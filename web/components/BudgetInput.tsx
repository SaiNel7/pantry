"use client";

interface BudgetInputProps {
  value: number | "";
  onChange: (value: number | "") => void;
}

export default function BudgetInput({ value, onChange }: BudgetInputProps) {
  return (
    <div className="mb-8">
      <label className="block font-sans text-xs font-bold text-forest uppercase tracking-widest mb-3">
        Weekly grocery budget
      </label>
      <div className="relative">
        <span className="absolute left-5 top-1/2 -translate-y-1/2 font-serif text-2xl font-bold text-forest pointer-events-none select-none">
          $
        </span>
        <input
          type="number"
          min="0"
          step="5"
          placeholder="75"
          value={value}
          onChange={(e) => {
            const v = e.target.value;
            onChange(v === "" ? "" : parseFloat(v));
          }}
          className="w-full pl-10 pr-6 py-5 bg-cream border-2 border-parchment rounded-2xl font-serif text-3xl font-bold text-bark placeholder:text-bark/20 focus:outline-none focus:border-forest transition-colors"
        />
        <span className="absolute right-5 top-1/2 -translate-y-1/2 font-sans text-xs text-bark-muted pointer-events-none">
          per week
        </span>
      </div>
      <p className="mt-2 font-sans text-xs text-bark-muted">
        Most students budget $50 – $100 / week
      </p>
    </div>
  );
}
