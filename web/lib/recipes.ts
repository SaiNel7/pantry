import { supabase } from "./supabase";
import type { Recipe } from "@/types";

export async function getRecipesByEffort(level: 'low' | 'med' | 'high'): Promise<Recipe[]> {
  const { data, error } = await supabase
    .from("recipes")
    .select("*")
    .eq("effort_level", level)
    .order("created_at", { ascending: true });

  if (error) throw new Error(error.message);
  return (data ?? []) as Recipe[];
}

export async function getRecipeById(id: string): Promise<Recipe | null> {
  const { data, error } = await supabase
    .from("recipes")
    .select("*")
    .eq("id", id)
    .single();

  if (error) return null;
  return data as Recipe;
}

export async function getRecipesByIds(ids: string[]): Promise<Recipe[]> {
  if (ids.length === 0) return [];
  const { data, error } = await supabase
    .from("recipes")
    .select("*")
    .in("id", ids);

  if (error) throw new Error(error.message);
  return (data ?? []) as Recipe[];
}

export async function updateRecipeEffort(id: string, effort_level: 'low' | 'med' | 'high'): Promise<void> {
  const { error } = await supabase
    .from("recipes")
    .update({ effort_level })
    .eq("id", id);
  if (error) throw new Error(error.message);
}

export async function deleteRecipe(id: string): Promise<void> {
  const { error } = await supabase.from("recipes").delete().eq("id", id);
  if (error) throw new Error(error.message);
}

export async function saveRecipe(recipe: Omit<Recipe, 'id' | 'created_at'>): Promise<Recipe> {
  const { data, error } = await supabase
    .from("recipes")
    .insert(recipe)
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data as Recipe;
}
