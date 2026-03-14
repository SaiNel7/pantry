# Pantry Extractor

Railway microservice that downloads TikTok and Instagram Reel videos, transcribes their audio with Whisper, and returns a transcript for recipe extraction.

## Endpoint

### `POST /extract`
```
Headers: x-extractor-secret: <EXTRACTOR_SECRET>
Body:    { "url": "https://www.tiktok.com/..." }

Response (success):  { "title": "...", "transcript": "..." }
Response (error):    { "error": "..." }
```

### `GET /health`
```
Response: { "status": "ok" }
```

## Environment Variables

| Variable | Required | Description |
|---|---|---|
| `EXTRACTOR_SECRET` | Yes | Shared secret — must match the calling app |
| `PORT` | No | Set automatically by Railway |

## Local Development

**Prerequisites:** Docker

```bash
# Build
docker build -t pantry-extractor .

# Run
docker run -e EXTRACTOR_SECRET=test -p 3000:3000 pantry-extractor

# Health check
curl localhost:3000/health

# Test extraction
curl -X POST \
  -H "x-extractor-secret: test" \
  -H "Content-Type: application/json" \
  -d '{"url":"https://www.tiktok.com/@user/video/123"}' \
  localhost:3000/extract
```

First build takes ~5–8 minutes due to the torch install.

## Railway Deployment

1. Push this repo to GitHub
2. In Railway: **New Project → Deploy from GitHub repo**
3. Set **Root Directory** to `/extractor`
4. Set environment variable: `EXTRACTOR_SECRET=<your-secret>`
5. Railway auto-detects the Dockerfile and builds
6. Copy the generated Railway URL — set it as `EXTRACTOR_URL` in your Vercel project

## Processing Pipeline

```
POST /extract
  → yt-dlp downloads video to /tmp/<id>.mp4     (30s timeout)
  → ffmpeg strips audio to /tmp/<id>.mp3         (15s timeout)
  → whisper transcribes to /tmp/<id>.txt         (30s timeout)
  → cleanup all temp files
  → return { title, transcript }
```
