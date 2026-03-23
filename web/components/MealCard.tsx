"use client";

import Link from "next/link";
import type { Recipe } from "@/types";
import { useState, useEffect } from "react";

interface MealCardProps {
  recipe: Recipe;
}

const STORAGE_KEY = "mise-saved-recipes";

export default function MealCard({ recipe }: MealCardProps) {
  const [inList, setInList] = useState(false);

  useEffect(() => {
    const ids: string[] = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "[]");
    setInList(ids.includes(recipe.id));
  }, [recipe.id]);

  const toggleList = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const ids: string[] = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "[]");
    const next = ids.includes(recipe.id)
      ? ids.filter((id) => id !== recipe.id)
      : [...ids, recipe.id];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    setInList(next.includes(recipe.id));
  };

  return (
    <Link href={`/recipe/${recipe.id}?from=${recipe.effort_level}`} className="block rounded-2xl overflow-hidden bg-[#1c1c1c]">
      <div className="flex items-start justify-between px-5 py-5">
        <div className="flex-1 min-w-0 pr-4">
          <h3 className="font-sans text-base font-bold text-white leading-snug">{recipe.title}</h3>
          {recipe.tagline && (
            <p className="font-sans text-xs text-[#555] mt-1">{recipe.tagline}</p>
          )}
          <div className="flex items-center gap-2 mt-2">
            {recipe.cook_time_minutes != null && (
              <span className="font-mono text-[11px] text-white bg-[#111] px-2 py-0.5 rounded-md">{recipe.cook_time_minutes}m</span>
            )}
            {recipe.cost_per_serving != null && (
              <span className="font-mono text-[11px] text-white bg-[#111] px-2 py-0.5 rounded-md">${recipe.cost_per_serving.toFixed(2)}</span>
            )}
          </div>
        </div>

        <button
          onClick={toggleList}
          className={`p-1 shrink-0 transition-colors ${inList ? "text-orange" : "text-[#444] hover:text-[#888]"}`}
          aria-label={inList ? "Remove from list" : "Add to list"}
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill={inList ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="9" cy="21" r="1" /><circle cx="20" cy="21" r="1" />
            <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
          </svg>
        </button>
      </div>
    </Link>
  );
}
