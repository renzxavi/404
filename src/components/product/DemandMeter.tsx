// src/components/product/DemandMeter.tsx
interface DemandMeterProps {
  value: number;
  market: string;
}

export default function DemandMeter({ value, market }: DemandMeterProps) {
  const radius = 20;
  const circ = 2 * Math.PI * radius;
  const offset = circ - (value / 100) * circ;

  return (
    <div className="flex items-center gap-3">
      <div className="relative w-12 h-12 flex items-center justify-center">
        <svg width="48" height="48" className="-rotate-90">
          <circle cx="24" cy="24" r={radius} fill="none" stroke="currentColor" strokeWidth="4" className="text-border" />
          <circle
            cx="24" cy="24" r={radius} fill="none"
            stroke="var(--color-lime)" strokeWidth="4" strokeLinecap="round"
            strokeDasharray={circ} strokeDashoffset={offset}
            className="transition-all duration-700 ease-out"
          />
        </svg>
      </div>
      <div>
        <p className="text-xl font-[family-name:var(--font-syne)] font-bold leading-none">{value}%</p>
        <p className="text-xs text-muted-foreground mt-0.5">demanda</p>
        <p className="text-xs text-muted-foreground">{market}</p>
      </div>
    </div>
  );
}