import { useState } from "react";
import { Scissors, Download, RefreshCw, Upload, ShieldCheck, AlertCircle } from "lucide-react";
import {
  assertFileValid,
  audioBufferToWav,
  decodeAudioFile,
  downloadBlob,
  formatBytes,
  friendlyError,
} from "@/lib/utils";
import type { ReadyToolRuntimeDefinition } from "../types";

function AudioCutterTool() {
  const [file, setFile] = useState<File | null>(null);
  const [duration, setDuration] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<{ name: string; size: number } | null>(null);
  const [startSec, setStartSec] = useState(0);
  const [endSec, setEndSec] = useState(0);

  const handleFile = async (f: File) => {
    setFile(f);
    setError("");
    setResult(null);
    try {
      assertFileValid(f, { kind: "audio", maxBytes: 100 * 1024 * 1024 });
      const buffer = await decodeAudioFile(f);
      setDuration(buffer.duration);
      setStartSec(0);
      setEndSec(Math.round(buffer.duration * 10) / 10);
    } catch (e) {
      setError(friendlyError(e, "Could not read this audio file's duration."));
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
    try {
      assertFileValid(file, { kind: "audio", maxBytes: 100 * 1024 * 1024 });
      const buffer = await decodeAudioFile(file);
      const sr = buffer.sampleRate;
      const startSample = Math.floor(startSec * sr);
      const endSample = Math.min(Math.floor(endSec * sr), buffer.length);
      const frameCount = endSample - startSample;
      if (frameCount <= 0) throw new Error("Selected range is empty.");
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      const ctx = new AudioCtx();
      const sliced = ctx.createBuffer(buffer.numberOfChannels, frameCount, sr);
      for (let c = 0; c < buffer.numberOfChannels; c++) {
        const src = buffer.getChannelData(c);
        sliced.copyToChannel(src.slice(startSample, endSample), c);
      }
      ctx.close();
      const wav = audioBufferToWav(sliced);
      const outName = file.name.replace(/\.[^.]+$/, "") + "-cut.wav";
      downloadBlob(wav, outName, "audio/wav");
      setResult({ name: outName, size: wav.byteLength });
    } catch (e) {
      setError(friendlyError(e, "Failed to cut audio. Please upload a valid audio file."));
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
              id="audio-cut-upload"
              accept="audio/*"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) handleFile(f);
              }}
            />
            <label
              htmlFor="audio-cut-upload"
              className="cursor-pointer flex flex-col items-center gap-1"
            >
              <Upload className="size-6 text-primary" />
              <span className="text-xs font-semibold text-foreground">
                {file ? file.name : "Drop audio here, or click to browse"}
              </span>
              {file && (
                <span className="text-[11px] text-muted-foreground">
                  {formatBytes(file.size)} · {duration.toFixed(1)}s
                </span>
              )}
            </label>
          </div>
          {duration > 0 && (
            <div className="space-y-2">
              <div>
                <label className="text-xs text-muted-foreground">
                  Start: {startSec.toFixed(1)}s
                </label>
                <input
                  type="range"
                  min={0}
                  max={duration}
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
                  max={duration}
                  step={0.1}
                  value={endSec}
                  onChange={(e) => setEndSec(Number(e.target.value))}
                  className="w-full accent-primary"
                />
              </div>
              <p className="text-[11px] text-muted-foreground">
                Output length: {(endSec - startSec).toFixed(1)}s
              </p>
            </div>
          )}
          <button
            type="button"
            onClick={handleProcess}
            disabled={!file || isProcessing}
            className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50"
          >
            {isProcessing ? (
              <>
                <RefreshCw className="size-4 animate-spin" />
                Cutting...
              </>
            ) : (
              <>
                <Scissors className="size-4" />
                Cut Audio
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
                <span>Your trimmed audio will download here.</span>
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

export const AudioCutterRuntime: ReadyToolRuntimeDefinition = {
  toolId: "audio-cutter",
  slug: "audio-cutter",
  categoryId: "audio",
  icon: Scissors,
  component: AudioCutterTool,
  layoutDescription: "Trim audio to an exact start and end point, entirely in your browser.",
  layoutDescriptionKey: "tool.audio-cutter.pageDescription",
};
