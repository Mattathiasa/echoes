# Deploying Echoes — Step-by-Step Guide

You need three free services. Here's what each one does:

| Service | What it does | Sign up at |
|---------|-------------|------------|
| **Neon** | Hosts the PostgreSQL database | neon.tech |
| **Render** | Runs the API server (Node.js backend) | render.com |
| **Vercel** | Hosts the frontend (the website) | vercel.com |

Do them in this order — each step gives you a value you need in the next one.

---

## Step 1 — Neon (Database)

### 1a. Create the project
1. Go to **neon.tech** and sign up (free, no card needed)
2. Click **"New Project"**
3. Name it `echoes`
4. Region: **EU Central (Frankfurt)** (or whatever is closest to you)
5. Click **Create Project**

### 1b. Copy the connection string
1. After creation you land on the project dashboard
2. In the **"Connection Details"** panel, find **"Connection string"**
3. Make sure the dropdown says **"pooled connection"** is OFF (direct connection)
4. Copy the full string — it looks like:
   ```
   postgresql://mattathias:AbCdEfGh@ep-something-abc.eu-central-1.aws.neon.tech/echoes?sslmode=require
   ```
5. **Save this** — you'll need it in Step 2

### 1c. Enable pgvector
1. In the left sidebar click **"Extensions"**
2. Search for `vector`
3. Click **Enable** next to `pgvector`

---

## Step 2 — Groq API Key (for AI features)

1. Go to **console.groq.com** and sign up (free)
2. Click **"API Keys"** in the left sidebar
3. Click **"Create API Key"**, name it `echoes`
4. Copy the key (starts with `gsk_...`)
5. **Save this** — you'll need it in Step 3

---

## Step 3 — Render (API Server)

### 3a. Connect your GitHub
1. Go to **render.com** and sign up with GitHub
2. On the dashboard, click **"New +"** → **"Web Service"**
3. Choose **"Build and deploy from a Git repository"**
4. Connect your GitHub account if prompted
5. Find **Mattathiasa/echoes** and click **Connect**

### 3b. Configure the service
Render will auto-detect the `render.yaml` file and fill most settings. Verify:

| Field | Value |
|-------|-------|
| Name | `echoes-api` |
| Region | Frankfurt EU (Central) |
| Branch | `main` |
| Root Directory | `apps/api` |
| Build Command | `npm install && npm run build` |
| Start Command | `node dist/index.js` |

### 3c. Set environment variables
Scroll down to **"Environment Variables"**. Click **"Add Environment Variable"** for each:

| Key | Value |
|-----|-------|
| `DATABASE_URL` | *(the Neon connection string from Step 1b)* |
| `JWT_SECRET` | *(any random 32+ character string — generate one below)* |
| `GROQ_API_KEY` | *(the Groq key from Step 2)* |
| `CORS_ORIGIN` | *(leave blank for now — you'll fill this after Step 4)* |

> **Generating a JWT_SECRET:** Open any browser tab and run this in the console (F12 → Console tab):
> ```js
> crypto.randomUUID() + crypto.randomUUID()
> ```
> Copy the result (it'll look like `550e8400-e29b-41d4-a716-44665544000036b8a489-...`). That's your secret.

### 3d. Deploy
1. Click **"Create Web Service"**
2. Render starts building — takes 3–5 minutes
3. When the status shows **"Live"**, copy your service URL from the top of the page
   - It looks like: `https://echoes-api.onrender.com`
4. **Save this URL** — you'll need it in Steps 4 and 5

### 3e. Run the database migration
This creates all the tables in your Neon database. Run this once from your terminal:

```bash
cd D:\Projects\echoes\apps\api

# Create a .env file with your Neon DATABASE_URL
echo DATABASE_URL="your-neon-connection-string-here" > .env

# Push the schema
npm run db:push
```

When prompted `Are you sure?`, type `y` and press Enter.

> If you get a pgvector error, make sure you completed Step 1c (enabling the extension in Neon).

---

## Step 4 — Vercel (Frontend)

### 4a. Import the project
1. Go to **vercel.com** and sign up with GitHub
2. Click **"Add New…"** → **"Project"**
3. Find **Mattathiasa/echoes** and click **Import**

### 4b. Configure the project
| Field | Value |
|-------|-------|
| Framework Preset | Vite |
| Root Directory | `apps/web` ← **important, change this** |
| Build Command | `npm run build` |
| Output Directory | `dist` |

Click the **Root Directory** field and type `apps/web`.

### 4c. Set environment variable
Under **"Environment Variables"** add:

| Name | Value |
|------|-------|
| `VITE_API_URL` | *(the Render URL from Step 3d, e.g. `https://echoes-api.onrender.com`)* |

### 4d. Deploy
Click **"Deploy"**. Takes about 2 minutes.

When done, Vercel gives you a URL like `https://echoes-mattathiasa.vercel.app`.

**Save this URL** — you need it for Step 5.

---

## Step 5 — Connect everything (CORS)

Now go back to **Render**:
1. Open your `echoes-api` service
2. Click **"Environment"** in the left sidebar
3. Find `CORS_ORIGIN` and set its value to your Vercel URL:
   ```
   https://echoes-mattathiasa.vercel.app
   ```
   (use your exact URL, no trailing slash)
4. Click **Save Changes** — Render automatically redeploys

---

## Step 6 — Verify it works

1. Open your Vercel URL in a browser
2. You should see the echoes landing page
3. Click **"Get Started"**, register an account, record a voice note
4. If the note transcribes and appears in the journal — everything is working

---

## Troubleshooting

| Problem | Fix |
|---------|-----|
| API returns 500 on login | Check `DATABASE_URL` in Render — run `db:push` again |
| "Failed to fetch" error in browser | Check `VITE_API_URL` in Vercel matches the Render URL exactly |
| Audio doesn't transcribe | Check `GROQ_API_KEY` in Render is correct |
| Render service sleeps | Free tier sleeps after 15 min of inactivity. First request after sleep takes ~30s. Upgrade to pay $7/month to avoid this. |
| Can't find uploaded audio after Render restart | Known limitation: free tier doesn't have persistent disk. Audio files in `/tmp/uploads` are lost on restart. The transcript is safe in the DB. |

---

## After deployment

Once it's live, add these to your portfolio:
- **Live URL:** your Vercel URL
- **Repo:** https://github.com/Mattathiasa/echoes
