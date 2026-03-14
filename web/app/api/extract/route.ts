import { NextRequest, NextResponse } from "next/server";
import { extractTranscript } from "@/lib/extractor";
import { extractRecipe } from "@/lib/claude";

export async function POST(req: NextRequest) {
  try {
    const { url } = await req.json();
    if (!url || typeof url !== "string") {
      return NextResponse.json({ error: "URL is required" }, { status: 400 });
    }

    const transcript = await extractTranscript(url);
    const recipe = await extractRecipe(transcript, url);
    return NextResponse.json(recipe);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Extraction failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
