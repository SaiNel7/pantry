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
    <div className={`py-4 border-b border-parchment last:border-0 transition-opacity ${item.checked ? "opacity-40" : ""}`}>
      <div className="flex items-start gap-4">
        {/* Custom checkbox */}
        <button
          onClick={onToggle}
          aria-checked={item.checked}
          role="checkbox"
          className={`mt-0.5 w-5 h-5 rounded-full border-2 shrink-0 flex items-center justify-center transition-colors ${
            item.checked
              ? "bg-forest border-forest"
              : "border-parchment hover:border-forest"
          }`}
        >
          {item.checked && (
            <svg viewBox="0 0 10 10" className="w-3 h-3" fill="none">
              <path d="M2 5l2.5 2.5L8 3" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          )}
        </button>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <span className={`font-sans text-sm text-bark leading-snug ${item.checked ? "line-through" : ""}`}>
                <span className="font-medium">{item.quantity}</span>{" "}
                {item.name}
              </span>
              {item.flag && (
                <button
                  onClick={() => setExpanded(!expanded)}
                  className={`ml-2 inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-sans font-semibold transition-colors ${
                    item.flag === "swap"
                      ? "bg-terra-pale text-terra hover:bg-terra/20"
                      : "bg-sage-pale text-forest hover:bg-forest-pale"
                  }`}
                >
                  {item.flag === "swap" ? "swap" : "optional"}
                  <span className="text-[10px]">{expanded ? "▲" : "▼"}</span>
                </button>
              )}
            </div>
            <span className="font-sans text-sm font-semibold text-bark whitespace-nowrap">
              ${item.estimatedCost.toFixed(2)}
            </span>
          </div>

          {expanded && item.swapSuggestion && (
            <p className="mt-2 font-sans text-xs text-terra bg-terra-pale border border-terra/15 rounded-xl px-3 py-2 leading-relaxed">
              💡 {item.swapSuggestion}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
