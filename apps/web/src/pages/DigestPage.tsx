import { useState, useEffect } from "react";
import { Sparkles, RefreshCw, Loader2, ChevronDown, ChevronUp } from "lucide-react";
import { toast } from "sonner";
import { api, type Digest } from "../lib/api";
import { formatDate } from "../lib/utils";

function DigestCard({ digest, defaultOpen = false }: { digest: Digest; defaultOpen?: boolean }) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-zinc-800/50 transition-colors"
      >
        <div className="flex items-center gap-2">
          <Sparkles size={14} className="text-violet-400 shrink-0" />
          <span className="text-sm font-medium text-zinc-200">
            Week of {formatDate(digest.weekStart)}
          </span>
        </div>
        {open ? (
          <ChevronUp size={15} className="text-zinc-500" />
        ) : (
          <ChevronDown size={15} className="text-zinc-500" />
        )}
      </button>

      {open && (
        <div className="px-5 pb-5 space-y-3 border-t border-zinc-800">
          <p className="text-zinc-300 text-sm leading-relaxed whitespace-pre-wrap pt-4">
            {digest.summaryText}
          </p>
          <p className="text-xs text-zinc-600">Generated {formatDate(digest.createdAt)}</p>
        </div>
      )}
    </div>
  );
}

export function DigestPage() {
  const [digests, setDigests] = useState<Digest[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    api.digest
      .list()
      .then(setDigests)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  async function handleGenerate() {
    setGenerating(true);
    try {
      const d = await api.digest.generate();
      // Prepend the new digest, replacing an existing one for the same week if present
      setDigests((prev) => {
        const filtered = prev.filter((x) => x.weekStart !== d.weekStart);
        return [d, ...filtered];
      });
      toast.success("Digest generated");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to generate digest");
    } finally {
      setGenerating(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Weekly Digests</h1>
        <button
          onClick={handleGenerate}
          disabled={generating}
          className="flex items-center gap-2 text-sm bg-violet-600 hover:bg-violet-500 disabled:opacity-50 px-3 py-2 rounded-lg transition-colors"
        >
          {generating ? <Loader2 size={14} className="animate-spin" /> : <RefreshCw size={14} />}
          {generating ? "Generating…" : "Generate"}
        </button>
      </div>

      {loading && (
        <div className="flex justify-center py-20">
          <div className="w-6 h-6 rounded-full border-2 border-violet-400 border-t-transparent animate-spin" />
        </div>
      )}

      {!loading && digests.length === 0 && (
        <div className="text-center py-20 space-y-3">
          <Sparkles size={40} className="mx-auto text-zinc-700" />
          <p className="text-zinc-500">No digests yet.</p>
          <p className="text-zinc-600 text-sm max-w-xs mx-auto">
            Record a few voice entries this week, then tap Generate to create your first digest.
          </p>
        </div>
      )}

      {digests.length > 0 && (
        <div className="space-y-3">
          {digests.map((d, i) => (
            <DigestCard key={d.id ?? d.weekStart} digest={d} defaultOpen={i === 0} />
          ))}
        </div>
      )}
    </div>
  );
}
