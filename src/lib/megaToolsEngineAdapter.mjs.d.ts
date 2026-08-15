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
export declare function runMegaTool(tool: unknown, file: File): Promise<MegaToolResultText | MegaToolResultDownload | MegaToolResultVideo>;
