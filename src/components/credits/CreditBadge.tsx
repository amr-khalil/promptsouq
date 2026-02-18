"use client";

import { useCredits } from "@/hooks/use-credits";
import { Button } from "@/components/ui/button";
import { Coins } from "lucide-react";
import { LocaleLink } from "@/components/LocaleLink";

export function CreditBadge() {
  const { total, isLoading } = useCredits();

  if (isLoading) {
    return (
      <Button variant="ghost" size="icon" className="relative" disabled>
        <Coins className="h-5 w-5 animate-pulse" />
      </Button>
    );
  }

  return (
    <Button variant="ghost" size="icon" asChild className="relative">
      <LocaleLink href="/dashboard/credits">
        <Coins className="h-5 w-5" />
        <span className="absolute -top-1 -end-1 bg-primary text-primary-foreground text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
          {total}
        </span>
      </LocaleLink>
    </Button>
  );
}
