"use client";

import Link from "next/link";
import { createPortal } from "react-dom";
import type { Recipe } from "@/types";
import { deleteRecipe, updateRecipeEffort } from "@/lib/recipes";
import { useState, useRef, useEffect } from "react";

type EffortLevel = 'low' | 'med' | 'high';

interface MealCardProps {
  recipe: Recipe;
  onDelete?: (id: string) => void;
  onMove?: (id: string) => void;
}

const EFFORT_LABELS: Record<EffortLevel, string> = { low: 'Low', med: 'Med', high: 'High' };

export default function MealCard({ recipe, onDelete, onMove }: MealCardProps) {
  const [open, setOpen] = useState(false);
  const [moving, setMoving] = useState(false);
  const [loading, setLoading] = useState(false);
  const [menuPos, setMenuPos] = useState({ top: 0, left: 0 });
  const btnRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    const handler = () => {
      setOpen(false);
      setMoving(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  const openMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const rect = btnRef.current?.getBoundingClientRect();
    if (rect) {
      setMenuPos({
        top: rect.top + window.scrollY,
        left: rect.right + 8,
      });
    }
    setMoving(false);
    setOpen((v) => !v);
  };

  const handleDelete = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setLoading(true);
    setOpen(false);
    try {
      await deleteRecipe(recipe.id);
      onDelete?.(recipe.id);
    } catch {
      setLoading(false);
    }
  };

  const handleMove = async (e: React.MouseEvent, level: EffortLevel) => {
    e.preventDefault();
    e.stopPropagation();
    setLoading(true);
    setOpen(false);
    try {
      await updateRecipeEffort(recipe.id, level);
      onMove?.(recipe.id);
    } catch {
      setLoading(false);
    }
  };

  const otherLevels = (["low", "med", "high"] as EffortLevel[]).filter(
    (l) => l !== recipe.effort_level
  );

  const menu = open && typeof document !== "undefined"
    ? createPortal(
        <div
          className="fixed z-[9999]"
          style={{ top: menuPos.top, left: menuPos.left }}
          onMouseDown={(e) => e.stopPropagation()}
        >
          <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg overflow-hidden shadow-xl">
            {!moving ? (
              <>
                <button
                  onClick={(e) => { e.preventDefault(); e.stopPropagation(); setMoving(true); }}
                  className="flex items-center gap-2 w-full px-3 py-2 text-left text-[#aaa] hover:text-white hover:bg-[#222] transition-colors"
                >
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                  <span className="font-sans text-xs">Move to</span>
                </button>
                <button
                  onClick={handleDelete}
                  className="flex items-center gap-2 w-full px-3 py-2 text-left text-red-400 hover:bg-[#222] transition-colors"
                >
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="3 6 5 6 21 6" />
                    <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                    <path d="M10 11v6M14 11v6" />
                    <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
                  </svg>
                  <span className="font-sans text-xs">Delete</span>
                </button>
              </>
            ) : (
              <>
                {otherLevels.map((level) => (
                  <button
                    key={level}
                    onClick={(e) => handleMove(e, level)}
                    className="flex items-center w-full px-3 py-2 text-left text-[#aaa] hover:text-white hover:bg-[#222] transition-colors"
                  >
                    <span className="font-sans text-xs">{EFFORT_LABELS[level]}</span>
                  </button>
                ))}
              </>
            )}
          </div>
        </div>,
        document.body
      )
    : null;

  return (
    <>
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
            ref={btnRef}
            onClick={openMenu}
            disabled={loading}
            className="p-1 text-[#444] hover:text-[#888] transition-colors disabled:opacity-30 shrink-0"
            aria-label="More options"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <circle cx="12" cy="5" r="1.5" />
              <circle cx="12" cy="12" r="1.5" />
              <circle cx="12" cy="19" r="1.5" />
            </svg>
          </button>
        </div>
      </Link>
      {menu}
    </>
  );
}
