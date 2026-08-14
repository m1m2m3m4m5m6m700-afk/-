import { useState } from "react";
import { Scissors, Download, RefreshCw, Upload, ShieldCheck, AlertCircle } from "lucide-react";
import {
  assertFileValid,
  downloadBlob,
  formatBytes,
  friendlyError,
  getFfmpeg,
  readFileAsArrayBuffer,
} from "@/lib/utils";
import type { ReadyToolRuntimeDefinition } from "../types";

function VideoTrimmerTool() {
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<{ name: string; size: number } | null>(null);
  const [progress, setProgress] = useState(0);
  const [startSec, setStartSec] = useState(0);
  const [endSec, setEndSec] = useState(10);
  const [duration, setDuration] = useState(0);

  const handleFile = async (f: File) => {
    setFile(f);
    setError("");
    setResult(null);
    setProgress(0);
    let objectUrl: string | null = null;
    try {
      assertFileValid(f, { kind: "video", maxBytes: 512 * 1024 * 1024 });
      const video = document.createElement("video");
      video.preload = "metadata";
      objectUrl = URL.createObjectURL(f);
      video.src = objectUrl;
      await new Promise<void>((res, rej) => {
        video.onloadedmetadata = () => res();
        video.onerror = () => rej(new Error("Could not read video metadata."));
      });
      const dur = video.duration;
      if (!isFinite(dur) || dur <= 0) throw new Error("Could not determine video duration.");
      setDuration(dur);
      setStartSec(0);
      setEndSec(Math.min(10, Math.round(dur * 10) / 10));
    } catch (e) {
      setError(
        friendlyError(e, "Could not read this video's metadata. You can still set times manually."),
      );
      setDuration(0);
    } finally {
      // The object URL was only needed to read metadata; free it immediately.
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    }
  };

  const handleProcess = async () => {
    if (!file) return;
    if (endSec <= startSec) {
      setError("End time must be after start time.");
      return;
    }
    setIsProcessing(true);
    setError("");
    setResult(null);
    setProgress(0);
    try {
      assertFileValid(file, { kind: "video", maxBytes: 512 * 1024 * 1024 });
      const ffmpeg = await getFfmpeg();
      const inExt = (file.name.split(".").pop() || "mp4").toLowerCase();
      const inName = "input." + inExt;
      const outName = "output." + inExt;
      const data = new Uint8Array(await readFileAsArrayBuffer(file));
      await ffmpeg.writeFile(inName, data);
      const progressCb = ({ progress }: { progress: number }) =>
        setProgress(Math.round(progress * 100));
      ffmpeg.on("progress", progressCb);
      const ret = await ffmpeg.exec([
        "-ss",
        String(startSec),
        "-to",
        String(endSec),
        "-i",
        inName,
        "-c",
        "copy",
        outName,
      ]);
      if (ret !== 0) throw new Error("FFMPEG_PROCESS_FAILED");
      ffmpeg.off("progress", progressCb);
      const outData = (await ffmpeg.readFile(outName)) as Uint8Array;
      if (!outData || outData.length === 0) throw new Error("FFMPEG_PROCESS_FAILED");
      const outFile = file.name.replace(/\.[^.]+$/, "") + "-trimmed." + inExt;
      const videoMimeByExt: Record<string, string> = {
        mp4: "video/mp4",
        webm: "video/webm",
        mov: "video/quicktime",
        mkv: "video/x-matroska",
        avi: "video/x-msvideo",
        m4v: "video/x-m4v",
        ogv: "video/ogg",
      };
      downloadBlob(new Uint8Array(outData), outFile, videoMimeByExt[inExt] ?? "video/mp4");
      setResult({ name: outFile, size: outData.length });
      try {
        await ffmpeg.deleteFile(inName);
        await ffmpeg.deleteFile(outName);
      } catch {
        /* ignore */
      }
    } catch (e) {
      setError(friendlyError(e, "Failed to trim video. The format may be unsupported."));
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
              id="vid-trim-upload"
              accept="video/*"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) handleFile(f);
              }}
            />
            <label
              htmlFor="vid-trim-upload"
              className="cursor-pointer flex flex-col items-center gap-1"
            >
              <Upload className="size-6 text-primary" />
              <span className="text-xs font-semibold text-foreground">
                {file ? file.name : "Drop a video here, or click to browse"}
              </span>
              {file && (
                <span className="text-[11px] text-muted-foreground">
                  {formatBytes(file.size)}
                  {duration > 0 ? ` · ${duration.toFixed(1)}s` : ""}
                </span>
              )}
            </label>
          </div>
          <div className="space-y-2">
            <div>
              <label className="text-xs text-muted-foreground">Start: {startSec.toFixed(1)}s</label>
              <input
                type="range"
                min={0}
                max={Math.max(duration, endSec)}
                step={0.1}
                value={startSec}
                onChange={(e) => setStartSec(Number(e.target.value))}
                className="w-full accent-primary"
              />
            </div>
            <div>
              <label className="text-xs text-muted-foreground">End: {endSec.toFixed(1)}s</label>
              <input
                type="range"
                min={0}
                max={Math.max(duration, endSec)}
                step={0.1}
                value={endSec}
                onChange={(e) => setEndSec(Number(e.target.value))}
                className="w-full accent-primary"
              />
            </div>
            <p className="text-[11px] text-muted-foreground">
              Clip length: {(endSec - startSec).toFixed(1)}s
            </p>
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
                Trimming... {progress}%
              </>
            ) : (
              <>
                <Scissors className="size-4" />
                Trim Video
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
                <Scissors className="size-8" />
                <span className="text-sm font-semibold">{result.name}</span>
                <span className="text-xs text-muted-foreground">{formatBytes(result.size)}</span>
                <span className="text-xs">Downloaded successfully</span>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-2 text-muted-foreground">
                <Scissors className="size-8 opacity-40" />
                <span>Your trimmed video will download here.</span>
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

export const VideoTrimmerRuntime: ReadyToolRuntimeDefinition = {
  toolId: "video-trimmer",
  slug: "video-trimmer",
  categoryId: "video",
  icon: Scissors,
  component: VideoTrimmerTool,
  layoutDescription:
    "Trim video to an exact start and end time using FFmpeg, entirely in your browser.",
  layoutDescriptionKey: "tool.video-trimmer.pageDescription",
};
