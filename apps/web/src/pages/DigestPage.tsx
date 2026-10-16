import { useState, useEffect } from "react";
import { Sparkles, RefreshCw, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { api, type Digest } from "../lib/api";
import { formatDate } from "../lib/utils";

export function DigestPage() {
  const [digest, setDigest] = useState<Digest | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    api.digest
      .get()
      .then(setDigest)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  async function handleGenerate() {
    setGenerating(true);
    try {
      const d = await api.digest.generate();
      setDigest(d);
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
        <h1 className="text-xl font-semibold">Weekly Digest</h1>
        <button
          onClick={handleGenerate}
          disabled={generating}
          className="flex items-center gap-2 text-sm bg-violet-600 hover:bg-violet-500 disabled:opacity-50 px-3 py-2 rounded-lg transition-colors"
        >
          {generating ? (
            <Loader2 size={14} className="animate-spin" />
          ) : (
            <RefreshCw size={14} />
          )}
          {generating ? "Generating…" : "Generate"}
        </button>
      </div>

      {loading && (
        <div className="flex justify-center py-20">
          <div className="w-6 h-6 rounded-full border-2 border-violet-400 border-t-transparent animate-spin" />
        </div>
      )}

      {!loading && !digest && !generating && (
        <div className="text-center py-20 space-y-3">
          <Sparkles size={40} className="mx-auto text-zinc-600" />
          <p className="text-zinc-500">No digest yet.</p>
          <p className="text-zinc-600 text-sm">
            Record a few voice entries this week, then generate your digest.
          </p>
        </div>
      )}

      {digest && (
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 space-y-4">
          <div className="flex items-center gap-2 text-sm text-zinc-400">
            <Sparkles size={14} className="text-violet-400" />
            <span>Week of {formatDate(digest.weekStart)}</span>
          </div>
          <div className="text-zinc-300 text-sm leading-relaxed whitespace-pre-wrap">
            {digest.summaryText}
          </div>
          <p className="text-xs text-zinc-600">Generated {formatDate(digest.createdAt)}</p>
        </div>
      )}
    </div>
  );
}
