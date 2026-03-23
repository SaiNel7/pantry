"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

interface AddToListButtonProps {
  recipeId: string;
  recipeName: string;
}

const STORAGE_KEY = "mise-saved-recipes";

export default function AddToListButton({ recipeId, recipeName }: AddToListButtonProps) {
  const router = useRouter();
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const ids: string[] = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "[]");
    setSaved(ids.includes(recipeId));
  }, [recipeId]);

  const toggle = () => {
    const ids: string[] = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "[]");
    let next: string[];
    if (ids.includes(recipeId)) {
      next = ids.filter((id) => id !== recipeId);
    } else {
      next = [...ids, recipeId];
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    setSaved(!ids.includes(recipeId));
    if (!ids.includes(recipeId)) {
      // Navigate to list after adding
      router.push("/list");
    }
  };

  return (
    <button
      onClick={toggle}
      className={`w-full py-4 font-sans font-semibold text-sm rounded-2xl transition-all ${
        saved
          ? "bg-[#1c1c1c] text-[#555] border border-[#2a2a2a]"
          : "bg-orange text-white"
      }`}
    >
      {saved ? `Remove "${recipeName}" from list` : "Add to grocery list →"}
    </button>
  );
}
