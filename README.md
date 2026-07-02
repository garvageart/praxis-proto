# Praxis — Interactive University Application Prototype

A practical, interactive platform for evaluating first-year readiness through real-world problem-solving tasks.

**Tech Stack:** Svelte 5 (Runes) + SCSS + Bits UI / Fastify + Gemini AI / PostgreSQL

## Architecture

One Cloud Run service running both servers:

- **Frontend** — SvelteKit with adapter-node on port 8080
- **Backend** — Fastify API on port 8081 (proxied through SvelteKit)

## Quick Start

```bash
# Start PostgreSQL (optional — in-memory store used otherwise)
cd backend && docker compose up -d

# Install dependencies (from root)
npm install

# Terminal 1: Backend
npm run dev --workspace=backend

# Terminal 2: Frontend
npm run dev --workspace=frontend
```

Open http://localhost:5173 — Admin at http://localhost:5173/admin

## API Key (Optional)

For AI features (hint generation, challenge extraction, summaries):

```
# backend/.env
GEMINI_API_KEY=your_key_here
```

Get a key at https://aistudio.google.com/apikey — uses Gemini 2.5 Flash.

## What's Inside

### Applicant Journeys
| Route | Journey | Interaction |
|-------|---------|------------|
| `/journeys/cs-buggy-leaderboard` | CS: The Buggy Leaderboard | Code editor + tests + AI hints |
| `/journeys/vcd-hierarchy-rescue` | VCD: Hierarchy Rescue | Figma embed + design quiz |
| `/journeys/spaza-ledger` | Accounting: Spaza Ledger | Drag-drop ledger buckets |

### Admin Console (`/admin`)
| Route | Feature |
|-------|---------|
| `/admin` | Dashboard with stats |
| `/admin/applicants` | Applicant list with scores |
| `/admin/applicants/:id` | Detail view + AI summaries + accept/reject |
| `/admin/challenges` | Challenge list |
| `/admin/challenges/:id` | Config editor + regenerate + publish |
| `/admin/upload` | AAI — Generate challenges from text |

### API Routes
| Method | Path | Description |
|--------|------|-------------|
| GET | `/health` | Health check |
| POST | `/api/challenges/upload` | Upload text → LLM extracts → generates challenge |
| POST | `/api/hints/generate` | Generate AI hint from student code |
| POST | `/api/submissions/:id/summarise` | Generate AI summary of submission |
| POST | `/api/applicants/:id/decision` | Accept/reject applicant |
| GET | `/api/admin/dashboard` | Aggregated stats |

## Deploy

```bash
# Single Cloud Run service
bash deploy.sh
```

Requires gcloud CLI, a GCP project with Cloud Run + Artifact Registry APIs enabled.
