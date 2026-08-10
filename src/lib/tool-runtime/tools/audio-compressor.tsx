import { useState } from "react";
import { FileMusic, Download, RefreshCw, Upload, ShieldCheck, AlertCircle } from "lucide-react";
import {
  assertFileValid,
  audioBufferToWav,
  decodeAudioFile,
  downloadBlob,
  formatBytes,
  friendlyError,
} from "@/lib/utils";
import type { ReadyToolRuntimeDefinition } from "../types";

function AudioCompressorTool() {
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<{ name: string; size: number; saved: number } | null>(null);
  const [quality, setQuality] = useState<"high" | "medium" | "low">("medium");

  const handleProcess = async () => {
    if (!file) return;
    setIsProcessing(true);
    setError("");
    setResult(null);
    try {
      assertFileValid(file, { kind: "audio", maxBytes: 100 * 1024 * 1024 });
      const buffer = await decodeAudioFile(file);
      const settings =
        quality === "high"
          ? { sampleRate: 44100, mono: false }
          : quality === "medium"
            ? { sampleRate: 22050, mono: false }
            : { sampleRate: 16000, mono: true };
      const wav = audioBufferToWav(buffer, settings);
      const outName = file.name.replace(/\.[^.]+$/, "") + "-compressed.wav";
      downloadBlob(wav, outName, "audio/wav");
      const saved = file.size - wav.byteLength;
      setResult({ name: outName, size: wav.byteLength, saved });
    } catch (e) {
      setError(
        friendlyError(
          e,
          "Failed to compress audio. Please upload a valid audio file (MP3, WAV, OGG, M4A).",
        ),
      );
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="rounded-3xl border border-border bg-card p-6 md:p-8 space-y-6">
      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-4">
          <label className="block text-sm font-semibold text-foreground">Upload Audio File</label>
          <div className="rounded-2xl border border-dashed border-border p-6 text-center bg-muted/20 hover:bg-muted/30 transition-colors cursor-pointer">
            <input
              type="file"
              id="audio-comp-upload"
              accept="audio/*"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) {
                  setFile(f);
                  setError("");
                  setResult(null);
                }
              }}
            />
            <label
              htmlFor="audio-comp-upload"
              className="cursor-pointer flex flex-col items-center gap-1"
            >
              <Upload className="size-6 text-primary" />
              <span className="text-xs font-semibold text-foreground">
                {file ? file.name : "Drop audio here, or click to browse"}
              </span>
              {file && (
                <span className="text-[11px] text-muted-foreground">{formatBytes(file.size)}</span>
              )}
            </label>
          </div>
          <div>
            <label className="text-xs text-muted-foreground">Compression level</label>
            <select
              value={quality}
              onChange={(e) => setQuality(e.target.value as typeof quality)}
              className="w-full mt-1 rounded-lg border border-border bg-background p-2 text-sm"
            >
              <option value="high">High (44.1 kHz stereo)</option>
              <option value="medium">Medium (22 kHz stereo)</option>
              <option value="low">Low (16 kHz mono) — smallest</option>
            </select>
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
                Compressing...
              </>
            ) : (
              <>
                <FileMusic className="size-4" />
                Compress Audio
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
                <FileMusic className="size-8" />
                <span className="text-sm font-semibold">{result.name}</span>
                <span className="text-xs text-muted-foreground">{formatBytes(result.size)}</span>
                <span className="text-xs">
                  {result.saved > 0
                    ? `Saved ${formatBytes(result.saved)} (${Math.round((result.saved / file!.size) * 100)}% smaller)`
                    : "Re-encoded to WAV"}
                </span>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-2 text-muted-foreground">
                <FileMusic className="size-8 opacity-40" />
                <span>Your compressed audio will download here.</span>
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

export const AudioCompressorRuntime: ReadyToolRuntimeDefinition = {
  toolId: "audio-compressor",
  slug: "audio-compressor",
  categoryId: "audio",
  icon: FileMusic,
  component: AudioCompressorTool,
  layoutDescription:
    "Compress audio files by reducing sample rate and channels, entirely in your browser.",
  layoutDescriptionKey: "tool.audio-compressor.pageDescription",
};
