import { useState, type ReactNode } from "react";
import { Link } from "react-router-dom";
import { Search, X } from "lucide-react";
import { toast } from "sonner";
import { api, type SearchResult } from "../lib/api";
import { formatDate, formatDuration } from "../lib/utils";

const STORAGE_KEY = "echoes_searches";
const MAX_HISTORY = 5;

function getHistory(): string[] {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "[]"); }
  catch { return []; }
}

function saveToHistory(q: string) {
  const prev = getHistory().filter((s) => s !== q);
  localStorage.setItem(STORAGE_KEY, JSON.stringify([q, ...prev].slice(0, MAX_HISTORY)));
}

function clearHistory() {
  localStorage.removeItem(STORAGE_KEY);
}

function highlight(text: string, query: string): ReactNode {
  const words = query
    .trim()
    .split(/\s+/)
    .filter((w) => w.length > 2);
  if (!words.length) return text;

  const escaped = words.map((w) => w.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"));
  const splitPat = new RegExp(`(${escaped.join("|")})`, "gi");
  const matchPat = new RegExp(`^(${escaped.join("|")})$`, "i");
  const parts = text.split(splitPat);

  return (
    <>
      {parts.map((part, i) =>
        matchPat.test(part) ? (
          <mark key={i} className="bg-violet-500/25 text-violet-200 rounded-sm px-0.5 not-italic">
            {part}
          </mark>
        ) : (
          <span key={i}>{part}</span>
        ),
      )}
    </>
  );
}

export function SearchPage() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [lastQuery, setLastQuery] = useState("");
  const [history, setHistory] = useState<string[]>(getHistory);

  async function runSearch(q: string) {
    if (!q.trim()) return;
    setLoading(true);
    try {
      const res = await api.search.query(q.trim());
      setResults(res);
      setLastQuery(q.trim());
      setSearched(true);
      saveToHistory(q.trim());
      setHistory(getHistory());
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Search failed");
    } finally {
      setLoading(false);
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    runSearch(query);
  }

  function handleChip(q: string) {
    setQuery(q);
    runSearch(q);
  }

  function handleClearHistory() {
    clearHistory();
    setHistory([]);
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold">Search Memories</h1>
        <p className="text-zinc-500 text-sm mt-1">
          Semantic search — finds entries by meaning, not just keywords.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="flex gap-2">
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

      {history.length > 0 && !searched && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <p className="text-xs text-zinc-500">Recent searches</p>
            <button
              onClick={handleClearHistory}
              className="text-xs text-zinc-600 hover:text-zinc-400 flex items-center gap-1 transition-colors"
            >
              <X size={11} /> Clear
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {history.map((h) => (
              <button
                key={h}
                onClick={() => handleChip(h)}
                className="px-3 py-1 rounded-full text-xs bg-zinc-800 hover:bg-zinc-700 text-zinc-300 transition-colors"
              >
                {h}
              </button>
            ))}
          </div>
        </div>
      )}

      {!searched && !loading && history.length === 0 && (
        <p className="text-zinc-600 text-sm text-center py-10">
          Try something like "times I felt stressed" or "creative ideas".
        </p>
      )}

      {searched && results.length === 0 && (
        <p className="text-zinc-500 text-sm text-center py-10">No matching entries found.</p>
      )}

      {results.length > 0 && (
        <p className="text-xs text-zinc-600">
          {results.length} result{results.length !== 1 ? "s" : ""} for "{lastQuery}"
        </p>
      )}

      <div className="space-y-3">
        {results.map((result) => (
          <Link
            key={result.id}
            to={`/journal/${result.id}`}
            className="block bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 hover:border-zinc-700 rounded-xl p-4 space-y-2 transition-colors"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs text-zinc-500">
                <span>{formatDate(result.createdAt)}</span>
                <span>·</span>
                <span>{formatDuration(result.durationSecs)}</span>
              </div>
              <span
                className="text-xs font-mono px-1.5 py-0.5 rounded bg-violet-500/10 text-violet-400"
                title="Semantic similarity score"
              >
                {Math.round(result.score * 100)}%
              </span>
            </div>
            <p className="text-zinc-300 text-sm leading-relaxed">
              {highlight(result.transcript, lastQuery)}
            </p>
          </Link>
        ))}
      </div>
    </div>
  );
}
