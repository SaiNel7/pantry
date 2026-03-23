export interface Ingredient {
  name: string;
  quantity: string;
  notes?: string;
  flag?: 'swap' | 'optional' | null;
  swapSuggestion?: string;
}

export interface Recipe {
  id: string;
  title: string;
  tagline: string | null;
  effort_level: 'low' | 'med' | 'high';
  cook_time_minutes: number | null;
  cost_per_serving: number | null;
  image_url: string | null;
  ingredients: Ingredient[];
  steps: string[];
  source_url: string | null;
  created_at: string;
}

export interface ExtractedRecipe {
  title: string;
  ingredients: Ingredient[];
  serves?: number;
  sourceUrl: string;
}

export interface ListItem {
  name: string;
  quantity: string;
  estimatedCost: number;
  flag: "swap" | "optional" | null;
  swapSuggestion?: string;
  checked: boolean;
}

export interface GeneratedList {
  items: ListItem[];
  totalEstimate: number;
  overBudget: boolean;
  budgetNotes: string;
}
