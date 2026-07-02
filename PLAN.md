# AGENT EXECUTION PLAN: Praxis Interactive Prototype

**Context:** Blueprint for building "Praxis," a practical, interactive university application platform evaluating first-year readiness.
**Tech Stack:** Svelte 5 (Runes) + Bits UI + SCSS (Frontend), Fastify (Backend), PostgreSQL (Database).
**Exclusions:** Ignore Authentication, User Onboarding, and standard CRUD boilerplate. Focus strictly on the interactive evaluation, builder engines, and deployment.

---

## PART 0: WORKSPACE INITIALIZATION & ARCHITECTURE (✅ COMPLETE)

**Objective:** Scaffold a monorepo containing the Svelte 5 frontend and Fastify backend, ready for Cloud Run deployment.

* **Step 1: Monorepo Setup:** ✅ Root `package.json` with workspace config for `/frontend` and `/backend`.
* **Step 2: Frontend Scaffold:** ✅ SvelteKit + Bits UI + SCSS + `@sveltejs/adapter-node`.
* **Step 3: Backend Scaffold:** ✅ Fastify v5 + PostgreSQL schema + docker-compose + in-memory store.
* **Step 4: Dockerization:** ✅ Multi-stage Dockerfiles for frontend (`:3000`) and backend (`:8080`) with `.dockerignore`.

---

## PART 1: FRONTEND EXPERIENCE (✅ COMPLETE)

**Core Philosophy:** Evaluate applicants through practical, interactive problem-solving. AI provides contextual hints, not direct answers.

### 1.1. Journey: Computer Science ("The Buggy Leaderboard") ✅
* Code editor with dark theme, Run Tests button, PASS/FAIL feedback, 3-level hint system, technical quiz + written rationale.

### 1.2. Journey: Visual Communication Design ("Hierarchy Rescue") ✅
* Brief → Figma embed → Quiz flow, split-screen layout, Figma URL submission, design quiz + written defense.

### 1.3. Journey: Accounting ("The Spaza Shop Ledger") ✅
* Drag-and-drop transaction cards into 5 ledger buckets, evaluation engine with per-item breakdown, Business Entity Concept quiz + rationale.

---

## PART 2: BACKEND EXPERIENCE (✅ COMPLETE)

**Core Philosophy:** Automate problem creation using archives, keeping humans in the loop for final tweaks.

### 2.1. Automated Archive Ingestion (AAI) ✅
* `POST /api/challenges/upload` — text → LLM extraction → draft challenge generation
* `POST /api/challenges/:id/regenerate-numbers` — randomise values in config
* `POST /api/challenges/:id/publish` — draft → published
* Seed data includes 3 published challenges across all journey types

### 2.2. Grading & Viewing Platform ✅
* `GET /api/admin/dashboard` — aggregated stats (counts, avg score, by degree/status)
* `GET /api/applicants` — list all applicants with scores
* `GET /api/applicants/:id/submissions` — artifacts + AI summaries
* `POST /api/applicants/:id/decision` — accept/reject
* University & Degree CRUD routes included

---

## PART 3: DEPLOYMENT (GOOGLE CLOUD RUN)

**Objective:** Deploy serverless, auto-scaling instances of both the SvelteKit frontend and Fastify backend.

* **Prerequisites:** * Google Cloud Project created with billing enabled.
    * Cloud Run API and Artifact Registry API enabled.
    * Managed Cloud SQL (PostgreSQL) instance provisioned and connection string injected into backend secrets.
* **Step 1: Container Build:** Use Google Cloud Build to create images from the respective Dockerfiles.
* **Step 2: Backend Deployment:** Deploy Fastify container to Cloud Run, injecting `DATABASE_URL` and `CORS_ORIGIN` (pointing to the frontend URL).
* **Step 3: Frontend Deployment:** Deploy SvelteKit Node adapter container to Cloud Run, injecting `PUBLIC_API_URL` (pointing to the backend URL).
