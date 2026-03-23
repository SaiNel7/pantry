"use client";

import { useState, useEffect, useCallback, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import type { Recipe, DietaryTag } from "@/types";
import EffortTabs from "@/components/EffortTabs";
import MealCard from "@/components/MealCard";
import BottomNav from "@/components/BottomNav";
import { getRecipesByEffort } from "@/lib/recipes";

type EffortLevel = 'low' | 'med' | 'high';

const DIETARY_OPTIONS: { tag: DietaryTag; label: string }[] = [
  { tag: 'vegan', label: 'Vegan' },
  { tag: 'vegetarian', label: 'Vegetarian' },
  { tag: 'gluten-free', label: 'Gluten-free' },
  { tag: 'halal', label: 'Halal' },
  { tag: 'kosher', label: 'Kosher' },
  { tag: 'dairy-free', label: 'Dairy-free' },
  { tag: 'nut-free', label: 'Nut-free' },
];

export default function Home() {
  return (
    <Suspense>
      <HomeContent />
    </Suspense>
  );
}

function HomeContent() {
  const searchParams = useSearchParams();
  const tabParam = searchParams.get("tab") as EffortLevel | null;
  const [effort, setEffort] = useState<EffortLevel>(
    tabParam && ["low","med","high"].includes(tabParam) ? tabParam : 'low'
  );
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [dietaryFilters, setDietaryFilters] = useState<DietaryTag[]>([]);
  const [showWelcome, setShowWelcome] = useState(false);

  useEffect(() => {
    // Get or create a persistent visitor UUID
    const match = document.cookie.match(/mise_vid=([^;]+)/);
    let vid = match?.[1];
    if (!vid) {
      vid = crypto.randomUUID();
      document.cookie = `mise_vid=${vid}; max-age=31536000; path=/`;
    }
    fetch("/api/view", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ path: "/", visitor_id: vid }),
    });
  }, []);

  useEffect(() => {
    const seen = document.cookie.includes("mise_seen=1");
    if (!seen) {
      setShowWelcome(true);
      document.cookie = "mise_seen=1; max-age=31536000; path=/";
    }
  }, []);

  const dismissWelcome = () => setShowWelcome(false);

  useEffect(() => {
    const stored = localStorage.getItem("dietary_filters");
    if (stored) setDietaryFilters(JSON.parse(stored));
  }, []);

  const toggleFilter = (tag: DietaryTag) => {
    setDietaryFilters((prev) => {
      const next = prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag];
      localStorage.setItem("dietary_filters", JSON.stringify(next));
      return next;
    });
  };

  const visibleRecipes = dietaryFilters.length === 0
    ? recipes
    : recipes.filter((r) => dietaryFilters.every((t) => (r.dietary_tags ?? []).includes(t)));

  // TikTok add flow
  const [showAdd, setShowAdd] = useState(false);
  const [addUrl, setAddUrl] = useState("");
  const [addEffort, setAddEffort] = useState<EffortLevel>('low');
  const [addLoading, setAddLoading] = useState(false);
  const [addError, setAddError] = useState<string | null>(null);

  const fetchRecipes = useCallback(async (level: EffortLevel) => {
    setLoading(true);
    try {
      const data = await getRecipesByEffort(level);
      setRecipes(data);
    } catch {
      setRecipes([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRecipes(effort);
  }, [effort, fetchRecipes]);

  const handleTabChange = (level: EffortLevel) => {
    setEffort(level);
  };

  const handleAddRecipe = async () => {
    if (!addUrl.trim()) return;
    setAddLoading(true);
    setAddError(null);
    try {
      const res = await fetch("/api/save-recipe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: addUrl.trim(), effort_level: addEffort }),
      });
      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.error ?? "Failed to add recipe");
      }
      const newRecipe: Recipe = await res.json();
      setShowAdd(false);
      setAddUrl("");
      // If the new recipe matches current tab, add it to the list
      if (newRecipe.effort_level === effort) {
        setRecipes((prev) => [...prev, newRecipe]);
      } else {
        // Switch to the effort tab of the new recipe
        setEffort(newRecipe.effort_level);
      }
    } catch (err) {
      setAddError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setAddLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="max-w-[390px] mx-auto px-5 pt-14 pb-28">
        {/* Header */}
        <div className="mb-8">
          <p className="font-sans text-xs font-bold text-orange uppercase tracking-widest mb-2">Pantry</p>
            <h1 className="font-sans text-[2rem] font-bold text-white leading-[1.1]"> What we cooking</h1>
            <h1 className="font-sans text-[2rem] font-bold text-white leading-[1.1]">tonight?</h1>
        </div>

        {/* Effort tabs */}
        <div className="mb-4">
          <EffortTabs value={effort} onChange={handleTabChange} />
        </div>

        {/* Dietary filter chips */}
        <div className="flex flex-wrap gap-2 mb-6">
          {DIETARY_OPTIONS.map(({ tag, label }) => {
            const active = dietaryFilters.includes(tag);
            return (
              <button
                key={tag}
                onClick={() => toggleFilter(tag)}
                className={`font-sans text-xs px-3 py-1 rounded-full border transition-colors ${
                  active
                    ? "bg-orange border-orange text-white"
                    : "bg-transparent border-[#2a2a2a] text-[#555] hover:text-[#888]"
                }`}
              >
                {label}
              </button>
            );
          })}
        </div>

        {/* Recipe cards */}
        <div className={`flex flex-col gap-4 transition-opacity duration-150 ${loading ? "opacity-40 pointer-events-none" : "opacity-100"}`}>
          {loading && recipes.length === 0 ? (
            <>
              {[0, 1].map((i) => (
                <div key={i} className="rounded-3xl bg-surface aspect-[4/3] animate-pulse" />
              ))}
            </>
          ) : !loading && recipes.length === 0 ? (
            <div className="text-center py-16">
              <p className="font-sans text-muted text-sm">No recipes yet.</p>
              <button
                onClick={() => setShowAdd(true)}
                className="mt-4 font-sans text-sm font-semibold text-orange"
              >
                Add one from TikTok →
              </button>
            </div>
          ) : !loading && visibleRecipes.length === 0 ? (
            <div className="text-center py-16">
              <p className="font-sans text-muted text-sm">No recipes match your dietary filters.</p>
            </div>
          ) : (
            visibleRecipes.map((recipe) => (
              <MealCard
                key={recipe.id}
                recipe={recipe}
              />
            ))
          )}
        </div>

        {/* Add from TikTok button — only show when there are recipes */}
        {recipes.length > 0 && (
          <button
            onClick={() => setShowAdd(true)}
            className="mt-6 w-full flex items-center justify-center gap-2 py-4 rounded-2xl bg-[#111] text-[#444] hover:text-white transition-colors"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            <span className="font-sans text-sm font-semibold">Add from TikTok</span>
          </button>
        )}

        {/* Community note */}
        <div className="mt-4 flex items-start gap-2 px-1">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0 mt-[2px]">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
          <p className="font-sans text-[11px] text-[#444] leading-relaxed">
            This is a shared recipebook for Cornell students. See what your peers are cooking. Make your own grocery lists.
          </p>
        </div>
      </div>

      {/* Add recipe modal */}
      {showAdd && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-5">
          <div className="absolute inset-0 bg-black/70" onClick={() => { setShowAdd(false); setAddError(null); }} />
          <div className="relative w-full max-w-[390px] bg-[#111] rounded-2xl p-6">
            <h2 className="font-sans text-lg font-light text-white mb-1">Add from TikTok</h2>
            <p className="font-sans text-xs text-muted mb-5">Paste a TikTok recipe link and we&apos;ll extract it.</p>

            <input
              type="url"
              placeholder="https://www.tiktok.com/@..."
              value={addUrl}
              onChange={(e) => setAddUrl(e.target.value)}
              className="w-full bg-[#1c1c1c] border border-[#2a2a2a] text-white font-sans text-sm rounded-xl px-4 py-3 mb-4 placeholder:text-[#444] outline-none focus:border-orange transition-colors"
            />

            <p className="font-sans text-xs text-muted mb-2 uppercase tracking-widest">Effort level</p>
            <div className="mb-5">
              <EffortTabs value={addEffort} onChange={setAddEffort} />
            </div>

            {addError && (
              <p className="font-sans text-xs text-orange mb-4">{addError}</p>
            )}

            <button
              onClick={handleAddRecipe}
              disabled={addLoading || !addUrl.trim()}
              className="w-full py-4 bg-orange text-white font-sans font-semibold text-sm rounded-2xl disabled:opacity-40 disabled:cursor-not-allowed transition-opacity"
            >
              {addLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Extracting…
                </span>
              ) : "Add recipe"}
            </button>
          </div>
        </div>
      )}

      <BottomNav />

      {/* Welcome sheet */}
      {showWelcome && (
        <div className="fixed inset-0 z-50 flex items-end justify-center">
          <div className="absolute inset-0 bg-black/60" onClick={dismissWelcome} />
          <div className="relative w-full max-w-[390px] bg-[#111] rounded-t-3xl px-6 pt-6 pb-10">
            <div className="w-8 h-1 bg-[#333] rounded-full mx-auto mb-6" />
            <p className="font-sans text-xs font-bold text-orange uppercase tracking-widest mb-3">Welcome</p>
            <h2 className="font-sans text-2xl font-bold text-white leading-snug mb-3">
              A recipebook built for Cornell students.
            </h2>
            <p className="font-sans text-sm text-[#666] leading-relaxed mb-8">
              See what your peers are cooking. Add recipes from TikTok. Build your own grocery lists.
            </p>
            <button
              onClick={dismissWelcome}
              className="w-full py-4 bg-orange text-white font-sans font-semibold text-sm rounded-2xl"
            >
              Let&apos;s cook
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
