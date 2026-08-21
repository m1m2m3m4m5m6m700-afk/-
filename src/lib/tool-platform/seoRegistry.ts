/** Canonical SEO metadata for public Tool Platform registrations. */
import type { ToolSeoMetadata } from "./types";

export const toolSeoRegistry: Readonly<Record<string, ToolSeoMetadata>> = Object.freeze({
  "image-compressor": {
    title: "Image Compressor — Shrink File Size Online | Flixo",
    description: "Compress JPG, PNG, and WebP images directly in your browser with live size comparison. Free and private.",
    keywords: ["image compressor", "shrink image size", "compress jpg", "compress png", "reduce image file size", "photo optimizer"],
  },
  "image-enhancer": {
    title: "Image Enhancer — Free Online Upscale, Sharpen & Adjust Photos | Flixo",
    description: "Upscale images up to 8x and adjust sharpness, brightness, contrast, and color tone with in-browser processing. Free and private.",
    keywords: ["image enhancer", "upscale image 4x 8x", "sharpen photo", "image resizer", "photo sharpener", "free photo upscaler"],
  },
  "video-compressor": {
    title: "Video Compressor — Reduce Video File Size Online | Flixo",
    description: "Compress supported videos locally in your browser with adjustable quality controls and downloadable output.",
    keywords: ["video compressor", "compress video online", "reduce video size", "browser video compressor"],
  },
  "video-trimmer": {
    title: "Video Trimmer — Cut Videos Online in Your Browser | Flixo",
    description: "Trim supported videos to precise start and end times locally in your browser and download the result.",
    keywords: ["video trimmer", "cut video online", "trim video", "browser video editor"],
  },
  "qr-generator": {
    title: "QR Code Generator — Custom PNG & SVG Vector QR Codes | Flixo",
    description: "Generate QR codes for URLs, Wi-Fi, text, email, and phone numbers with instant PNG or SVG export.",
    keywords: ["qr code generator", "free qr generator", "wifi qr code", "custom qr code", "vector svg qr code", "qr maker"],
  },
});

export const getToolSeoMetadata = (toolId: string): ToolSeoMetadata | undefined => toolSeoRegistry[toolId];
