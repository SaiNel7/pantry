# Pantry

Paste a TikTok or Instagram Reel → get a smart shopping list that fits your weekly grocery budget.

Built for Cornell students who save recipes they'll never cook because the gap between TikTok and the grocery store costs too much time and money to figure out.

---

## How it works

1. Browse the shared recipebook or paste a TikTok/Instagram URL
2. Add recipes to your grocery list
3. Pantry merges ingredients across all your recipes, estimates costs, and flags expensive items with cheaper swaps

---

## Features

- **Video recipe extraction** — Downloads TikTok/Instagram Reels, transcribes audio with Whisper, then uses Claude to extract structured recipes
- **Smart ingredient merging** — Combines quantities across recipes, normalizes units, splits compound ingredients
- **Budget-aware shopping** — Estimates costs using Wegmans/Tops pricing, flags if over budget, suggests substitutions
- **Dietary filters** — Vegan, vegetarian, gluten-free, halal, kosher, dairy-free, nut-free
- **Effort levels** — Filter recipes by low / med / high effort
- **Shared recipebook** — All Cornell students see the same recipe feed

---

## Tech stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 14 (App Router), React, TypeScript, Tailwind CSS |
| AI | Claude API (`claude-opus-4-6`) via Anthropic SDK |
| Video processing | Railway microservice — yt-dlp + ffmpeg + Whisper |
| Database | Supabase (PostgreSQL) |
| Deployment | Vercel (web), Railway (extractor) |

---

## Project structure

```
pantry/
├── web/              # Next.js app — frontend + API routes
│   ├── app/
│   │   ├── page.tsx              # Recipe discovery homepage
│   │   ├── list/page.tsx         # Grocery list
│   │   ├── recipe/[id]/page.tsx  # Recipe detail
│   │   └── api/
│   │       ├── extract/          # Transcribe video + extract recipe
│   │       ├── generate-list/    # Merge ingredients + estimate costs
│   │       ├── save-recipe/      # Extract from URL + save to Supabase
│   │       └── view/             # Analytics
│   ├── components/
│   ├── lib/
│   │   ├── claude.ts             # Anthropic client + extraction prompts
│   │   ├── extractor.ts          # HTTP client for Railway service
│   │   ├── recipes.ts            # Supabase CRUD
│   │   └── supabase.ts
│   └── types/index.ts            # Recipe, Ingredient, DietaryTag interfaces
└── extractor/        # Railway microservice — video → transcript
    ├── server.js     # Express: yt-dlp → ffmpeg → whisper pipeline
    └── Dockerfile    # Python 3.11 + Node 18 + ffmpeg + yt-dlp + whisper-ctranslate2
```

---

## Local development

### Web app

```bash
cd web
npm install
npm run dev
# http://localhost:3000
```

Create `web/.env.local`:

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
ANTHROPIC_API_KEY=
EXTRACTOR_URL=           # Railway service URL (or localhost:3001 if running locally)
EXTRACTOR_SECRET=        # Shared secret — must match extractor service
```

### Extractor service

```bash
cd extractor
docker build -t pantry-extractor .
docker run -e EXTRACTOR_SECRET=dev -p 3001:3000 pantry-extractor

# Health check
curl localhost:3001/health
```

> First Docker build takes 5–8 minutes (torch + whisper dependencies). Subsequent builds use layer cache.

---

## Deployment

- **Web app** → Vercel. Set the same env vars from `.env.local` in the Vercel dashboard.
- **Extractor** → Railway. Set root directory to `/extractor`, Railway auto-detects the Dockerfile. Set `EXTRACTOR_SECRET`. Copy the public URL into Vercel's `EXTRACTOR_URL`.

Vercel serverless functions have a 60s max timeout (`maxDuration = 60`). Typical video processing takes 15–45 seconds.

---

## API routes

| Route | Method | Description |
|---|---|---|
| `/api/save-recipe` | POST | Extract recipe from TikTok/Instagram URL and save to Supabase. Rate limited to 5 req/IP/hour. |
| `/api/extract` | POST | Call extractor service and extract recipe from transcript. |
| `/api/generate-list` | POST | Merge ingredients across recipes, estimate costs, suggest budget swaps. |
| `/api/view` | POST | Anonymous analytics (visitor ID + page path). |

The extractor microservice exposes:

| Route | Method | Description |
|---|---|---|
| `/extract` | POST | Download video → extract audio → transcribe. Requires `X-Secret` header. |
| `/health` | GET | Liveness check. |

---

## Data model

```typescript
interface Recipe {
  id: string;
  title: string;
  tagline: string | null;
  effort_level: 'low' | 'med' | 'high';
  cook_time_minutes: number | null;
  cost_per_serving: number | null;
  ingredients: Ingredient[];
  steps: string[];
  dietary_tags: DietaryTag[];
  source_url: string | null;
  created_at: string;
}

interface Ingredient {
  name: string;
  quantity: string;
  notes?: string;
  flag?: 'swap' | 'optional' | null;  // swap = expensive, optional = nice-to-have
  swapSuggestion?: string;
}

type DietaryTag = 'vegan' | 'vegetarian' | 'gluten-free' | 'halal' | 'kosher' | 'dairy-free' | 'nut-free';
```
