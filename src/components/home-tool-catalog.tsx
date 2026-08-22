import { useMemo, useState } from 'react';
import { Link } from '@tanstack/react-router';
import { TOOLS_REGISTRY } from '../config/tools';

type Category = 'All' | 'Popular' | 'Edit' | 'Convert' | 'Extract' | 'Creative';
const CATEGORY_BY_ID: Record<string, Exclude<Category, 'All'>> = {
  'image-compressor':'Popular','image-upscaler':'Popular','image-converter':'Convert','background-remover':'Edit','object-remover':'Edit','watermark-remover':'Extract','image-cropper':'Edit','image-to-svg':'Convert','image-ocr':'Extract','background-blur':'Edit','passport-photo-maker':'Edit','watermark-adder':'Edit','meme-generator':'Creative','collage-maker':'Creative','image-effects':'Edit','exif-cleaner':'Extract','svg-optimizer':'Convert','mockup-generator':'Creative','ai-image-generator':'Creative',seed:'Edit',pix:'Creative','photo-colorizer':'Creative',
};
const CATEGORIES: Category[] = ['All','Popular','Edit','Convert','Extract','Creative'];
const ICONS: Record<string,string> = {'image-compressor':'↘','background-remover':'◐','image-upscaler':'↗','image-converter':'⇄','ai-image-generator':'✦','object-remover':'⌫','watermark-remover':'⌧','image-cropper':'⌗','image-to-svg':'◇','image-ocr':'⌕','background-blur':'◌','passport-photo-maker':'▣','watermark-adder':'✚','meme-generator':'☻','collage-maker':'▦','image-effects':'✧','exif-cleaner':'◍','svg-optimizer':'⌁','mockup-generator':'▤',seed:'◈',pix:'✎'};

type DiagramKind = 'compress' | 'upscale' | 'convert' | 'remove' | 'ocr' | 'crop' | 'edit' | 'creative';
const DIAGRAMS: Record<string, DiagramKind> = {
  'image-compressor':'compress', 'image-upscaler':'upscale', 'image-converter':'convert', 'background-remover':'remove',
  'object-remover':'remove', 'watermark-remover':'remove', 'image-cropper':'crop', 'image-to-svg':'convert', 'image-ocr':'ocr',
  'background-blur':'edit', 'passport-photo-maker':'crop', 'watermark-adder':'edit', 'meme-generator':'creative', 'collage-maker':'creative',
  'image-effects':'edit', 'exif-cleaner':'remove', 'svg-optimizer':'convert', 'mockup-generator':'creative', 'ai-image-generator':'creative',
  seed:'edit', pix:'edit',
};

function OperationDiagram({ kind }: { kind: DiagramKind }) {
  if (kind === 'compress') return <svg viewBox="0 0 180 72" aria-label="Compress image diagram" role="img" className="tool-diagram"><rect x="12" y="17" width="48" height="38" rx="7"/><path d="M68 36h34m-8-8 8 8-8 8"/><rect x="118" y="25" width="48" height="22" rx="5"/><path d="M132 36h20"/></svg>;
  if (kind === 'upscale') return <svg viewBox="0 0 180 72" aria-label="Upscale image diagram" role="img" className="tool-diagram"><rect x="12" y="22" width="42" height="28" rx="6"/><path d="M67 48V18m0 0-8 8m8-8 8 8"/><rect x="102" y="12" width="60" height="48" rx="7"/><path d="M116 36h32m-16-16v32"/></svg>;
  if (kind === 'convert') return <svg viewBox="0 0 180 72" aria-label="Convert format diagram" role="img" className="tool-diagram"><rect x="10" y="18" width="55" height="36" rx="7"/><text x="37" y="41" textAnchor="middle">JPG</text><path d="M75 36h28m-8-8 8 8-8 8"/><rect x="115" y="18" width="55" height="36" rx="7"/><text x="142" y="41" textAnchor="middle">SVG</text></svg>;
  if (kind === 'remove') return <svg viewBox="0 0 180 72" aria-label="Remove object diagram" role="img" className="tool-diagram"><rect x="12" y="14" width="56" height="44" rx="7"/><circle cx="40" cy="36" r="10"/><path d="M83 36h30m-8-8 8 8-8 8"/><rect x="122" y="14" width="46" height="44" rx="7"/><path d="M132 44l26-16"/></svg>;
  if (kind === 'ocr') return <svg viewBox="0 0 180 72" aria-label="OCR extraction diagram" role="img" className="tool-diagram"><rect x="10" y="14" width="55" height="44" rx="7"/><path d="M22 27h30M22 36h24M22 45h18"/><path d="M82 36h25m-8-8 8 8-8 8"/><text x="128" y="41" textAnchor="middle">TEXT</text></svg>;
  if (kind === 'crop') return <svg viewBox="0 0 180 72" aria-label="Crop image diagram" role="img" className="tool-diagram"><rect x="10" y="12" width="58" height="48" rx="6"/><path d="M20 24h12M20 24v12M58 48H46M58 48V36"/><path d="M84 36h28m-8-8 8 8-8 8"/><rect x="132" y="22" width="34" height="28" rx="4"/></svg>;
  if (kind === 'creative') return <svg viewBox="0 0 180 72" aria-label="Creative image workflow" role="img" className="tool-diagram"><rect x="10" y="17" width="45" height="38" rx="6"/><path d="M66 36h25"/><circle cx="117" cy="36" r="17"/><path d="M117 26v20m-10-10h20"/><rect x="145" y="27" width="26" height="18" rx="4"/></svg>;
  return <svg viewBox="0 0 180 72" aria-label="Image editing diagram" role="img" className="tool-diagram"><rect x="12" y="17" width="52" height="38" rx="7"/><path d="M82 24h80M82 36h58M82 48h64"/><circle cx="105" cy="24" r="5"/><circle cx="132" cy="36" r="5"/><circle cx="118" cy="48" r="5"/></svg>;
}

export function HomeToolCatalog() {
  const [query,setQuery] = useState('');
  const [category,setCategory] = useState<Category>('All');
  const readyTools = TOOLS_REGISTRY.filter((tool) => tool.isReady);
  const featured = readyTools.filter((tool) => ['image-compressor','image-upscaler','image-converter','ai-image-generator','pix'].includes(tool.id));
  const filtered = useMemo(() => readyTools.filter((tool) => {
    const q = query.trim().toLowerCase();
    const matchesQuery = !q || `${tool.title} ${tool.description} ${tool.id}`.toLowerCase().includes(q);
    return matchesQuery && (category === 'All' || CATEGORY_BY_ID[tool.id] === category);
  }), [category,query]);
  return <section id="tools" className="catalog-section" aria-labelledby="catalog-heading">
    <div className="featured-section">
      <div className="section-heading"><div><p className="section-kicker">START HERE</p><h2>Popular right now</h2></div><span>Fast paths to a result</span></div>
      <div className="featured-grid">{featured.map((tool) => <Link key={tool.id} to={tool.path} className="featured-card"><div className="tool-visual"><OperationDiagram kind={DIAGRAMS[tool.id] ?? 'edit'} /><span className="tool-icon">{ICONS[tool.id] ?? '•'}</span></div><div><span className="featured-label">{tool.id === 'pix' ? 'Studio' : tool.id === 'ai-image-generator' ? 'AI' : 'Popular'}</span><h3>{tool.title}</h3><p>{tool.description}</p></div><span className="card-arrow">↗</span></Link>)}</div>
    </div>
    <div className="section-heading catalog-heading"><div><p className="section-kicker">TOOL CATALOG</p><h2 id="catalog-heading">Find the right tool</h2></div><span>{filtered.length} shown</span></div>
    <div className="catalog-toolbar"><label className="search-box"><span>⌕</span><input value={query} onChange={(e)=>setQuery(e.target.value)} placeholder="Search tools…" aria-label="Search tools" /></label><div className="category-tabs" role="tablist" aria-label="Tool categories">{CATEGORIES.map((item)=><button key={item} type="button" role="tab" aria-selected={category===item} className={category===item?'active':''} onClick={()=>setCategory(item)}>{item}</button>)}</div></div>
    <div className="catalog-grid">{filtered.map((tool)=><Link key={tool.id} to={tool.path} className="tool-card"><div className="tool-visual"><OperationDiagram kind={DIAGRAMS[tool.id] ?? 'edit'} /><span className="tool-icon">{ICONS[tool.id] ?? '•'}</span></div><div className="tool-card-copy"><div className="tool-card-top"><h3>{tool.title}</h3>{tool.id === 'pix' || tool.id === 'seed' ? <span className="tool-badge">Pro</span> : tool.id === 'ai-image-generator' ? <span className="tool-badge new">New</span> : null}</div><p>{tool.description}</p><span className="tool-operation">{tool.id === 'image-compressor' ? 'Reduce file size → smaller output' : tool.id === 'image-upscaler' ? 'Scale pixels → larger image' : tool.id === 'image-converter' ? 'Format A → Format B' : tool.id === 'image-ocr' ? 'Image → editable text' : tool.id === 'image-to-svg' ? 'Raster → vector paths' : tool.id === 'background-remover' ? 'Subject → transparent background' : tool.id === 'image-cropper' ? 'Select area → exact dimensions' : tool.id === 'ai-image-generator' ? 'Prompt → generated image' : tool.id === 'object-remover' ? 'Select object → cleaned frame' : tool.id === 'watermark-remover' ? 'Select mark → cleaner image' : tool.id === 'meme-generator' ? 'Image + text → meme' : tool.id === 'collage-maker' ? 'Images → composed layout' : tool.id === 'passport-photo-maker' ? 'Portrait → standard crop' : tool.id === 'svg-optimizer' ? 'SVG → leaner markup' : tool.id === 'exif-cleaner' ? 'Metadata → cleaned file' : tool.id === 'mockup-generator' ? 'Image → device mockup' : tool.id === 'pix' ? 'Canvas → edited export' : 'Image → adjusted result'}</span></div><span className="tool-arrow">→</span></Link>)}</div>
    {!filtered.length && <div className="catalog-empty"><strong>No tools match that search.</strong><span>Try a broader phrase or switch category.</span></div>}
  </section>;
}
