# Pantry — PRD for Claude Code

## One-liner
Paste a TikTok or Instagram Reel link → get a smart shopping list that fits your weekly grocery budget.

## Problem
Cornell students save recipes they'll never cook because the gap between TikTok and the grocery store costs too much time and money to figure out.

## Tech Stack
- **Framework**: Next.js 14 (App Router)
- **Styling**: Tailwind CSS
- **AI**: Claude API (claude-sonnet-4-20250514) via Anthropic SDK
- **Video pipeline**: Pantry Extractor microservice (Railway) — handles yt-dlp download, ffmpeg audio extraction, and Whisper transcription
- **Deployment**: Vercel

---

## Core User Flow

1. User enters weekly grocery budget
2. User pastes one or more TikTok or Instagram Reel URLs
3. For each URL, app calls the Railway extractor service → returns a Whisper transcript of the video audio
4. App passes transcript to Claude → Claude extracts a structured ingredient list
5. App passes all ingredient lists + budget to Claude → Claude consolidates, flags low-versatility ingredients, estimates costs
6. App displays a single smart shopping list with cost estimate and budget status

---

## Pages & Components

### `/` — Home / Main App
Single-page app. No routing needed.

**Layout:**
- Top: Wordmark "Pantry" + one-line description
- Left panel: Input area (budget + TikTok or Instagram Reel URLs)
- Right panel: Output (shopping list)

---

## Feature Specs

### Feature 1 — Budget Input
- Number input: "My weekly grocery budget: $___"
- Persists in React state
- Required before list can be generated

### Feature 2 — TikTok or Instagram Reel URL Input
- Text input for a TikTok or Instagram Reel URL
- "Add another recipe" adds a second input (up to 5)
- Each URL shows a loading state while processing
- If extraction fails, show a fallback error message per URL

### Feature 3 — Video Transcription (via Railway microservice)
For each TikTok or Instagram Reel URL, the Next.js app calls its own `/api/extract` route, which calls the Railway extractor service. The extractor downloads the video, strips audio, and returns a Whisper transcript. Claude then receives this transcript and extracts a structured recipe.

**What Claude receives:** raw spoken transcript from the video
**What Claude returns:** structured recipe — title, ingredient names, quantities

**Claude prompt intent:**
- Input is a messy spoken transcript from a TikTok or Instagram Reel cooking video
- Extract the recipe title and a clean ingredient list with quantities
- Return structured JSON
- If no recipe is detectable, return an error flag

### Feature 4 — Smart List Generation
Once all recipes are extracted, all ingredient lists are sent together with the user's budget to Claude in a single call.

**Claude prompt intent:**
- Consolidate duplicate ingredients across recipes
- Flag low-versatility ingredients (exotic, single-use, expensive for a college cook) and suggest practical swaps
- Estimate realistic grocery store cost per ingredient (Wegmans / Tops pricing)
- If total exceeds budget, identify the 2–3 highest-impact substitutions to bring it under
- Return structured JSON

### Feature 5 — Shopping List UI
Displays the generated list in the right panel.

**Each list item shows:**
- Ingredient name + quantity
- Estimated cost
- Swap badge if flagged, with swap suggestion visible on expand
- Checkbox to mark as "already have" — removes item from running total

**Bottom of list:**
- Live subtotal (updates as items are checked off)
- Budget remaining = budget minus subtotal
- Green if under budget, red if over
- "Copy list" button — copies plain text to clipboard

---

## API Routes

### `POST /api/extract`
**Responsibility:** Receives a TikTok or Instagram Reel URL, calls the Railway extractor service, passes the returned transcript to Claude, returns a structured recipe.

**Input:** TikTok or Instagram Reel URL
**Output:** Recipe title + ingredient list, or error

### `POST /api/generate-list`
**Responsibility:** Receives all extracted recipes and the user's budget, sends to Claude for consolidation and cost estimation, returns the final shopping list.

**Input:** Array of extracted recipes + budget amount
**Output:** Consolidated ingredient list with costs, flags, swaps, budget status

---

## Environment Variables

```
ANTHROPIC_API_KEY=
EXTRACTOR_URL=        ← Railway microservice public URL
EXTRACTOR_SECRET=     ← Shared secret matching Railway env var
```

---

## Repo Structure
This app lives in the `/web` subdirectory of the `pantry` monorepo. Vercel is configured to deploy from this subdirectory.

---

## File Structure

```
/app
  /page.tsx                   ← Main UI
  /api
    /extract/route.ts         ← Calls Railway extractor → Claude recipe extraction
    /generate-list/route.ts   ← Claude consolidation + cost estimation
/components
  /BudgetInput.tsx
  /UrlInput.tsx
  /RecipeCard.tsx             ← Extracted recipe title + ingredient count
  /ShoppingList.tsx           ← Final consolidated list
  /ListItem.tsx               ← Single ingredient row with checkbox + flag
/lib
  /claude.ts                  ← Anthropic client + shared prompt helpers
  /extractor.ts               ← HTTP client for Railway microservice
/types
  /index.ts                   ← Shared TypeScript interfaces
```

---

## TypeScript Interfaces

**Ingredient** — name, quantity, optional notes

**ExtractedRecipe** — title, ingredients array, serves count, source URL

**ListItem** — name, quantity, estimated cost, flag (swap / optional / null), swap suggestion, checked state

**GeneratedList** — items array, total estimate, over budget boolean, budget notes

---

## Visual Design Direction

- **Aesthetic:** Organic and natural meets clean utility — a farmers market receipt, not a finance dashboard
- **Colors:** Warm off-white background, deep forest green primary, terracotta accent for flags and warnings
- **Typography:** Distinctive serif or slab for the wordmark, clean sans for body text
- **No generic gradients, no purple, no glassmorphism**
- The ingredient list should feel tactile — like a handwritten grocery list, not a sterile data table

---

## Build Order for Claude Code

1. Scaffold Next.js 14 app with TypeScript and Tailwind
2. Install dependencies: Anthropic SDK
3. Define all TypeScript interfaces in /types/index.ts
4. Build /lib/extractor.ts — HTTP client that calls Railway service
5. Build /lib/claude.ts — Anthropic client and prompt functions
6. Build /api/extract/route.ts
7. Build /api/generate-list/route.ts
8. Build components in order: BudgetInput → UrlInput → RecipeCard → ListItem → ShoppingList
9. Build /app/page.tsx wiring all components together
10. Apply visual design system — colors, typography, spacing
11. Test end-to-end with 2 real TikTok or Instagram Reel recipe URLs
12. Deploy to Vercel

---

## Out of Scope
- User accounts or auth
- Database or persistence
- Big Red Bucks integration
- Store maps
- Cooking level onboarding
- Mobile app