"use client";

type EffortLevel = 'low' | 'med' | 'high';

const tabs: { level: EffortLevel; label: string; sub: string }[] = [
  { level: 'low', label: 'LOW', sub: '< 15m · 1 pot' },
  { level: 'med', label: 'MED', sub: '< 30m · 2 pots' },
  { level: 'high', label: 'HIGH', sub: 'Impressing someone' },
];

interface EffortTabsProps {
  value: EffortLevel;
  onChange: (level: EffortLevel) => void;
}

export default function EffortTabs({ value, onChange }: EffortTabsProps) {
  return (
    <div className="grid grid-cols-3 rounded-2xl overflow-hidden bg-[#1c1c1c] p-1 gap-1">
      {tabs.map((tab) => {
        const active = value === tab.level;
        return (
          <button
            key={tab.level}
            onClick={() => onChange(tab.level)}
            className={`flex flex-col items-center justify-center py-2 px-2 rounded-xl transition-colors ${
              active ? "bg-orange" : "hover:bg-[#252525]"
            }`}
          >
            <span className={`font-sans text-[10px] font-bold tracking-widest ${active ? "text-white" : "text-[#555]"}`}>
              {tab.label}
            </span>
            <span className={`font-sans text-[9px] mt-0.5 ${active ? "text-white/75" : "text-[#444]"}`}>
              {tab.sub}
            </span>
          </button>
        );
      })}
    </div>
  );
}
