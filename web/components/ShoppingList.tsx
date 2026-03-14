"use client";
import { useMemo } from "react";
import type { GeneratedList } from "@/types";
import ListItem from "./ListItem";

interface ShoppingListProps {
  list: GeneratedList;
  budget: number;
  onToggleItem: (index: number) => void;
}

export default function ShoppingList({ list, budget, onToggleItem }: ShoppingListProps) {
  const subtotal = useMemo(
    () =>
      list.items
        .filter((item) => !item.checked)
        .reduce((sum, item) => sum + item.estimatedCost, 0),
    [list.items]
  );

  const remaining = budget - subtotal;
  const overBudget = remaining < 0;

  const copyList = () => {
    const text = list.items
      .filter((item) => !item.checked)
      .map((item) => `${item.quantity} ${item.name} — $${item.estimatedCost.toFixed(2)}`)
      .join("\n");
    const total = `\nTotal: $${subtotal.toFixed(2)} / $${budget} budget`;
    navigator.clipboard.writeText(text + total);
  };

  return (
    <div className="bg-white rounded-xl border-2 border-parchment p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-serif text-bark text-xl font-bold">Shopping List</h2>
        <button
          onClick={copyList}
          className="font-sans text-sm text-forest hover:text-forest-light font-semibold transition-colors"
        >
          Copy list
        </button>
      </div>

      {list.budgetNotes && (
        <p className={`font-sans text-sm mb-4 px-3 py-2 rounded-lg ${
          list.overBudget
            ? "bg-terra/10 text-terra border border-terra/20"
            : "bg-sage/15 text-forest border border-sage/30"
        }`}>
          {list.budgetNotes}
        </p>
      )}

      <div className="mb-4">
        {list.items.map((item, i) => (
          <ListItem key={i} item={item} onToggle={() => onToggleItem(i)} />
        ))}
      </div>

      <div className="pt-4 border-t-2 border-parchment space-y-2">
        <div className="flex justify-between font-sans text-sm text-bark/60">
          <span>Estimated total</span>
          <span>${subtotal.toFixed(2)}</span>
        </div>
        <div className={`flex justify-between font-sans text-base font-bold ${
          overBudget ? "text-terra" : "text-forest"
        }`}>
          <span>{overBudget ? "Over budget by" : "Budget remaining"}</span>
          <span>${Math.abs(remaining).toFixed(2)}</span>
        </div>
      </div>
    </div>
  );
}
