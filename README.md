# Resume Ecosystem Builder – AI-Powered ATS & Resume Intelligence Platform

A high-performance, domain-targeted resume intelligence platform built with **Next.js 14 App Router, React 18, TypeScript, PostgreSQL (Prisma ORM), Redis 7, and Server-Side LLM Orchestration**.

This system centralizes a master engineering portfolio of projects, tech stacks, and metrics, allowing developers to generate tailored, domain-specific resumes (e.g., AI/ML, Full-Stack, Computer Vision, IoT) and evaluate them against real-world Job Descriptions using an **explainable, hybrid ATS match engine** and **anti-hallucination bullet refiner**.

---

## Key Capabilities

### 1. Hybrid ATS Match Engine (Deterministic + Semantic)
- **Deterministic Keyword Matcher:** Evaluates verified technical skills and tools against JD requirements with exact boundary matching (zero arbitrary score fabrication).
- **Composite ATS Readiness Score:** 60% deterministic keyword coverage + 40% semantic depth and contextual alignment.
- **Explainable Coverage:** Explicitly highlights *Matched Skills*, *Missing Skills*, and *Keyword Coverage Ratio* (e.g. 18 / 23).

### 2. Prioritized Skill Gap Analysis
- Classifies missing requirements into **Critical**, **Important**, and **Nice-to-Have** tiers.
- Distinguishes between skills *already present*, *missing*, *weakly represented*, and *potentially relevant*.
- Provides ethical, actionable recommendations on how to highlight true engineering experience without fabricating unearned credentials.

### 3. AI Resume Suggestions with Anti-Hallucination Guardrails
- **In-Editor Action Triggers:** *Stronger Impact*, *Make Concise*, *Action Verb*, and *Tailor to Domain*.
- **Strict Anti-Fabrication Principles:** The AI model is strictly prohibited from inventing numerical metrics, percentages, company names, or unverified technical claims.
- **Prompt Injection Defense:** Job descriptions and bullet inputs are isolated within delimited XML tags with explicit instructions to ignore role-hijacking prompts.

### 4. High-Performance Architecture & Redis 7 Layer
- **Deterministic Cache Hashing:** AI analyses are hashed via SHA-256 `(resumeConfigId + resumeHash + jdHash)` and cached in Redis (6-hour TTL).
- **Atomic Sliding Rate Limiter:** Protects AI and authentication endpoints using Redis `INCR` + `EXPIRE` (25 reqs / 10 mins).
- **Graceful Fallback:** If Redis or the LLM provider is offline, the platform automatically degrades to a local deterministic heuristic engine without crashing.

### 5. Multi-Variant Domain Resumes & ATS Export
- Drag-and-drop project curation via `@hello-pangea/dnd` with Prisma negative-index transaction reordering.
- Per-resume bullet point overrides without duplicating master project data.
- Instant, pixel-perfect ATS `.docx` exports using the `docx` library.
- LLM-friendly Markdown serializer for pasting clean resume context into external assistants.

---

## Tech Stack

| Layer | Technology |
|---|---|
| **Framework** | Next.js 14.2 (App Router, Server Actions, Standalone Output) |
| **Frontend** | React 18, Tailwind CSS, Lucide Icons |
| **Database** | PostgreSQL (Neon Serverless) with Prisma ORM 6 |
| **Cache & Rate Limiting** | Redis 7 (Alpine, 64MB LRU cache) |
| **AI Layer** | Server-Side LLM Service (Google Gemini / OpenAI compatible) |
| **Validation** | Strict Zod 3 schemas on all API inputs and structured LLM outputs |
| **Containerization** | Lean Multi-stage Docker (~130MB footprint) & Docker Compose |
| **Deployment** | AWS EC2 (t3/t4g), Systemd, DuckDNS dynamic DNS sync |

---

## Getting Started

### 1. Prerequisites
- Node.js 20+
- PostgreSQL database (or Neon account)
- (Optional) Redis server for caching & rate limiting
- (Optional) Gemini API Key (`GEMINI_API_KEY`) or OpenAI API Key (`OPENAI_API_KEY`)

### 2. Installation
```bash
git clone https://github.com/amangupta0005/resume-ecosystem-builder.git
cd resume-ecosystem-builder
npm install
```

### 3. Environment Configuration
Create a `.env` file based on `.env.example`:
```bash
cp .env.example .env
```
Populate your database connection and credentials:
```env
DATABASE_URL="postgresql://user:password@host:port/database?sslmode=require"
APP_PASSCODE="YourSecurePasscode"
REDIS_URL="redis://localhost:6379"

# AI Configuration (Server-Side Only)
AI_FEATURES_ENABLED="true"
GEMINI_API_KEY="your-gemini-api-key"
GEMINI_MODEL="gemini-1.5-flash"
```

### 4. Database Setup & Migration
```bash
npx prisma generate
npx prisma db push
npm run db:seed
```

### 5. Run Verification & Test Suite
```bash
npm run test:ai   # Runs 18-step AI and keyword matching test suite
npm run lint      # Verifies zero ESLint warnings
npx tsc --noEmit  # Full TypeScript strict check
npm run build     # Compiles production standalone build
```

### 6. Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) to access the dashboard.

---

## Docker Deployment (Production)

The repository includes a production multi-stage `Dockerfile` and `docker-compose.yml`:
```bash
# Build and run containers in detached mode
docker compose up -d --build
```
This runs the Next.js standalone app on port 80 with an accompanying `redis:7-alpine` container capped to 64MB RAM.

---

## Reversibility & Rollback

The stable baseline before the AI upgrade is tagged in Git:
```bash
# To rollback to the pre-AI stable baseline:
git checkout stable-before-ai-upgrade
```
All AI services are encapsulated in `src/lib/ai/` and behind the `AI_FEATURES_ENABLED` configuration flag, ensuring zero breaking changes to existing resume editing or export features.
