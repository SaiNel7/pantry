"use client";

import { useState, useCallback } from "react";
import type { ExtractedRecipe, GeneratedList } from "@/types";
import BudgetInput from "@/components/BudgetInput";
import UrlInput from "@/components/UrlInput";
import RecipeCard from "@/components/RecipeCard";
import ShoppingList from "@/components/ShoppingList";

interface RecipeState {
  recipe: ExtractedRecipe | null;
  isLoading: boolean;
  error: string | null;
}

export default function Home() {
  const [budget, setBudget] = useState<number | "">("");
  const [urls, setUrls] = useState<string[]>([""]);
  const [recipes, setRecipes] = useState<RecipeState[]>([]);
  const [list, setList] = useState<GeneratedList | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generateError, setGenerateError] = useState<string | null>(null);

  const handleGenerate = useCallback(async () => {
    if (!budget || budget <= 0) return;
    const validUrls = urls.filter((u) => u.trim() !== "");
    if (validUrls.length === 0) return;

    setList(null);
    setGenerateError(null);
    setIsGenerating(true);

    // Extract recipes in parallel
    const initialStates: RecipeState[] = validUrls.map(() => ({
      recipe: null,
      isLoading: true,
      error: null,
    }));
    setRecipes(initialStates);

    const results = await Promise.allSettled(
      validUrls.map((url) =>
        fetch("/api/extract", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ url }),
        }).then((res) => {
          if (!res.ok) return res.json().then((d) => Promise.reject(d.error));
          return res.json() as Promise<ExtractedRecipe>;
        })
      )
    );

    const newStates: RecipeState[] = results.map((result) => {
      if (result.status === "fulfilled") {
        return { recipe: result.value, isLoading: false, error: null };
      } else {
        return {
          recipe: null,
          isLoading: false,
          error: String(result.reason ?? "Failed to extract recipe"),
        };
      }
    });
    setRecipes(newStates);

    const successfulRecipes = newStates
      .filter((s) => s.recipe !== null)
      .map((s) => s.recipe!);

    if (successfulRecipes.length === 0) {
      setGenerateError("No recipes could be extracted. Please check your URLs.");
      setIsGenerating(false);
      return;
    }

    // Generate consolidated list
    try {
      const res = await fetch("/api/generate-list", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ recipes: successfulRecipes, budget }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? "Failed to generate list");
      }
      const generatedList: GeneratedList = await res.json();
      setList(generatedList);
    } catch (err) {
      setGenerateError(err instanceof Error ? err.message : "Failed to generate list");
    } finally {
      setIsGenerating(false);
    }
  }, [budget, urls]);

  const toggleItem = useCallback((index: number) => {
    setList((prev: GeneratedList | null) => {
      if (!prev) return prev;
      const items = [...prev.items];
      items[index] = { ...items[index], checked: !items[index].checked };
      return { ...prev, items };
    });
  }, []);

  const isReady =
    typeof budget === "number" &&
    budget > 0 &&
    urls.some((u) => u.trim() !== "");

  return (
    <main className="min-h-screen bg-cream">
      {/* Header */}
      <header className="border-b border-parchment bg-cream/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-baseline gap-4">
          <h1 className="font-serif text-3xl font-bold text-forest tracking-tight">
            Pantry
          </h1>
          <p className="font-sans text-sm text-bark/60 hidden sm:block">
            From TikTok to grocery list, on budget.
          </p>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-6 py-8 grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left: Input panel */}
        <div>
          <BudgetInput value={budget} onChange={setBudget} />
          <UrlInput urls={urls} onChange={setUrls} disabled={isGenerating} />

          {/* Recipe cards (shown while/after extracting) */}
          {recipes.length > 0 && (
            <div className="mb-6 space-y-2">
              {recipes.map((state, i) => (
                <RecipeCard
                  key={i}
                  recipe={state.recipe!}
                  isLoading={state.isLoading}
                  error={state.error ?? undefined}
                  url={urls.filter((u) => u.trim())[i] ?? ""}
                />
              ))}
            </div>
          )}

          <button
            onClick={handleGenerate}
            disabled={!isReady || isGenerating}
            className="w-full py-4 bg-forest hover:bg-forest-light disabled:bg-forest/40 text-cream font-sans font-bold text-base rounded-xl transition-colors"
          >
            {isGenerating ? "Building your list…" : "Build my grocery list"}
          </button>

          {generateError && (
            <p className="mt-3 font-sans text-sm text-terra text-center">
              {generateError}
            </p>
          )}
        </div>

        {/* Right: Output panel */}
        <div>
          {list ? (
            <ShoppingList
              list={list}
              budget={typeof budget === "number" ? budget : 0}
              onToggleItem={toggleItem}
            />
          ) : (
            <div className="bg-parchment/40 rounded-xl border-2 border-dashed border-parchment h-64 flex items-center justify-center">
              <p className="font-sans text-sm text-bark/40 text-center px-8">
                Enter your budget, paste some recipe video URLs, and hit the button to build your list.
              </p>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
