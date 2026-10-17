import { Link } from "react-router-dom";
import {
  Mic,
  Search,
  Sparkles,
  RotateCcw,
  Activity,
  Zap,
  ArrowRight,
  Play,
  Tag,
} from "lucide-react";

// ─── Static app preview data ────────────────────────────────────────────────

const previewEntries = [
  {
    time: "Today at 9:14 AM",
    duration: "2:32",
    transcript:
      "Had a great catch-up with Sarah about her career pivot. She mentioned that switching from engineering to product felt like learning a new language at first — but now she can't imagine going back. Made me think about what I'd do if...",
    tags: ["reflection", "career"],
    score: null,
  },
  {
    time: "Yesterday at 7:48 PM",
    duration: "1:15",
    transcript:
      "Evening walk helped clear my head after that difficult stand-up. I keep circling back to the same worry about the deadline. Maybe the real issue is I haven't broken the work into pieces small enough to...",
    tags: ["work", "clarity"],
    score: null,
  },
  {
    time: "Mon at 8:02 AM",
    duration: "3:44",
    transcript:
      "Read an article on spaced repetition and it finally clicked — this is exactly what I want from journaling. Not just a thought dump, but a system that surfaces the right memory at the right moment...",
    tags: ["ideas", "learning"],
    score: null,
  },
];

const searchPreview = {
  query: "times I felt overwhelmed at work",
  results: [
    { time: "Yesterday at 7:48 PM", score: 94, excerpt: "I keep circling back to the same worry about the deadline…" },
    { time: "2 weeks ago", score: 81, excerpt: "Sprint planning ran three hours. Left feeling like nothing got decided…" },
    { time: "Last month", score: 74, excerpt: "The new codebase is bigger than I expected. Spent most of the day just reading…" },
  ],
};

// ─── Feature cards ───────────────────────────────────────────────────────────

const features = [
  {
    icon: Zap,
    title: "Instant transcription",
    body: "Groq Whisper converts your recording to text in seconds — accurate even with natural pauses and filler words.",
  },
  {
    icon: Search,
    title: "Semantic search",
    body: 'pgvector cosine similarity finds entries by meaning. "Times I felt stuck" surfaces relevant memories even if you never used those words.',
  },
  {
    icon: Sparkles,
    title: "Weekly digest",
    body: "Every week, Groq Llama reads your entries and writes a digest: recurring themes, emotional patterns, and things worth revisiting.",
  },
  {
    icon: RotateCcw,
    title: "Memory flash",
    body: "The home screen resurfaces entries from 1 week, 1 month, and 1 year ago — so the past stays part of your thinking.",
  },
  {
    icon: Activity,
    title: "Activity heatmap",
    body: "A 16-week calendar grid turns your journaling habit into something visible. Streaks are motivating.",
  },
  {
    icon: Tag,
    title: "Tags & filtering",
    body: "Add up to 5 tags per entry. Click any tag in your journal to instantly filter — no separate taxonomy to maintain.",
  },
];

// ─── How it works steps ──────────────────────────────────────────────────────

const steps = [
  {
    n: "01",
    icon: Mic,
    title: "Speak freely",
    body: "Tap the mic and talk. Your day, a decision you're wrestling with, something you noticed. Stop when you're done.",
  },
  {
    n: "02",
    icon: Zap,
    title: "AI does the work",
    body: "Whisper transcribes in seconds. A local embedding model indexes the meaning — no third-party embedding API needed.",
  },
  {
    n: "03",
    icon: Search,
    title: "Discover patterns",
    body: "Search by concept, not keyword. Get weekly summaries. Watch memories surface from months ago at exactly the right time.",
  },
];

// ─── Component ───────────────────────────────────────────────────────────────

export function LandingPage() {
  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col">

      {/* ── Nav ─────────────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-40 border-b border-zinc-800/60 bg-zinc-950/80 backdrop-blur-md">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <span className="font-semibold tracking-tight">echoes</span>
          <div className="flex items-center gap-3 text-sm">
            <Link to="/login" className="text-zinc-400 hover:text-zinc-100 transition-colors">
              Sign in
            </Link>
            <Link
              to="/register"
              className="bg-violet-600 hover:bg-violet-500 px-4 py-1.5 rounded-lg font-medium transition-colors"
            >
              Start free
            </Link>
          </div>
        </div>
      </header>

      {/* ── Hero ────────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden">
        {/* Background glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-violet-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative max-w-5xl mx-auto px-6 pt-20 pb-16 flex flex-col items-center text-center gap-8">
          {/* Badge */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-violet-500/30 bg-violet-500/10 text-violet-300 text-xs font-medium">
            <Zap size={11} />
            Powered by Groq Whisper + pgvector
          </div>

          {/* Headline */}
          <div className="space-y-4 max-w-2xl">
            <h1 className="text-5xl sm:text-6xl font-bold tracking-tight leading-[1.1]">
              Your voice,{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 via-violet-300 to-zinc-200">
                turned into searchable memory.
              </span>
            </h1>
            <p className="text-zinc-400 text-lg sm:text-xl leading-relaxed max-w-xl mx-auto">
              Record daily reflections in seconds. AI transcribes, indexes, and resurfaces them
              exactly when you need them.
            </p>
          </div>

          {/* CTAs */}
          <div className="flex items-center gap-3 flex-wrap justify-center">
            <Link
              to="/register"
              className="flex items-center gap-2 bg-violet-600 hover:bg-violet-500 px-6 py-3 rounded-xl font-semibold text-sm transition-all shadow-lg shadow-violet-900/40 hover:shadow-violet-800/50 hover:-translate-y-0.5"
            >
              Start for free
              <ArrowRight size={15} />
            </Link>
            <Link
              to="/login"
              className="border border-zinc-700 hover:border-zinc-500 text-zinc-300 hover:text-zinc-100 px-6 py-3 rounded-xl text-sm font-medium transition-colors"
            >
              Sign in
            </Link>
          </div>

          <p className="text-zinc-600 text-xs">
            Free forever · No credit card required · Open source
          </p>
        </div>
      </section>

      {/* ── App Preview ─────────────────────────────────────────────────── */}
      <section className="max-w-5xl mx-auto px-6 pb-20 w-full">
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 overflow-hidden shadow-2xl shadow-black/40">
          {/* Fake browser chrome */}
          <div className="border-b border-zinc-800 px-4 py-3 flex items-center gap-2 bg-zinc-900">
            <div className="flex gap-1.5">
              <div className="w-3 h-3 rounded-full bg-zinc-700" />
              <div className="w-3 h-3 rounded-full bg-zinc-700" />
              <div className="w-3 h-3 rounded-full bg-zinc-700" />
            </div>
            <div className="flex-1 mx-4 bg-zinc-800 rounded-md h-6 flex items-center px-3">
              <span className="text-xs text-zinc-500">echoes.app/journal</span>
            </div>
          </div>

          {/* App chrome */}
          <div className="flex flex-col sm:flex-row" style={{ minHeight: 420 }}>
            {/* Sidebar nav (desktop only) */}
            <div className="hidden sm:flex sm:flex-col border-r border-zinc-800 w-14 items-center pt-4 gap-5 bg-zinc-900/60">
              <div className="w-8 h-8 rounded-full bg-violet-600/20 border border-violet-500/30 flex items-center justify-center">
                <Mic size={14} className="text-violet-400" />
              </div>
              <div className="w-8 h-8 rounded-lg bg-zinc-800 flex items-center justify-center">
                <Activity size={14} className="text-zinc-400" />
              </div>
              <div className="w-8 h-8 rounded-lg bg-zinc-800 flex items-center justify-center">
                <Search size={14} className="text-zinc-500" />
              </div>
              <div className="w-8 h-8 rounded-lg bg-zinc-800 flex items-center justify-center">
                <Sparkles size={14} className="text-zinc-500" />
              </div>
            </div>

            {/* Main content — journal list */}
            <div className="flex-1 p-5 space-y-3 overflow-hidden">
              <div className="flex items-center justify-between mb-4">
                <span className="font-semibold text-zinc-100 text-sm">Your Journal</span>
                <span className="text-xs text-zinc-500">3 entries</span>
              </div>

              {previewEntries.map((e, i) => (
                <div
                  key={i}
                  className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-xs text-zinc-500">
                      <span>{e.time}</span>
                      <span>·</span>
                      <span>{e.duration}</span>
                    </div>
                    <button className="text-zinc-600">
                      <Play size={13} />
                    </button>
                  </div>
                  <p className="text-zinc-300 text-xs leading-relaxed line-clamp-2">
                    {e.transcript}
                  </p>
                  <div className="flex gap-1.5">
                    {e.tags.map((t) => (
                      <span
                        key={t}
                        className="px-2 py-0.5 rounded-full text-xs bg-violet-500/10 text-violet-400 border border-violet-500/20"
                      >
                        #{t}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Right panel — semantic search preview (desktop only) */}
            <div className="hidden lg:flex lg:flex-col border-l border-zinc-800 w-72 p-5 space-y-3 bg-zinc-900/30">
              <p className="text-xs font-medium text-zinc-500 uppercase tracking-wider">Semantic search</p>
              <div className="bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-xs text-zinc-400 italic">
                "{searchPreview.query}"
              </div>
              <div className="space-y-2">
                {searchPreview.results.map((r, i) => (
                  <div key={i} className="bg-zinc-900 border border-zinc-800 rounded-xl p-3 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-zinc-500">{r.time}</span>
                      <span className="text-xs font-mono px-1.5 py-0.5 rounded bg-violet-500/10 text-violet-400">
                        {r.score}%
                      </span>
                    </div>
                    <p className="text-zinc-400 text-xs leading-relaxed">{r.excerpt}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <p className="text-center text-xs text-zinc-600 mt-4">
          Static preview — actual app data is your own voice entries
        </p>
      </section>

      {/* ── How it works ────────────────────────────────────────────────── */}
      <section className="border-t border-zinc-800/60 py-20">
        <div className="max-w-5xl mx-auto px-6 space-y-12">
          <div className="text-center space-y-3">
            <h2 className="text-3xl font-bold tracking-tight">How it works</h2>
            <p className="text-zinc-500 max-w-md mx-auto">
              Three steps. Each one takes less than a second on your end.
            </p>
          </div>

          <div className="grid sm:grid-cols-3 gap-6">
            {steps.map(({ n, icon: Icon, title, body }, i) => (
              <div key={i} className="relative space-y-4">
                {/* Connector line between steps (desktop) */}
                {i < steps.length - 1 && (
                  <div className="hidden sm:block absolute top-5 left-full w-full h-px bg-gradient-to-r from-zinc-700 to-transparent -translate-x-1/2 z-0" />
                )}
                <div className="relative z-10 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center shrink-0">
                    <Icon size={18} className="text-violet-400" />
                  </div>
                  <span className="text-3xl font-bold text-zinc-800 tabular-nums">{n}</span>
                </div>
                <div className="space-y-1.5">
                  <h3 className="font-semibold text-zinc-100">{title}</h3>
                  <p className="text-zinc-500 text-sm leading-relaxed">{body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features ────────────────────────────────────────────────────── */}
      <section className="border-t border-zinc-800/60 py-20">
        <div className="max-w-5xl mx-auto px-6 space-y-10">
          <div className="text-center space-y-3">
            <h2 className="text-3xl font-bold tracking-tight">Everything you need</h2>
            <p className="text-zinc-500 max-w-md mx-auto">
              Built around the idea that a journal should help you think, not just store text.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {features.map(({ icon: Icon, title, body }) => (
              <div
                key={title}
                className="group bg-zinc-900 border border-zinc-800 hover:border-zinc-700 rounded-2xl p-6 space-y-3 transition-colors"
              >
                <div className="w-9 h-9 rounded-lg bg-violet-500/10 border border-violet-500/20 group-hover:border-violet-500/40 flex items-center justify-center transition-colors">
                  <Icon size={17} className="text-violet-400" />
                </div>
                <h3 className="font-semibold text-zinc-100">{title}</h3>
                <p className="text-zinc-500 text-sm leading-relaxed">{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Tech callout ────────────────────────────────────────────────── */}
      <section className="border-t border-zinc-800/60 py-16">
        <div className="max-w-3xl mx-auto px-6 text-center space-y-6">
          <h2 className="text-2xl font-bold tracking-tight">Entirely free to run</h2>
          <p className="text-zinc-500 leading-relaxed">
            No paid APIs. Embeddings run locally via{" "}
            <span className="text-zinc-300 font-medium">@xenova/transformers</span> (all-MiniLM-L6-v2, 384-dim).
            Transcription and summaries use{" "}
            <span className="text-zinc-300 font-medium">Groq's free tier</span> — 6,000 minutes of
            Whisper and generous Llama access per month. Database is{" "}
            <span className="text-zinc-300 font-medium">PostgreSQL + pgvector</span> on Supabase's
            free tier.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            {["Fastify 5", "Drizzle ORM", "pgvector", "Groq Whisper", "React 19", "Tailwind CSS"].map((t) => (
              <span
                key={t}
                className="px-3 py-1.5 rounded-full border border-zinc-800 bg-zinc-900 text-zinc-400 text-xs font-medium"
              >
                {t}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ── Final CTA ───────────────────────────────────────────────────── */}
      <section className="border-t border-zinc-800/60 py-20">
        <div className="max-w-xl mx-auto px-6 text-center space-y-6">
          <div className="relative inline-block">
            <div className="absolute inset-0 rounded-full bg-violet-600/20 blur-2xl" />
            <div className="relative w-16 h-16 rounded-full bg-violet-600/10 border border-violet-500/30 flex items-center justify-center mx-auto">
              <Mic size={28} className="text-violet-400" />
            </div>
          </div>
          <div className="space-y-3">
            <h2 className="text-3xl font-bold tracking-tight">
              Start talking to yourself — productively.
            </h2>
            <p className="text-zinc-500">
              It takes 10 seconds to make your first entry. The AI handles the rest.
            </p>
          </div>
          <div className="flex items-center gap-3 justify-center">
            <Link
              to="/register"
              className="flex items-center gap-2 bg-violet-600 hover:bg-violet-500 px-7 py-3 rounded-xl font-semibold text-sm transition-all shadow-lg shadow-violet-900/40 hover:-translate-y-0.5"
            >
              Create free account
              <ArrowRight size={15} />
            </Link>
          </div>
          <p className="text-zinc-700 text-xs">No credit card · Open source · Self-hostable</p>
        </div>
      </section>

      {/* ── Footer ──────────────────────────────────────────────────────── */}
      <footer className="border-t border-zinc-800/60 py-8">
        <div className="max-w-5xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-zinc-600">
          <span className="font-medium text-zinc-500">echoes</span>
          <span>Built with Fastify · pgvector · Groq · React · Tailwind</span>
          <div className="flex items-center gap-4">
            <Link to="/login" className="hover:text-zinc-400 transition-colors">Sign in</Link>
            <Link to="/register" className="hover:text-zinc-400 transition-colors">Register</Link>
          </div>
        </div>
      </footer>

    </div>
  );
}
