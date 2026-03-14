import { NextRequest, NextResponse } from "next/server";
import { generateList } from "@/lib/claude";
import type { ExtractedRecipe } from "@/types";

export async function POST(req: NextRequest) {
  try {
    const { recipes, budget } = await req.json();
    if (!recipes || !Array.isArray(recipes) || typeof budget !== "number") {
      return NextResponse.json(
        { error: "recipes array and budget number are required" },
        { status: 400 }
      );
    }

    const list = await generateList(recipes as ExtractedRecipe[], budget);
    return NextResponse.json(list);
  } catch (error) {
    const message = error instanceof Error ? error.message : "List generation failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
