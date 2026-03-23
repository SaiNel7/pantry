"use client";

import { useState, useEffect } from "react";

interface PrepChecklistProps {
  recipeId: string;
  steps: string[];
}

export default function PrepChecklist({ recipeId, steps }: PrepChecklistProps) {
  const storageKey = `mise-steps-${recipeId}`;
  const [checked, setChecked] = useState<boolean[]>(() => steps.map(() => false));

  // Load from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem(storageKey);
    if (stored) {
      try {
        const parsed: boolean[] = JSON.parse(stored);
        setChecked(steps.map((_, i) => parsed[i] ?? false));
      } catch {}
    }
  }, [storageKey, steps]);

  const toggle = (i: number) => {
    setChecked((prev) => {
      const next = [...prev];
      next[i] = !next[i];
      localStorage.setItem(storageKey, JSON.stringify(next));
      return next;
    });
  };

  const doneCount = checked.filter(Boolean).length;

  return (
    <div>
      {doneCount > 0 && (
        <p className="font-sans text-xs text-[#555] mb-3">{doneCount} of {steps.length} done</p>
      )}
      <div className="flex flex-col gap-3">
        {steps.map((step, i) => (
          <button
            key={i}
            onClick={() => toggle(i)}
            className="flex items-start gap-3 text-left group"
          >
            <span
              className={`mt-0.5 shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                checked[i]
                  ? "bg-orange border-orange"
                  : "border-[#333] group-hover:border-[#555]"
              }`}
            >
              {checked[i] && (
                <svg width="10" height="10" viewBox="0 0 12 12" fill="none">
                  <polyline points="2 6 5 9 10 3" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              )}
            </span>
            <span
              className={`font-sans text-sm leading-relaxed transition-colors ${
                checked[i] ? "text-[#444] line-through" : "text-white"
              }`}
            >
              {step}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
