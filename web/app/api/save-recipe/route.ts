import { NextResponse } from "next/server";
import { extractTranscript } from "@/lib/extractor";
import { extractRichRecipe } from "@/lib/claude";
import { saveRecipe } from "@/lib/recipes";

export const maxDuration = 60;

export async function POST(req: Request) {
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
    });

    return NextResponse.json(recipe);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to save recipe";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
