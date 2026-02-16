"use client";

import { cn } from "@/lib/utils";

const cycles = [
  { value: "monthly", label: "شهري" },
  { value: "six_month", label: "6 أشهر" },
  { value: "yearly", label: "سنوي" },
] as const;

type BillingCycle = "monthly" | "six_month" | "yearly";

interface BillingCycleToggleProps {
  selectedCycle: BillingCycle;
  onCycleChange: (cycle: BillingCycle) => void;
}

export function BillingCycleToggle({
  selectedCycle,
  onCycleChange,
}: BillingCycleToggleProps) {
  return (
    <div className="inline-flex items-center rounded-full bg-muted p-1 gap-1">
      {cycles.map((cycle) => (
        <button
          key={cycle.value}
          type="button"
          onClick={() => onCycleChange(cycle.value)}
          className={cn(
            "rounded-full px-4 py-2 text-sm font-medium transition-all duration-200 md:px-6 md:py-2.5 md:text-base",
            selectedCycle === cycle.value
              ? "bg-primary text-primary-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground",
          )}
        >
          {cycle.label}
        </button>
      ))}
    </div>
  );
}
