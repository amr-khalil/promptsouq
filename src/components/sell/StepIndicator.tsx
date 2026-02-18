"use client";

import { cn } from "@/lib/utils";
import { Check } from "lucide-react";
import { useTranslation } from "react-i18next";

interface StepIndicatorProps {
  currentStep: number;
  isFree?: boolean;
  paymentActivated?: boolean;
}

export function StepIndicator({ currentStep, isFree = false, paymentActivated = false }: StepIndicatorProps) {
  const { t } = useTranslation("sell");

  // Paid: Payment → Details → Content. Free: Details → Content.
  const paidStepKeys = ["payout", "details", "content"] as const;
  const freeStepKeys = ["details", "content"] as const;
  const stepKeys = isFree ? freeStepKeys : paidStepKeys;

  return (
    <div className="flex items-center justify-center gap-2 sm:gap-4">
      {stepKeys.map((key, index) => {
        const stepNumber = index + 1;
        const isCompleted = stepNumber < currentStep;
        const isActive = stepNumber === currentStep;
        // Show green checkmark on payment step when activated (even if active)
        const isPaymentDone = !isFree && key === "payout" && paymentActivated;

        return (
          <div key={key} className="flex items-center gap-2 sm:gap-4">
            <div className="flex flex-col items-center gap-1">
              <div
                className={cn(
                  "flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium transition-colors sm:h-10 sm:w-10",
                  isPaymentDone &&
                    "bg-green-500 text-white",
                  !isPaymentDone && isCompleted &&
                    "bg-primary text-primary-foreground",
                  !isPaymentDone && isActive &&
                    "bg-primary text-primary-foreground ring-2 ring-primary/30 ring-offset-2 ring-offset-background",
                  !isPaymentDone && !isCompleted &&
                    !isActive &&
                    "bg-muted text-muted-foreground",
                )}
              >
                {isPaymentDone || isCompleted ? (
                  <Check className="h-4 w-4" />
                ) : (
                  stepNumber
                )}
              </div>
              <span
                className={cn(
                  "text-xs font-medium hidden sm:block",
                  isActive
                    ? "text-foreground"
                    : "text-muted-foreground",
                )}
              >
                {t(`steps.${key}`)}
              </span>
            </div>
            {index < stepKeys.length - 1 && (
              <div
                className={cn(
                  "h-px w-6 sm:w-12",
                  stepNumber < currentStep
                    ? "bg-primary"
                    : "bg-muted",
                )}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
