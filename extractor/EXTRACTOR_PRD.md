# Pantry Extractor — Railway Microservice PRD

## Repo Structure
This service lives in the `/extractor` subdirectory of the `pantry` monorepo. Railway is configured to deploy from this subdirectory.

---

## One-liner
A microservice deployed on Railway that downloads a TikTok or Instagram Reel video, transcribes its audio using Whisper, and returns a rich transcript for recipe extraction.

## Purpose
Vercel serverless functions cannot run binary executables or process video files. This microservice runs on Railway, handles the full video pipeline (download → audio extraction → transcription), and exposes a single HTTP endpoint that the main Pantry Next.js app calls.

---

## Tech Stack
- **Runtime**: Node.js 18
- **Framework**: Express
- **Video download**: yt-dlp
- **Audio extraction**: ffmpeg
- **Transcription**: OpenAI Whisper (Python library, runs locally on the server)
- **Base image**: python:3.11-slim
- **Deployment**: Railway via GitHub repo

---

## Architecture

```
Pantry (Vercel)
    ↓ POST /extract (TikTok URL)
Extractor (Railway)
    ↓ yt-dlp downloads video file
    ↓ ffmpeg strips audio to .mp3
    ↓ Whisper transcribes audio to text
    ↓ cleanup temp files
    ↑ returns { title, transcript }
Pantry (Vercel)
    ↓ sends transcript to Claude
    ↑ Claude returns structured recipe
```

The extractor is stateless. All video and audio files are written to /tmp and deleted after each request.

---

## Endpoint Specification

### `POST /extract`

**Input:**
- `url` (string, required) — a valid TikTok or Instagram Reel URL

**Output on success:**
- `title` — video title
- `transcript` — full Whisper transcription of the video audio

**Output on failure:**
- `error` — plain English error message

**Authentication:**
- Shared secret passed as a request header
- Requests without the correct secret are rejected with 401

### `GET /health`
- Returns server status
- Used by Railway for uptime monitoring

---

## Processing Pipeline

**Step 1 — Download**
- yt-dlp downloads the TikTok or Instagram video to /tmp as an .mp4
- Timeout: 30 seconds
- If download fails (blocked, login required, invalid URL), request fails with 500

**Step 2 — Audio extraction**
- ffmpeg strips audio track from the .mp4 to a .mp3
- Timeout: 15 seconds

**Step 3 — Transcription**
- Whisper (base model) transcribes the .mp3 to plain text
- Base model is fast enough for short TikTok clips (typically 15–60 seconds)
- Timeout: 30 seconds

**Step 4 — Cleanup**
- All temp files (.mp4, .mp3) are deleted regardless of success or failure

---

## File Structure

```
/pantry/extractor
  Dockerfile        ← Python + Node + ffmpeg + yt-dlp + Whisper
  server.js         ← Express app, orchestrates the pipeline
  package.json      ← Express dependency only
  .env.example      ← Documents required environment variables
  README.md         ← Setup and deployment instructions
```

---

## Dependencies to Install in Dockerfile

- ffmpeg (apt-get)
- Node.js 18 (via nodesource)
- yt-dlp (pip)
- openai-whisper (pip)
- torch (pip, CPU-only build to keep image size reasonable)

---

## Environment Variables

| Variable | Location | Description |
|---|---|---|
| EXTRACTOR_SECRET | Railway | Shared secret for authenticating requests |
| PORT | Railway | Set automatically by Railway |
| EXTRACTOR_URL | Vercel (main app) | Public Railway URL for this service |
| EXTRACTOR_SECRET | Vercel (main app) | Same secret, used when calling this service |

---

## Performance Expectations

- TikToks are typically 15–60 seconds long
- Whisper base model transcribes roughly 10x faster than real-time on CPU
- Total expected latency per request: 15–45 seconds
- This is acceptable for a hackathon — show a loading state in the UI

---

## Deployment

1. Push code to a new GitHub repo
2. Connect repo to Railway — Railway auto-detects the Dockerfile
3. Set EXTRACTOR_SECRET environment variable in Railway dashboard
4. Railway builds and deploys — first build is slow (~5 min) due to torch install
5. Subsequent deploys are faster (Docker layer caching)
6. Verify with a health check before the hackathon

**Expected first build time:** 5–8 minutes (torch is large)

---

## Integration with Main App

The Pantry Next.js app calls this service from a server-side API route. It passes the TikTok URL and the shared secret header, receives the transcript, then passes that transcript directly to Claude for recipe extraction.

---

## Error Handling

| Scenario | Behavior |
|---|---|
| Missing or invalid URL | 400 with error message |
| Wrong or missing secret | 401 Unauthorized |
| yt-dlp blocked by TikTok or Instagram | 500 with error message |
| ffmpeg audio extraction fails | 500 with error message |
| Whisper transcription fails | 500 with error message |
| Request times out | 500 with error message |

---

## What to Validate Before the Hackathon

1. yt-dlp can download a real TikTok and Instagram Reel video file locally
2. ffmpeg can strip audio from the downloaded file
3. Whisper base model transcribes the audio accurately enough for ingredient extraction
4. Full Docker build completes successfully on Railway
5. End-to-end: paste a recipe TikTok or Instagram Reel URL, confirm transcript comes back with ingredient names in it

---

## Out of Scope
- Rate limiting
- Request logging / analytics
- Support for platforms other than TikTok and Instagram
- Async / queued processing
- Any storage of video, audio, or transcript content
- Whisper large or medium models (base is sufficient for short clips)