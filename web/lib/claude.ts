import Anthropic from "@anthropic-ai/sdk";
import type { ExtractedRecipe, GeneratedList, Ingredient, ListItem } from "@/types";

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

function stripCodeFences(text: string): string {
  return text.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, "").trim();
}

export async function extractRecipe(
  transcript: string,
  sourceUrl: string
): Promise<ExtractedRecipe> {
  const response = await client.messages.create({
    model: "claude-opus-4-6",
    max_tokens: 2048,
    messages: [
      {
        role: "user",
        content: `You are a recipe extraction assistant. Extract the recipe from this cooking video transcript.

Transcript:
${transcript}

Return a JSON object with this exact shape:
{
  "title": "Recipe name",
  "ingredients": [
    { "name": "ingredient name", "quantity": "amount + unit", "notes": "optional prep notes" }
  ],
  "serves": 4
}

If no recipe is detectable, return: { "error": "No recipe found" }

Return only the JSON, no other text.`,
      },
    ],
  });

  const raw = response.content.find((b) => b.type === "text")?.text ?? "";
  const text = stripCodeFences(raw);

  let parsed: { title: string; ingredients: Ingredient[]; serves?: number; error?: string };
  try {
    parsed = JSON.parse(text);
  } catch {
    throw new Error("Claude returned invalid JSON for recipe extraction");
  }

  if (parsed.error) {
    throw new Error(parsed.error);
  }

  return {
    title: parsed.title,
    ingredients: parsed.ingredients ?? [],
    serves: parsed.serves,
    sourceUrl,
  };
}

export async function generateList(
  recipes: ExtractedRecipe[],
  budget: number
): Promise<GeneratedList> {
  const recipesText = recipes
    .map(
      (r, i) =>
        `Recipe ${i + 1}: ${r.title}\nIngredients:\n${r.ingredients
          .map((ing) => `  - ${ing.quantity} ${ing.name}${ing.notes ? ` (${ing.notes})` : ""}`)
          .join("\n")}`
    )
    .join("\n\n");

  const response = await client.messages.create({
    model: "claude-opus-4-6",
    max_tokens: 4096,
    messages: [
      {
        role: "user",
        content: `You are a smart grocery list generator for college students. The user has a weekly grocery budget of $${budget}.

Here are the recipes they want to make:

${recipesText}

Create a consolidated shopping list. Return a JSON object with this exact shape:
{
  "items": [
    {
      "name": "ingredient name",
      "quantity": "amount + unit",
      "estimatedCost": 3.99,
      "flag": "swap" | "optional" | null,
      "swapSuggestion": "cheaper alternative (only if flag is swap)"
    }
  ],
  "totalEstimate": 45.50,
  "overBudget": false,
  "budgetNotes": "Brief note about budget fit, or top 2-3 swap suggestions if over budget"
}

Rules:
- Consolidate duplicate ingredients across recipes
- Flag "swap" for exotic, single-use, or expensive ingredients with cheaper alternatives
- Flag "optional" for nice-to-have but not essential ingredients
- Use realistic Wegmans/Tops/grocery store pricing
- If total exceeds $${budget}, set overBudget to true and identify substitutions in budgetNotes

Return only the JSON, no other text.`,
      },
    ],
  });

  const raw = response.content.find((b) => b.type === "text")?.text ?? "";
  const text = stripCodeFences(raw);

  let parsed: { items: Omit<ListItem, "checked">[]; totalEstimate: number; overBudget: boolean; budgetNotes: string };
  try {
    parsed = JSON.parse(text);
  } catch {
    throw new Error("Claude returned invalid JSON for list generation");
  }

  return {
    items: (parsed.items ?? []).map((item: Omit<ListItem, "checked">): ListItem => ({
      ...item,
      checked: false,
    })),
    totalEstimate: parsed.totalEstimate ?? 0,
    overBudget: parsed.overBudget ?? false,
    budgetNotes: parsed.budgetNotes ?? "",
  };
}
