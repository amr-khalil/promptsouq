"use client";

import { cn } from "@/lib/utils";
import { useTranslation } from "react-i18next";

type BillingCycle = "monthly" | "six_month" | "yearly";

interface BillingCycleToggleProps {
  selectedCycle: BillingCycle;
  onCycleChange: (cycle: BillingCycle) => void;
}

export function BillingCycleToggle({
  selectedCycle,
  onCycleChange,
}: BillingCycleToggleProps) {
  const { t } = useTranslation("subscription");
  const cycles = [
    { value: "monthly" as const, label: t("billing.monthly") },
    { value: "six_month" as const, label: t("billing.sixMonths") },
    { value: "yearly" as const, label: t("billing.yearly") },
  ];

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
