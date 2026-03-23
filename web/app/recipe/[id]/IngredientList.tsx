"use client";

import { useState, useEffect } from "react";
import type { Ingredient } from "@/types";

interface IngredientListProps {
  recipeId: string;
  ingredients: Ingredient[];
}

export default function IngredientList({ recipeId, ingredients }: IngredientListProps) {
  const storageKey = `mise-removed-ingredients-${recipeId}`;
  const [removed, setRemoved] = useState<string[]>([]);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(storageKey);
      if (stored) setRemoved(JSON.parse(stored));
    } catch {}
  }, [storageKey]);

  const toggle = (name: string) => {
    setRemoved((prev) => {
      const next = prev.includes(name) ? prev.filter((n) => n !== name) : [...prev, name];
      localStorage.setItem(storageKey, JSON.stringify(next));
      return next;
    });
  };

  return (
    <div>
      {ingredients.map((ing, i) => {
        const isRemoved = removed.includes(ing.name);
        return (
          <div
            key={i}
            className={`flex items-start justify-between py-3 border-b border-[#1a1a1a] transition-opacity ${isRemoved ? "opacity-30" : ""}`}
          >
            <div className="flex-1 min-w-0 pr-3">
              <div className="flex items-center gap-2 flex-wrap">
                <span className={`font-sans text-sm text-white ${isRemoved ? "line-through" : ""}`}>
                  {ing.name}
                </span>
                {!isRemoved && ing.flag === "optional" && (
                  <span className="font-mono text-[10px] text-[#888] bg-[#1a1a1a] border border-[#2a2a2a] px-1.5 py-0.5 rounded">
                    optional
                  </span>
                )}
                {!isRemoved && ing.flag === "swap" && ing.swapSuggestion && (
                  <span className="font-mono text-[10px] text-orange bg-[#1a1a1a] border border-orange/20 px-1.5 py-0.5 rounded">
                    swap → {ing.swapSuggestion}
                  </span>
                )}
              </div>
              {ing.notes && !isRemoved && (
                <p className="font-sans text-xs text-[#444] mt-0.5">{ing.notes}</p>
              )}
            </div>
            <div className="flex items-center gap-3 shrink-0">
              <span className={`font-sans text-xs ${isRemoved ? "text-[#333]" : "text-[#555]"}`}>
                {ing.quantity}
              </span>
              <button
                onClick={() => toggle(ing.name)}
                className="text-[#333] hover:text-[#666] transition-colors"
                aria-label={isRemoved ? "Restore ingredient" : "Remove ingredient"}
              >
                {isRemoved ? (
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M3 12h18M12 3l9 9-9 9" />
                  </svg>
                ) : (
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                )}
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
