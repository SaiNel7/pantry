"use client";
import type { ExtractedRecipe } from "@/types";

interface RecipeCardProps {
  recipe: ExtractedRecipe;
  isLoading?: boolean;
  error?: string;
  url: string;
}

export default function RecipeCard({ recipe, isLoading, error, url }: RecipeCardProps) {
  if (isLoading) {
    return (
      <div className="shrink-0 w-56 bg-white rounded-2xl border border-parchment shadow-card p-5 snap-start animate-pulse">
        <div className="w-8 h-8 bg-parchment rounded-xl mb-4" />
        <div className="h-4 bg-parchment rounded-full w-3/4 mb-2" />
        <div className="h-3 bg-parchment rounded-full w-1/2" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="shrink-0 w-56 bg-white rounded-2xl border border-terra/20 shadow-card p-5 snap-start">
        <div className="w-8 h-8 bg-terra-pale rounded-xl flex items-center justify-center mb-4 text-terra text-sm font-bold">
          ✕
        </div>
        <p className="font-sans text-sm font-semibold text-terra mb-1">Could not extract</p>
        <p className="font-sans text-xs text-bark-muted truncate mb-2">{url}</p>
        <p className="font-sans text-xs text-terra/70 line-clamp-2">{error}</p>
      </div>
    );
  }

  return (
    <div className="shrink-0 w-56 bg-white rounded-2xl border border-parchment shadow-card p-5 snap-start">
      <div className="w-8 h-8 bg-forest-pale rounded-xl flex items-center justify-center mb-4">
        <svg viewBox="0 0 16 16" fill="none" className="w-4 h-4" stroke="#2D6A4F" strokeWidth="1.5" strokeLinecap="round">
          <path d="M8 1C4 1 1 4 1 8s3 7 7 7 7-3 7-7-3-7-7-7z" />
          <path d="M5 8l2 2 4-4" />
        </svg>
      </div>
      <p className="font-serif text-sm font-bold text-bark leading-snug mb-2 line-clamp-2">
        {recipe.title}
      </p>
      <div className="flex items-center gap-2 flex-wrap">
        <span className="font-sans text-xs text-bark-muted">
          {recipe.ingredients.length} ingredients
        </span>
        {recipe.serves && (
          <>
            <span className="text-parchment">·</span>
            <span className="font-sans text-xs text-bark-muted">serves {recipe.serves}</span>
          </>
        )}
      </div>
    </div>
  );
}
