# echoes

Voice journal with AI memory. Record thoughts, get them transcribed, search them semantically, and receive weekly AI-generated digests.

**Stack — 100% free tier**

| Layer | Tool |
|---|---|
| Frontend | React + Vite + Tailwind + shadcn/ui |
| Backend | Fastify + TypeScript + Drizzle ORM |
| Database | PostgreSQL + pgvector (Docker local / Supabase free prod) |
| Embeddings | @xenova/transformers — runs in-process, no API key |
| Transcription | Groq Whisper (`whisper-large-v3-turbo`) |
| AI Summaries | Groq Llama (`llama-3.3-70b-versatile`) |
| Deploy | Vercel (frontend) + Render free tier (API) |

---

## Getting started

### 1. Clone & install

```bash
git clone https://github.com/Mattathiasa/echoes
cd echoes

cd apps/api && npm install
cd ../web && npm install
```

### 2. Environment

```bash
cp .env.example apps/api/.env
# Edit apps/api/.env — set JWT_SECRET and GROQ_API_KEY
# Free Groq key: https://console.groq.com

echo "VITE_API_URL=http://localhost:3001" > apps/web/.env
```

### 3. Database

```bash
docker compose up -d
cd apps/api && npm run db:generate && npm run db:migrate
```

### 4. Run

```bash
# Terminal 1
cd apps/api && npm run dev

# Terminal 2
cd apps/web && npm run dev
```

Open http://localhost:5173 — register an account and start recording.

---

## Project structure

```
echoes/
├── apps/
│   ├── api/          Fastify backend
│   │   └── src/
│   │       ├── db/       schema, migrations
│   │       ├── lib/      embeddings, llm, transcribe, password
│   │       ├── plugins/  auth (JWT), errors
│   │       └── routes/   auth, entries, audio, search, digest
│   └── web/          React frontend
│       └── src/
│           ├── hooks/    useRecorder (MediaRecorder + Web Audio)
│           ├── lib/      api client, auth context, utils
│           ├── pages/    Record, Journal, Search, Digest, Login, Register
│           └── components/ Layout, ProtectedRoute
├── docker-compose.yml
└── .env.example
```

## API endpoints

| Method | Path | Description |
|---|---|---|
| POST | /auth/register | Create account |
| POST | /auth/login | Get JWT |
| POST | /entries | Upload audio → transcribe → embed → store |
| GET | /entries | List entries (paginated) |
| GET | /entries/:id | Single entry |
| DELETE | /entries/:id | Delete entry |
| GET | /audio/:userId/:filename | Stream audio file |
| POST | /search | Semantic search over transcripts |
| GET | /digest | Latest weekly digest |
| POST | /digest/generate | Generate digest from last 7 days |
