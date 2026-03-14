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
      <div className="bg-parchment/50 rounded-lg p-4 border border-parchment animate-pulse">
        <div className="h-4 bg-parchment rounded w-3/4 mb-2" />
        <div className="h-3 bg-parchment rounded w-1/2" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-terra/10 rounded-lg p-4 border border-terra/20">
        <p className="font-sans text-sm text-terra font-semibold">Could not extract recipe</p>
        <p className="font-sans text-xs text-bark/60 mt-1 truncate">{url}</p>
        <p className="font-sans text-xs text-terra/80 mt-1">{error}</p>
      </div>
    );
  }

  return (
    <div className="bg-sage/10 rounded-lg p-4 border border-sage/30">
      <p className="font-serif text-bark font-bold text-base">{recipe.title}</p>
      <p className="font-sans text-xs text-bark/60 mt-1">
        {recipe.ingredients.length} ingredients
        {recipe.serves ? ` · serves ${recipe.serves}` : ""}
      </p>
    </div>
  );
}
