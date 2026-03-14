"use client";
import { useState } from "react";
import type { ListItem as ListItemType } from "@/types";

interface ListItemProps {
  item: ListItemType;
  onToggle: () => void;
}

export default function ListItem({ item, onToggle }: ListItemProps) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className={`py-3 border-b border-parchment last:border-0 ${item.checked ? "opacity-40" : ""}`}>
      <div className="flex items-start gap-3">
        <input
          type="checkbox"
          checked={item.checked}
          onChange={onToggle}
          className="mt-0.5 h-4 w-4 rounded border-parchment text-forest focus:ring-forest accent-forest cursor-pointer"
        />
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div>
              <span className={`font-sans text-sm text-bark ${item.checked ? "line-through" : ""}`}>
                {item.quantity} {item.name}
              </span>
              {item.flag && (
                <button
                  onClick={() => setExpanded(!expanded)}
                  className={`ml-2 inline-flex items-center px-1.5 py-0.5 rounded text-xs font-sans font-semibold transition-colors ${
                    item.flag === "swap"
                      ? "bg-terra/15 text-terra hover:bg-terra/25"
                      : "bg-sage/25 text-forest hover:bg-sage/40"
                  }`}
                >
                  {item.flag === "swap" ? "swap" : "optional"}
                  <span className="ml-0.5">{expanded ? "▲" : "▼"}</span>
                </button>
              )}
            </div>
            <span className="font-sans text-sm text-bark/60 whitespace-nowrap">
              ${item.estimatedCost.toFixed(2)}
            </span>
          </div>
          {expanded && item.swapSuggestion && (
            <p className="mt-1 font-sans text-xs text-terra bg-terra/8 rounded px-2 py-1">
              {item.swapSuggestion}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
