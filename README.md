# echoes

A voice journal with AI memory. Record daily reflections, have them transcribed automatically, search them semantically, and receive weekly AI-generated digests that surface patterns you'd otherwise miss.

**100% free-tier stack — no credit card required to run or deploy.**

---

## Features

| | Feature | Detail |
|---|---|---|
| 🎙️ | **Voice recording** | MediaRecorder API → WebM → Groq Whisper transcription in seconds |
| 🔍 | **Semantic search** | pgvector cosine similarity — finds entries by *meaning*, not just keywords |
| ✨ | **Weekly digest** | Groq Llama summarises your week: themes, moods, patterns |
| 🔁 | **Memory flash** | Resurfaces entries from 7 days, 1 month, and 1 year ago on the home screen |
| 📊 | **Activity heatmap** | 16-week calendar grid showing journaling streaks |
| 🏷️ | **Tags** | Add up to 5 tags per entry; click a tag in the journal to filter |
| ✏️ | **Inline edit** | Fix Whisper mistakes without re-recording; re-embeds automatically |
| 🔒 | **Auth** | JWT (30-day expiry), bcrypt passwords, auto-logout on expiry |
| 📤 | **Export** | Download all entries as JSON (GDPR-friendly) |
| 🌐 | **PWA-ready** | Manifest + icons; installable on mobile |

---

## Stack

| Layer | Tool | Why free |
|---|---|---|
| Frontend | React 19 + Vite + Tailwind CSS | Vercel free tier |
| Backend | Fastify 5 + TypeScript + Drizzle ORM | Render free tier |
| Database | PostgreSQL + pgvector | Supabase free tier (500 MB) |
| Embeddings | `@xenova/transformers` — `all-MiniLM-L6-v2` (384-dim) | Runs in-process, no API |
| Transcription | Groq `whisper-large-v3-turbo` | Groq free tier (6000 min/month) |
| AI Summaries | Groq `llama-3.3-70b-versatile` | Groq free tier |

---

## Getting started

### 1. Clone & install

```bash
git clone https://github.com/Mattathiasa/echoes
cd echoes
npm install --prefix apps/api
npm install --prefix apps/web
```

### 2. Environment

```bash
cp .env.example apps/api/.env
# Fill in: JWT_SECRET (32+ chars), GROQ_API_KEY
# Free Groq key → https://console.groq.com

echo "VITE_API_URL=http://localhost:3001" > apps/web/.env
```

### 3. Database

```bash
docker compose up -d           # starts pgvector postgres on :5432
cd apps/api
npm run db:push                # push schema (first run) — or db:generate + db:migrate
```

### 4. Run

```bash
# terminal 1
cd apps/api && npm run dev

# terminal 2
cd apps/web && npm run dev
```

Open [http://localhost:5173](http://localhost:5173) → register → start recording.

---

## Project structure

```
echoes/
├── apps/
│   ├── api/                      Fastify backend
│   │   └── src/
│   │       ├── db/               schema (Drizzle), migrate script
│   │       ├── lib/              embeddings, llm, transcribe, password
│   │       ├── plugins/          auth (JWT decorator), errors
│   │       └── routes/           auth, entries, audio, search,
│   │                             digest, stats, export, memories
│   └── web/                      React frontend
│       └── src/
│           ├── components/       Layout, ErrorBoundary, ActivityHeatmap,
│           │                     ShortcutsModal, ProtectedRoute
│           ├── hooks/            useRecorder (MediaRecorder + Web Audio API)
│           ├── lib/              api client, auth context, utils
│           └── pages/            Landing, Record, Journal, EntryDetail,
│                                 Search, Digest, Settings, Login, Register
├── docker-compose.yml
├── .env.example
└── .github/workflows/            CI: typecheck + build
```

---

## API reference

| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/auth/register` | — | Create account → JWT |
| POST | `/auth/login` | — | Email + password → JWT |
| PATCH | `/auth/password` | ✓ | Change password |
| DELETE | `/auth/account` | ✓ | Delete account (cascade) |
| POST | `/entries/transcribe` | ✓ | Transcribe audio preview (no save) |
| POST | `/entries` | ✓ | Upload audio → transcribe → embed → save |
| GET | `/entries` | ✓ | List entries (paginated) |
| GET | `/entries/random` | ✓ | Random entry |
| GET | `/entries/:id` | ✓ | Single entry |
| PATCH | `/entries/:id` | ✓ | Update transcript and/or tags (re-embeds) |
| DELETE | `/entries/:id` | ✓ | Delete entry |
| GET | `/audio/:userId/:file` | ✓ | Stream audio file |
| POST | `/search` | ✓ | Semantic search (pgvector cosine) |
| GET | `/digest` | ✓ | Latest weekly digest |
| GET | `/digests` | ✓ | All digests |
| POST | `/digest/generate` | ✓ | Generate this week's digest (Groq) |
| GET | `/stats` | ✓ | Totals, streak, week count |
| GET | `/stats/activity` | ✓ | 16-week daily entry counts |
| GET | `/memories/flash` | ✓ | On-this-day entries (7d / 1mo / 1yr) |
| GET | `/export` | ✓ | Download all entries as JSON |

---

## Keyboard shortcuts

| Key | Action |
|---|---|
| `Space` | Start / stop recording (Record page) |
| `?` | Toggle shortcuts help |
| `Esc` | Close dialog |
