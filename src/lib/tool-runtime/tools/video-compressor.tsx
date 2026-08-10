import { useState } from "react";
import { FileVideo, Download, RefreshCw, Upload, ShieldCheck, AlertCircle } from "lucide-react";
import {
  assertFileValid,
  downloadBlob,
  formatBytes,
  friendlyError,
  getFfmpeg,
  readFileAsArrayBuffer,
} from "@/lib/utils";
import type { ReadyToolRuntimeDefinition } from "../types";

function VideoCompressorTool() {
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<{ name: string; size: number; saved: number } | null>(null);
  const [progress, setProgress] = useState(0);
  const [crf, setCrf] = useState(28);

  const handleProcess = async () => {
    if (!file) return;
    setIsProcessing(true);
    setError("");
    setResult(null);
    setProgress(0);
    try {
      assertFileValid(file, { kind: "video", maxBytes: 512 * 1024 * 1024 });
      const ffmpeg = await getFfmpeg();
      const inExt = (file.name.split(".").pop() || "mp4").toLowerCase();
      const inName = "input." + inExt;
      const outName = "output.mp4";
      const data = new Uint8Array(await readFileAsArrayBuffer(file));
      await ffmpeg.writeFile(inName, data);
      const progressCb = ({ progress }: { progress: number }) =>
        setProgress(Math.round(progress * 100));
      ffmpeg.on("progress", progressCb);
      // libx264 with CRF is verified to work in the single-thread FFmpeg.wasm core
      // and produces real compression (CRF 32 ≈ 25% smaller). VP9/VP8 (libvpx) crash
      // with an out-of-bounds wasm memory trap in this core, so H.264 is used.
      const ret = await ffmpeg.exec([
        "-i",
        inName,
        "-c:v",
        "libx264",
        "-pix_fmt",
        "yuv420p",
        "-crf",
        String(crf),
        "-preset",
        "ultrafast",
        "-c:a",
        "aac",
        "-b:a",
        "96k",
        outName,
      ]);
      if (ret !== 0) throw new Error("FFMPEG_PROCESS_FAILED");
      ffmpeg.off("progress", progressCb);
      const outData = (await ffmpeg.readFile(outName)) as Uint8Array;
      if (!outData || outData.length === 0) throw new Error("FFMPEG_PROCESS_FAILED");
      const outFile = file.name.replace(/\.[^.]+$/, "") + "-compressed.mp4";
      downloadBlob(new Uint8Array(outData), outFile, "video/mp4");
      const saved = file.size - outData.length;
      setResult({ name: outFile, size: outData.length, saved });
      try {
        await ffmpeg.deleteFile(inName);
        await ffmpeg.deleteFile(outName);
      } catch {
        /* ignore */
      }
    } catch (e) {
      setError(friendlyError(e, "Failed to compress video. The format may be unsupported."));
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="rounded-3xl border border-border bg-card p-6 md:p-8 space-y-6">
      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-4">
          <label className="block text-sm font-semibold text-foreground">Upload Video File</label>
          <div className="rounded-2xl border border-dashed border-border p-6 text-center bg-muted/20 hover:bg-muted/30 transition-colors cursor-pointer">
            <input
              type="file"
              id="vid-comp-upload"
              accept="video/*"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) {
                  setFile(f);
                  setError("");
                  setResult(null);
                  setProgress(0);
                }
              }}
            />
            <label
              htmlFor="vid-comp-upload"
              className="cursor-pointer flex flex-col items-center gap-1"
            >
              <Upload className="size-6 text-primary" />
              <span className="text-xs font-semibold text-foreground">
                {file ? file.name : "Drop a video here, or click to browse"}
              </span>
              {file && (
                <span className="text-[11px] text-muted-foreground">{formatBytes(file.size)}</span>
              )}
            </label>
          </div>
          <div>
            <label className="text-xs text-muted-foreground">
              Quality (CRF {crf} — higher = smaller file)
            </label>
            <input
              type="range"
              min={20}
              max={40}
              step={2}
              value={crf}
              onChange={(e) => setCrf(Number(e.target.value))}
              className="w-full accent-primary"
            />
          </div>
          <p className="text-[11px] text-muted-foreground">
            Re-encodes to MP4 (H.264) with adjustable compression. Powered by FFmpeg in your
            browser.
          </p>
          <button
            type="button"
            onClick={handleProcess}
            disabled={!file || isProcessing}
            className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50"
          >
            {isProcessing ? (
              <>
                <RefreshCw className="size-4 animate-spin" />
                Compressing... {progress}%
              </>
            ) : (
              <>
                <FileVideo className="size-4" />
                Compress Video
              </>
            )}
          </button>
        </div>
        <div className="space-y-4 flex flex-col justify-between">
          <div className="h-full rounded-2xl border border-border bg-background/50 p-4 text-sm flex flex-col items-center justify-center text-center gap-3">
            {error ? (
              <div className="flex flex-col items-center gap-2 text-destructive">
                <AlertCircle className="size-8" />
                <span className="text-xs">{error}</span>
              </div>
            ) : result ? (
              <div className="flex flex-col items-center gap-2 text-emerald-600">
                <FileVideo className="size-8" />
                <span className="text-sm font-semibold">{result.name}</span>
                <span className="text-xs text-muted-foreground">{formatBytes(result.size)}</span>
                <span className="text-xs">
                  {result.saved > 0
                    ? `Saved ${formatBytes(result.saved)} (${Math.round((result.saved / file!.size) * 100)}% smaller)`
                    : "Re-encoded"}
                </span>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-2 text-muted-foreground">
                <FileVideo className="size-8 opacity-40" />
                <span>Your compressed video will download here.</span>
              </div>
            )}
          </div>
          <div className="rounded-xl border border-border/70 bg-muted/10 p-3.5 flex items-center gap-3">
            <ShieldCheck className="size-5 text-emerald-500 shrink-0" />
            <p className="text-xs text-muted-foreground">
              100% Client-side processing. Your files and data remain strictly on your local device.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export const VideoCompressorRuntime: ReadyToolRuntimeDefinition = {
  toolId: "video-compressor",
  slug: "video-compressor",
  categoryId: "video",
  icon: FileVideo,
  component: VideoCompressorTool,
  layoutDescription:
    "Compress videos with adjustable quality using FFmpeg, entirely in your browser.",
  layoutDescriptionKey: "tool.video-compressor.pageDescription",
};
