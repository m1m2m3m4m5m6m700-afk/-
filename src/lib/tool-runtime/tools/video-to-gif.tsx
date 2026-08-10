import { useState } from "react";
import { Clapperboard, Download, RefreshCw, Upload, ShieldCheck, AlertCircle } from "lucide-react";
import {
  assertFileValid,
  downloadBlob,
  formatBytes,
  friendlyError,
  getFfmpeg,
  readFileAsArrayBuffer,
} from "@/lib/utils";
import type { ReadyToolRuntimeDefinition } from "../types";

function VideoToGifTool() {
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<{ name: string; size: number } | null>(null);
  const [progress, setProgress] = useState(0);
  const [fps, setFps] = useState(15);
  const [width, setWidth] = useState(480);
  const [startSec, setStartSec] = useState(0);
  const [duration, setDuration] = useState(5);

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
      const data = new Uint8Array(await readFileAsArrayBuffer(file));
      await ffmpeg.writeFile(inName, data);
      const progressCb = ({ progress }: { progress: number }) =>
        setProgress(Math.round(progress * 100));
      ffmpeg.on("progress", progressCb);
      const ret = await ffmpeg.exec([
        "-ss",
        String(startSec),
        "-t",
        String(duration),
        "-i",
        inName,
        "-vf",
        `fps=${fps},scale=${width}:-1:flags=lanczos`,
        "-loop",
        "0",
        "output.gif",
      ]);
      if (ret !== 0) throw new Error("FFMPEG_PROCESS_FAILED");
      ffmpeg.off("progress", progressCb);
      const outData = (await ffmpeg.readFile("output.gif")) as Uint8Array;
      if (!outData || outData.length === 0) throw new Error("FFMPEG_PROCESS_FAILED");
      const outFile = file.name.replace(/\.[^.]+$/, "") + ".gif";
      downloadBlob(new Uint8Array(outData), outFile, "image/gif");
      setResult({ name: outFile, size: outData.length });
      try {
        await ffmpeg.deleteFile(inName);
        await ffmpeg.deleteFile("output.gif");
      } catch {
        /* ignore */
      }
    } catch (e) {
      setError(friendlyError(e, "Failed to convert video to GIF. The format may be unsupported."));
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
              id="vid2gif-upload"
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
              htmlFor="vid2gif-upload"
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
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-muted-foreground">FPS: {fps}</label>
              <input
                type="range"
                min={5}
                max={30}
                step={1}
                value={fps}
                onChange={(e) => setFps(Number(e.target.value))}
                className="w-full accent-primary"
              />
            </div>
            <div>
              <label className="text-xs text-muted-foreground">Width (px)</label>
              <select
                value={width}
                onChange={(e) => setWidth(Number(e.target.value))}
                className="w-full mt-1 rounded-lg border border-border bg-background p-2 text-sm"
              >
                <option value={320}>320</option>
                <option value={480}>480</option>
                <option value={640}>640</option>
              </select>
            </div>
            <div>
              <label className="text-xs text-muted-foreground">Start (s)</label>
              <input
                type="number"
                min={0}
                step={0.1}
                value={startSec}
                onChange={(e) => setStartSec(Number(e.target.value) || 0)}
                className="w-full mt-1 rounded-lg border border-border bg-background p-2 text-sm"
              />
            </div>
            <div>
              <label className="text-xs text-muted-foreground">Duration (s)</label>
              <input
                type="number"
                min={0.5}
                step={0.5}
                value={duration}
                onChange={(e) => setDuration(Number(e.target.value) || 5)}
                className="w-full mt-1 rounded-lg border border-border bg-background p-2 text-sm"
              />
            </div>
          </div>
          <button
            type="button"
            onClick={handleProcess}
            disabled={!file || isProcessing}
            className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50"
          >
            {isProcessing ? (
              <>
                <RefreshCw className="size-4 animate-spin" />
                Converting... {progress}%
              </>
            ) : (
              <>
                <Clapperboard className="size-4" />
                Convert to GIF
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
                <Clapperboard className="size-8" />
                <span className="text-sm font-semibold">{result.name}</span>
                <span className="text-xs text-muted-foreground">{formatBytes(result.size)}</span>
                <span className="text-xs">Downloaded successfully</span>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-2 text-muted-foreground">
                <Clapperboard className="size-8 opacity-40" />
                <span>Your animated GIF will download here.</span>
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

export const VideoToGifRuntime: ReadyToolRuntimeDefinition = {
  toolId: "video-to-gif",
  slug: "video-to-gif",
  categoryId: "video",
  icon: Clapperboard,
  component: VideoToGifTool,
  layoutDescription:
    "Convert a video clip into an animated GIF with custom FPS and size, using FFmpeg in your browser.",
  layoutDescriptionKey: "tool.video-to-gif.pageDescription",
};
