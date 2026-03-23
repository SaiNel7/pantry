import { getRecipeById } from "@/lib/recipes";
import { notFound } from "next/navigation";
import Link from "next/link";
import PrepChecklist from "./PrepChecklist";
import AddToListButton from "./AddToListButton";
import IngredientList from "./IngredientList";

export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ from?: string }>;
}

export default async function RecipePage({ params, searchParams }: Props) {
  const { id } = await params;
  const { from } = await searchParams;
  const recipe = await getRecipeById(id);

  if (!recipe) notFound();

  const effortLabel = {
    low: "Low effort",
    med: "Medium effort",
    high: "High effort",
  }[recipe.effort_level];

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="max-w-[390px] mx-auto">
      <div className="px-5 pt-14 pb-32">
        {/* Back button */}
        <Link href={`/?tab=${from ?? recipe.effort_level}`} className="inline-flex items-center gap-1 text-[#555] mb-6">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </Link>
        {/* Title + meta */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-2">
            <span className="font-sans text-[10px] font-bold text-orange uppercase tracking-widest">{effortLabel}</span>
            {recipe.cook_time_minutes && (
              <>
                <span className="text-[#444]">·</span>
                <span className="font-sans text-[10px] text-[#666]">{recipe.cook_time_minutes}m</span>
              </>
            )}
            {recipe.cost_per_serving && (
              <>
                <span className="text-[#444]">·</span>
                <span className="font-sans text-[10px] text-[#666]">${recipe.cost_per_serving.toFixed(2)}/serving</span>
              </>
            )}
          </div>
          <h1 className="font-sans text-xl font-light text-white leading-tight">{recipe.title}</h1>
          {recipe.tagline && (
            <p className="font-sans text-sm text-[#666] mt-1">{recipe.tagline}</p>
          )}
        </div>

        {/* Ingredients */}
        <section className="mb-8">
          <h2 className="font-sans text-xs font-bold text-orange uppercase tracking-widest mb-3">Ingredients</h2>
          <IngredientList recipeId={recipe.id} ingredients={recipe.ingredients} />
        </section>

        {/* Prep checklist */}
        {recipe.steps.length > 0 && (
          <section className="mb-8">
            <h2 className="font-sans text-xs font-bold text-orange uppercase tracking-widest mb-3">Steps</h2>
            <PrepChecklist recipeId={recipe.id} steps={recipe.steps} />
          </section>
        )}

        {/* Add to grocery list */}
        <AddToListButton recipeId={recipe.id} recipeName={recipe.title} />
      </div>
      </div>
    </div>
  );
}
