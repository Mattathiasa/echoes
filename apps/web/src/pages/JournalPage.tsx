import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Trash2, Play, Pause, ChevronDown, ChevronUp, Mic, X } from "lucide-react";
import { toast } from "sonner";
import { api, type Entry } from "../lib/api";
import { useAuth } from "../lib/auth";
import { formatDate, formatDuration } from "../lib/utils";

const PAGE_SIZE = 20;

function dateGroup(iso: string): string {
  const d = new Date(iso);
  const now = new Date();
  const diffDays = Math.floor((now.getTime() - d.getTime()) / 86_400_000);
  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return "This week";
  if (diffDays < 30) return "This month";
  return d.toLocaleDateString(undefined, { month: "long", year: "numeric" });
}

function EntryCard({
  entry,
  isPlaying,
  onPlay,
  onDelete,
}: {
  entry: Entry;
  isPlaying: boolean;
  onPlay: () => void;
  onDelete: () => void;
}) {
  const navigate = useNavigate();
  const [expanded, setExpanded] = useState(false);
  const isLong = entry.transcript.length > 240;

  return (
    <div
      onClick={() => navigate(`/journal/${entry.id}`)}
      className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 space-y-3 cursor-pointer hover:border-zinc-700 transition-colors"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs text-zinc-500">
          <span>{formatDate(entry.createdAt)}</span>
          <span>·</span>
          <span>{formatDuration(entry.durationSecs)}</span>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={(e) => { e.stopPropagation(); onPlay(); }}
            className="text-zinc-400 hover:text-violet-400 transition-colors"
            title={isPlaying ? "Pause" : "Play"}
          >
            {isPlaying ? <Pause size={15} /> : <Play size={15} />}
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); onDelete(); }}
            className="text-zinc-600 hover:text-red-400 transition-colors"
            title="Delete entry"
          >
            <Trash2 size={15} />
          </button>
        </div>
      </div>

      <p className="text-zinc-300 text-sm leading-relaxed">
        {expanded || !isLong ? entry.transcript : entry.transcript.slice(0, 240) + "…"}
      </p>

      {isLong && (
        <button
          onClick={(e) => { e.stopPropagation(); setExpanded((v) => !v); }}
          className="flex items-center gap-1 text-xs text-zinc-500 hover:text-zinc-300 transition-colors"
        >
          {expanded ? (
            <><ChevronUp size={13} /> Show less</>
          ) : (
            <><ChevronDown size={13} /> Read more</>
          )}
        </button>
      )}
    </div>
  );
}

export function JournalPage() {
  const { user } = useAuth();
  const [entries, setEntries] = useState<Entry[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [filter, setFilter] = useState("");
  const [playingId, setPlayingId] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    api.entries
      .list(PAGE_SIZE, 0)
      .then((rows) => {
        setEntries(rows);
        setHasMore(rows.length === PAGE_SIZE);
      })
      .catch(() => toast.error("Failed to load entries"))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    return () => { audioRef.current?.pause(); };
  }, []);

  async function loadMore() {
    setLoadingMore(true);
    try {
      const rows = await api.entries.list(PAGE_SIZE, entries.length);
      setEntries((prev) => [...prev, ...rows]);
      setHasMore(rows.length === PAGE_SIZE);
    } catch {
      toast.error("Failed to load more entries");
    } finally {
      setLoadingMore(false);
    }
  }

  async function handleDelete(id: string) {
    if (playingId === id) {
      audioRef.current?.pause();
      audioRef.current = null;
      setPlayingId(null);
    }
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

    if (playingId === entry.id) {
      audioRef.current?.pause();
      audioRef.current = null;
      setPlayingId(null);
      return;
    }

    audioRef.current?.pause();
    const audio = new Audio(api.audio.url(user.id, entry.audioPath));
    audio.onended = () => {
      audioRef.current = null;
      setPlayingId(null);
    };
    audio.play().catch(() => toast.error("Could not play audio"));
    audioRef.current = audio;
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
      <div className="flex flex-col items-center text-center py-24 gap-5">
        <div className="w-16 h-16 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center">
          <Mic size={28} className="text-zinc-600" />
        </div>
        <div className="space-y-1">
          <p className="text-zinc-300 font-medium">Your journal is empty</p>
          <p className="text-zinc-500 text-sm max-w-xs">
            Record your first voice entry and it will appear here.
          </p>
        </div>
        <Link
          to="/"
          className="flex items-center gap-2 bg-violet-600 hover:bg-violet-500 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors"
        >
          <Mic size={15} />
          Start recording
        </Link>
      </div>
    );
  }

  const needle = filter.trim().toLowerCase();
  const filteredEntries = needle
    ? entries.filter((e) => e.transcript.toLowerCase().includes(needle))
    : entries;

  const groups: { label: string; items: Entry[] }[] = [];
  for (const entry of filteredEntries) {
    const label = dateGroup(entry.createdAt);
    const last = groups[groups.length - 1];
    if (last && last.label === label) {
      last.items.push(entry);
    } else {
      groups.push({ label, items: [entry] });
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Your Journal</h1>
        <span className="text-xs text-zinc-500">
          {needle
            ? `${filteredEntries.length} of ${entries.length}${hasMore ? "+" : ""}`
            : entries.length > 0
              ? `${entries.length}${hasMore ? "+" : ""} entries`
              : null}
        </span>
      </div>

      <div className="relative">
        <input
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          placeholder="Filter entries…"
          className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 pr-8 text-sm text-zinc-100 placeholder-zinc-600 focus:outline-none focus:ring-1 focus:ring-violet-500 focus:border-violet-600 transition-colors"
        />
        {filter && (
          <button
            onClick={() => setFilter("")}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 transition-colors"
          >
            <X size={14} />
          </button>
        )}
      </div>

      {needle && filteredEntries.length === 0 && (
        <p className="text-zinc-500 text-sm text-center py-8">No entries match "{filter}".</p>
      )}

      {groups.map((group) => (
        <div key={group.label} className="space-y-3">
          <p className="text-xs font-medium text-zinc-500 uppercase tracking-wider px-1">
            {group.label}
          </p>
          {group.items.map((entry) => (
            <EntryCard
              key={entry.id}
              entry={entry}
              isPlaying={playingId === entry.id}
              onPlay={() => handlePlay(entry)}
              onDelete={() => handleDelete(entry.id)}
            />
          ))}
        </div>
      ))}

      {hasMore && (
        <button
          onClick={loadMore}
          disabled={loadingMore}
          className="w-full py-2.5 text-sm text-zinc-500 hover:text-zinc-300 border border-zinc-800 hover:border-zinc-700 rounded-lg transition-colors disabled:opacity-50"
        >
          {loadingMore ? "Loading…" : "Load more"}
        </button>
      )}
    </div>
  );
}
