"use client";

interface BudgetInputProps {
  value: number | "";
  onChange: (value: number | "") => void;
}

export default function BudgetInput({ value, onChange }: BudgetInputProps) {
  return (
    <div className="mb-6">
      <label className="block text-bark font-sans text-sm font-semibold mb-2 tracking-wide uppercase">
        Weekly Grocery Budget
      </label>
      <div className="relative">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-forest font-serif text-xl font-bold">
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
          className="w-full pl-8 pr-4 py-3 bg-white border-2 border-parchment rounded-lg font-serif text-xl text-bark placeholder:text-bark/30 focus:outline-none focus:border-forest transition-colors"
        />
      </div>
    </div>
  );
}
