FROM python:3.11-slim

# System dependencies
RUN apt-get update && apt-get install -y \
    ffmpeg \
    curl \
    gnupg \
    && rm -rf /var/lib/apt/lists/*

# Node.js 18 via NodeSource
RUN curl -fsSL https://deb.nodesource.com/setup_18.x | bash - \
    && apt-get install -y nodejs \
    && rm -rf /var/lib/apt/lists/*

# Python dependencies — whisper-ctranslate2 uses CTranslate2 (not torch), ~100MB vs ~3GB
RUN pip install --no-cache-dir yt-dlp whisper-ctranslate2

# Pre-download the whisper base model so it's baked into the image (avoids HF Hub rate limits at runtime)
RUN python -c "from faster_whisper import WhisperModel; WhisperModel('base', device='cpu', compute_type='int8')"

WORKDIR /app
COPY package.json .
RUN npm install --production
COPY server.js .

EXPOSE 3000
CMD ["node", "server.js"]
