import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
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
  VolumeX,
  Brain,
  Layers,
  Flame,
  Clock,
  Calendar,
  Radio,
  Sliders,
  Cpu,
  ShieldCheck,
  Disc,
} from "lucide-react";
import { NeuralVoiceSphere } from "../components/NeuralVoiceSphere";

// Register ScrollTrigger safely
if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

// ─── Web Audio Tone Synthesizer for Interactive Sensory Feedback ─────────────

class SoundFX {
  private ctx: AudioContext | null = null;
  public enabled: boolean = true;

  private init() {
    if (!this.ctx && typeof window !== "undefined") {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) this.ctx = new AudioCtx();
    }
  }

  public playTone(freq: number = 440, type: OscillatorType = "sine", duration: number = 0.25) {
    if (!this.enabled) return;
    try {
      this.init();
      if (!this.ctx) return;
      if (this.ctx.state === "suspended") this.ctx.resume();

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = type;
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(freq * 1.5, this.ctx.currentTime + duration);

      gain.gain.setValueAtTime(0.04, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + duration);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start();
      osc.stop(this.ctx.currentTime + duration);
    } catch {
      // Audio autoplay policy fallback
    }
  }

  public playHarmonicChime() {
    this.playTone(528, "sine", 0.4);
    setTimeout(() => this.playTone(660, "sine", 0.35), 80);
  }
}

const sfx = new SoundFX();

// ─── Interactive Sample Audio Reflections ───────────────────────────────────

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
    tags: ["architecture", "systems", "clarity"],
    tone: "Analytical & Grounded",
    confidence: "99.6%",
    keyQuote: "The bottleneck wasn't the database, it was our lack of bounded context.",
    transcript: [
      "Had a breakthrough during the morning walk about our microservice boundaries.",
      "We've been treating state synchronization like a distributed systems problem when it's really an organizational one.",
      "Sarah pointed out that decoupling the ingest pipeline from search embeddings would let us process audio in sub-second bursts without touching pgvector locks.",
      "Now that we separated them, latency dropped by 70%. It finally clicked: simplify the data flow before optimizing compute.",
    ],
  },
  {
    id: "sample-2",
    title: "Morning Mindset & Preventing Burnout",
    time: "Yesterday at 8:05 AM",
    duration: "1:42",
    durationSeconds: 102,
    tags: ["burnout-prevention", "mindset", "balance"],
    tone: "Reflective & Centered",
    confidence: "99.8%",
    keyQuote: "Urgency is often just someone else's poor planning disguised as your emergency.",
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

// ─── Semantic Search Interactive Dataset ─────────────────────────────────────

interface SearchMemory {
  id: string;
  time: string;
  score: number;
  topic: string;
  tags: string[];
  excerpt: string;
}

const mockMemories: SearchMemory[] = [
  {
    id: "mem-1",
    time: "2 days ago",
    score: 96,
    topic: "Sprint Overwhelm & Task Splitting",
    tags: ["clarity", "work", "focus"],
    excerpt: "I keep circling back to anxiety around the sprint deadline. The issue isn't the deadline itself; it's that we haven't decomposed the epic into day-sized deliverables...",
  },
  {
    id: "mem-2",
    time: "3 weeks ago",
    score: 89,
    topic: "Career Crossroads & Next Moves",
    tags: ["career", "reflection"],
    excerpt: "Sarah mentioned switching from engineering to product felt like learning Japanese at first, but now she can't imagine living inside tickets again...",
  },
  {
    id: "mem-3",
    time: "Last month",
    score: 84,
    topic: "Deep Work vs Calendar Tetris",
    tags: ["productivity", "habits"],
    excerpt: "Three hours lost to back-to-back calendar tetris. Left feeling drained with zero tangible output. Need to block Tuesday and Thursday mornings as sacred sanctuary hours...",
  },
  {
    id: "mem-4",
    time: "4 months ago",
    score: 79,
    topic: "Technical Imposter Syndrome",
    tags: ["imposter-syndrome", "engineering"],
    excerpt: "Staring at the distributed consensus bug for 6 hours. Wondering if I'm cut out for high-scale backend systems. But after walking away, the race condition became obvious...",
  },
];

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
    title: "Overcoming initial hesitation on the pitch deck",
    transcript:
      "Spent 4 hours tweaking font sizes on slide 3 instead of writing the actual narrative. Realized perfectionism is just fear in a sharp suit. Forced myself to record a 3-minute voice pitch instead. It was messy, but the core hook was undeniable.",
    insight: "The deck was delivered two days later. The voice pitch became the exact opening slide that secured the pilot partner.",
  },
  {
    period: "30 Days Ago",
    tagline: "The Monthly Calibration",
    date: "September 17",
    title: "Why we abandoned the complex caching layer",
    transcript:
      "Redis was giving us cache invalidation nightmares. Spoke out loud for 5 minutes explaining the edge cases to an imaginary rubber duck. Concluded that our PostgreSQL query latency on indexed pgvector columns is already sub-12ms. We were solving a problem we didn't have.",
    insight: "Stripping Redis eliminated 3 production alerts and lowered our Docker footprint by 40%.",
  },
  {
    period: "1 Year Ago",
    tagline: "The Long Horizon",
    date: "October 17, 2025",
    title: "The decision to leave corporate security and build",
    transcript:
      "Sitting in my car in the office parking lot. My palms were sweaty after telling my director I was wrapping up at year-end. Terrified of the lack of stability, but more terrified of looking back in 10 years and wondering what I could have created.",
    insight: "Today you are running two profitable products with full autonomy. The leap was terrifying, but the regret would have been fatal.",
  },
];

// ─── Pinned Scrub Story Steps ────────────────────────────────────────────────

const storySteps = [
  {
    step: "01",
    tag: "Acoustic Stream",
    title: "Whisper Large-v3-Turbo",
    desc: "Speak naturally with filler words, pauses, and multilingual phrases. Groq's high-throughput LPU transcribes your thoughts in sub-1.4 seconds with punctuation and syntax parsed.",
    metric: "1.2s avg latency",
    icon: Zap,
  },
  {
    step: "02",
    tag: "Vector Mindspace",
    title: "In-Process Embeddings",
    desc: "Your transcription runs through @xenova/transformers (all-MiniLM-L6-v2) directly inside node memory, generating a 384-dimensional vector without ever calling third-party cloud APIs.",
    metric: "384-dim local vector",
    icon: Brain,
  },
  {
    step: "03",
    tag: "pgvector Indexing",
    title: "Cosine Similarity Matrix",
    desc: "Stored securely in PostgreSQL with pgvector cosine indexes. Query by semantic intent ('feeling stuck') and retrieve entries that share the emotional essence without identical keywords.",
    metric: "sub-10ms retrieval",
    icon: Layers,
  },
  {
    step: "04",
    tag: "Sunday Synthesis",
    title: "Llama 3.3 70B Digest",
    desc: "Every Sunday night, Groq Llama reads your weekly entries, maps your emotional trajectory, detects blindspots, and gives you a single transformative reflection prompt for Monday.",
    metric: "Weekly intelligence",
    icon: Sparkles,
  },
];

// ─── FAQ Items ───────────────────────────────────────────────────────────────

const faqs = [
  {
    q: "How can Echoes be 100% free to run and host?",
    a: "Echoes leverages modern high-generosity free tiers: Groq Whisper Large-v3-Turbo provides 6,000 minutes free per month. Embeddings run in-process with Xenova Transformers (zero API fees). Database runs on Supabase PostgreSQL + pgvector (500MB free). Frontend and backend run on Vercel and Render free tiers.",
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
  // Demo audio state
  const [selectedSample, setSelectedSample] = useState<AudioSample>(audioSamples[0]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackProgress, setPlaybackProgress] = useState(25);
  const [audioMuted, setAudioMuted] = useState(false);

  // Search state
  const [searchQuery, setSearchQuery] = useState("When did I feel overwhelmed by deadlines?");

  // Memory flash tab
  const [activeFlashTab, setActiveFlashTab] = useState(0);

  // FAQ accordion
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  // Active Story Step (for scrubbed section)
  const [activeStoryIdx, setActiveStoryIdx] = useState(0);

  // ── GSAP Element Refs ──
  const mainRef = useRef<HTMLDivElement>(null);
  const progressBarRef = useRef<HTMLDivElement>(null);
  const heroBadgeRef = useRef<HTMLDivElement>(null);
  const heroTitleRef = useRef<HTMLHeadingElement>(null);
  const heroSubRef = useRef<HTMLParagraphElement>(null);
  const heroCtasRef = useRef<HTMLDivElement>(null);
  const heroSphereContainerRef = useRef<HTMLDivElement>(null);
  const interactiveDemoRef = useRef<HTMLDivElement>(null);
  const bentoSectionRef = useRef<HTMLDivElement>(null);
  const storyPinRef = useRef<HTMLDivElement>(null);

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
          return prev + 1.2;
        });
      }, 300);
    }
    return () => clearInterval(interval);
  }, [isPlaying]);

  // ── GSAP Animations & ScrollTriggers ──
  useEffect(() => {
    const ctx = gsap.context(() => {
      // 1. Scroll Progress Indicator Bar
      if (progressBarRef.current) {
        gsap.to(progressBarRef.current, {
          scaleX: 1,
          ease: "none",
          scrollTrigger: {
            trigger: mainRef.current,
            start: "top top",
            end: "bottom bottom",
            scrub: 0.3,
          },
        });
      }

      // 2. Hero Section Entrance Animation Timeline
      const heroTl = gsap.timeline({ defaults: { ease: "power4.out" } });

      heroTl
        .fromTo(
          heroBadgeRef.current,
          { y: -30, opacity: 0, scale: 0.9 },
          { y: 0, opacity: 1, scale: 1, duration: 0.8 }
        )
        .fromTo(
          heroTitleRef.current,
          { y: 40, opacity: 0, filter: "blur(10px)" },
          { y: 0, opacity: 1, filter: "blur(0px)", duration: 1.1 },
          "-=0.5"
        )
        .fromTo(
          heroSubRef.current,
          { y: 25, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.8 },
          "-=0.7"
        )
        .fromTo(
          heroCtasRef.current,
          { y: 20, opacity: 0, scale: 0.95 },
          { y: 0, opacity: 1, scale: 1, duration: 0.7 },
          "-=0.6"
        )
        .fromTo(
          heroSphereContainerRef.current,
          { scale: 0.7, opacity: 0 },
          { scale: 1, opacity: 1, duration: 1.4, ease: "expo.out" },
          "-=1.0"
        );

      // 3. Interactive Demo Container Entrance on Scroll
      if (interactiveDemoRef.current) {
        gsap.fromTo(
          interactiveDemoRef.current,
          { y: 80, opacity: 0, rotateX: 6 },
          {
            y: 0,
            opacity: 1,
            rotateX: 0,
            duration: 1.2,
            ease: "power3.out",
            scrollTrigger: {
              trigger: interactiveDemoRef.current,
              start: "top 85%",
              end: "top 45%",
              scrub: 0.5,
            },
          }
        );
      }

      // 4. Bento Grid Staggered Reveal with 3D Tilt Entrance
      if (bentoSectionRef.current) {
        const cards = bentoSectionRef.current.querySelectorAll(".bento-card");
        gsap.fromTo(
          cards,
          { y: 60, opacity: 0, scale: 0.94 },
          {
            y: 0,
            opacity: 1,
            scale: 1,
            duration: 0.9,
            stagger: 0.12,
            ease: "power3.out",
            scrollTrigger: {
              trigger: bentoSectionRef.current,
              start: "top 78%",
            },
          }
        );
      }

      // 5. Pinned Scrubbed Architecture Walkthrough
      if (storyPinRef.current) {
        ScrollTrigger.create({
          trigger: storyPinRef.current,
          start: "top top",
          end: "+=1600",
          pin: true,
          scrub: 0.6,
          onUpdate: (self) => {
            const step = Math.min(
              storySteps.length - 1,
              Math.floor(self.progress * storySteps.length)
            );
            setActiveStoryIdx(step);
          },
        });
      }

      // 6. Subtle Parallax on Background Light Spheres
      gsap.to(".parallax-orb", {
        yPercent: -25,
        ease: "none",
        scrollTrigger: {
          trigger: mainRef.current,
          start: "top top",
          end: "bottom bottom",
          scrub: 1.2,
        },
      });
    }, mainRef);

    return () => ctx.revert();
  }, []);

  const handleTogglePlay = () => {
    if (!isPlaying) {
      sfx.playHarmonicChime();
    }
    setIsPlaying(!isPlaying);
  };

  const handleSelectSample = (sample: AudioSample) => {
    sfx.playTone(480, "sine", 0.2);
    setSelectedSample(sample);
    setPlaybackProgress(15);
    setIsPlaying(true);
  };

  return (
    <div
      ref={mainRef}
      className="min-h-screen bg-[#080a0f] text-slate-100 flex flex-col font-sans selection:bg-emerald-500/20 selection:text-emerald-200 overflow-x-hidden"
    >
      {/* ── Scroll Progress Bar (GSAP Controlled) ─────────────────────────── */}
      <div
        ref={progressBarRef}
        className="fixed top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-emerald-400 via-teal-300 to-amber-300 z-50 origin-left scale-x-0"
      />

      {/* ── Background Atmospheric Light Cones & Parallax Orbs ────────────── */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="parallax-orb absolute -top-40 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-gradient-to-b from-emerald-500/14 via-teal-500/8 to-transparent rounded-full blur-[140px]" />
        <div className="parallax-orb absolute top-[40%] -left-64 w-[650px] h-[650px] bg-emerald-600/7 rounded-full blur-[170px]" />
        <div className="parallax-orb absolute top-[70%] -right-64 w-[700px] h-[700px] bg-teal-500/7 rounded-full blur-[170px]" />
        <div className="absolute inset-0 bg-grid-pattern opacity-35" />
      </div>

      {/* ── Sticky Top Navigation Bar ────────────────────────────────────────── */}
      <header className="sticky top-0 z-40 border-b border-white/[0.06] bg-[#080a0f]/80 backdrop-blur-2xl">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          {/* Brand Logo with Pulsing Neural Dot */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center shadow-lg shadow-emerald-500/25 group-hover:scale-105 group-hover:shadow-emerald-500/40 transition-all">
              <Mic size={17} className="text-slate-950 font-bold" />
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-lg tracking-tight text-white flex items-center gap-1.5">
                echoes
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              </span>
            </div>
          </Link>

          {/* Navigation Links (Desktop) */}
          <nav className="hidden md:flex items-center gap-7 text-sm text-slate-300 font-medium">
            <a href="#interactive-player" className="hover:text-emerald-400 transition-colors">
              3D Acoustic Player
            </a>
            <a href="#pipeline-story" className="hover:text-emerald-400 transition-colors">
              How Thoughts Evolve
            </a>
            <a href="#semantic-search" className="hover:text-emerald-400 transition-colors">
              Semantic Search
            </a>
            <a href="#features" className="hover:text-emerald-400 transition-colors">
              Features
            </a>
            <a href="#faq" className="hover:text-emerald-400 transition-colors">
              FAQ
            </a>
          </nav>

          {/* Right Action Group */}
          <div className="flex items-center gap-3">
            {/* Audio Feedback Toggle */}
            <button
              onClick={() => {
                sfx.enabled = !sfx.enabled;
                setAudioMuted(!sfx.enabled);
              }}
              title={audioMuted ? "Sound FX Disabled" : "Sound FX Active"}
              className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/[0.05] transition-colors"
            >
              {audioMuted ? <VolumeX size={16} /> : <Volume2 size={16} className="text-emerald-400" />}
            </button>

            <Link
              to="/login"
              className="text-sm text-slate-300 hover:text-white px-3.5 py-1.5 rounded-lg transition-colors font-medium"
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

      {/* ── MAIN CONTENT CONTAINER ────────────────────────────────────────── */}
      <main className="relative z-10 flex-1">
        
        {/* ── HERO SECTION WITH THREE.JS VOICE SPHERE ───────────────────────── */}
        <section className="relative pt-16 pb-20 px-6 max-w-6xl mx-auto flex flex-col items-center">
          
          {/* Badge */}
          <div
            ref={heroBadgeRef}
            className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 text-emerald-300 text-xs font-semibold backdrop-blur-md mb-8 shadow-sm shadow-emerald-950"
          >
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span className="font-mono tracking-wider">ECHOES 2.0</span>
            <span className="text-emerald-600">|</span>
            <span>Intelligent Voice Journal with AI Semantic Memory</span>
          </div>

          {/* Headline */}
          <h1
            ref={heroTitleRef}
            className="text-5xl sm:text-7xl lg:text-8xl font-extrabold tracking-tight text-white leading-[1.05] text-center max-w-5xl mb-6"
          >
            Speak your mind.{" "}
            <span className="bg-gradient-to-r from-emerald-300 via-teal-200 to-amber-200 bg-clip-text text-transparent">
              Never lose an insight again.
            </span>
          </h1>

          {/* Subtitle */}
          <p
            ref={heroSubRef}
            className="text-slate-300 text-lg sm:text-2xl leading-relaxed text-center max-w-2xl mb-8 font-normal"
          >
            Echoes transcribes your daily reflections in seconds using Groq Whisper, indexes the deeper meaning in high-dimensional vector space, and resurfaces your past wisdom when you need it most.
          </p>

          {/* CTAs */}
          <div
            ref={heroCtasRef}
            className="flex flex-col sm:flex-row items-center gap-4 justify-center mb-10 w-full sm:w-auto"
          >
            <Link
              to="/register"
              onClick={() => sfx.playHarmonicChime()}
              className="w-full sm:w-auto flex items-center justify-center gap-2.5 bg-gradient-to-r from-emerald-400 via-teal-400 to-emerald-400 hover:from-emerald-300 hover:to-teal-300 text-slate-950 font-bold px-8 py-4 rounded-xl text-base shadow-xl shadow-emerald-500/25 hover:shadow-emerald-500/40 hover:-translate-y-0.5 transition-all"
            >
              <Mic size={18} />
              <span>Record Your First Reflection</span>
              <ArrowRight size={16} />
            </Link>

            <a
              href="#interactive-player"
              onClick={() => sfx.playTone(520, "sine", 0.2)}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-4 rounded-xl text-slate-300 hover:text-white border border-white/10 hover:border-emerald-500/40 bg-white/[0.03] hover:bg-white/[0.06] backdrop-blur-md text-base font-medium transition-all"
            >
              <Play size={15} className="text-emerald-400 fill-emerald-400" />
              <span>Experience 3D Acoustic Demo</span>
            </a>
          </div>

          {/* Trust stats */}
          <div className="flex flex-wrap items-center justify-center gap-y-2 gap-x-6 text-xs text-slate-400 font-medium mb-10">
            <div className="flex items-center gap-1.5">
              <CheckCircle2 size={14} className="text-emerald-400" />
              <span>100% Free Forever Stack</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 size={14} className="text-emerald-400" />
              <span>Sub-2s Whisper Transcription</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 size={14} className="text-emerald-400" />
              <span>pgvector 384-Dim Semantic Memory</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 size={14} className="text-emerald-400" />
              <span>Private & Self-Hostable</span>
            </div>
          </div>

          {/* Three.js 3D Neural Voice Sphere Showcase */}
          <div
            ref={heroSphereContainerRef}
            className="relative w-full max-w-4xl h-[400px] sm:h-[460px] flex items-center justify-center mt-2"
          >
            <div className="absolute inset-0 flex items-center justify-center">
              <NeuralVoiceSphere isPlaying={isPlaying} />
            </div>

            {/* Floating Glassmorphic Sensory Badges */}
            <div className="absolute top-8 left-4 sm:left-12 p-3.5 rounded-2xl bg-slate-900/70 border border-white/[0.08] backdrop-blur-xl shadow-xl flex items-center gap-3 animate-float-slow">
              <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                <Radio size={16} className={isPlaying ? "animate-spin" : ""} />
              </div>
              <div className="text-left">
                <span className="text-[10px] font-mono uppercase text-slate-400 block">Neural Voice Mesh</span>
                <span className="text-xs font-semibold text-white">2,800 Active Particle Nodes</span>
              </div>
            </div>

            <div className="absolute bottom-8 right-4 sm:right-12 p-3.5 rounded-2xl bg-slate-900/70 border border-white/[0.08] backdrop-blur-xl shadow-xl flex items-center gap-3 animate-float-slow" style={{ animationDelay: "1.5s" }}>
              <div className="w-8 h-8 rounded-xl bg-teal-500/20 text-teal-300 flex items-center justify-center">
                <Cpu size={16} />
              </div>
              <div className="text-left">
                <span className="text-[10px] font-mono uppercase text-slate-400 block">LPU Inference</span>
                <span className="text-xs font-semibold text-white">Groq Whisper Large-v3</span>
              </div>
            </div>

            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 px-3 py-1 rounded-full bg-slate-950/80 border border-white/[0.08] text-[11px] font-mono text-slate-400 backdrop-blur-md">
              <Disc size={12} className={`text-emerald-400 ${isPlaying ? "animate-spin" : ""}`} />
              <span>{isPlaying ? "3D Sphere Modulating to Audio Stream" : "Move mouse to orbit · Press play below"}</span>
            </div>
          </div>

        </section>

        {/* ── SECTION: INTERACTIVE 3D ACOUSTIC & WHISPER PLAYGROUND ─────────── */}
        <section id="interactive-player" ref={interactiveDemoRef} className="max-w-6xl mx-auto px-6 py-12">
          
          <div className="relative rounded-3xl border border-white/[0.1] bg-slate-900/50 backdrop-blur-2xl shadow-2xl overflow-hidden p-6 sm:p-10">
            
            {/* Header */}
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
              <div className="flex items-center gap-1.5 bg-slate-950/80 p-1.5 rounded-xl border border-white/[0.07] overflow-x-auto max-w-full">
                {audioSamples.map((sample, idx) => (
                  <button
                    key={sample.id}
                    onClick={() => handleSelectSample(sample)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
                      selectedSample.id === sample.id
                        ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/35 shadow-sm"
                        : "text-slate-400 hover:text-white"
                    }`}
                  >
                    Sample #{idx + 1}
                  </button>
                ))}
              </div>
            </div>

            {/* Grid */}
            <div className="grid lg:grid-cols-12 gap-8 pt-8">

              {/* Left Column: Player & Equalizer Visualization */}
              <div className="lg:col-span-5 flex flex-col justify-between space-y-6">
                
                <div className="bg-slate-950/70 border border-white/[0.08] rounded-2xl p-6 relative overflow-hidden group">
                  <div className="absolute -right-8 -top-8 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl group-hover:bg-emerald-500/20 transition-all" />

                  <div className="flex items-center justify-between text-xs text-slate-400 mb-3">
                    <span className="flex items-center gap-1 font-mono">
                      <Clock size={12} className="text-emerald-400" />
                      {selectedSample.time}
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 font-mono text-[11px] border border-emerald-500/25">
                      Duration: {selectedSample.duration}
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-white mb-2 leading-snug">
                    {selectedSample.title}
                  </h3>

                  <div className="bg-emerald-950/40 border border-emerald-800/30 rounded-xl p-3.5 my-4">
                    <p className="text-xs text-emerald-200 italic leading-relaxed">
                      "{selectedSample.keyQuote}"
                    </p>
                  </div>

                  {/* Equalizer Waveform Visualization */}
                  <div className="space-y-3 pt-2">
                    <div className="flex items-end justify-between gap-1 h-16 px-2 py-1 bg-slate-900/90 rounded-xl border border-white/[0.06]">
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
                              height: isPlaying
                                ? `${Math.max(15, (height * (Math.sin(i + playbackProgress) + 1.2)) / 2)}%`
                                : `${height}%`,
                            }}
                          />
                        );
                      })}
                    </div>

                    <div className="flex items-center justify-between text-[11px] font-mono text-slate-400">
                      <span>0:{Math.floor((playbackProgress / 100) * selectedSample.durationSeconds).toString().padStart(2, "0")}</span>
                      <span>{selectedSample.duration}</span>
                    </div>
                  </div>

                  {/* Control Button */}
                  <div className="pt-4 flex items-center justify-between">
                    <button
                      onClick={handleTogglePlay}
                      className="flex items-center gap-2.5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-bold px-5 py-2.5 rounded-xl text-sm transition-all shadow-md shadow-emerald-500/20 active:scale-95"
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
                <div className="bg-slate-950/50 border border-white/[0.07] rounded-xl p-4 flex items-center justify-between text-xs">
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

              {/* Right Column: Synchronized Transcript */}
              <div className="lg:col-span-7 flex flex-col justify-between space-y-4">
                
                <div className="bg-slate-950/75 border border-white/[0.08] rounded-2xl p-6 flex-1 flex flex-col">
                  
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

                  <div className="space-y-3.5 flex-1 text-sm text-slate-200 leading-relaxed font-normal">
                    {selectedSample.transcript.map((sentence, idx) => (
                      <div
                        key={idx}
                        className={`p-3 rounded-xl transition-all ${
                          idx === 0
                            ? "bg-white/[0.03] border-l-2 border-emerald-400 text-white shadow-sm"
                            : "text-slate-300"
                        }`}
                      >
                        <p className="text-sm leading-relaxed">{sentence}</p>
                      </div>
                    ))}
                  </div>

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

        {/* ── SECTION: PINNED SCROLL STORYTELLING ("HOW THOUGHTS EVOLVE") ────── */}
        <section
          id="pipeline-story"
          ref={storyPinRef}
          className="relative max-w-6xl mx-auto px-6 py-24 min-h-screen flex items-center"
        >
          <div className="w-full grid lg:grid-cols-12 gap-12 items-center">
            
            {/* Left Column: Progress Step Indicator (Pinned) */}
            <div className="lg:col-span-5 space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/25 text-emerald-300 text-xs font-semibold">
                <Sliders size={13} />
                <span>The Cognitive Pipeline</span>
              </div>

              <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight leading-tight">
                From Spoken Words to Life Wisdom.
              </h2>
              <p className="text-slate-400 text-base leading-relaxed">
                Scroll to watch how an ephemeral audio clip gets transcribed, mathematically vectorized, and resurfaced at pivotal moments in your life.
              </p>

              {/* Step Navigation Indicators */}
              <div className="space-y-3 pt-4">
                {storySteps.map((st, idx) => {
                  const isActive = activeStoryIdx === idx;
                  return (
                    <div
                      key={st.step}
                      onClick={() => {
                        sfx.playTone(400 + idx * 80, "sine", 0.2);
                        setActiveStoryIdx(idx);
                      }}
                      className={`cursor-pointer p-4 rounded-2xl border transition-all flex items-center justify-between ${
                        isActive
                          ? "bg-slate-900 border-emerald-500/40 shadow-lg shadow-emerald-950/40 translate-x-2"
                          : "bg-slate-950/40 border-white/[0.05] hover:border-white/10 opacity-60"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span className={`text-xs font-mono font-bold ${isActive ? "text-emerald-400" : "text-slate-500"}`}>
                          {st.step}
                        </span>
                        <span className={`text-sm font-semibold ${isActive ? "text-white" : "text-slate-400"}`}>
                          {st.title}
                        </span>
                      </div>
                      <span className="text-[11px] font-mono text-emerald-400/80">{st.metric}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Right Column: Morphing Dynamic Step Detail Card */}
            <div className="lg:col-span-7">
              <div className="relative rounded-3xl border border-emerald-500/25 bg-gradient-to-br from-slate-900/90 via-slate-950/80 to-[#080a0f] p-8 sm:p-12 backdrop-blur-2xl shadow-2xl transition-all min-h-[380px] flex flex-col justify-between">
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-bold uppercase tracking-widest text-emerald-400">
                      Step {storySteps[activeStoryIdx].step} · {storySteps[activeStoryIdx].tag}
                    </span>
                    <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                      {(() => {
                        const Icon = storySteps[activeStoryIdx].icon;
                        return <Icon size={20} />;
                      })()}
                    </div>
                  </div>

                  <h3 className="text-2xl sm:text-3xl font-extrabold text-white">
                    {storySteps[activeStoryIdx].title}
                  </h3>

                  <p className="text-slate-300 text-base leading-relaxed">
                    {storySteps[activeStoryIdx].desc}
                  </p>
                </div>

                <div className="pt-6 border-t border-white/[0.07] flex items-center justify-between text-xs font-mono text-slate-400">
                  <span className="flex items-center gap-2">
                    <ShieldCheck size={14} className="text-emerald-400" />
                    Zero Cloud Vendor Lock-in
                  </span>
                  <span className="text-emerald-300 font-bold">{storySteps[activeStoryIdx].metric}</span>
                </div>

              </div>
            </div>

          </div>
        </section>

        {/* ── SECTION: INTERACTIVE SEMANTIC SEARCH SANDBOX ─────────────────── */}
        <section id="semantic-search" className="max-w-6xl mx-auto px-6 py-20">
          
          <div className="text-center max-w-3xl mx-auto mb-14">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/10 border border-teal-500/25 text-teal-300 text-xs font-semibold mb-4">
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
                  onClick={() => {
                    sfx.playTone(550, "sine", 0.15);
                    setSearchQuery(preset);
                  }}
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

        {/* ── SECTION: BENTO GRID (GSAP STAGGERED) ─────────────────────────── */}
        <section id="features" ref={bentoSectionRef} className="max-w-6xl mx-auto px-6 py-20">
          
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight mb-4">
              Everything Your Mind Needs.
            </h2>
            <p className="text-slate-400 text-base">
              A personal reflection system designed to turn fleeting verbal observations into cumulative wisdom.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">

            {/* Bento Card 1 */}
            <div className="bento-card glass-card-hover bg-slate-900/40 border border-white/[0.08] rounded-3xl p-8 space-y-4 relative overflow-hidden">
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

            {/* Bento Card 2 */}
            <div className="bento-card glass-card-hover bg-slate-900/40 border border-white/[0.08] rounded-3xl p-8 space-y-4 relative overflow-hidden">
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

            {/* Bento Card 3 */}
            <div className="bento-card glass-card-hover bg-slate-900/40 border border-white/[0.08] rounded-3xl p-8 space-y-4 relative overflow-hidden">
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

            {/* Bento Card 4 */}
            <div className="bento-card glass-card-hover bg-slate-900/40 border border-white/[0.08] rounded-3xl p-8 space-y-4 relative overflow-hidden">
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

            {/* Bento Card 5 */}
            <div className="bento-card glass-card-hover bg-slate-900/40 border border-white/[0.08] rounded-3xl p-8 space-y-4 relative overflow-hidden">
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

            {/* Bento Card 6 */}
            <div className="bento-card glass-card-hover bg-slate-900/40 border border-white/[0.08] rounded-3xl p-8 space-y-4 relative overflow-hidden">
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
        <section className="max-w-5xl mx-auto px-6 py-20">
          
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

          <div className="flex items-center justify-center gap-3 mb-8">
            {memoryFlashTabs.map((tab, idx) => (
              <button
                key={tab.period}
                onClick={() => {
                  sfx.playTone(450 + idx * 75, "sine", 0.15);
                  setActiveFlashTab(idx);
                }}
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

        {/* ── SECTION: 100% FREE TIER ARCHITECTURE ────────────────────────── */}
        <section className="max-w-5xl mx-auto px-6 py-20 border-t border-white/[0.06]">
          
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
                  onClick={() => {
                    sfx.playTone(420, "sine", 0.1);
                    setOpenFaq(openFaq === idx ? null : idx);
                  }}
                  className="w-full px-6 py-4 text-left flex items-center justify-between text-white font-medium text-sm sm:text-base hover:text-emerald-300 transition-colors"
                >
                  <span>{faq.q}</span>
                  <ChevronDown
                    size={18}
                    className={`text-slate-400 transition-transform duration-200 ${
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
                onClick={() => sfx.playHarmonicChime()}
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
            <a href="#interactive-player" className="hover:text-emerald-400 transition-colors">Player</a>
            <a href="#pipeline-story" className="hover:text-emerald-400 transition-colors">Pipeline</a>
            <a href="#semantic-search" className="hover:text-emerald-400 transition-colors">Search</a>
            <Link to="/login" className="hover:text-emerald-400 transition-colors">Sign In</Link>
            <Link to="/register" className="hover:text-emerald-400 transition-colors">Register</Link>
          </div>

          <div className="font-mono text-[11px] text-slate-600">
            Three.js · GSAP · pgvector · Groq Whisper · Fastify · React 19
          </div>
        </div>
      </footer>
    </div>
  );
}
