import { useState, useEffect } from "react";
import { Trash2, Play, Pause } from "lucide-react";
import { toast } from "sonner";
import { api, type Entry } from "../lib/api";
import { useAuth } from "../lib/auth";
import { formatDate, formatDuration, cn } from "../lib/utils";

export function JournalPage() {
  const { user } = useAuth();
  const [entries, setEntries] = useState<Entry[]>([]);
  const [loading, setLoading] = useState(true);
  const [playingId, setPlayingId] = useState<string | null>(null);
  const audioRef = useState<HTMLAudioElement | null>(null)[0];

  useEffect(() => {
    api.entries.list().then(setEntries).catch(() => toast.error("Failed to load entries")).finally(() => setLoading(false));
  }, []);

  async function handleDelete(id: string) {
    try {
      await api.entries.delete(id);
      setEntries((prev) => prev.filter((e) => e.id !== id));
      toast.success("Entry deleted");
    } catch {
      toast.error("Failed to delete entry");
    }
  }

  function handlePlay(entry: Entry) {
    if (!user) return;
    const url = api.audio.url(user.id, entry.audioPath);
    if (playingId === entry.id) {
      setPlayingId(null);
      return;
    }
    const audio = new Audio(url);
    audio.onended = () => setPlayingId(null);
    audio.play().catch(() => toast.error("Could not play audio"));
    setPlayingId(entry.id);
  }

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="w-6 h-6 rounded-full border-2 border-violet-400 border-t-transparent animate-spin" />
      </div>
    );
  }

  if (entries.length === 0) {
    return (
      <div className="text-center py-20 text-zinc-500">
        <p className="text-lg">No entries yet.</p>
        <p className="text-sm mt-1">Record your first voice note to get started.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <h1 className="text-xl font-semibold mb-6">Your Journal</h1>
      {entries.map((entry) => (
        <div key={entry.id} className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm text-zinc-400">
              <span>{formatDate(entry.createdAt)}</span>
              <span>·</span>
              <span>{formatDuration(entry.durationSecs)}</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => handlePlay(entry)}
                className="text-zinc-400 hover:text-violet-400 transition-colors"
              >
                {playingId === entry.id ? <Pause size={16} /> : <Play size={16} />}
              </button>
              <button
                onClick={() => handleDelete(entry.id)}
                className="text-zinc-500 hover:text-red-400 transition-colors"
              >
                <Trash2 size={16} />
              </button>
            </div>
          </div>
          <p className="text-zinc-300 text-sm leading-relaxed line-clamp-4">{entry.transcript}</p>
        </div>
      ))}
    </div>
  );
}
