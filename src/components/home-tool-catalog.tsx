import { useMemo, useState } from 'react';
import { Link } from '@tanstack/react-router';
import { TOOLS_REGISTRY } from '../config/tools';

type Category = 'All' | 'Popular' | 'Edit' | 'Convert' | 'Extract' | 'Creative';
const CATEGORY_BY_ID: Record<string, Exclude<Category, 'All'>> = {
  'image-compressor':'Popular','image-upscaler':'Popular','image-converter':'Convert','background-remover':'Edit','object-remover':'Edit','watermark-remover':'Extract','image-cropper':'Edit','image-to-svg':'Convert','image-ocr':'Extract','background-blur':'Edit','passport-photo-maker':'Edit','watermark-adder':'Edit','meme-generator':'Creative','collage-maker':'Creative','image-effects':'Edit','exif-cleaner':'Extract','svg-optimizer':'Convert','mockup-generator':'Creative','ai-image-generator':'Creative',seed:'Edit',pix:'Creative','photo-colorizer':'Creative',
};
const CATEGORIES: Category[] = ['All','Popular','Edit','Convert','Extract','Creative'];
const ICONS: Record<string,string> = {'image-compressor':'↘','background-remover':'◐','image-upscaler':'↗','image-converter':'⇄','ai-image-generator':'✦','object-remover':'⌫','watermark-remover':'⌧','image-cropper':'⌗','image-to-svg':'◇','image-ocr':'⌕','background-blur':'◌','passport-photo-maker':'▣','watermark-adder':'✚','meme-generator':'☻','collage-maker':'▦','image-effects':'✧','exif-cleaner':'◍','svg-optimizer':'⌁','mockup-generator':'▤',seed:'◈',pix:'✎'};

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
      <div className="featured-grid">{featured.map((tool) => <Link key={tool.id} to={tool.path} className="featured-card"><span className="tool-icon">{ICONS[tool.id] ?? '•'}</span><div><span className="featured-label">{tool.id === 'pix' ? 'Studio' : tool.id === 'ai-image-generator' ? 'AI' : 'Popular'}</span><h3>{tool.title}</h3><p>{tool.description}</p></div><span className="card-arrow">↗</span></Link>)}</div>
    </div>
    <div className="section-heading catalog-heading"><div><p className="section-kicker">TOOL CATALOG</p><h2 id="catalog-heading">Find the right tool</h2></div><span>{filtered.length} shown</span></div>
    <div className="catalog-toolbar"><label className="search-box"><span>⌕</span><input value={query} onChange={(e)=>setQuery(e.target.value)} placeholder="Search tools…" aria-label="Search tools" /></label><div className="category-tabs" role="tablist" aria-label="Tool categories">{CATEGORIES.map((item)=><button key={item} type="button" role="tab" aria-selected={category===item} className={category===item?'active':''} onClick={()=>setCategory(item)}>{item}</button>)}</div></div>
    <div className="catalog-grid">{filtered.map((tool)=><Link key={tool.id} to={tool.path} className="tool-card"><span className="tool-icon">{ICONS[tool.id] ?? '•'}</span><div className="tool-card-copy"><div className="tool-card-top"><h3>{tool.title}</h3>{tool.id === 'pix' || tool.id === 'seed' ? <span className="tool-badge">Pro</span> : tool.id === 'ai-image-generator' ? <span className="tool-badge new">New</span> : null}</div><p>{tool.description}</p></div><span className="tool-arrow">→</span></Link>)}</div>
    {!filtered.length && <div className="catalog-empty"><strong>No tools match that search.</strong><span>Try a broader phrase or switch category.</span></div>}
  </section>;
}
