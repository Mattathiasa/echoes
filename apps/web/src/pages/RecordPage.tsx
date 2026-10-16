import { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Mic, Square, Loader2, Check, RotateCcw, Flame } from "lucide-react";
import { ActivityHeatmap } from "../components/ActivityHeatmap";
import { toast } from "sonner";
import { useRecorder } from "../hooks/useRecorder";
import { api, type Stats, type MemoryFlash } from "../lib/api";
import { formatDate, formatDuration, cn } from "../lib/utils";

type Phase = "idle" | "recording" | "transcribing" | "preview" | "saving";

interface PreviewData {
  transcript: string;
  blob: Blob;
  durationSecs: number;
}

export function RecordPage() {
  const navigate = useNavigate();
  const { state: recorderState, error, audioLevels, startRecording, stopRecording, reset: resetRecorder } = useRecorder();
  const [phase, setPhase] = useState<Phase>("idle");
  const [elapsed, setElapsed] = useState(0);
  const [preview, setPreview] = useState<PreviewData | null>(null);
  const [editedTranscript, setEditedTranscript] = useState("");
  const [stats, setStats] = useState<Stats | null>(null);
  const [flashes, setFlashes] = useState<MemoryFlash[]>([]);
  const [activity, setActivity] = useState<{ date: string; count: number }[]>([]);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    api.stats.get().then(setStats).catch(() => {});
    api.memories.flash().then(setFlashes).catch(() => {});
    api.stats.activity().then(setActivity).catch(() => {});
  }, []);

  // Space bar starts/stops recording when focus is not in a text field
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.code !== "Space" || e.repeat) return;
      const tag = (e.target as HTMLElement).tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || tag === "BUTTON") return;
      if ((e.target as HTMLElement).isContentEditable) return;
      e.preventDefault();
      if (phase === "idle") handleStart();
      else if (phase === "recording") handleStop();
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  // handleStart/handleStop are stable within a given phase; re-register on phase change
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase]);

  function clearTimer() {
    if (intervalRef.current !== null) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setElapsed(0);
  }

  async function handleStart() {
    await startRecording();
    const start = Date.now();
    intervalRef.current = setInterval(
      () => setElapsed(Math.floor((Date.now() - start) / 1000)),
      500,
    );
    setPhase("recording");
  }

  async function handleStop() {
    clearTimer();
    try {
      const { blob, durationSecs } = await stopRecording();
      setPhase("transcribing");
      const { transcript } = await api.entries.transcribe(blob);
      setPreview({ transcript, blob, durationSecs });
      setEditedTranscript(transcript);
      setPhase("preview");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Transcription failed");
      resetRecorder();
      setPhase("idle");
    }
  }

  async function handleSave() {
    if (!preview) return;
    setPhase("saving");
    try {
      await api.entries.create(preview.blob, preview.durationSecs, editedTranscript.trim() || preview.transcript);
      toast.success("Entry saved");
      navigate("/journal");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to save entry");
      setPhase("preview");
    }
  }

  function handleDiscard() {
    setPreview(null);
    setEditedTranscript("");
    resetRecorder();
    setPhase("idle");
  }

  if (phase === "preview" && preview) {
    return (
      <div className="space-y-5">
        <div>
          <h1 className="text-xl font-semibold">Review your entry</h1>
          <p className="text-zinc-500 text-sm mt-1">
            Edit the transcript if Whisper got anything wrong, then save.
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs text-zinc-500">
          <span>{formatDuration(preview.durationSecs)}</span>
        </div>
        <textarea
          value={editedTranscript}
          onChange={(e) => setEditedTranscript(e.target.value)}
          rows={10}
          className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-4 py-3 text-sm text-zinc-200 leading-relaxed focus:outline-none focus:ring-1 focus:ring-violet-500 resize-none"
        />
        <div className="flex gap-3">
          <button
            onClick={handleSave}
            disabled={!editedTranscript.trim()}
            className="flex-1 flex items-center justify-center gap-2 bg-violet-600 hover:bg-violet-500 disabled:opacity-50 py-2.5 rounded-lg text-sm font-medium transition-colors"
          >
            <Check size={15} />
            Save entry
          </button>
          <button
            onClick={handleDiscard}
            className="flex items-center justify-center gap-2 border border-zinc-700 hover:border-zinc-500 text-zinc-400 hover:text-zinc-200 px-4 py-2.5 rounded-lg text-sm transition-colors"
          >
            <RotateCcw size={15} />
            Discard
          </button>
        </div>
      </div>
    );
  }

  const isRecording = phase === "recording";
  const isBusy = phase === "transcribing" || phase === "saving" || recorderState === "processing";

  return (
    <div className="space-y-10">
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-10">
        <div className="text-center">
          <h1 className="text-2xl font-semibold">What's on your mind?</h1>
          <p className="text-zinc-500 text-sm mt-1">
            {isRecording ? "Tap the square to stop." : "Tap the mic to start recording."}
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
          <p className="text-zinc-400 tabular-nums text-sm">
            {String(Math.floor(elapsed / 60)).padStart(2, "0")}:
            {String(elapsed % 60).padStart(2, "0")}
          </p>
        )}

        <button
          onClick={isRecording ? handleStop : handleStart}
          disabled={isBusy}
          className={cn(
            "w-24 h-24 rounded-full flex items-center justify-center transition-all shadow-lg",
            isRecording
              ? "bg-red-500 hover:bg-red-600 scale-110"
              : "bg-violet-600 hover:bg-violet-500",
            isBusy && "opacity-50 cursor-not-allowed scale-100",
          )}
        >
          {isBusy ? (
            <Loader2 size={32} className="animate-spin text-white" />
          ) : isRecording ? (
            <Square size={28} className="text-white" fill="white" />
          ) : (
            <Mic size={32} className="text-white" />
          )}
        </button>

        {phase === "transcribing" && (
          <p className="text-zinc-500 text-sm animate-pulse">Transcribing your entry…</p>
        )}
        {phase === "saving" && (
          <p className="text-zinc-500 text-sm animate-pulse">Saving…</p>
        )}

        {!isRecording && !isBusy && stats && stats.totalEntries > 0 && (
          <div className="flex items-center gap-5 text-xs text-zinc-500">
            {stats.streakDays > 0 && (
              <span className="flex items-center gap-1">
                <Flame size={13} className="text-orange-400" />
                {stats.streakDays}d streak
              </span>
            )}
            <span>{stats.weekEntries} this week</span>
            <span>{formatDuration(stats.totalDurationSecs)} total</span>
          </div>
        )}

        {!isRecording && !isBusy && (
          <p className="text-zinc-700 text-xs">Press Space to record</p>
        )}

        {error && <p className="text-red-400 text-sm text-center max-w-xs">{error}</p>}
      </div>

      {phase === "idle" && stats && stats.totalEntries > 0 && (
        <ActivityHeatmap data={activity} />
      )}

      {phase === "idle" && flashes.length > 0 && (
        <div className="space-y-3">
          <p className="text-xs font-medium text-zinc-500 uppercase tracking-wider px-1">
            Memories
          </p>
          <div className="space-y-2">
            {flashes.map(({ label, entry }) => (
              <Link
                key={entry.id}
                to={`/journal/${entry.id}`}
                className="block bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 hover:border-zinc-700 rounded-xl p-4 space-y-1.5 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-violet-400">{label}</span>
                  <span className="text-xs text-zinc-500">{formatDate(entry.createdAt)}</span>
                </div>
                <p className="text-zinc-300 text-sm leading-relaxed line-clamp-2">
                  {entry.transcript}
                </p>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
