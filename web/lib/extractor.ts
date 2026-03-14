const EXTRACTOR_URL = process.env.EXTRACTOR_URL!;
const EXTRACTOR_SECRET = process.env.EXTRACTOR_SECRET!;

export async function extractTranscript(videoUrl: string): Promise<string> {
  const response = await fetch(`${EXTRACTOR_URL}/extract`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Secret": EXTRACTOR_SECRET,
    },
    body: JSON.stringify({ url: videoUrl }),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Extractor failed: ${response.status} — ${text}`);
  }

  const data = await response.json();
  return data.transcript as string;
}
