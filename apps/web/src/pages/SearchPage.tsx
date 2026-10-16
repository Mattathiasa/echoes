import { useState } from "react";
import { Search } from "lucide-react";
import { toast } from "sonner";
import { api, type SearchResult } from "../lib/api";
import { formatDate, formatDuration } from "../lib/utils";

export function SearchPage() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (!query.trim()) return;
    setLoading(true);
    try {
      const res = await api.search.query(query.trim());
      setResults(res);
      setSearched(true);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Search failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-semibold">Search Memories</h1>
      <p className="text-zinc-500 text-sm -mt-4">
        Ask anything — semantic search finds entries by meaning, not just keywords.
      </p>

      <form onSubmit={handleSearch} className="flex gap-2">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="e.g. times I felt grateful, work stress, creative ideas…"
          className="flex-1 bg-zinc-900 border border-zinc-700 rounded-lg px-4 py-2.5 text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-violet-500"
        />
        <button
          type="submit"
          disabled={loading || !query.trim()}
          className="bg-violet-600 hover:bg-violet-500 disabled:opacity-50 px-4 py-2.5 rounded-lg transition-colors"
        >
          {loading ? (
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <Search size={16} className="text-white" />
          )}
        </button>
      </form>

      {searched && results.length === 0 && (
        <p className="text-zinc-500 text-sm text-center py-10">No matching entries found.</p>
      )}

      <div className="space-y-3">
        {results.map((result) => (
          <div key={result.id} className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs text-zinc-400">
                <span>{formatDate(result.createdAt)}</span>
                <span>·</span>
                <span>{formatDuration(result.durationSecs)}</span>
              </div>
              <span className="text-xs text-violet-400 font-mono">
                {Math.round(result.score * 100)}% match
              </span>
            </div>
            <p className="text-zinc-300 text-sm leading-relaxed line-clamp-4">{result.transcript}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
