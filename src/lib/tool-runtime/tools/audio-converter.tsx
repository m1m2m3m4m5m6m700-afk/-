import { useState } from "react";
import {
  FileVideoCamera,
  Download,
  RefreshCw,
  Upload,
  ShieldCheck,
  AlertCircle,
} from "lucide-react";
import {
  assertFileValid,
  audioBufferToWav,
  decodeAudioFile,
  downloadBlob,
  formatBytes,
  friendlyError,
} from "@/lib/utils";
import type { ReadyToolRuntimeDefinition } from "../types";

function AudioConverterTool() {
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<{ name: string; size: number; info: string } | null>(null);
  const [sampleRate, setSampleRate] = useState(44100);

  const handleProcess = async () => {
    if (!file) return;
    setIsProcessing(true);
    setError("");
    setResult(null);
    try {
      assertFileValid(file, { kind: "audio", maxBytes: 100 * 1024 * 1024 });
      const buffer = await decodeAudioFile(file);
      const wav = audioBufferToWav(buffer, { sampleRate, mono: false });
      const outName = file.name.replace(/\.[^.]+$/, "") + ".wav";
      downloadBlob(wav, outName, "audio/wav");
      setResult({
        name: outName,
        size: wav.byteLength,
        info: `${buffer.numberOfChannels} ch · ${sampleRate} Hz`,
      });
    } catch (e) {
      setError(
        friendlyError(
          e,
          "Failed to convert audio. Please upload a valid audio file (MP3, WAV, OGG, M4A, FLAC).",
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
              id="audio-conv-upload"
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
              htmlFor="audio-conv-upload"
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
          <p className="text-[11px] text-muted-foreground">
            Decodes MP3, WAV, OGG, M4A, FLAC and converts to high-quality WAV.
          </p>
          <div>
            <label className="text-xs text-muted-foreground">Output sample rate</label>
            <select
              value={sampleRate}
              onChange={(e) => setSampleRate(Number(e.target.value))}
              className="w-full mt-1 rounded-lg border border-border bg-background p-2 text-sm"
            >
              <option value={48000}>48 kHz</option>
              <option value={44100}>44.1 kHz (CD)</option>
              <option value={22050}>22 kHz</option>
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
                Converting...
              </>
            ) : (
              <>
                <FileVideoCamera className="size-4" />
                Convert to WAV
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
                <FileVideoCamera className="size-8" />
                <span className="text-sm font-semibold">{result.name}</span>
                <span className="text-xs text-muted-foreground">{formatBytes(result.size)}</span>
                <span className="text-xs">{result.info}</span>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-2 text-muted-foreground">
                <FileVideoCamera className="size-8 opacity-40" />
                <span>Your converted audio will download here.</span>
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

export const AudioConverterRuntime: ReadyToolRuntimeDefinition = {
  toolId: "audio-converter",
  slug: "audio-converter",
  categoryId: "audio",
  icon: FileVideoCamera,
  component: AudioConverterTool,
  layoutDescription:
    "Convert audio files between formats (to WAV) with selectable sample rate, entirely in your browser.",
  layoutDescriptionKey: "tool.audio-converter.pageDescription",
};
