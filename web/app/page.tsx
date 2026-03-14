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

// Botanical leaf SVG for hero decoration
function LeafDecoration() {
  return (
    <svg
      viewBox="0 0 400 400"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="w-full h-full"
      aria-hidden="true"
    >
      {/* Large background leaf */}
      <path
        d="M200 20 C280 20 360 80 370 180 C380 280 300 370 200 380 C100 370 20 280 30 180 C40 80 120 20 200 20Z"
        fill="#2D6A4F"
        opacity="0.06"
      />
      {/* Herb stem top */}
      <path
        d="M200 60 C200 60 180 100 160 130 C150 145 140 160 145 175 C150 190 165 195 180 185 C195 175 200 155 200 130"
        stroke="#2D6A4F"
        strokeWidth="3"
        opacity="0.15"
        fill="none"
        strokeLinecap="round"
      />
      <ellipse cx="155" cy="115" rx="22" ry="14" fill="#2D6A4F" opacity="0.12" transform="rotate(-35 155 115)" />
      <ellipse cx="148" cy="148" rx="18" ry="11" fill="#2D6A4F" opacity="0.10" transform="rotate(-55 148 148)" />
      {/* Herb stem bottom-right */}
      <path
        d="M230 200 C250 210 270 230 280 260 C290 285 285 310 270 320 C255 330 240 320 235 300 C228 278 235 250 230 230"
        stroke="#2D6A4F"
        strokeWidth="3"
        opacity="0.12"
        fill="none"
        strokeLinecap="round"
      />
      <ellipse cx="272" cy="240" rx="20" ry="12" fill="#2D6A4F" opacity="0.09" transform="rotate(30 272 240)" />
      <ellipse cx="278" cy="270" rx="18" ry="11" fill="#2D6A4F" opacity="0.10" transform="rotate(50 278 270)" />
      {/* Small circle accent */}
      <circle cx="320" cy="120" r="24" fill="#2D6A4F" opacity="0.06" />
      <circle cx="80" cy="290" r="18" fill="#74A97A" opacity="0.10" />
      {/* Dots */}
      <circle cx="340" cy="280" r="5" fill="#2D6A4F" opacity="0.12" />
      <circle cx="70" cy="140" r="4" fill="#74A97A" opacity="0.18" />
      <circle cx="300" cy="340" r="6" fill="#2D6A4F" opacity="0.08" />
    </svg>
  );
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
    <div className="min-h-screen bg-white">

      {/* ── Nav ─────────────────────────────────────────────── */}
      <nav className="sticky top-0 z-20 bg-white/90 backdrop-blur-md border-b border-parchment">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-baseline gap-3">
            <span className="font-serif text-2xl font-bold text-forest tracking-tight">Pantry</span>
            <span className="hidden sm:inline font-sans text-xs text-bark-muted">
              You save the recipe. We do the rest!
            </span>
          </div>
          <a
            href="#get-started"
            className="font-sans text-sm font-semibold bg-forest text-white px-5 py-2.5 rounded-full hover:bg-forest-dark transition-colors"
          >
            Get started
          </a>
        </div>
      </nav>

      {/* ── Hero ────────────────────────────────────────────── */}
      <section className="relative bg-white overflow-hidden pt-16 pb-24 lg:pt-24 lg:pb-32">
        {/* Full-bleed botanical background */}
        <div className="absolute inset-0 pointer-events-none select-none">
          <div className="absolute -top-24 -right-24 w-[520px] h-[520px] opacity-50">
            <LeafDecoration />
          </div>
          <div className="absolute -bottom-16 -left-16 w-72 h-72 opacity-30">
            <LeafDecoration />
          </div>
        </div>

        <div className="relative max-w-6xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left: headline + CTAs */}
          <div>
            <span className="inline-block font-sans text-xs font-bold text-forest uppercase tracking-widest mb-5 bg-forest-pale px-3 py-1.5 rounded-full">
              Smart grocery planning
            </span>
            <h1 className="font-serif text-5xl lg:text-6xl font-black text-bark leading-[1.1] mb-6">
              Recipes you love,<br />
              <em className="not-italic text-forest">groceries you can afford.</em>
            </h1>
            <p className="font-sans text-lg text-bark-muted leading-relaxed mb-10 max-w-md">
              Paste TikTok recipe videos. Get a smart,
              budget-aware grocery list in seconds.
            </p>
            <div className="flex flex-wrap gap-4">
              <a
                href="#get-started"
                className="font-sans font-semibold text-base bg-forest text-white px-8 py-4 rounded-full hover:bg-forest-dark transition-colors shadow-card"
              >
                Build my list
              </a>
              <a
                href="#how-it-works"
                className="font-sans font-semibold text-base border-2 border-forest text-forest px-8 py-4 rounded-full hover:bg-forest-pale transition-colors"
              >
                How it works
              </a>
            </div>
          </div>

          {/* Right: organic illustration + floating card */}
          <div className="relative hidden lg:flex items-center justify-center">
            {/* Organic blob */}
            <div
              className="relative w-[400px] h-[400px] bg-gradient-to-br from-forest-pale to-sage-pale flex items-center justify-center"
              style={{ borderRadius: "62% 38% 46% 54% / 60% 44% 56% 40%" }}
            >
              {/* Herb / botanical SVG inside blob */}
              <svg viewBox="0 0 200 200" fill="none" className="w-56 h-56" aria-hidden="true">
                <circle cx="100" cy="100" r="90" fill="#2D6A4F" opacity="0.06" />
                {/* Sprig 1 */}
                <path d="M100 160 C100 160 100 100 100 60" stroke="#2D6A4F" strokeWidth="2.5" strokeLinecap="round" opacity="0.5" />
                <ellipse cx="85" cy="100" rx="20" ry="10" fill="#2D6A4F" opacity="0.25" transform="rotate(-40 85 100)" />
                <ellipse cx="116" cy="115" rx="20" ry="10" fill="#2D6A4F" opacity="0.22" transform="rotate(40 116 115)" />
                <ellipse cx="88" cy="78" rx="16" ry="9" fill="#74A97A" opacity="0.30" transform="rotate(-30 88 78)" />
                <ellipse cx="112" cy="88" rx="16" ry="9" fill="#74A97A" opacity="0.28" transform="rotate(30 112 88)" />
                <ellipse cx="98" cy="62" rx="14" ry="8" fill="#2D6A4F" opacity="0.25" transform="rotate(-10 98 62)" />
                {/* Sprig 2 */}
                <path d="M60 170 C60 170 70 130 80 100" stroke="#2D6A4F" strokeWidth="2" strokeLinecap="round" opacity="0.35" />
                <ellipse cx="50" cy="130" rx="16" ry="8" fill="#74A97A" opacity="0.20" transform="rotate(-50 50 130)" />
                <ellipse cx="66" cy="112" rx="14" ry="7" fill="#2D6A4F" opacity="0.18" transform="rotate(-30 66 112)" />
                {/* Berries */}
                <circle cx="140" cy="75" r="7" fill="#C1440E" opacity="0.20" />
                <circle cx="152" cy="82" r="5" fill="#C1440E" opacity="0.16" />
                <circle cx="145" cy="88" r="6" fill="#C1440E" opacity="0.14" />
              </svg>
            </div>

            {/* Floating budget card */}
            <div className="absolute bottom-10 -left-8 bg-white rounded-2xl shadow-float px-5 py-4 flex items-center gap-4 border border-parchment">
              <div className="w-10 h-10 bg-forest-pale rounded-xl flex items-center justify-center">
                <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="#2D6A4F" strokeWidth="2" strokeLinecap="round">
                  <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
                  <line x1="3" y1="6" x2="21" y2="6" />
                  <path d="M16 10a4 4 0 0 1-8 0" />
                </svg>
              </div>
              <div>
                <p className="font-sans text-xs text-bark-muted">This week&apos;s list</p>
                <p className="font-serif text-sm font-bold text-bark">$47.82 of $60 budget</p>
              </div>
            </div>

            {/* Floating recipe count badge */}
            <div className="absolute top-8 -right-4 bg-forest text-white rounded-2xl shadow-float px-4 py-3">
              <p className="font-sans text-xs opacity-80">Recipes extracted</p>
              <p className="font-serif text-lg font-bold">3 videos</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── How it works ────────────────────────────────────── */}
      <section id="how-it-works" className="bg-cream py-16">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
            {[
              { step: "01", title: "Set your budget", body: "Tell us how much you want to spend this week on groceries." },
              { step: "02", title: "Paste video URLs", body: "Drop in up to 5 TikTok recipe links." },
              { step: "03", title: "Get your list", body: "We extract every ingredient and build a consolidated, budget-smart list." },
            ].map(({ step, title, body }) => (
              <div key={step} className="flex gap-5">
                <span className="font-serif text-4xl font-black text-forest opacity-20 leading-none mt-1 select-none">{step}</span>
                <div>
                  <h3 className="font-serif text-lg font-bold text-bark mb-2">{title}</h3>
                  <p className="font-sans text-sm text-bark-muted leading-relaxed">{body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Input section ───────────────────────────────────── */}
      <section id="get-started" className="bg-white py-16 lg:py-24">
        <div className="max-w-2xl mx-auto px-6">
          <p className="font-sans text-xs font-bold text-forest uppercase tracking-widest mb-3">
            Get started
          </p>
          <h2 className="font-serif text-3xl lg:text-4xl font-bold text-bark mb-10">
            Build your grocery list
          </h2>

          <BudgetInput value={budget} onChange={setBudget} />
          <UrlInput urls={urls} onChange={setUrls} disabled={isGenerating} />

          <button
            onClick={handleGenerate}
            disabled={!isReady || isGenerating}
            className="w-full py-5 bg-forest text-cream font-sans font-semibold text-base rounded-full hover:bg-forest-dark disabled:opacity-40 disabled:cursor-not-allowed transition-colors shadow-card mt-2"
          >
            {isGenerating ? (
              <span className="flex items-center justify-center gap-3">
                <span className="inline-block w-4 h-4 border-2 border-cream/40 border-t-cream rounded-full animate-spin" />
                Building your list…
              </span>
            ) : (
              "Build my grocery list"
            )}
          </button>

          {generateError && (
            <p className="mt-4 font-sans text-sm text-terra text-center bg-terra-pale border border-terra/20 rounded-2xl px-4 py-3">
              {generateError}
            </p>
          )}
        </div>
      </section>

      {/* ── Recipe cards ────────────────────────────────────── */}
      {recipes.length > 0 && (
        <section className="bg-cream py-12">
          <div className="max-w-6xl mx-auto px-6">
            <p className="font-sans text-xs font-bold text-forest uppercase tracking-widest mb-3">
              Extracted recipes
            </p>
            <h2 className="font-serif text-2xl font-bold text-bark mb-6">
              {recipes.filter((r) => r.isLoading).length > 0
                ? "Extracting…"
                : "Your recipes"}
            </h2>
            <div className="flex gap-4 overflow-x-auto pb-4 -mx-6 px-6 snap-x">
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
          </div>
        </section>
      )}

      {/* ── Shopping list ───────────────────────────────────── */}
      {list && (
        <section className="bg-white py-12 lg:py-16">
          <div className="max-w-2xl mx-auto px-6">
            <p className="font-sans text-xs font-bold text-forest uppercase tracking-widest mb-3">
              Your grocery list
            </p>
            <h2 className="font-serif text-3xl font-bold text-bark mb-8">
              Ready to shop
            </h2>
            <ShoppingList
              list={list}
              budget={typeof budget === "number" ? budget : 0}
              onToggleItem={toggleItem}
            />
          </div>
        </section>
      )}

      {/* ── Footer ──────────────────────────────────────────── */}
      <footer className="bg-cream border-t border-parchment py-8">
        <div className="max-w-6xl mx-auto px-6 flex items-center justify-between">
          <span className="font-serif text-lg font-bold text-forest">Pantry</span>
          <span className="font-sans text-xs text-bark-muted">Built for Cornell students</span>
        </div>
      </footer>
    </div>
  );
}
