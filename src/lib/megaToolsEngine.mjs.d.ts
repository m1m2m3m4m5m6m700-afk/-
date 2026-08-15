export interface MegaToolResultText {
  type: "text";
  text: string;
}

export interface MegaToolResultDownload {
  type: "download";
  url: string;
  filename: string;
}

export interface MegaToolResultVideo {
  type: "video";
  element: HTMLVideoElement;
  keepUrl?: boolean;
  cleanup?: () => void;
}

export declare const MEGA_HANDLER_IDS: readonly string[];
export declare function runMegaTool(tool: unknown, file: File): Promise<MegaToolResultText | MegaToolResultDownload | MegaToolResultVideo>;
