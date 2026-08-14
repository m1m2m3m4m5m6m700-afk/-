# Flixo AI — Free First

Flixo uses a provider-neutral AI layer so tools do not depend on one model vendor.

## Provider order

When `FLIXO_AI_FREE_FIRST=true` (the default):

1. **Ollama** — local/self-hosted inference. No API bill; the machine must have Ollama running.
2. **Gemini** — use the current Google AI Studio free tier when the deployment has `GEMINI_API_KEY` configured.
3. **Groq** — use an eligible Groq free tier when `GROQ_API_KEY` is configured.
4. Paid providers are **not** selected implicitly. OpenAI is used only when explicitly selected with `FLIXO_AI_PROVIDER=openai` or when the deployment is configured that way.

Free-tier limits and model availability are controlled by the provider and can change independently of Flixo. Flixo must never describe a provider as unlimited or permanently free.

## Current free-first tasks

The shared AI contract supports:

- AI Chat
- AI Writer
- Article Generator
- SEO Blog Generator
- Summarizer
- Rewrite
- Grammar Checker
- Translator
- Code Assistant
- Research Assistant

## Security rules

- API keys remain server-side.
- Client code calls only the typed AI RPC.
- CSRF and per-IP rate limiting run before provider calls.
- Provider errors are normalized; upstream response bodies are never returned.
- User content and secrets must not be logged.

## Local Ollama note

Ollama is useful for self-hosted Flixo deployments. A public Flixo server cannot access a visitor's `127.0.0.1`; browser-local Ollama support is therefore a separate future capability and must use explicit user opt-in and CORS-safe handling.
