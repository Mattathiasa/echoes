import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { ArrowLeft, Play, Pause, Trash2, Loader2, Pencil, Check, X, Copy, Share2, Tag } from "lucide-react";
import { toast } from "sonner";
import { api, type Entry, type SearchResult } from "../lib/api";
import { useAuth } from "../lib/auth";
import { formatDate, formatDuration } from "../lib/utils";

const SPEEDS = [1, 1.5, 2] as const;
type Speed = (typeof SPEEDS)[number];

function AudioPlayer({ src }: { src: string }) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [playing, setPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [ready, setReady] = useState(false);
  const [speed, setSpeed] = useState<Speed>(1);

  useEffect(() => {
    const audio = new Audio(src);
    audio.onloadedmetadata = () => { setDuration(audio.duration); setReady(true); };
    audio.ontimeupdate = () => setCurrentTime(audio.currentTime);
    audio.onended = () => { setPlaying(false); setCurrentTime(0); };
    audioRef.current = audio;
    return () => { audio.pause(); audioRef.current = null; };
  }, [src]);

  function handlePlayPause() {
    const audio = audioRef.current;
    if (!audio) return;
    if (playing) { audio.pause(); setPlaying(false); }
    else { audio.play().catch(() => toast.error("Could not play audio")); setPlaying(true); }
  }

  function handleSeek(e: React.ChangeEvent<HTMLInputElement>) {
    const t = parseFloat(e.target.value);
    if (audioRef.current) audioRef.current.currentTime = t;
    setCurrentTime(t);
  }

  function cycleSpeed() {
    const next = SPEEDS[(SPEEDS.indexOf(speed) + 1) % SPEEDS.length] as Speed;
    setSpeed(next);
    if (audioRef.current) audioRef.current.playbackRate = next;
  }

  const pct = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
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
            style={{ background: `linear-gradient(to right, #7c3aed ${pct}%, #3f3f46 ${pct}%)` }}
          />
          <div className="flex justify-between text-xs text-zinc-500 tabular-nums">
            <span>{formatDuration(Math.floor(currentTime))}</span>
            <div className="flex items-center gap-3">
              <button
                onClick={cycleSpeed}
                disabled={!ready}
                className="font-mono text-zinc-500 hover:text-violet-400 disabled:opacity-40 transition-colors tabular-nums"
                title="Cycle playback speed"
              >
                {speed}×
              </button>
              <span>{formatDuration(Math.floor(duration))}</span>
            </div>
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
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [editing, setEditing] = useState(false);
  const [related, setRelated] = useState<SearchResult[]>([]);
  const [editText, setEditText] = useState("");
  const [saving, setSaving] = useState(false);
  const [editingTags, setEditingTags] = useState(false);
  const [tagDraft, setTagDraft] = useState("");
  const [pendingTags, setPendingTags] = useState<string[]>([]);

  useEffect(() => {
    if (!id) { navigate("/journal"); return; }
    api.entries
      .get(id)
      .then((e) => {
        setEntry(e);
        // Fetch related entries using the first ~100 words as the query
        const query = e.transcript.trim().split(/\s+/).slice(0, 100).join(" ");
        api.search.query(query, 4).then((results) => {
          setRelated(results.filter((r) => r.id !== e.id).slice(0, 3));
        }).catch(() => {});
      })
      .catch(() => { toast.error("Entry not found"); navigate("/journal"); })
      .finally(() => setLoading(false));
  }, [id]);

  function startEdit() {
    if (!entry) return;
    setEditText(entry.transcript);
    setEditing(true);
  }

  function cancelEdit() {
    setEditing(false);
    setEditText("");
  }

  async function handleSave() {
    if (!entry || !editText.trim()) return;
    setSaving(true);
    try {
      const updated = await api.entries.update(entry.id, { transcript: editText.trim() });
      setEntry(updated);
      setEditing(false);
      setEditText("");
      toast.success("Transcript updated");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to save");
    } finally {
      setSaving(false);
    }
  }

  function openTagEditor() {
    if (!entry) return;
    setPendingTags(entry.tags ?? []);
    setTagDraft("");
    setEditingTags(true);
  }

  function addTag() {
    const t = tagDraft.trim().toLowerCase().replace(/\s+/g, "-");
    if (!t || pendingTags.includes(t) || pendingTags.length >= 5) return;
    setPendingTags((prev) => [...prev, t]);
    setTagDraft("");
  }

  async function saveTags() {
    if (!entry) return;
    setSaving(true);
    try {
      const updated = await api.entries.update(entry.id, { tags: pendingTags });
      setEntry(updated);
      setEditingTags(false);
      toast.success("Tags saved");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to save tags");
    } finally {
      setSaving(false);
    }
  }

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
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-zinc-800 animate-pulse shrink-0" />
          <div className="h-4 w-40 bg-zinc-800 rounded animate-pulse" />
        </div>
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-zinc-800 animate-pulse shrink-0" />
            <div className="flex-1 space-y-2">
              <div className="h-1.5 w-full bg-zinc-800 rounded-full animate-pulse" />
              <div className="flex justify-between">
                <div className="h-3 w-8 bg-zinc-800 rounded animate-pulse" />
                <div className="h-3 w-8 bg-zinc-800 rounded animate-pulse" />
              </div>
            </div>
          </div>
        </div>
        <div className="space-y-2">
          <div className="h-3.5 w-full bg-zinc-800 rounded animate-pulse" />
          <div className="h-3.5 w-5/6 bg-zinc-800 rounded animate-pulse" />
          <div className="h-3.5 w-4/6 bg-zinc-800 rounded animate-pulse" />
          <div className="h-3.5 w-full bg-zinc-800 rounded animate-pulse" />
          <div className="h-3.5 w-3/4 bg-zinc-800 rounded animate-pulse" />
        </div>
      </div>
    );
  }

  if (!entry || !user) return null;

  const wordCount = entry.transcript.trim().split(/\s+/).filter(Boolean).length;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate("/journal")}
          className="text-zinc-400 hover:text-zinc-100 transition-colors"
        >
          <ArrowLeft size={20} />
        </button>
        <div className="flex-1 min-w-0">
          <p className="text-sm text-zinc-400">{formatDate(entry.createdAt, true)}</p>
        </div>
        {confirmDelete ? (
          <div className="flex items-center gap-3">
            <span className="text-xs text-zinc-400">Delete this entry?</span>
            <button
              onClick={handleDelete}
              disabled={deleting}
              className="flex items-center gap-1 text-xs text-red-400 hover:text-red-300 font-medium disabled:opacity-50 transition-colors"
            >
              {deleting && <Loader2 size={12} className="animate-spin" />}
              Yes
            </button>
            <button
              onClick={() => setConfirmDelete(false)}
              className="text-xs text-zinc-500 hover:text-zinc-300 transition-colors"
            >
              Cancel
            </button>
          </div>
        ) : (
          <button
            onClick={() => setConfirmDelete(true)}
            disabled={editing}
            className="flex items-center gap-1.5 text-sm text-zinc-500 hover:text-red-400 disabled:opacity-50 transition-colors"
          >
            <Trash2 size={15} />
            Delete
          </button>
        )}
      </div>

      <AudioPlayer src={api.audio.url(user.id, entry.audioPath)} />

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 text-xs text-zinc-500">
            <span>{formatDuration(entry.durationSecs)}</span>
            <span>·</span>
            <span>{wordCount} words</span>
          </div>
          {!editing && (
            <div className="flex items-center gap-3">
              <button
                onClick={async () => {
                  await navigator.clipboard.writeText(entry.transcript);
                  toast.success("Copied to clipboard");
                }}
                className="flex items-center gap-1.5 text-xs text-zinc-500 hover:text-zinc-300 transition-colors"
                title="Copy transcript"
              >
                <Copy size={13} />
              </button>
              {typeof navigator.share === "function" && (
                <button
                  onClick={() =>
                    navigator.share({
                      title: `echoes — ${formatDate(entry.createdAt)}`,
                      text: entry.transcript,
                    }).catch(() => {})
                  }
                  className="flex items-center gap-1.5 text-xs text-zinc-500 hover:text-zinc-300 transition-colors"
                  title="Share"
                >
                  <Share2 size={13} />
                </button>
              )}
              <button
                onClick={startEdit}
                className="flex items-center gap-1.5 text-xs text-zinc-500 hover:text-violet-400 transition-colors"
              >
                <Pencil size={13} />
                Edit
              </button>
            </div>
          )}
        </div>

        {editing ? (
          <div className="space-y-3">
            <textarea
              value={editText}
              onChange={(e) => setEditText(e.target.value)}
              rows={12}
              className="w-full bg-zinc-900 border border-violet-600 rounded-xl px-4 py-3 text-sm text-zinc-200 leading-relaxed focus:outline-none focus:ring-1 focus:ring-violet-500 resize-none"
            />
            <div className="flex gap-2">
              <button
                onClick={handleSave}
                disabled={saving || !editText.trim()}
                className="flex items-center gap-1.5 bg-violet-600 hover:bg-violet-500 disabled:opacity-50 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors"
              >
                {saving ? <Loader2 size={13} className="animate-spin" /> : <Check size={13} />}
                Save
              </button>
              <button
                onClick={cancelEdit}
                disabled={saving}
                className="flex items-center gap-1.5 border border-zinc-700 hover:border-zinc-500 text-zinc-400 hover:text-zinc-200 px-3 py-1.5 rounded-lg text-sm transition-colors"
              >
                <X size={13} />
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <p className="text-zinc-200 text-sm leading-relaxed whitespace-pre-wrap">
            {entry.transcript}
          </p>
        )}
      </div>

      {/* Tags section */}
      <div className="space-y-2">
        {editingTags ? (
          <div className="space-y-3">
            <div className="flex flex-wrap gap-2">
              {pendingTags.map((t) => (
                <span
                  key={t}
                  className="flex items-center gap-1 px-2.5 py-1 rounded-full text-xs bg-violet-500/15 text-violet-300 border border-violet-500/25"
                >
                  #{t}
                  <button
                    onClick={() => setPendingTags((prev) => prev.filter((x) => x !== t))}
                    className="text-violet-400 hover:text-violet-200"
                  >
                    <X size={10} />
                  </button>
                </span>
              ))}
            </div>
            {pendingTags.length < 5 && (
              <div className="flex gap-2">
                <input
                  value={tagDraft}
                  onChange={(e) => setTagDraft(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addTag(); } }}
                  placeholder="Add tag…"
                  maxLength={30}
                  className="flex-1 bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-1.5 text-sm text-zinc-100 placeholder-zinc-600 focus:outline-none focus:ring-1 focus:ring-violet-500"
                />
                <button
                  onClick={addTag}
                  disabled={!tagDraft.trim()}
                  className="px-3 py-1.5 rounded-lg text-sm bg-zinc-800 hover:bg-zinc-700 disabled:opacity-40 text-zinc-300 transition-colors"
                >
                  Add
                </button>
              </div>
            )}
            <div className="flex gap-2">
              <button
                onClick={saveTags}
                disabled={saving}
                className="flex items-center gap-1.5 bg-violet-600 hover:bg-violet-500 disabled:opacity-50 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors"
              >
                {saving ? <Loader2 size={13} className="animate-spin" /> : <Check size={13} />}
                Save tags
              </button>
              <button
                onClick={() => setEditingTags(false)}
                disabled={saving}
                className="flex items-center gap-1.5 border border-zinc-700 hover:border-zinc-500 text-zinc-400 hover:text-zinc-200 px-3 py-1.5 rounded-lg text-sm transition-colors"
              >
                <X size={13} />
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-2 flex-wrap">
            {(entry.tags ?? []).map((t) => (
              <span
                key={t}
                className="px-2.5 py-1 rounded-full text-xs bg-violet-500/10 text-violet-400 border border-violet-500/20"
              >
                #{t}
              </span>
            ))}
            {!editing && (
              <button
                onClick={openTagEditor}
                className="flex items-center gap-1 text-xs text-zinc-600 hover:text-zinc-400 transition-colors"
              >
                <Tag size={12} />
                {(entry.tags ?? []).length === 0 ? "Add tags" : "Edit"}
              </button>
            )}
          </div>
        )}
      </div>

      {related.length > 0 && (
        <div className="space-y-3 border-t border-zinc-800 pt-6">
          <p className="text-xs font-medium text-zinc-500 uppercase tracking-wider">
            Related memories
          </p>
          <div className="space-y-2">
            {related.map((r) => (
              <Link
                key={r.id}
                to={`/journal/${r.id}`}
                className="block bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 hover:border-zinc-700 rounded-xl p-4 space-y-1.5 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs text-zinc-500">{formatDate(r.createdAt)}</span>
                  <span className="text-xs font-mono px-1.5 py-0.5 rounded bg-violet-500/10 text-violet-400">
                    {Math.round(r.score * 100)}%
                  </span>
                </div>
                <p className="text-zinc-300 text-sm leading-relaxed line-clamp-2">
                  {r.transcript}
                </p>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
