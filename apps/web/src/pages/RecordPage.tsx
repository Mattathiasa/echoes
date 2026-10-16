import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Mic, Square, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useRecorder } from "../hooks/useRecorder";
import { api } from "../lib/api";
import { cn } from "../lib/utils";

export function RecordPage() {
  const navigate = useNavigate();
  const { state, error, audioLevels, startRecording, stopRecording, reset } = useRecorder();
  const [elapsed, setElapsed] = useState(0);

  async function handleStart() {
    await startRecording();
    const start = Date.now();
    const iv = setInterval(() => setElapsed(Math.floor((Date.now() - start) / 1000)), 500);
    (window as unknown as Record<string, unknown>)["_recorderInterval"] = iv;
  }

  async function handleStop() {
    clearInterval((window as unknown as Record<string, number>)["_recorderInterval"]);
    setElapsed(0);
    try {
      const { blob, durationSecs } = await stopRecording();
      await api.entries.create(blob, durationSecs);
      toast.success("Entry saved");
      navigate("/journal");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to save entry");
      reset();
    }
  }

  const isRecording = state === "recording";
  const isProcessing = state === "processing";

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-10">
      <div>
        <h1 className="text-2xl font-semibold text-center">What's on your mind?</h1>
        <p className="text-zinc-500 text-sm text-center mt-1">
          Tap the mic to start recording your thoughts.
        </p>
      </div>

      {isRecording && (
        <div className="flex items-end gap-0.5 h-12">
          {audioLevels.map((level, i) => (
            <div
              key={i}
              className="w-1.5 bg-violet-400 rounded-full transition-all duration-75"
              style={{ height: `${Math.max(4, level * 48)}px` }}
            />
          ))}
        </div>
      )}

      {isRecording && (
        <p className="text-zinc-400 tabular-nums">
          {String(Math.floor(elapsed / 60)).padStart(2, "0")}:
          {String(elapsed % 60).padStart(2, "0")}
        </p>
      )}

      <button
        onClick={isRecording ? handleStop : handleStart}
        disabled={isProcessing}
        className={cn(
          "w-24 h-24 rounded-full flex items-center justify-center transition-all",
          isRecording
            ? "bg-red-500 hover:bg-red-600 scale-110"
            : "bg-violet-600 hover:bg-violet-500",
          isProcessing && "opacity-50 cursor-not-allowed",
        )}
      >
        {isProcessing ? (
          <Loader2 size={32} className="animate-spin text-white" />
        ) : isRecording ? (
          <Square size={28} className="text-white" fill="white" />
        ) : (
          <Mic size={32} className="text-white" />
        )}
      </button>

      {isProcessing && (
        <p className="text-zinc-500 text-sm animate-pulse">Transcribing your entry…</p>
      )}

      {error && <p className="text-red-400 text-sm text-center max-w-xs">{error}</p>}
    </div>
  );
}
