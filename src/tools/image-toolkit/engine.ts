import type { ChangeEvent } from 'react';

export type LocalToolId =
  | 'background-remover'
  | 'ai-image-generator'
  | 'image-upscaler'
  | 'image-converter'
  | 'image-to-text'
  | 'object-remover'
  | 'crop-resize'
  | 'watermark-remover'
  | 'raster-to-svg';

export type ImageInfo = { width: number; height: number };

export function imageInfo(blob: Blob): Promise<ImageInfo> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(blob);
    const image = new Image();
    image.onload = () => { URL.revokeObjectURL(url); resolve({ width: image.naturalWidth, height: image.naturalHeight }); };
    image.onerror = () => { URL.revokeObjectURL(url); reject(new Error('Image could not be decoded.')); };
    image.src = url;
  });
}

export function loadImage(blob: Blob): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(blob);
    const image = new Image();
    image.onload = () => { URL.revokeObjectURL(url); resolve(image); };
    image.onerror = () => { URL.revokeObjectURL(url); reject(new Error('Image could not be decoded.')); };
    image.src = url;
  });
}

function canvasBlob(canvas: HTMLCanvasElement, type = 'image/png', quality = 0.92): Promise<Blob> {
  return new Promise((resolve, reject) => canvas.toBlob((blob) => blob ? resolve(blob) : reject(new Error('Could not create output image.')), type, quality));
}

export async function resizeImage(blob: Blob, scale: number): Promise<Blob> {
  const image = await loadImage(blob);
  const canvas = document.createElement('canvas');
  canvas.width = Math.max(1, Math.round(image.naturalWidth * scale));
  canvas.height = Math.max(1, Math.round(image.naturalHeight * scale));
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas is unavailable.');
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
  return canvasBlob(canvas);
}

export async function convertImage(blob: Blob, type: 'image/png' | 'image/jpeg' | 'image/webp'): Promise<Blob> {
  const image = await loadImage(blob);
  const canvas = document.createElement('canvas');
  canvas.width = image.naturalWidth;
  canvas.height = image.naturalHeight;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas is unavailable.');
  if (type === 'image/jpeg') { ctx.fillStyle = '#ffffff'; ctx.fillRect(0, 0, canvas.width, canvas.height); }
  ctx.drawImage(image, 0, 0);
  return canvasBlob(canvas, type, 0.92);
}

export async function cropResizeImage(blob: Blob, crop: { x: number; y: number; width: number; height: number }, out: { width: number; height: number }): Promise<Blob> {
  const image = await loadImage(blob);
  const canvas = document.createElement('canvas');
  canvas.width = Math.max(1, Math.round(out.width));
  canvas.height = Math.max(1, Math.round(out.height));
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas is unavailable.');
  ctx.drawImage(image, crop.x, crop.y, crop.width, crop.height, 0, 0, canvas.width, canvas.height);
  return canvasBlob(canvas);
}

export async function removeBackground(blob: Blob, tolerance = 42): Promise<Blob> {
  const image = await loadImage(blob);
  const canvas = document.createElement('canvas');
  canvas.width = image.naturalWidth; canvas.height = image.naturalHeight;
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  if (!ctx) throw new Error('Canvas is unavailable.');
  ctx.drawImage(image, 0, 0);
  const data = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const samples = [[0,0],[canvas.width-1,0],[0,canvas.height-1],[canvas.width-1,canvas.height-1]];
  const bg = samples.reduce((acc, [x,y]) => {
    const i=(y*canvas.width+x)*4; return [acc[0]+data.data[i],acc[1]+data.data[i+1],acc[2]+data.data[i+2]];
  }, [0,0,0]).map((v) => v/4);
  for (let i=0;i<data.data.length;i+=4) {
    const d=Math.hypot(data.data[i]-bg[0],data.data[i+1]-bg[1],data.data[i+2]-bg[2]);
    if (d < tolerance) data.data[i+3]=0;
  }
  ctx.putImageData(data, 0, 0);
  return canvasBlob(canvas, 'image/png');
}

function clamp(n: number, min: number, max: number) { return Math.max(min, Math.min(max, n)); }

export async function fillRemoveRegion(blob: Blob, region: { x:number; y:number; width:number; height:number }): Promise<Blob> {
  const image = await loadImage(blob);
  const canvas=document.createElement('canvas'); canvas.width=image.naturalWidth; canvas.height=image.naturalHeight;
  const ctx=canvas.getContext('2d'); if(!ctx) throw new Error('Canvas is unavailable.');
  ctx.drawImage(image,0,0);
  const x=clamp(region.x,0,canvas.width-1), y=clamp(region.y,0,canvas.height-1);
  const w=clamp(region.width,1,canvas.width-x), h=clamp(region.height,1,canvas.height-y);
  const edge=8;
  const pixels=ctx.getImageData(0,0,canvas.width,canvas.height);
  const sample = (sx:number,sy:number) => { const i=(sy*canvas.width+sx)*4; return [pixels.data[i],pixels.data[i+1],pixels.data[i+2],pixels.data[i+3]]; };
  const left=sample(Math.max(0,x-1),y+Math.floor(h/2));
  const right=sample(Math.min(canvas.width-1,x+w),y+Math.floor(h/2));
  const top=sample(x+Math.floor(w/2),Math.max(0,y-1));
  const bottom=sample(x+Math.floor(w/2),Math.min(canvas.height-1,y+h));
  const avg=[(left[0]+right[0]+top[0]+bottom[0])/4,(left[1]+right[1]+top[1]+bottom[1])/4,(left[2]+right[2]+top[2]+bottom[2])/4,(left[3]+right[3]+top[3]+bottom[3])/4];
  ctx.fillStyle=`rgba(${avg[0]},${avg[1]},${avg[2]},${avg[3]/255})`; ctx.fillRect(x,y,w,h);
  const blur = ctx.filter = `blur(${edge}px)`; void blur;
  ctx.drawImage(canvas,x,y,w,h,x,y,w,h); ctx.filter='none';
  return canvasBlob(canvas,'image/png');
}

export async function watermarkRemove(blob: Blob, region: {x:number;y:number;width:number;height:number}): Promise<Blob> {
  return fillRemoveRegion(blob, region);
}

export async function rasterToSvg(blob: Blob, columns = 48): Promise<Blob> {
  const image=await loadImage(blob);
  const scale=Math.min(1, columns/image.naturalWidth);
  const width=Math.max(1,Math.round(image.naturalWidth*scale));
  const height=Math.max(1,Math.round(image.naturalHeight*scale));
  const canvas=document.createElement('canvas'); canvas.width=width; canvas.height=height;
  const ctx=canvas.getContext('2d',{willReadFrequently:true}); if(!ctx) throw new Error('Canvas is unavailable.');
  ctx.drawImage(image,0,0,width,height);
  const {data}=ctx.getImageData(0,0,width,height);
  const rects:string[]=[];
  for(let y=0;y<height;y++) for(let x=0;x<width;x++) { const i=(y*width+x)*4; const a=data[i+3]; if(a<16) continue; rects.push(`<rect x="${x}" y="${y}" width="1" height="1" fill="rgb(${data[i]},${data[i+1]},${data[i+2]})" fill-opacity="${(a/255).toFixed(2)}"/>`); }
  const svg=`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" shape-rendering="crispEdges">${rects.join('')}</svg>`;
  return new Blob([svg],{type:'image/svg+xml'});
}

export function fileChange(event: ChangeEvent<HTMLInputElement>): File | null { return event.target.files?.[0] ?? null; }
