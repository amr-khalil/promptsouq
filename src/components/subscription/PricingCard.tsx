"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Check, Crown, Loader2, Sword, Zap } from "lucide-react";

interface PlanData {
  id: string;
  name: string;
  nameAr: string;
  monthlyCredits: number;
  monthlyPrice: number;
  sixMonthPrice: number;
  yearlyPrice: number;
  features: string[];
  theme: string;
  icon: string;
  sortOrder: number;
}

type BillingCycle = "monthly" | "six_month" | "yearly";

interface PricingCardProps {
  plan: PlanData;
  billingCycle: BillingCycle;
  currentPlanId?: string | null;
  hasActiveSubscription?: boolean;
  onSubscribe: (planId: string) => void;
  onUpgrade: () => void;
  isLoading?: boolean;
  isUpgrading?: boolean;
}

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Sword,
  Zap,
  Crown,
};

const themeStyles: Record<
  string,
  { gradient: string; button: string; badge: string }
> = {
  blue: {
    gradient: "from-blue-500 to-blue-600",
    button:
      "bg-blue-600 text-white hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600",
    badge: "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300",
  },
  green: {
    gradient: "from-emerald-500 to-emerald-600",
    button:
      "bg-emerald-600 text-white hover:bg-emerald-700 dark:bg-emerald-500 dark:hover:bg-emerald-600",
    badge:
      "bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300",
  },
  purple: {
    gradient: "from-purple-500 to-purple-600",
    button:
      "bg-purple-600 text-white hover:bg-purple-700 dark:bg-purple-500 dark:hover:bg-purple-600",
    badge:
      "bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300",
  },
};

const periodLabels: Record<BillingCycle, string> = {
  monthly: "/شهرياً",
  six_month: "/6 أشهر",
  yearly: "/سنوياً",
};

function getPriceForCycle(plan: PlanData, cycle: BillingCycle): number {
  switch (cycle) {
    case "monthly":
      return plan.monthlyPrice;
    case "six_month":
      return plan.sixMonthPrice;
    case "yearly":
      return plan.yearlyPrice;
  }
}

export function PricingCard({
  plan,
  billingCycle,
  currentPlanId,
  hasActiveSubscription,
  onSubscribe,
  onUpgrade,
  isLoading,
  isUpgrading,
}: PricingCardProps) {
  const IconComponent = iconMap[plan.icon] ?? Sword;
  const theme = themeStyles[plan.theme] ?? themeStyles.blue;
  const isCurrentPlan = currentPlanId === plan.id;
  const isPopular = plan.sortOrder === 1;
  const price = getPriceForCycle(plan, billingCycle);
  const displayPrice = (price / 100).toFixed(2).replace(/\.00$/, "");

  return (
    <Card
      className={cn(
        "relative flex flex-col overflow-hidden transition-shadow duration-200 hover:shadow-lg",
        isPopular && "ring-2 ring-primary",
      )}
    >
      {isPopular && (
        <div className="absolute top-4 start-4 z-10">
          <Badge variant="default">الأكثر شيوعاً</Badge>
        </div>
      )}

      {/* Themed gradient header */}
      <CardHeader className="p-0">
        <div
          className={cn(
            "bg-gradient-to-l p-6 text-white",
            theme.gradient,
            isPopular && "pt-12",
          )}
        >
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-white/20 p-2.5">
              <IconComponent className="h-6 w-6" />
            </div>
            <h3 className="text-xl font-bold">{plan.nameAr}</h3>
          </div>
        </div>
      </CardHeader>

      {/* Body */}
      <CardContent className="flex flex-1 flex-col gap-6 pt-6">
        {/* Credits */}
        <div className="text-center">
          <span className="text-3xl font-bold">{plan.monthlyCredits}</span>
          <span className="text-muted-foreground me-1 text-sm">
            {" "}
            رصيد / شهر
          </span>
        </div>

        {/* Price */}
        <div className="text-center">
          <span className="text-4xl font-extrabold">${displayPrice}</span>
          <span className="text-muted-foreground text-sm">
            {periodLabels[billingCycle]}
          </span>
        </div>

        {/* Features */}
        <ul className="flex flex-col gap-3">
          {(plan.features as string[]).map((feature) => (
            <li key={feature} className="flex items-start gap-2 text-sm">
              <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
              <span>{feature}</span>
            </li>
          ))}
        </ul>
      </CardContent>

      {/* Footer */}
      <CardFooter className="mt-auto">
        {isCurrentPlan ? (
          <Badge
            variant="secondary"
            className="w-full justify-center py-2.5 text-sm"
          >
            الخطة الحالية
          </Badge>
        ) : hasActiveSubscription ? (
          <Button
            variant="outline"
            className="w-full"
            onClick={onUpgrade}
            disabled={isUpgrading}
          >
            {isUpgrading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>جاري التحميل...</span>
              </>
            ) : (
              "ترقية"
            )}
          </Button>
        ) : (
          <Button
            className={cn("w-full", theme.button)}
            onClick={() => onSubscribe(plan.id)}
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>جاري التحميل...</span>
              </>
            ) : (
              "اشترك الآن"
            )}
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}
