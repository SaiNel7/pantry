import { NextResponse } from "next/server";
import { extractTranscript } from "@/lib/extractor";
import { extractRichRecipe } from "@/lib/claude";
import { saveRecipe } from "@/lib/recipes";

export const maxDuration = 60;

// Simple in-memory rate limit: 5 requests per IP per hour
const ipLog = new Map<string, number[]>();
function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const window = 60 * 60 * 1000;
  const hits = (ipLog.get(ip) ?? []).filter((t) => now - t < window);
  hits.push(now);
  ipLog.set(ip, hits);
  return hits.length > 5;
}

export async function POST(req: Request) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  if (isRateLimited(ip)) {
    return NextResponse.json({ error: "Too many requests — try again later." }, { status: 429 });
  }

  try {
    const body = await req.json();
    const { url, effort_level } = body as { url?: string; effort_level?: string };

    if (!url) {
      return NextResponse.json({ error: "URL is required" }, { status: 400 });
    }

    const transcript = await extractTranscript(url);
    const rich = await extractRichRecipe(transcript, url);

    const recipe = await saveRecipe({
      title: rich.title,
      tagline: rich.tagline,
      effort_level: (effort_level as 'low' | 'med' | 'high') ?? rich.effort_level,
      cook_time_minutes: rich.cook_time_minutes,
      cost_per_serving: rich.cost_per_serving,
      image_url: null,
      ingredients: rich.ingredients,
      steps: rich.steps,
      source_url: url,
      dietary_tags: rich.dietary_tags,
    });

    return NextResponse.json(recipe);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to save recipe";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
