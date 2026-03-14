export interface Ingredient {
  name: string;
  quantity: string;
  notes?: string;
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
