import { getAIConfig, type AIProviderConfig } from "../config";
import { tools } from "@/data/tools";
import { categoryById } from "@/data/categories";

interface ChatTurn {
  role: "user" | "assistant";
  content: string;
}
interface ChatRequestBody { message?: unknown; history?: unknown; locale?: unknown }
interface ChatSuccessBody { reply: string; model: string; provider: string }
interface ChatErrorBody { error: string; retryable: boolean }

const MAX_MESSAGE_CHARS = 4000;
const MAX_TURNS = 20;
const MAX_REPLY_CHARS = 4000;
const MAX_REQUEST_BODY_CHARS = 128_000;
const SUPPORTED_LOCALES = new Set(["en","ar","es","zh-CN","hi","pt","fr","de","ja","ko","tr","it","vi","id","th","pl","nl","sv","uk","ro","el","cs","he","bn","fa","ru","ms"]);

type OpenRouterContent = string | Array<{ type?: string; text?: string }>;
interface GeminiGenerateResponse { candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>; promptFeedback?: { blockReason?: string }; error?: { message?: string; status?: string } }
interface OpenRouterResponse { choices?: Array<{ message?: { content?: OpenRouterContent } }>; model?: string; error?: { message?: string; code?: number } }

const CHAT_SYSTEM_PROMPT = [
  "You are Flex, the general AI assistant inside Flixo.",
  "Behave like a capable conversational assistant: reason about problems, ask useful clarifying questions, explain concepts, draft content, analyze text, brainstorm, and propose practical solutions.",
  "Reply in the user's language. Match the user's register when useful, including dialects and colloquial language; do not force formal language.",
  "Flex is not a tool picker UI. Do not render tool cards, fake buttons, or pretend a tool has already been run. You may recommend a Flixo tool naturally in prose when it is relevant.",
  "When discussing Flixo, rely on the supplied catalog context and never invent tool availability.",
  "When web-search context is supplied, treat it as fresh research material, distinguish it from your own knowledge, and summarize it accurately.",
].join(" ");

const LOCALE_NAMES: Record<string,string> = { en:"English", ar:"Arabic", es:"Spanish", "zh-CN":"Simplified Chinese", hi:"Hindi", pt:"Portuguese", fr:"French", de:"German", ja:"Japanese", ko:"Korean", tr:"Turkish", it:"Italian", vi:"Vietnamese", id:"Indonesian", th:"Thai", pl:"Polish", nl:"Dutch", sv:"Swedish", uk:"Ukrainian", ro:"Romanian", el:"Greek", cs:"Czech", he:"Hebrew", bn:"Bengali", fa:"Persian", ru:"Russian", ms:"Malay" };

function sanitizeContent(content: string): string { const nul = String.fromCharCode(0); return content.split(nul).join("").replace(/\r/g, "").trim(); }
function normalizeLocale(value: unknown): string | null { if (typeof value !== "string") return null; const locale = value.trim(); return SUPPORTED_LOCALES.has(locale) ? locale : null; }
function localizedSystemPrompt(locale: string | null): string { if (!locale || locale === "en") return CHAT_SYSTEM_PROMPT; const name = LOCALE_NAMES[locale] ?? locale; return `${CHAT_SYSTEM_PROMPT}\nThe active Flixo interface language is ${name} (${locale}). Keep the response in that language unless the user clearly switches languages.`; }
function jsonResponse(body: ChatSuccessBody | ChatErrorBody, status = 200): Response { return new Response(JSON.stringify(body), { status, headers: { "content-type":"application/json; charset=utf-8", "cache-control":"no-store" } }); }
function notConfiguredResponse(): Response { return jsonResponse({ error: "Flex is not configured yet. Add OPENROUTER_API_KEY or GEMINI_API_KEY in the server environment.", retryable:false }); }

function parseTurns(body: ChatRequestBody): { ok:true; turns:ChatTurn[]; locale:string|null } | { ok:false; response:Response } {
  const message = typeof body.message === "string" ? body.message : "";
  const cleanedMessage = sanitizeContent(message);
  if (!cleanedMessage) return { ok:false, response:jsonResponse({ error:"Please send a message to start the conversation.", retryable:false }) };
  if (cleanedMessage.length > MAX_MESSAGE_CHARS) return { ok:false, response:jsonResponse({ error:`Message is too long (max ${MAX_MESSAGE_CHARS} characters).`, retryable:false }) };
  const turns:ChatTurn[]=[];
  if (Array.isArray(body.history)) {
    for (const entry of body.history) {
      if (!entry || typeof entry !== "object") continue;
      const role=(entry as ChatTurn).role; const content=(entry as ChatTurn).content;
      if ((role !== "user" && role !== "assistant") || typeof content !== "string") continue;
      const cleaned=sanitizeContent(content); if (cleaned) turns.push({role,content:cleaned});
    }
    if (turns.length > MAX_TURNS) turns.splice(0, turns.length - MAX_TURNS);
  }
  turns.push({ role:"user", content:cleanedMessage });
  return { ok:true, turns, locale:normalizeLocale(body.locale) };
}

function toOpenRouterMessages(turns:ChatTurn[], locale:string|null) { return [{ role:"system" as const, content:localizedSystemPrompt(locale) }, ...turns.map((turn)=>({ role:turn.role as "user"|"assistant", content:turn.content }))]; }
function buildGeminiContents(turns:ChatTurn[]): Array<{role:"user"|"model";parts:Array<{text:string}>}> {
  const contents: Array<{role:"user"|"model";parts:Array<{text:string}>}> = [];
  for(const turn of turns){ const role=turn.role === "assistant" ? "model" : "user"; const last=contents[contents.length-1]; if(last&&last.role===role) last.parts[0].text += `\n\n${turn.content}`; else contents.push({role,parts:[{text:turn.content}]}); }
  return contents;
}
function extractOpenRouterText(content:OpenRouterContent|undefined):string { if(typeof content === "string") return content; if(!Array.isArray(content)) return ""; return content.map((part)=>part.text??"").join(""); }

function buildFlixoContext(message:string):string {
  const q = message.toLowerCase();
  const categoryEntries = [...categoryById.values()].map((c)=>`${c.name}: ${c.description}`).join("\n");
  const scored = tools.map((tool)=>{
    const hay = `${tool.name} ${tool.description} ${tool.slug}`.toLowerCase();
    const words = q.split(/[^\p{L}\p{N}]+/u).filter((w)=>w.length>=3);
    const score = words.reduce((sum,w)=>sum + (hay.includes(w) ? 1 : 0),0);
    return { tool, score };
  }).filter((item)=>item.score>0).sort((a,b)=>b.score-a.score).slice(0,8);
  const toolLines = scored.length ? scored.map(({tool})=>`- ${tool.name} (${tool.slug}) — ${tool.description}`).join("\n") : "No close tool match found; discuss the task normally and only recommend a tool when justified.";
  return `[Flixo catalog context]\nCategories:\n${categoryEntries}\nRelevant tools:\n${toolLines}`;
}

function shouldWebSearch(message:string):boolean { return /(search the web|search online|on the internet|web search|google it|latest|today|tonight|current|recent|news|price today|ابحث|الإنترنت|الانترنت|آخر|اليوم|حاليا|حديث|الأخبار|السعر الآن|الاخبار)/i.test(message); }

async function searchWeb(query:string, signal:AbortSignal):Promise<string> {
  try {
    const url=`https://api.duckduckgo.com/?q=${encodeURIComponent(query)}&format=json&no_html=1&skip_disambig=1`;
    const response=await fetch(url,{signal,headers:{"accept":"application/json","user-agent":"Flixo/1.0"}});
    if(!response.ok) return "";
    const data=(await response.json()) as { AbstractText?:string; AbstractURL?:string; Heading?:string; RelatedTopics?:Array<{Text?:string;FirstURL?:string;Topics?:Array<{Text?:string;FirstURL?:string}>}> };
    const lines:string[]=[];
    if(data.AbstractText) lines.push(`- ${data.Heading ?? "Result"}: ${data.AbstractText}${data.AbstractURL ? ` (${data.AbstractURL})` : ""}`);
    for(const topic of (data.RelatedTopics ?? []).slice(0,6)) { if(topic.Text) lines.push(`- ${topic.Text}${topic.FirstURL ? ` (${topic.FirstURL})` : ""}`); for(const nested of (topic.Topics ?? []).slice(0,2)) if(nested.Text) lines.push(`- ${nested.Text}${nested.FirstURL ? ` (${nested.FirstURL})` : ""}`); }
    return lines.length ? `[Fresh web search results for: ${query}]\n${lines.join("\n")}` : "";
  } catch { return ""; }
}

async function callOpenRouter(provider:AIProviderConfig, turns:ChatTurn[], locale:string|null, signal:AbortSignal):Promise<{ok:true;reply:string;model:string}|{ok:false;retryable:boolean;blocked?:boolean}>{
  if(!provider.apiKey) return {ok:false,retryable:false};
  const response=await fetch(`${provider.baseUrl}/chat/completions`,{method:"POST",headers:{"content-type":"application/json",authorization:`Bearer ${provider.apiKey}`,"http-referer":"https://flixoai.vercel.app","x-title":"Flixo"},signal,body:JSON.stringify({model:provider.defaultModel,messages:toOpenRouterMessages(turns,locale),temperature:0.6,max_tokens:1400})});
  if(!response.ok) return {ok:false,retryable:response.status===408||response.status===429||response.status>=500};
  const data=(await response.json()) as OpenRouterResponse; if(data.error) return {ok:false,retryable:false};
  const reply=extractOpenRouterText(data.choices?.[0]?.message?.content).trim(); if(!reply) return {ok:false,retryable:true};
  return {ok:true,reply:reply.slice(0,MAX_REPLY_CHARS),model:data.model??provider.defaultModel};
}

async function callGemini(provider:AIProviderConfig, turns:ChatTurn[], locale:string|null, signal:AbortSignal):Promise<{ok:true;reply:string;model:string}|{ok:false;retryable:boolean;blocked?:boolean}>{
  if(!provider.apiKey) return {ok:false,retryable:false};
  const url=`${provider.baseUrl}/v1beta/models/${encodeURIComponent(provider.defaultModel)}:generateContent?key=${encodeURIComponent(provider.apiKey)}`;
  const response=await fetch(url,{method:"POST",headers:{"content-type":"application/json"},signal,body:JSON.stringify({contents:buildGeminiContents(turns),systemInstruction:{parts:[{text:localizedSystemPrompt(locale)}]},generationConfig:{maxOutputTokens:1400,temperature:0.6}})});
  if(!response.ok) return {ok:false,retryable:response.status===408||response.status===429||response.status>=500};
  const data=(await response.json()) as GeminiGenerateResponse; if(data.promptFeedback?.blockReason) return {ok:false,retryable:false,blocked:true}; if(data.error) return {ok:false,retryable:false};
  const reply=data.candidates?.[0]?.content?.parts?.map((part)=>part.text??"").join("").trim()??""; if(!reply) return {ok:false,retryable:true};
  return {ok:true,reply:reply.slice(0,MAX_REPLY_CHARS),model:provider.defaultModel};
}

export async function handleChatRequest(request:Request):Promise<Response>{
  if(request.method!=="POST") return new Response("Method Not Allowed",{status:405,headers:{allow:"POST"}});
  const contentLength=Number(request.headers.get("content-length")); if(Number.isFinite(contentLength)&&contentLength>MAX_REQUEST_BODY_CHARS) return jsonResponse({error:"Request payload is too large.",retryable:false},413);
  let body:ChatRequestBody;
  try { const rawBody=await request.text(); if(rawBody.length>MAX_REQUEST_BODY_CHARS) return jsonResponse({error:"Request payload is too large.",retryable:false},413); body=JSON.parse(rawBody) as ChatRequestBody; }
  catch { return jsonResponse({error:"Invalid JSON body. Expected { message, history, locale }.",retryable:false}); }
  const parsed=parseTurns(body); if(!parsed.ok) return parsed.response;

  const config=getAIConfig(); const openrouter=config.providers.openrouter; const gemini=config.providers.gemini; if(!openrouter?.apiKey&&!gemini?.apiKey) return notConfiguredResponse();
  const controller=new AbortController(); const timeout=setTimeout(()=>controller.abort(),config.defaultTimeoutMs);
  try {
    const catalog=buildFlixoContext(body.message as string); const fresh=shouldWebSearch(body.message as string) ? await searchWeb(body.message as string,controller.signal) : ""; const last=parsed.turns[parsed.turns.length-1]; const augmentedTurns=[...parsed.turns.slice(0,-1),{...last,content:[last.content,catalog,fresh].filter(Boolean).join("\n\n")}];
    const providers:Array<{name:"openrouter"|"gemini";config:AIProviderConfig}>=[]; if(openrouter?.apiKey) providers.push({name:"openrouter",config:openrouter}); if(gemini?.apiKey) providers.push({name:"gemini",config:gemini});
    let lastRetryable=false;
    for(const provider of providers){ try { const result=provider.name==="openrouter" ? await callOpenRouter(provider.config,augmentedTurns,parsed.locale,controller.signal) : await callGemini(provider.config,augmentedTurns,parsed.locale,controller.signal); if(result.ok) return jsonResponse({reply:result.reply,model:result.model,provider:provider.name}); if(result.blocked) return jsonResponse({error:"The AI provider blocked this request with its safety filters.",retryable:false}); lastRetryable=result.retryable; if(!result.retryable) break; } catch { lastRetryable=true; } if(controller.signal.aborted) break; }
    return jsonResponse({error:lastRetryable?"Flex's AI providers are temporarily unavailable or rate-limited. Please try again shortly.":"Flex could not generate a response with the configured AI providers.",retryable:lastRetryable});
  } finally { clearTimeout(timeout); }
}
