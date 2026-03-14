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
    navigator.clipboard.writeText(text + `\n\nTotal: $${subtotal.toFixed(2)} / $${budget} budget`);
  };

  const checkedCount = list.items.filter((i) => i.checked).length;

  return (
    <div className="space-y-6">
      {/* Budget status banner */}
      <div className={`rounded-2xl px-5 py-4 flex items-center justify-between ${
        overBudget
          ? "bg-terra-pale border border-terra/20"
          : "bg-forest-pale border border-forest/15"
      }`}>
        <div>
          <p className={`font-sans text-xs font-bold uppercase tracking-widest mb-0.5 ${overBudget ? "text-terra" : "text-forest"}`}>
            {overBudget ? "Over budget" : "Looking good"}
          </p>
          <p className="font-serif text-lg font-bold text-bark">
            ${subtotal.toFixed(2)}{" "}
            <span className="font-sans text-sm font-normal text-bark-muted">
              of ${budget} budget
            </span>
          </p>
        </div>
        <div className={`text-right`}>
          <p className={`font-serif text-2xl font-black ${overBudget ? "text-terra" : "text-forest"}`}>
            {overBudget ? "-" : "+"}${Math.abs(remaining).toFixed(2)}
          </p>
          <p className="font-sans text-xs text-bark-muted">
            {overBudget ? "over" : "remaining"}
          </p>
        </div>
      </div>

      {/* Budget notes */}
      {list.budgetNotes && (
        <p className="font-sans text-sm text-bark-muted bg-cream rounded-2xl px-5 py-4 leading-relaxed border border-parchment">
          {list.budgetNotes}
        </p>
      )}

      {/* List card */}
      <div className="bg-white rounded-2xl border border-parchment shadow-card overflow-hidden">
        {/* Card header */}
        <div className="px-6 py-4 border-b border-parchment flex items-center justify-between">
          <div>
            <h3 className="font-serif text-lg font-bold text-bark">
              {list.items.length} items
            </h3>
            {checkedCount > 0 && (
              <p className="font-sans text-xs text-bark-muted">
                {checkedCount} checked off
              </p>
            )}
          </div>
          <button
            onClick={copyList}
            className="font-sans text-xs font-semibold bg-forest-pale text-forest px-4 py-2 rounded-full hover:bg-forest hover:text-white transition-colors"
          >
            Copy list
          </button>
        </div>

        {/* Items */}
        <div className="px-6">
          {list.items.map((item, i) => (
            <ListItem key={i} item={item} onToggle={() => onToggleItem(i)} />
          ))}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-parchment bg-cream/60">
          <div className="flex justify-between font-sans text-sm text-bark-muted mb-1.5">
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
    </div>
  );
}
