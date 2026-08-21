import { lazy, type ComponentType, type LazyExoticComponent } from "react";
import { Clapperboard, FileImage, FileVideo, QrCode, Scissors, Sparkles } from "lucide-react";
import type { ToolCategoryId, ToolInputKind, ToolOutputKind } from "@/lib/tool-platform/types";

type ToolComponent = LazyExoticComponent<ComponentType>;

export interface ToolConfig {
  readonly id: string;
  readonly title: string;
  readonly category: ToolCategoryId;
  readonly path: string;
  readonly component: ToolComponent;
  readonly icon: typeof FileImage;
  readonly description: string;
  readonly descriptionKey?: string;
  readonly input: ToolInputKind;
  readonly output: ToolOutputKind;
  readonly localOnly: boolean;
  readonly isReady: boolean;
}

export const TOOLS_REGISTRY: readonly ToolConfig[] = Object.freeze([
  {
    id: "image-compressor",
    title: "Image Compressor",
    category: "images",
    path: "/tools/image-compressor",
    component: lazy(() => import("@/tools/image-compressor")),
    icon: FileImage,
    description: "Shrink image file size in your browser with real-time compression ratio preview.",
    input: "file",
    output: "download",
    localOnly: true,
    isReady: true,
  },
  {
    id: "image-enhancer",
    title: "Image Enhancer",
    category: "images",
    path: "/tools/image-enhancer",
    component: lazy(() => import("@/components/tools/ImageEnhancer").then((module) => ({ default: module.ImageEnhancer }))),
    icon: Sparkles,
    description: "Upscale images up to 8x via in-browser resampling, with adjustable sharpness, brightness, contrast, vibrance, and tone corrections.",
    input: "file",
    output: "download",
    localOnly: true,
    isReady: true,
  },
  {
    id: "background-remover",
    title: "Background Remover",
    category: "images",
    path: "/tools/background-remover",
    component: lazy(() => import("@/components/tools/BackgroundRemover").then((module) => ({ default: module.BackgroundRemover }))),
    icon: FileImage,
    description: "Cut out image backgrounds locally and export transparent PNGs.",
    input: "file",
    output: "download",
    localOnly: true,
    isReady: true,
  },
  {
    id: "video-compressor",
    title: "Video Compressor",
    category: "video",
    path: "/tools/video-compressor",
    component: lazy(() => import("@/lib/tool-runtime/tools/video-compressor").then((module) => ({ default: module.VideoCompressorRuntime.component }))),
    icon: FileVideo,
    description: "Compress videos with adjustable quality using FFmpeg, entirely in your browser.",
    descriptionKey: "tool.video-compressor.pageDescription",
    input: "file",
    output: "download",
    localOnly: true,
    isReady: true,
  },
  {
    id: "video-trimmer",
    title: "Video Trimmer",
    category: "video",
    path: "/tools/video-trimmer",
    component: lazy(() => import("@/lib/tool-runtime/tools/video-trimmer").then((module) => ({ default: module.VideoTrimmerRuntime.component }))),
    icon: Scissors,
    description: "Trim video to an exact start and end time using FFmpeg, entirely in your browser.",
    descriptionKey: "tool.video-trimmer.pageDescription",
    input: "file",
    output: "download",
    localOnly: true,
    isReady: true,
  },
  {
    id: "video-to-gif",
    title: "Video to GIF",
    category: "video",
    path: "/tools/video-to-gif",
    component: lazy(() => import("@/lib/tool-runtime/tools/video-to-gif").then((module) => ({ default: module.VideoToGifRuntime.component }))),
    icon: Clapperboard,
    description: "Convert a video clip into an animated GIF with browser-side FFmpeg processing.",
    input: "file",
    output: "download",
    localOnly: true,
    isReady: true,
  },
  {
    id: "qr-generator",
    title: "QR Generator",
    category: "utilities",
    path: "/tools/qr-generator",
    component: lazy(() => import("@/components/tools/QrGenerator").then((module) => ({ default: module.QrGenerator }))),
    icon: QrCode,
    description: "Generate high quality QR codes for URLs, Wi-Fi credentials, text and contact information.",
    input: "text",
    output: "download",
    localOnly: true,
    isReady: true,
  },
]);

export const getToolConfig = (id: string): ToolConfig | undefined =>
  TOOLS_REGISTRY.find((tool) => tool.id === id);

export const getToolConfigByPath = (path: string): ToolConfig | undefined =>
  TOOLS_REGISTRY.find((tool) => tool.path === path);

export const getReadyToolConfigs = (): readonly ToolConfig[] =>
  TOOLS_REGISTRY.filter((tool) => tool.isReady);
