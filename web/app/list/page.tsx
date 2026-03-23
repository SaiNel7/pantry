"use client";

import { useState, useEffect } from "react";
import type { Recipe, Ingredient } from "@/types";
import { getRecipesByIds } from "@/lib/recipes";
import BottomNav from "@/components/BottomNav";
import Link from "next/link";

const STORAGE_KEY = "mise-saved-recipes";
const CHECKED_KEY = "mise-grocery-checked";

interface GroceryItem {
  name: string;
  quantity: string;
}

// Normalize ingredient name: lowercase, strip parenthetical prep notes, trim
function normalizeIngredientName(name: string): string {
  return name
    .toLowerCase()
    .replace(/\s*\(.*?\)/g, "")   // remove "(minced)", "(divided)", etc.
    .replace(/,.*$/, "")           // remove ", thinly sliced" suffixes
    .replace(/\s+/g, " ")
    .trim();
}

// Try to add two quantities with the same unit, else concatenate
function combineQuantities(a: string, b: string): string {
  const parse = (q: string) => {
    const m = q.trim().match(/^([\d./]+(?:\s+[\d/]+)?)\s*(.*)$/);
    if (!m) return null;
    const numStr = m[1].trim();
    const unit = m[2].trim().toLowerCase();
    // handle fractions like "1/2" or mixed "1 1/2"
    const parts = numStr.split(/\s+/);
    const num = parts.reduce((acc, p) => {
      const [n, d] = p.split("/");
      return acc + (d ? parseInt(n) / parseInt(d) : parseFloat(n));
    }, 0);
    return { num, unit };
  };

  const pa = parse(a);
  const pb = parse(b);
  if (pa && pb && pa.unit === pb.unit) {
    const total = pa.num + pb.num;
    // format nicely: avoid floating point noise
    const formatted = Number(total.toFixed(2)).toString();
    return `${formatted} ${pa.unit}`.trim();
  }
  return `${a} + ${b}`;
}

function insertIngredient(
  map: Map<string, { displayName: string; quantity: string }>,
  name: string,
  quantity: string
) {
  // Split compound ingredients like "salt and pepper" into individual parts
  const parts = name.split(/\s+and\s+/i);
  for (const part of parts) {
    const key = normalizeIngredientName(part);
    if (!key) continue;
    if (!map.has(key)) {
      map.set(key, { displayName: part.trim(), quantity });
    } else {
      const existing = map.get(key)!;
      map.set(key, {
        displayName: existing.displayName,
        quantity: combineQuantities(existing.quantity, quantity),
      });
    }
  }
}

function mergeIngredients(recipes: Recipe[]): GroceryItem[] {
  const map = new Map<string, { displayName: string; quantity: string }>();
  for (const recipe of recipes) {
    for (const ing of recipe.ingredients as Ingredient[]) {
      insertIngredient(map, ing.name, ing.quantity);
    }
  }
  return Array.from(map.values()).map(({ displayName, quantity }) => ({
    name: displayName.charAt(0).toUpperCase() + displayName.slice(1),
    quantity,
  }));
}

export default function ListPage() {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [items, setItems] = useState<GroceryItem[]>([]);
  const [checked, setChecked] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const ids: string[] = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "[]");
    const storedChecked: Record<string, boolean> = JSON.parse(localStorage.getItem(CHECKED_KEY) ?? "{}");
    setChecked(storedChecked);

    if (ids.length === 0) {
      setLoading(false);
      return;
    }

    getRecipesByIds(ids)
      .then((data) => {
        setRecipes(data);
        setItems(mergeIngredients(data));
      })
      .catch(() => setItems([]))
      .finally(() => setLoading(false));
  }, []);

  const toggle = (name: string) => {
    setChecked((prev) => {
      const next = { ...prev, [name]: !prev[name] };
      localStorage.setItem(CHECKED_KEY, JSON.stringify(next));
      return next;
    });
  };

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="max-w-[390px] mx-auto px-5 pt-14 pb-28">
        {/* Header */}
        <div className="mb-10">
          <p className="font-sans text-xs font-bold text-orange uppercase tracking-widest mb-3">Grocery List</p>
          {loading ? (
            <div className="h-10 w-48 bg-[#1c1c1c] rounded-lg animate-pulse" />
          ) : items.length === 0 ? (
            <h1 className="font-sans text-2xl font-light text-white leading-tight">Nothing yet.</h1>
          ) : (
            <h1 className="font-sans text-2xl font-light text-white leading-tight">
              You need {items.length} thing{items.length !== 1 ? "s" : ""}.
            </h1>
          )}
        </div>

        {/* Grocery items */}
        {loading ? (
          <div>
            {[0, 1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex items-center gap-4 py-4 border-b border-[#1a1a1a]">
                <div className="w-6 h-6 rounded-md bg-[#1c1c1c] animate-pulse shrink-0" />
                <div className="h-4 bg-[#1c1c1c] rounded animate-pulse flex-1" />
                <div className="h-4 w-14 bg-[#1c1c1c] rounded animate-pulse" />
              </div>
            ))}
          </div>
        ) : items.length === 0 ? (
          <div className="pt-4">
            <p className="font-sans text-sm text-[#555] mb-6">
              Save a meal and your ingredients show up here.
            </p>
            <Link href="/" className="font-sans text-sm font-semibold text-orange">
              Browse meals →
            </Link>
          </div>
        ) : (
          <div>
            {items.map((item) => {
              const isChecked = !!checked[item.name];
              return (
                <button
                  key={item.name}
                  onClick={() => toggle(item.name)}
                  className="flex items-center gap-4 py-4 border-b border-[#1a1a1a] text-left w-full"
                >
                  {/* Rounded-square checkbox */}
                  <span
                    className={`shrink-0 w-[26px] h-[26px] rounded-[7px] border-2 flex items-center justify-center transition-all ${
                      isChecked ? "bg-orange border-orange" : "border-[#333]"
                    }`}
                  >
                    {isChecked && (
                      <svg width="11" height="11" viewBox="0 0 12 12" fill="none">
                        <polyline points="2 6 5 9 10 3" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    )}
                  </span>
                  <span className={`font-sans text-sm flex-1 transition-colors ${isChecked ? "text-[#444] line-through" : "text-white"}`}>
                    {item.name}
                  </span>
                  <span className={`font-sans text-xs shrink-0 ${isChecked ? "text-[#333]" : "text-[#555]"}`}>
                    {item.quantity}
                  </span>
                </button>
              );
            })}
          </div>
        )}

        {/* Saved recipe chips */}
        {recipes.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-8">
            {recipes.map((r) => (
              <Link
                key={r.id}
                href={`/recipe/${r.id}`}
                className="font-sans text-xs text-[#555] bg-[#111] px-3 py-1.5 rounded-full"
              >
                {r.title}
              </Link>
            ))}
          </div>
        )}
      </div>

      <BottomNav />
    </div>
  );
}
