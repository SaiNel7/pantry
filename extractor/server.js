const express = require('express');
const { execFile } = require('child_process');
const { promisify } = require('util');
const { randomUUID } = require('crypto');
const fs = require('fs/promises');
const path = require('path');

const execFileAsync = promisify(execFile);
const app = express();
app.use(express.json());

// Concurrency limiter — whisper is CPU/memory intensive; run one job at a time
let activeJobs = 0;
const MAX_CONCURRENT = 1;
const jobQueue = [];

function acquireSlot() {
  return new Promise((resolve) => {
    const tryAcquire = () => {
      if (activeJobs < MAX_CONCURRENT) {
        activeJobs++;
        resolve();
      } else {
        jobQueue.push(tryAcquire);
      }
    };
    tryAcquire();
  });
}

function releaseSlot() {
  activeJobs--;
  if (jobQueue.length > 0) {
    const next = jobQueue.shift();
    next();
  }
}

// Auth middleware
app.use((req, res, next) => {
  if (req.path === '/health') return next();
  const secret = req.headers['x-secret'];
  if (!secret || secret !== process.env.EXTRACTOR_SECRET) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  next();
});

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.post('/extract', async (req, res) => {
  const { url } = req.body;
  if (!url || typeof url !== 'string' || !url.trim()) {
    return res.status(400).json({ error: 'Missing or invalid url parameter' });
  }

  const id = randomUUID();
  const videoPath = path.join('/tmp', `${id}.mp4`);
  const audioPath = path.join('/tmp', `${id}.mp3`);
  const transcriptPath = path.join('/tmp', `${id}.txt`);

  await acquireSlot();
  try {
    // Step 1: Download video
    // Use flexible format selection: prefer mp4, fall back to best available (needed for Instagram)
    await execFileAsync(
      'yt-dlp',
      ['--output', videoPath, '--format', 'bestvideo[ext=mp4]+bestaudio[ext=m4a]/mp4/best', '--merge-output-format', 'mp4', url],
      { timeout: 30000 }
    );

    // Step 2: Extract audio
    await execFileAsync(
      'ffmpeg',
      ['-i', videoPath, '-q:a', '0', '-map', 'a', audioPath, '-y'],
      { timeout: 15000 }
    );

    // Verify audio file has content before transcribing
    const audioStat = await fs.stat(audioPath);
    if (audioStat.size < 1000) {
      throw new Error('Audio extraction produced no content — video may have no audio track');
    }

    // Step 3: Transcribe (whisper-ctranslate2 is a drop-in CLI, no torch required)
    // initial_prompt gives Whisper culinary context to improve ingredient name accuracy
    await execFileAsync(
      'whisper-ctranslate2',
      [
        audioPath,
        '--model', 'base',
        '--output_format', 'txt',
        '--output_dir', '/tmp',
        '--initial_prompt', 'Cooking recipe video. Ingredients, measurements, and cooking instructions.',
      ],
      { timeout: 60000 }
    );

    // Read transcript (whisper names the output file after the input basename)
    const transcript = await fs.readFile(transcriptPath, 'utf8');

    // Extract title from yt-dlp (best effort via separate call)
    let title = '';
    try {
      const { stdout } = await execFileAsync(
        'yt-dlp',
        ['--get-title', url],
        { timeout: 10000 }
      );
      title = stdout.trim();
    } catch {
      title = '';
    }

    res.json({ title, transcript: transcript.trim() });
  } catch (err) {
    const message = err.stderr || err.message || 'Pipeline failed';
    res.status(500).json({ error: message });
  } finally {
    releaseSlot();
    // Cleanup temp files regardless of success or failure
    await Promise.allSettled([
      fs.unlink(videoPath),
      fs.unlink(audioPath),
      fs.unlink(transcriptPath),
    ]);
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Extractor listening on port ${PORT}`);
});
