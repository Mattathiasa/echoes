import { Link } from "react-router-dom";
import { Mic, Search, Sparkles, RotateCcw, Activity, Zap } from "lucide-react";

const features = [
  {
    icon: Mic,
    title: "Voice-first",
    body: "Tap once to record. Whisper transcribes your words automatically — no typing required.",
  },
  {
    icon: Zap,
    title: "AI Transcription",
    body: "Groq Whisper converts speech to text in seconds, even with natural pauses and filler words.",
  },
  {
    icon: Search,
    title: "Semantic Search",
    body: "Find any memory by meaning, not just keywords. \"times I felt grateful\" actually works.",
  },
  {
    icon: Sparkles,
    title: "Weekly Digest",
    body: "An AI summary of your week — themes, moods, and patterns you may have missed.",
  },
  {
    icon: RotateCcw,
    title: "Memory Flash",
    body: "Resurfaces entries from 1 week, 1 month, and 1 year ago so the past stays present.",
  },
  {
    icon: Activity,
    title: "Activity Heatmap",
    body: "A 16-week calendar grid of your journaling streaks. Consistency made visible.",
  },
];

export function LandingPage() {
  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col">
      {/* Nav */}
      <header className="border-b border-zinc-800/60 px-6 py-4 flex items-center justify-between max-w-5xl mx-auto w-full">
        <span className="font-semibold tracking-tight text-zinc-100">echoes</span>
        <div className="flex items-center gap-3 text-sm">
          <Link
            to="/login"
            className="text-zinc-400 hover:text-zinc-100 transition-colors"
          >
            Sign in
          </Link>
          <Link
            to="/register"
            className="bg-violet-600 hover:bg-violet-500 px-4 py-1.5 rounded-lg font-medium transition-colors"
          >
            Start free
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section className="flex-1 flex flex-col items-center justify-center text-center px-6 py-24 gap-10">
        <div className="relative">
          <div className="absolute inset-0 rounded-full bg-violet-600/20 blur-3xl scale-150" />
          <div className="relative w-24 h-24 rounded-full bg-violet-600/10 border border-violet-500/30 flex items-center justify-center">
            <Mic size={40} className="text-violet-400" />
          </div>
        </div>

        <div className="space-y-4 max-w-xl">
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight leading-tight">
            Your voice,{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-violet-200">
              turned into memory.
            </span>
          </h1>
          <p className="text-zinc-400 text-lg leading-relaxed">
            Record daily reflections. AI transcribes, indexes, and resurfaces them
            when you need them most.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/register"
            className="bg-violet-600 hover:bg-violet-500 px-6 py-3 rounded-xl font-semibold text-sm transition-colors shadow-lg shadow-violet-900/30"
          >
            Start for free
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
      </section>

      {/* Features */}
      <section className="px-6 pb-24 max-w-5xl mx-auto w-full">
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {features.map(({ icon: Icon, title, body }) => (
            <div
              key={title}
              className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 space-y-3 hover:border-zinc-700 transition-colors"
            >
              <div className="w-9 h-9 rounded-lg bg-violet-500/10 border border-violet-500/20 flex items-center justify-center">
                <Icon size={18} className="text-violet-400" />
              </div>
              <h3 className="font-semibold text-zinc-100">{title}</h3>
              <p className="text-zinc-500 text-sm leading-relaxed">{body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-zinc-800/60 px-6 py-6 text-center text-xs text-zinc-600">
        Built with Fastify · pgvector · Groq Whisper · React
      </footer>
    </div>
  );
}
