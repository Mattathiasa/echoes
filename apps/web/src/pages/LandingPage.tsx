import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Mic,
  Search,
  Sparkles,
  RotateCcw,
  Zap,
  ArrowRight,
  Play,
  Pause,
  Tag,
  CheckCircle2,
  Smartphone,
  ChevronDown,
  Volume2,
  Brain,
  Layers,
  Flame,
  Clock,
  Calendar,
} from "lucide-react";

// ─── Interactive Sample Audio Recordings ─────────────────────────────────────

interface AudioSample {
  id: string;
  title: string;
  time: string;
  duration: string;
  durationSeconds: number;
  tags: string[];
  tone: string;
  confidence: string;
  transcript: string[];
  keyQuote: string;
}

const audioSamples: AudioSample[] = [
  {
    id: "sample-1",
    title: "Navigating the Architecture Crossroads",
    time: "Today at 9:14 AM",
    duration: "2:14",
    durationSeconds: 134,
    tags: ["architecture", "decision-making", "systems"],
    tone: "Analytical & Grounded",
    confidence: "99.6%",
    keyQuote: "The complexity wasn't in the code, it was in our lack of bounded context.",
    transcript: [
      "Had a breakthrough during the morning walk about our microservice boundaries.",
      "We've been treating state synchronization like a distributed systems problem when it's really an organizational one.",
      "Sarah pointed out that decoupling the ingest pipeline from search embeddings would let us process audio in sub-second bursts without touching pgvector locks.",
      "Now that we separated them, our latency dropped by 70%. It finally clicked: simplify the data flow before optimizing the compute.",
    ],
  },
  {
    id: "sample-2",
    title: "Morning Mindset & Preventing Burnout",
    time: "Yesterday at 8:05 AM",
    duration: "1:42",
    durationSeconds: 102,
    tags: ["burnout-prevention", "mindset", "clarity"],
    tone: "Reflective & Centered",
    confidence: "99.8%",
    keyQuote: "Urgency is often just someone else's lack of planning disguised as my emergency.",
    transcript: [
      "Noticing a subtle tension in my shoulders the moment I open Slack in the morning.",
      "Decided to institute a hard rule: voice journal first, coffee second, notifications only after 10 AM.",
      "When I give my thoughts room to reverberate out loud before consuming anyone else's inputs, my entire day shifts from reactive firefighting to intentional design.",
    ],
  },
  {
    id: "sample-3",
    title: "Spaced Repetition for Life Insights",
    time: "3 days ago at 7:30 PM",
    duration: "3:02",
    durationSeconds: 182,
    tags: ["learning", "memory-systems", "growth"],
    tone: "Energized & Inspired",
    confidence: "99.4%",
    keyQuote: "A journal is only as valuable as the insights it proactively resurfaces.",
    transcript: [
      "Rereading my note from six months ago felt like meeting a younger sibling. I was wrestling with the exact same career question.",
      "The wild thing is, back then I thought the answer was more credentials. Now I realize it was simply more repetitions in public.",
      "This is why linear note-taking apps fail us. Thoughts go into a black hole unless an AI memory engine whispers them back at the moment of relevance.",
    ],
  },
];

// ─── Semantic Search Interactive Database ────────────────────────────────────

interface SearchMemory {
  id: string;
  time: string;
  score: number;
  topic: string;
  tags: string[];
  excerpt: string;
  fullNote: string;
}

const mockMemories: SearchMemory[] = [
  {
    id: "mem-1",
    time: "2 days ago",
    score: 96,
    topic: "Work Pressure & Deadlines",
    tags: ["clarity", "work", "focus"],
    excerpt: "I keep circling back to the anxiety around the sprint deadline. The issue isn't the deadline itself; it's that we haven't decomposed the epic into day-sized deliverables...",
    fullNote: "Evening walk after stand-up. Realized anxiety is just uncertainty without a checklist. Breaking tomorrow into 3 discrete commits.",
  },
  {
    id: "mem-2",
    time: "3 weeks ago",
    score: 89,
    topic: "Career Crossroads & Next Moves",
    tags: ["career", "reflection"],
    excerpt: "Sarah mentioned switching from engineering to product felt like learning Japanese at first, but now she can't imagine living inside tickets again...",
    fullNote: "Lunch with Sarah. She advised looking at what I do when procrastinating—that's usually where the true curiosity lies.",
  },
  {
    id: "mem-3",
    time: "Last month",
    score: 84,
    topic: "Deep Work vs Reaction",
    tags: ["productivity", "habits"],
    excerpt: "Three hours lost to back-to-back calendar tetris. Left feeling drained with zero tangible output. Need to block Tuesday and Thursday mornings as sacred sanctuary hours...",
    fullNote: "Installed calendar firewall. Declining ad-hoc syncs unless an agenda is attached 24h prior.",
  },
  {
    id: "mem-4",
    time: "4 months ago",
    score: 79,
    topic: "Technical Self-Doubt",
    tags: ["imposter-syndrome", "engineering"],
    excerpt: "Staring at the distributed consensus bug for 6 hours. Wondering if I'm cut out for high-scale backend systems. But after walking away, the race condition became obvious...",
    fullNote: "The fix was a single mutex guard. Remember this entry whenever feeling stuck: stepping away is active problem-solving.",
  },
];

// Preset queries visitors can click to test semantic search
const presetQueries = [
  "When did I feel overwhelmed by deadlines?",
  "Reflections on career transitions & advice",
  "How to protect focus time from meetings",
  "Times I doubted my technical ability",
];

// ─── Memory Flash Timeline ───────────────────────────────────────────────────

const memoryFlashTabs = [
  {
    period: "7 Days Ago",
    tagline: "The Near Mirror",
    date: "October 10",
    title: "Overcoming the initial hesitation on the pitch deck",
    transcript:
      "Spent 4 hours tweaking font sizes on slide 3 instead of writing the actual narrative. Realized perfectionism is just fear in a sharp suit. Forced myself to record a 3-minute voice pitch instead. It was messy, but the core hook was undeniable.",
    insight: "The deck was delivered two days later. The voice pitch became the exact opening slide that secured the pilot partner.",
    badgeColor: "emerald",
  },
  {
    period: "30 Days Ago",
    tagline: "The Monthly Calibration",
    date: "September 17",
    title: "Why we abandoned the complex caching layer",
    transcript:
      "Redis was giving us cache invalidation nightmares. Spoke out loud for 5 minutes explaining the edge cases to an imaginary rubber duck. Concluded that our PostgreSQL query latency on indexed pgvector columns is already sub-12ms. We were solving a problem we didn't have.",
    insight: "Stripping Redis eliminated 3 production alerts and lowered our Docker footprint by 40%.",
    badgeColor: "teal",
  },
  {
    period: "1 Year Ago",
    tagline: "The Long Horizon",
    date: "October 17, 2025",
    title: "The decision to leave corporate security and build",
    transcript:
      "Sitting in my car in the office parking lot. My palms were sweaty after telling my director I was wrapping up at year-end. Terrified of the lack of stability, but more terrified of looking back in 10 years and wondering what I could have created.",
    insight: "Today you are running two profitable products with full autonomy. The leap was terrifying, but the regret would have been fatal.",
    badgeColor: "amber",
  },
];

// ─── FAQ Items ───────────────────────────────────────────────────────────────

const faqs = [
  {
    q: "How can Echoes be 100% free to run and host?",
    a: "Echoes is built on modern, generous free tiers without predatory billing models. Audio transcription runs on Groq Whisper Large-v3-Turbo (6,000 minutes free per month). Vector embeddings compute in-process with Xenova Transformers (zero external API calls). Your database is Supabase PostgreSQL + pgvector (500MB free). Fastify backend and React frontend deploy seamlessly on Render and Vercel free plans.",
  },
  {
    q: "How does semantic search work if I forget my exact words?",
    a: "Unlike traditional keyword search that looks for exact character matches, Echoes converts your spoken reflections into 384-dimensional mathematical vectors using pgvector. When you search 'feeling stuck at work', it calculates cosine similarity to surface entries about deadlines, friction, burnout, and mental blocks—even if you never uttered the word 'stuck'.",
  },
  {
    q: "Is my personal voice data private and secure?",
    a: "Completely. Your audio is streamed directly to Groq's high-speed LPU for immediate WebM transcription and is not used to train proprietary public models. Embeddings are calculated inside your server process, passwords use bcrypt with salt rounds, and sessions use 30-day JWT authentication. You can export your entire journal as clean JSON anytime with one click.",
  },
  {
    q: "Can I use Echoes on my phone as an app?",
    a: "Yes! Echoes is fully PWA-ready with an installable manifest, web app icons, and offline support. Simply open the URL in iOS Safari or Android Chrome, tap 'Add to Home Screen', and you have an instant one-tap voice recorder with full microphone hardware access.",
  },
  {
    q: "What if Whisper mishears a name or technical acronym?",
    a: "Echoes includes built-in inline editing. Click any sentence in your journal to immediately edit the transcript. When you save your fix, Echoes automatically re-embeds the text in pgvector so your semantic search stays 100% accurate.",
  },
];

export function LandingPage() {
  // Active demo audio state
  const [selectedSample, setSelectedSample] = useState<AudioSample>(audioSamples[0]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackProgress, setPlaybackProgress] = useState(38);

  // Search playground state
  const [searchQuery, setSearchQuery] = useState("When did I feel overwhelmed by deadlines?");

  // Memory flash tab
  const [activeFlashTab, setActiveFlashTab] = useState(0);

  // FAQ accordion
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  // Simulated audio playback effect
  useEffect(() => {
    let interval: any;
    if (isPlaying) {
      interval = setInterval(() => {
        setPlaybackProgress((prev) => {
          if (prev >= 100) {
            setIsPlaying(false);
            return 0;
          }
          return prev + 1.5;
        });
      }, 300);
    }
    return () => clearInterval(interval);
  }, [isPlaying]);

  return (
    <div className="min-h-screen bg-[#080a0f] text-slate-100 flex flex-col font-sans selection:bg-emerald-500/20 selection:text-emerald-200">

      {/* ── Background Atmospheric Light Cones ───────────────────────────── */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[900px] h-[550px] bg-gradient-to-b from-emerald-500/12 via-teal-500/8 to-transparent rounded-full blur-[140px]" />
        <div className="absolute top-[35%] -left-48 w-[600px] h-[600px] bg-emerald-600/6 rounded-full blur-[160px]" />
        <div className="absolute top-[65%] -right-48 w-[650px] h-[650px] bg-teal-500/6 rounded-full blur-[160px]" />
        <div className="absolute inset-0 bg-grid-pattern opacity-40" />
      </div>

      {/* ── Sticky Navigation Bar ────────────────────────────────────────── */}
      <header className="sticky top-0 z-50 border-b border-white/[0.06] bg-[#080a0f]/80 backdrop-blur-xl">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          
          {/* Brand Logo with Pulsing Neural Wave */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center shadow-lg shadow-emerald-500/20 group-hover:shadow-emerald-500/40 transition-all">
              <Mic size={17} className="text-slate-950 font-bold" />
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-lg tracking-tight text-white flex items-center gap-1.5">
                echoes
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              </span>
            </div>
          </Link>

          {/* Nav Links (Desktop) */}
          <nav className="hidden md:flex items-center gap-7 text-sm text-slate-300">
            <a href="#demo" className="hover:text-emerald-400 transition-colors">
              Live Demo
            </a>
            <a href="#semantic-search" className="hover:text-emerald-400 transition-colors">
              Semantic Search
            </a>
            <a href="#memory-flash" className="hover:text-emerald-400 transition-colors">
              Memory Flash
            </a>
            <a href="#weekly-digest" className="hover:text-emerald-400 transition-colors">
              AI Digest
            </a>
            <a href="#architecture" className="hover:text-emerald-400 transition-colors">
              100% Free Stack
            </a>
            <a href="#faq" className="hover:text-emerald-400 transition-colors">
              FAQ
            </a>
          </nav>

          {/* Action Buttons */}
          <div className="flex items-center gap-3">
            <Link
              to="/login"
              className="text-sm text-slate-300 hover:text-white px-3.5 py-1.5 rounded-lg transition-colors"
            >
              Sign in
            </Link>
            <Link
              to="/register"
              className="relative group overflow-hidden rounded-xl bg-gradient-to-r from-emerald-400 via-teal-400 to-emerald-500 p-[1px] shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/35 transition-all"
            >
              <span className="flex items-center gap-1.5 px-4 py-2 rounded-[11px] bg-slate-950/90 group-hover:bg-slate-950/75 text-emerald-300 text-sm font-semibold transition-all">
                <span>Start Journaling</span>
                <ArrowRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
              </span>
            </Link>
          </div>

        </div>
      </header>

      {/* ── Main Content ─────────────────────────────────────────────────── */}
      <main className="relative z-10 flex-1">

        {/* ── HERO SECTION ────────────────────────────────────────────────── */}
        <section className="relative pt-24 pb-20 px-6 max-w-5xl mx-auto text-center flex flex-col items-center">
          
          {/* Pill Badge */}
          <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full border border-emerald-500/25 bg-emerald-500/10 text-emerald-300 text-xs font-medium backdrop-blur-md mb-8 animate-fade-in shadow-sm shadow-emerald-950">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span className="font-semibold tracking-wide">ECHOES 2.0</span>
            <span className="text-emerald-600">|</span>
            <span>Voice Journal with AI Semantic Memory</span>
          </div>

          {/* Main Headline */}
          <h1 className="text-5xl sm:text-7xl font-extrabold tracking-tight text-white leading-[1.08] max-w-4xl mb-6">
            Speak your mind.{" "}
            <span className="bg-gradient-to-r from-emerald-300 via-teal-200 to-amber-200 bg-clip-text text-transparent">
              Never lose a thought again.
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-slate-300 text-lg sm:text-xl leading-relaxed max-w-2xl mb-10 font-normal">
            Echoes transcribes your daily voice reflections in seconds using Groq Whisper, indexes the deeper meaning in high-dimensional vector space, and resurfaces your past insights when you need them most.
          </p>

          {/* Primary Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto justify-center mb-8">
            <Link
              to="/register"
              className="w-full sm:w-auto flex items-center justify-center gap-2.5 bg-gradient-to-r from-emerald-400 to-teal-400 hover:from-emerald-300 hover:to-teal-300 text-slate-950 font-bold px-8 py-3.5 rounded-xl text-base shadow-xl shadow-emerald-500/25 hover:shadow-emerald-500/40 hover:-translate-y-0.5 transition-all"
            >
              <Mic size={18} />
              <span>Record Your First Reflection</span>
              <ArrowRight size={16} />
            </Link>

            <a
              href="#demo"
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl text-slate-300 hover:text-white border border-white/10 hover:border-emerald-500/40 bg-white/[0.03] hover:bg-white/[0.06] backdrop-blur-md text-base font-medium transition-all"
            >
              <Play size={15} className="text-emerald-400 fill-emerald-400" />
              <span>Explore Interactive Demo</span>
            </a>
          </div>

          {/* Micro Trust Indicators */}
          <div className="flex flex-wrap items-center justify-center gap-y-2 gap-x-6 text-xs text-slate-400 font-medium">
            <div className="flex items-center gap-1.5">
              <CheckCircle2 size={14} className="text-emerald-400" />
              <span>100% Free Tier Stack</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 size={14} className="text-emerald-400" />
              <span>Sub-2s Whisper Transcription</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 size={14} className="text-emerald-400" />
              <span>pgvector Semantic Search</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 size={14} className="text-emerald-400" />
              <span>Private & Self-Hostable</span>
            </div>
          </div>

        </section>

        {/* ── SECTION: INTERACTIVE LIVE AUDIO & TRANSCRIPTION EXPERIENCE ──── */}
        <section id="demo" className="max-w-6xl mx-auto px-6 py-12">
          
          <div className="relative rounded-3xl border border-white/[0.09] bg-slate-900/40 backdrop-blur-2xl shadow-2xl overflow-hidden p-6 sm:p-10">
            {/* Top Chrome Header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-8 border-b border-white/[0.08] gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-xs uppercase font-mono tracking-widest text-emerald-400 font-semibold">
                    Live Acoustic Interface
                  </span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
                  Voice In. Instant Structured Intelligence Out.
                </h2>
              </div>

              {/* Sample Switcher Pills */}
              <div className="flex items-center gap-1.5 bg-slate-950/70 p-1.5 rounded-xl border border-white/[0.06] overflow-x-auto max-w-full">
                {audioSamples.map((sample, idx) => (
                  <button
                    key={sample.id}
                    onClick={() => {
                      setSelectedSample(sample);
                      setPlaybackProgress(20);
                      setIsPlaying(true);
                    }}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap ${
                      selectedSample.id === sample.id
                        ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 shadow-sm"
                        : "text-slate-400 hover:text-white"
                    }`}
                  >
                    Sample #{idx + 1}
                  </button>
                ))}
              </div>
            </div>

            {/* Main Interactive Player Grid */}
            <div className="grid lg:grid-cols-12 gap-8 pt-8">

              {/* Left Column: Player & Dynamic Soundwave Visualization (5 cols) */}
              <div className="lg:col-span-5 flex flex-col justify-between space-y-6">
                
                {/* Active Sample Card */}
                <div className="bg-slate-950/60 border border-white/[0.07] rounded-2xl p-6 relative overflow-hidden group">
                  <div className="absolute -right-8 -top-8 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl group-hover:bg-emerald-500/20 transition-all" />

                  <div className="flex items-center justify-between text-xs text-slate-400 mb-3">
                    <span className="flex items-center gap-1 font-mono">
                      <Clock size={12} className="text-emerald-400" />
                      {selectedSample.time}
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 font-mono text-[11px] border border-emerald-500/20">
                      Duration: {selectedSample.duration}
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-white mb-2 leading-snug">
                    {selectedSample.title}
                  </h3>

                  <div className="bg-emerald-950/40 border border-emerald-800/30 rounded-xl p-3 my-4">
                    <p className="text-xs text-emerald-200 italic leading-relaxed">
                      "{selectedSample.keyQuote}"
                    </p>
                  </div>

                  {/* Equalizer Waveform Visualization */}
                  <div className="space-y-3 pt-2">
                    <div className="flex items-end justify-between gap-1 h-16 px-2 py-1 bg-slate-900/80 rounded-xl border border-white/[0.05]">
                      {[
                        35, 60, 85, 45, 90, 70, 40, 95, 65, 30, 80, 100, 75, 50, 90, 60,
                        45, 85, 70, 50, 95, 80, 40, 60,
                      ].map((height, i) => {
                        const isActive = i < (playbackProgress / 100) * 24;
                        return (
                          <div
                            key={i}
                            className={`w-full rounded-full transition-all duration-200 ${
                              isActive
                                ? "bg-gradient-to-t from-emerald-500 to-teal-300"
                                : "bg-slate-800 hover:bg-slate-700"
                            } ${isPlaying ? "animate-pulse" : ""}`}
                            style={{
                              height: isPlaying ? `${Math.max(15, (height * (Math.sin(i + playbackProgress) + 1.2)) / 2)}%` : `${height}%`,
                            }}
                          />
                        );
                      })}
                    </div>

                    {/* Playhead progress */}
                    <div className="flex items-center justify-between text-[11px] font-mono text-slate-400">
                      <span>0:{Math.floor((playbackProgress / 100) * selectedSample.durationSeconds).toString().padStart(2, "0")}</span>
                      <span>{selectedSample.duration}</span>
                    </div>
                  </div>

                  {/* Control Button */}
                  <div className="pt-4 flex items-center justify-between">
                    <button
                      onClick={() => setIsPlaying(!isPlaying)}
                      className="flex items-center gap-2.5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-bold px-5 py-2.5 rounded-xl text-sm transition-all shadow-md shadow-emerald-500/20"
                    >
                      {isPlaying ? (
                        <>
                          <Pause size={16} />
                          <span>Pause Audio</span>
                        </>
                      ) : (
                        <>
                          <Play size={16} className="fill-slate-950" />
                          <span>Play Reflection</span>
                        </>
                      )}
                    </button>

                    <div className="flex items-center gap-2 text-xs text-slate-400 font-mono">
                      <Volume2 size={14} className="text-emerald-400" />
                      <span>48kHz WebM</span>
                    </div>
                  </div>

                </div>

                {/* AI Extraction Micro-Card */}
                <div className="bg-slate-950/40 border border-white/[0.06] rounded-xl p-4 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <Sparkles size={15} className="text-amber-400" />
                    <span className="text-slate-300">Tone Analysis:</span>
                    <span className="text-emerald-300 font-semibold">{selectedSample.tone}</span>
                  </div>
                  <span className="font-mono text-slate-500 text-[11px]">
                    Whisper Confidence: {selectedSample.confidence}
                  </span>
                </div>

              </div>

              {/* Right Column: Real-Time Stream Transcript & Vector Metadata (7 cols) */}
              <div className="lg:col-span-7 flex flex-col justify-between space-y-4">
                
                <div className="bg-slate-950/70 border border-white/[0.07] rounded-2xl p-6 flex-1 flex flex-col">
                  
                  <div className="flex items-center justify-between pb-4 border-b border-white/[0.06] mb-4">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-emerald-400" />
                      <span className="text-xs font-semibold text-white uppercase tracking-wider">
                        Synchronized Whisper Transcript
                      </span>
                    </div>
                    <span className="text-xs font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                      Groq LPU: 1.2s Latency
                    </span>
                  </div>

                  {/* Transcript Body */}
                  <div className="space-y-3.5 flex-1 text-sm text-slate-200 leading-relaxed font-normal">
                    {selectedSample.transcript.map((sentence, idx) => (
                      <div
                        key={idx}
                        className={`p-3 rounded-xl transition-all ${
                          idx === 0
                            ? "bg-white/[0.03] border-l-2 border-emerald-400 text-white"
                            : "text-slate-300"
                        }`}
                      >
                        <p className="text-sm leading-relaxed">{sentence}</p>
                      </div>
                    ))}
                  </div>

                  {/* Auto-extracted semantic tags */}
                  <div className="pt-5 border-t border-white/[0.06] flex items-center justify-between flex-wrap gap-2">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-xs text-slate-400 flex items-center gap-1 mr-1">
                        <Tag size={12} className="text-emerald-400" />
                        AI Tags:
                      </span>
                      {selectedSample.tags.map((tag) => (
                        <span
                          key={tag}
                          className="px-2.5 py-1 rounded-full text-xs font-mono bg-emerald-500/10 text-emerald-300 border border-emerald-500/25"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>

                    <span className="text-xs text-slate-500 font-mono">
                      vector: 384-dim indexed
                    </span>
                  </div>

                </div>

              </div>

            </div>

          </div>

        </section>

        {/* ── SECTION: INTERACTIVE SEMANTIC SEARCH SANDBOX ─────────────────── */}
        <section id="semantic-search" className="max-w-6xl mx-auto px-6 py-20">
          
          <div className="text-center max-w-3xl mx-auto mb-14">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/10 border border-teal-500/20 text-teal-300 text-xs font-semibold mb-4">
              <Search size={13} />
              <span>pgvector Cosine Similarity</span>
            </div>
            <h2 className="text-4xl sm:text-5xl font-extrabold text-white tracking-tight mb-4">
              Search by Feeling. Not by Keyword.
            </h2>
            <p className="text-slate-400 text-base sm:text-lg">
              You won't remember the exact phrase you uttered six months ago on an evening walk.
              Echoes understands <span className="text-white font-medium">the intent and emotion</span> behind your words.
            </p>
          </div>

          <div className="bg-slate-900/50 border border-white/[0.08] rounded-3xl p-6 sm:p-10 backdrop-blur-xl">
            
            {/* Interactive Search Bar */}
            <div className="relative mb-6">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-emerald-400">
                <Search size={20} />
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Ask your past self anything (e.g., 'When did I feel imposter syndrome?')..."
                className="w-full bg-slate-950/80 border border-emerald-500/30 rounded-2xl pl-12 pr-4 py-4 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-500/20 text-base shadow-inner transition-all"
              />
              <div className="absolute inset-y-0 right-3 flex items-center">
                <span className="hidden sm:inline-flex px-2 py-1 rounded bg-slate-800 text-[11px] font-mono text-slate-400">
                  Cosine Match Active
                </span>
              </div>
            </div>

            {/* Clickable Preset Query Chips */}
            <div className="flex items-center gap-2 flex-wrap mb-8">
              <span className="text-xs text-slate-400 font-medium">Try asking:</span>
              {presetQueries.map((preset) => (
                <button
                  key={preset}
                  onClick={() => setSearchQuery(preset)}
                  className={`text-xs px-3 py-1.5 rounded-lg border transition-all ${
                    searchQuery === preset
                      ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/40 shadow-sm"
                      : "bg-slate-950/60 text-slate-400 border-white/[0.06] hover:text-white hover:border-white/20"
                  }`}
                >
                  "{preset}"
                </button>
              ))}
            </div>

            {/* Simulated Live Results Grid */}
            <div className="space-y-4">
              <div className="flex items-center justify-between text-xs text-slate-400 px-1 font-mono">
                <span>Surfacing top vector matches (384-dimensional cosine similarity)</span>
                <span className="text-emerald-400 font-semibold">{mockMemories.length} memories ranked</span>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                {mockMemories.map((mem) => (
                  <div
                    key={mem.id}
                    className="group bg-slate-950/70 border border-white/[0.07] hover:border-emerald-500/40 rounded-2xl p-5 transition-all hover:-translate-y-0.5 hover:shadow-xl hover:shadow-emerald-950/30 space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-mono text-slate-400">{mem.time}</span>
                      <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 font-mono text-xs font-semibold">
                        <Sparkles size={11} className="text-emerald-400" />
                        <span>{mem.score}% Semantic Match</span>
                      </div>
                    </div>

                    <h4 className="font-semibold text-white text-sm group-hover:text-emerald-300 transition-colors">
                      {mem.topic}
                    </h4>

                    <p className="text-xs text-slate-300 leading-relaxed">
                      "{mem.excerpt}"
                    </p>

                    <div className="pt-2 border-t border-white/[0.05] flex items-center justify-between text-[11px]">
                      <div className="flex gap-1.5">
                        {mem.tags.map((t) => (
                          <span key={t} className="text-slate-400 font-mono">
                            #{t}
                          </span>
                        ))}
                      </div>
                      <span className="text-slate-500 italic">Retrieved in 18ms</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>

        </section>

        {/* ── SECTION: THE CORE VALUE ENGINE (Bento Grid) ──────────────────── */}
        <section className="max-w-6xl mx-auto px-6 py-20">
          
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight mb-4">
              Everything Your Mind Needs. Nothing It Doesn't.
            </h2>
            <p className="text-slate-400 text-base">
              A personal reflection system designed to turn fleeting verbal observations into cumulative wisdom.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">

            {/* Bento Card 1: Groq Whisper */}
            <div className="glass-card-hover bg-slate-900/40 border border-white/[0.08] rounded-3xl p-8 space-y-4 relative overflow-hidden">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-teal-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mb-6">
                <Zap size={22} />
              </div>
              <h3 className="text-xl font-bold text-white">Sub-2s Speech Transcription</h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                Groq's Whisper Large-v3-Turbo transcribes long recordings almost instantaneously. Natural pauses, hesitations, and stream-of-consciousness filler words are handled with remarkable fidelity.
              </p>
              <div className="pt-2 text-xs font-mono text-emerald-400">
                ⚡ 6,000 free minutes / month
              </div>
            </div>

            {/* Bento Card 2: Memory Flash */}
            <div className="glass-card-hover bg-slate-900/40 border border-white/[0.08] rounded-3xl p-8 space-y-4 relative overflow-hidden">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-teal-500/20 to-cyan-500/20 border border-teal-500/30 flex items-center justify-center text-teal-400 mb-6">
                <RotateCcw size={22} />
              </div>
              <h3 className="text-xl font-bold text-white">The Memory Flash Engine</h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                Spaced repetition for your personal thoughts. Every morning, your home screen resurfaces what you were thinking 7 days, 1 month, and 1 year ago. Notice how your dilemmas evolved.
              </p>
              <div className="pt-2 text-xs font-mono text-teal-400">
                🔁 Spaced memory recall
              </div>
            </div>

            {/* Bento Card 3: In-Process Embeddings */}
            <div className="glass-card-hover bg-slate-900/40 border border-white/[0.08] rounded-3xl p-8 space-y-4 relative overflow-hidden">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-amber-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-300 mb-6">
                <Brain size={22} />
              </div>
              <h3 className="text-xl font-bold text-white">Local In-Process Embeddings</h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                Embeddings run locally using <span className="text-slate-200">@xenova/transformers</span> (all-MiniLM-L6-v2, 384 dimensions). Your text never gets sent to expensive third-party embedding APIs.
              </p>
              <div className="pt-2 text-xs font-mono text-emerald-300">
                🔒 $0 cost · Private
              </div>
            </div>

            {/* Bento Card 4: Sunday AI Digest */}
            <div className="glass-card-hover bg-slate-900/40 border border-white/[0.08] rounded-3xl p-8 space-y-4 relative overflow-hidden">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-500/20 to-emerald-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400 mb-6">
                <Sparkles size={22} />
              </div>
              <h3 className="text-xl font-bold text-white">Weekly AI Synthesis</h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                Every Sunday, Groq Llama 3.3 70B reads all entries from the past seven days. It extracts recurrent emotional patterns, highlights breakthrough decisions, and points out blindspots.
              </p>
              <div className="pt-2 text-xs font-mono text-amber-400">
                📊 Sunday evening briefing
              </div>
            </div>

            {/* Bento Card 5: 16-Week Heatmap */}
            <div className="glass-card-hover bg-slate-900/40 border border-white/[0.08] rounded-3xl p-8 space-y-4 relative overflow-hidden">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-teal-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mb-6">
                <Flame size={22} />
              </div>
              <h3 className="text-xl font-bold text-white">Habit Streak Heatmap</h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                A 16-week calendar grid turns your journaling habit into a tangible, glowing visual record. Watch your streaks compound as speaking becomes your daily decompression ritual.
              </p>
              <div className="pt-2 text-xs font-mono text-emerald-400">
                🔥 16-week visual momentum
              </div>
            </div>

            {/* Bento Card 6: Zero Lock-in & PWA */}
            <div className="glass-card-hover bg-slate-900/40 border border-white/[0.08] rounded-3xl p-8 space-y-4 relative overflow-hidden">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-cyan-500/20 to-teal-500/20 border border-cyan-500/30 flex items-center justify-center text-cyan-400 mb-6">
                <Smartphone size={22} />
              </div>
              <h3 className="text-xl font-bold text-white">PWA Mobile & Data Export</h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                Installable on iOS and Android with a single tap. Download your entire library of transcripts and metadata as a standard JSON bundle anytime. Complete data sovereignty.
              </p>
              <div className="pt-2 text-xs font-mono text-cyan-400">
                📱 Offline PWA + GDPR export
              </div>
            </div>

          </div>

        </section>

        {/* ── SECTION: INTERACTIVE MEMORY FLASH SIMULATOR ─────────────────── */}
        <section id="memory-flash" className="max-w-5xl mx-auto px-6 py-20">
          
          <div className="text-center max-w-2xl mx-auto mb-12">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/25 text-amber-300 text-xs font-semibold mb-4">
              <RotateCcw size={13} />
              <span>Time-Travel Clarity</span>
            </div>
            <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight mb-4">
              The Memory Flash Experience
            </h2>
            <p className="text-slate-400 text-base sm:text-lg">
              Most journals become graveyards of unread text. Echoes resurfaces your past thoughts on a spaced cadence so you see your personal growth in real time.
            </p>
          </div>

          {/* Interactive Memory Flash Tabs */}
          <div className="flex items-center justify-center gap-3 mb-8">
            {memoryFlashTabs.map((tab, idx) => (
              <button
                key={tab.period}
                onClick={() => setActiveFlashTab(idx)}
                className={`px-5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                  activeFlashTab === idx
                    ? "bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 shadow-lg shadow-emerald-500/20"
                    : "bg-slate-900 border border-white/[0.08] text-slate-400 hover:text-white"
                }`}
              >
                {tab.period}
              </button>
            ))}
          </div>

          {/* Memory Card */}
          <div className="bg-slate-900/60 border border-white/[0.09] rounded-3xl p-8 sm:p-10 backdrop-blur-xl relative overflow-hidden">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-6 border-b border-white/[0.07] gap-3">
              <div>
                <span className="text-xs font-mono text-emerald-400 uppercase tracking-widest font-semibold">
                  {memoryFlashTabs[activeFlashTab].tagline}
                </span>
                <h3 className="text-2xl font-bold text-white mt-1">
                  {memoryFlashTabs[activeFlashTab].title}
                </h3>
              </div>
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-950 border border-white/[0.08] text-xs font-mono text-slate-400">
                <Calendar size={13} className="text-emerald-400" />
                <span>Recorded: {memoryFlashTabs[activeFlashTab].date}</span>
              </div>
            </div>

            <div className="py-6 space-y-4">
              <p className="text-slate-200 text-base leading-relaxed italic bg-slate-950/50 p-5 rounded-2xl border border-white/[0.04]">
                "{memoryFlashTabs[activeFlashTab].transcript}"
              </p>

              {/* AI Retrospective Insight */}
              <div className="p-4 rounded-xl bg-gradient-to-r from-emerald-950/40 via-teal-950/30 to-slate-950 border border-emerald-500/20 flex items-start gap-3">
                <Sparkles size={18} className="text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-bold text-emerald-300 uppercase tracking-wider mb-1">
                    AI Growth Perspective
                  </h4>
                  <p className="text-xs text-emerald-100/90 leading-relaxed">
                    {memoryFlashTabs[activeFlashTab].insight}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-white/[0.07] text-xs text-slate-500">
              <span>Resurfaced automatically on your Echoes dashboard</span>
              <span className="text-emerald-400 font-mono">Spaced Retrieval Active</span>
            </div>
          </div>

        </section>

        {/* ── SECTION: SUNDAY AI DIGEST SHOWCASE ───────────────────────────── */}
        <section id="weekly-digest" className="max-w-6xl mx-auto px-6 py-20">
          
          <div className="grid lg:grid-cols-12 gap-10 items-center">
            
            <div className="lg:col-span-5 space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/25 text-emerald-300 text-xs font-semibold">
                <Sparkles size={13} />
                <span>Sunday AI Synthesis</span>
              </div>
              <h2 className="text-4xl sm:text-5xl font-extrabold text-white tracking-tight leading-tight">
                Your Week In Review. Written by Llama 3.3 70B.
              </h2>
              <p className="text-slate-400 text-base leading-relaxed">
                Every Sunday evening, Echoes analyzes your weekly voice recordings. It surfaces your emotional highs and lows, recurring topics, and unresolved questions—handing you a clean mental slate for Monday.
              </p>
              
              <div className="space-y-3 pt-2">
                <div className="flex items-start gap-3 text-sm text-slate-300">
                  <div className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
                    ✓
                  </div>
                  <span><strong>Emotional Arc Tracking:</strong> See how your stress peaks and resolves over 7 days.</span>
                </div>
                <div className="flex items-start gap-3 text-sm text-slate-300">
                  <div className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
                    ✓
                  </div>
                  <span><strong>Blindspot Detection:</strong> Identifies circular thinking before it turns into burnout.</span>
                </div>
                <div className="flex items-start gap-3 text-sm text-slate-300">
                  <div className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
                    ✓
                  </div>
                  <span><strong>Introspective Prompt:</strong> One tailored question to ponder in your next reflection.</span>
                </div>
              </div>
            </div>

            {/* Interactive Digest Card */}
            <div className="lg:col-span-7 bg-slate-900/60 border border-white/[0.09] rounded-3xl p-6 sm:p-8 backdrop-blur-xl relative">
              <div className="flex items-center justify-between pb-4 border-b border-white/[0.08]">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                  <span className="text-xs font-mono text-white font-semibold">
                    WEEKLY DIGEST · WEEK 41
                  </span>
                </div>
                <span className="text-xs font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                  Generated Sun 9:00 PM
                </span>
              </div>

              {/* Theme */}
              <div className="py-4">
                <span className="text-xs text-slate-500 uppercase tracking-wider font-semibold">Overarching Theme</span>
                <p className="text-base font-bold text-white mt-1">
                  "Transitioning from reactive firefighting to proactive architectural design."
                </p>
              </div>

              {/* Emotional Arc Indicator */}
              <div className="p-4 rounded-xl bg-slate-950/70 border border-white/[0.06] space-y-2 mb-4">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400 font-medium">Emotional Energy Arc</span>
                  <span className="text-emerald-400 font-mono">+32% Clarity by Weekend</span>
                </div>
                <div className="grid grid-cols-7 gap-1.5 h-8 items-end pt-1">
                  {[40, 30, 55, 75, 60, 90, 85].map((val, idx) => (
                    <div key={idx} className="flex flex-col items-center gap-1">
                      <div
                        className={`w-full rounded-sm ${
                          val >= 70 ? "bg-emerald-400" : val >= 50 ? "bg-teal-500" : "bg-slate-700"
                        }`}
                        style={{ height: `${val}%` }}
                      />
                      <span className="text-[9px] font-mono text-slate-500">
                        {["M", "T", "W", "T", "F", "S", "S"][idx]}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recurring Insight */}
              <div className="space-y-3">
                <div className="bg-slate-950/40 p-3.5 rounded-xl border border-white/[0.05]">
                  <h4 className="text-xs font-semibold text-slate-200 mb-1">Key Observation:</h4>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    You mentioned feeling 'behind' on Tuesday and Wednesday, yet your git commits and code reviews were at a monthly high. The pressure was purely self-imposed expectation.
                  </p>
                </div>

                <div className="bg-emerald-950/30 p-3.5 rounded-xl border border-emerald-500/20">
                  <h4 className="text-xs font-semibold text-emerald-300 mb-1">Prompt for Next Week:</h4>
                  <p className="text-xs text-emerald-100/90 leading-relaxed">
                    "What would your work week feel like if you declined the Monday sync and dedicated those two hours entirely to deep creative flow?"
                  </p>
                </div>
              </div>

            </div>

          </div>

        </section>

        {/* ── SECTION: WHY VOICE BEATS TYPING (Comparison Table) ──────────── */}
        <section className="max-w-5xl mx-auto px-6 py-20">
          
          <div className="text-center max-w-2xl mx-auto mb-14">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight mb-4">
              Why Voice Journaling Changes Everything
            </h2>
            <p className="text-slate-400 text-base">
              Typing is high-friction. Speaking is natural, unvarnished thought.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            
            {/* The Old Way */}
            <div className="bg-slate-950/60 border border-red-500/10 rounded-3xl p-8 space-y-5">
              <div className="flex items-center gap-2 text-red-400 text-sm font-semibold">
                <span>❌ Traditional Notes & Typing Apps</span>
              </div>
              <ul className="space-y-4 text-sm text-slate-400">
                <li className="flex items-start gap-3">
                  <span className="text-red-400/80 font-mono">38 wpm:</span>
                  <span>Typing on a phone keyboard feels like a chore after a long day at a screen.</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-red-400/80 font-mono">Buried:</span>
                  <span>Notes sit in Apple Notes or Notion folders and are literally never read again.</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-red-400/80 font-mono">Rigid:</span>
                  <span>Keyword search fails if you search for "exhausted" but wrote "drained".</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-red-400/80 font-mono">Filtered:</span>
                  <span>You edit yourself while typing, sanitizing the raw truth of how you actually feel.</span>
                </li>
              </ul>
            </div>

            {/* The Echoes Way */}
            <div className="bg-gradient-to-br from-emerald-950/20 via-slate-900/60 to-slate-950 border border-emerald-500/30 rounded-3xl p-8 space-y-5 shadow-xl shadow-emerald-950/20">
              <div className="flex items-center gap-2 text-emerald-400 text-sm font-semibold">
                <span>✨ The Echoes Voice Experience</span>
              </div>
              <ul className="space-y-4 text-sm text-slate-200">
                <li className="flex items-start gap-3">
                  <span className="text-emerald-400 font-mono">150+ wpm:</span>
                  <span>Speak with your eyes closed during a walk. 90 seconds captures 250 deep words.</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-emerald-400 font-mono">Resurfaced:</span>
                  <span>Spaced memory flash (7d / 30d / 365d) brings relevant wisdom back when needed.</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-emerald-400 font-mono">Semantic:</span>
                  <span>pgvector finds concepts, emotional states, and insights across any phrasing.</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-emerald-400 font-mono">Synthesized:</span>
                  <span>Weekly Llama digest summarizes recurring patterns and prevents burnout.</span>
                </li>
              </ul>
            </div>

          </div>

        </section>

        {/* ── SECTION: 100% FREE TIER ARCHITECTURE ────────────────────────── */}
        <section id="architecture" className="max-w-5xl mx-auto px-6 py-20 border-t border-white/[0.06]">
          
          <div className="text-center max-w-2xl mx-auto mb-12">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/25 text-emerald-300 text-xs font-semibold mb-3">
              <Layers size={13} />
              <span>Full Technological Transparency</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight mb-3">
              100% Free Forever Stack
            </h2>
            <p className="text-slate-400 text-sm sm:text-base">
              No credit card required. No bait-and-switch subscription tiers. Built on industry-leading open free infrastructure.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 text-center">
            {[
              { tool: "React 19 + Vite", layer: "Frontend", why: "Vercel free tier" },
              { tool: "Fastify 5 + TS", layer: "Backend", why: "Render free tier" },
              { tool: "Groq Whisper", layer: "Speech-to-Text", why: "6,000 min/mo free" },
              { tool: "pgvector", layer: "Vector DB", why: "Supabase 500MB free" },
              { tool: "@xenova/transformers", layer: "Embeddings", why: "Runs in-process ($0)" },
              { tool: "Groq Llama 3.3", layer: "Weekly Digest", why: "Free tier LPU" },
            ].map((item) => (
              <div
                key={item.tool}
                className="bg-slate-950/60 border border-white/[0.07] rounded-2xl p-4 flex flex-col justify-between"
              >
                <div>
                  <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider block mb-1">
                    {item.layer}
                  </span>
                  <h4 className="font-semibold text-white text-xs mb-2">{item.tool}</h4>
                </div>
                <span className="inline-block px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 text-[10px] font-mono border border-emerald-500/20">
                  {item.why}
                </span>
              </div>
            ))}
          </div>

        </section>

        {/* ── SECTION: INTERACTIVE FAQ ACCORDION ───────────────────────────── */}
        <section id="faq" className="max-w-4xl mx-auto px-6 py-20 border-t border-white/[0.06]">
          
          <div className="text-center max-w-xl mx-auto mb-12">
            <h2 className="text-3xl font-extrabold text-white tracking-tight mb-3">
              Frequently Asked Questions
            </h2>
            <p className="text-slate-400 text-sm">
              Everything you need to know about privacy, accuracy, and self-hosting.
            </p>
          </div>

          <div className="space-y-3">
            {faqs.map((faq, idx) => (
              <div
                key={idx}
                className="bg-slate-900/50 border border-white/[0.07] rounded-2xl overflow-hidden transition-all"
              >
                <button
                  onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                  className="w-full px-6 py-4 text-left flex items-center justify-between text-white font-medium text-sm sm:text-base hover:text-emerald-300 transition-colors"
                >
                  <span>{faq.q}</span>
                  <ChevronDown
                    size={18}
                    className={`text-slate-400 transition-transform ${
                      openFaq === idx ? "rotate-180 text-emerald-400" : ""
                    }`}
                  />
                </button>
                {openFaq === idx && (
                  <div className="px-6 pb-5 pt-1 text-xs sm:text-sm text-slate-300 leading-relaxed border-t border-white/[0.04]">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>

        </section>

        {/* ── FINAL CTA BANNER ────────────────────────────────────────────── */}
        <section className="relative py-24 px-6 overflow-hidden">
          
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-emerald-950/20 to-transparent pointer-events-none" />

          <div className="max-w-3xl mx-auto text-center space-y-8 relative z-10">
            
            {/* Glowing Beacon */}
            <div className="relative inline-block">
              <div className="absolute inset-0 rounded-full bg-emerald-500/25 blur-3xl animate-pulse" />
              <div className="relative w-20 h-20 rounded-3xl bg-gradient-to-br from-emerald-400 to-teal-500 p-[1px] shadow-2xl shadow-emerald-500/30 mx-auto">
                <div className="w-full h-full rounded-[23px] bg-slate-950 flex items-center justify-center">
                  <Mic size={32} className="text-emerald-400 animate-bounce" />
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h2 className="text-4xl sm:text-6xl font-extrabold text-white tracking-tight">
                Start Talking to Yourself.{" "}
                <span className="bg-gradient-to-r from-emerald-300 to-teal-200 bg-clip-text text-transparent">
                  Productively.
                </span>
              </h2>
              <p className="text-slate-300 text-base sm:text-lg max-w-xl mx-auto leading-relaxed">
                It takes 10 seconds to make your first entry. Speak your raw thoughts, let Whisper transcribe, and let AI memory preserve your growth.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
              <Link
                to="/register"
                className="w-full sm:w-auto flex items-center justify-center gap-2.5 bg-gradient-to-r from-emerald-400 via-teal-400 to-emerald-400 hover:from-emerald-300 hover:to-teal-300 text-slate-950 font-bold px-9 py-4 rounded-xl text-base shadow-2xl shadow-emerald-500/30 hover:shadow-emerald-500/50 hover:-translate-y-0.5 transition-all"
              >
                <span>Create Free Account</span>
                <ArrowRight size={18} />
              </Link>
              <Link
                to="/login"
                className="w-full sm:w-auto px-7 py-4 rounded-xl border border-white/10 hover:border-emerald-500/30 text-slate-300 hover:text-white bg-slate-950/60 text-base font-medium transition-all"
              >
                Sign in to Existing Journal
              </Link>
            </div>

            <p className="text-xs font-mono text-slate-500 pt-2">
              Free forever · No credit card · 100% open source · Self-hostable
            </p>

          </div>

        </section>

      </main>

      {/* ── FOOTER ──────────────────────────────────────────────────────── */}
      <footer className="border-t border-white/[0.06] bg-slate-950/80 py-10 relative z-10">
        <div className="max-w-6xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-6 text-xs text-slate-500">
          
          <div className="flex items-center gap-3">
            <div className="w-6 h-6 rounded-lg bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center">
              <Mic size={12} className="text-emerald-400" />
            </div>
            <span className="font-semibold text-slate-300 tracking-tight text-sm">echoes</span>
            <span className="text-slate-600">·</span>
            <span>Intelligent Voice Journal with AI Memory</span>
          </div>

          <div className="flex items-center gap-6 text-slate-400 font-medium">
            <a href="#demo" className="hover:text-emerald-400 transition-colors">Demo</a>
            <a href="#semantic-search" className="hover:text-emerald-400 transition-colors">Search</a>
            <a href="#architecture" className="hover:text-emerald-400 transition-colors">Stack</a>
            <Link to="/login" className="hover:text-emerald-400 transition-colors">Sign In</Link>
            <Link to="/register" className="hover:text-emerald-400 transition-colors">Register</Link>
          </div>

          <div className="font-mono text-[11px] text-slate-600">
            pgvector · Groq Whisper · Llama 3.3 · Fastify · React 19
          </div>

        </div>
      </footer>

    </div>
  );
}
