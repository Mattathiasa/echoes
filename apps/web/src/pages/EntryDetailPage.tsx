import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Play, Pause, Trash2, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { api, type Entry } from "../lib/api";
import { useAuth } from "../lib/auth";
import { formatDate, formatDuration } from "../lib/utils";

function AudioPlayer({ src }: { src: string }) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [playing, setPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const audio = new Audio(src);
    audio.onloadedmetadata = () => {
      setDuration(audio.duration);
      setReady(true);
    };
    audio.ontimeupdate = () => setCurrentTime(audio.currentTime);
    audio.onended = () => {
      setPlaying(false);
      setCurrentTime(0);
    };
    audioRef.current = audio;
    return () => {
      audio.pause();
      audioRef.current = null;
    };
  }, [src]);

  function handlePlayPause() {
    const audio = audioRef.current;
    if (!audio) return;
    if (playing) {
      audio.pause();
      setPlaying(false);
    } else {
      audio.play().catch(() => toast.error("Could not play audio"));
      setPlaying(true);
    }
  }

  function handleSeek(e: React.ChangeEvent<HTMLInputElement>) {
    const t = parseFloat(e.target.value);
    if (audioRef.current) audioRef.current.currentTime = t;
    setCurrentTime(t);
  }

  const pct = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 space-y-3">
      <div className="flex items-center gap-3">
        <button
          onClick={handlePlayPause}
          disabled={!ready}
          className="w-9 h-9 rounded-full bg-violet-600 hover:bg-violet-500 disabled:opacity-40 flex items-center justify-center transition-colors shrink-0"
        >
          {playing ? <Pause size={16} className="text-white" /> : <Play size={16} className="text-white ml-0.5" />}
        </button>

        <div className="flex-1 space-y-1">
          <input
            type="range"
            min={0}
            max={duration || 0}
            step={0.1}
            value={currentTime}
            onChange={handleSeek}
            disabled={!ready}
            className="w-full h-1.5 appearance-none rounded-full bg-zinc-700 disabled:opacity-40"
            style={{
              background: `linear-gradient(to right, #7c3aed ${pct}%, #3f3f46 ${pct}%)`,
            }}
          />
          <div className="flex justify-between text-xs text-zinc-500 tabular-nums">
            <span>{formatDuration(Math.floor(currentTime))}</span>
            <span>{formatDuration(Math.floor(duration))}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export function EntryDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [entry, setEntry] = useState<Entry | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (!id) { navigate("/journal"); return; }
    api.entries
      .get(id)
      .then(setEntry)
      .catch(() => { toast.error("Entry not found"); navigate("/journal"); })
      .finally(() => setLoading(false));
  }, [id]);

  async function handleDelete() {
    if (!entry) return;
    setDeleting(true);
    try {
      await api.entries.delete(entry.id);
      toast.success("Entry deleted");
      navigate("/journal");
    } catch {
      toast.error("Failed to delete entry");
      setDeleting(false);
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="w-6 h-6 rounded-full border-2 border-violet-400 border-t-transparent animate-spin" />
      </div>
    );
  }

  if (!entry || !user) return null;

  const audioSrc = api.audio.url(user.id, entry.audioPath);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate("/journal")}
          className="text-zinc-400 hover:text-zinc-100 transition-colors"
        >
          <ArrowLeft size={20} />
        </button>
        <div className="flex-1">
          <p className="text-sm text-zinc-400">{formatDate(entry.createdAt)}</p>
        </div>
        <button
          onClick={handleDelete}
          disabled={deleting}
          className="flex items-center gap-1.5 text-sm text-zinc-500 hover:text-red-400 disabled:opacity-50 transition-colors"
        >
          {deleting ? <Loader2 size={15} className="animate-spin" /> : <Trash2 size={15} />}
          Delete
        </button>
      </div>

      <AudioPlayer src={audioSrc} />

      <div className="space-y-2">
        <div className="flex items-center gap-2 text-xs text-zinc-500">
          <span>{formatDuration(entry.durationSecs)}</span>
        </div>
        <p className="text-zinc-200 text-sm leading-relaxed whitespace-pre-wrap">
          {entry.transcript}
        </p>
      </div>
    </div>
  );
}
