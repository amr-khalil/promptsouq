"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Coins, Loader2 } from "lucide-react";
import { useTranslation } from "react-i18next";

interface TopupPackCardProps {
  pack: {
    id: string;
    credits: number;
    price: number; // in cents
  };
  onPurchase: (packId: string) => void;
  isLoading?: boolean;
}

export function TopupPackCard({
  pack,
  onPurchase,
  isLoading,
}: TopupPackCardProps) {
  const { t } = useTranslation(["subscription", "common"]);
  const displayPrice = (pack.price / 100).toFixed(2).replace(/\.00$/, "");

  return (
    <Card className="transition-shadow duration-200 hover:shadow-lg">
      <CardContent className="flex flex-col items-center gap-4 p-6">
        {/* Icon */}
        <div className="rounded-full bg-amber-100 p-3 dark:bg-amber-900/30">
          <Coins className="h-6 w-6 text-amber-600 dark:text-amber-400" />
        </div>

        {/* Credits */}
        <div className="text-center">
          <span className="text-3xl font-bold">{pack.credits}</span>
          <span className="text-muted-foreground me-1 text-sm"> {t("subscription:labels.credits")}</span>
        </div>

        {/* Price */}
        <div className="text-center">
          <span className="text-2xl font-extrabold">${displayPrice}</span>
        </div>

        {/* Buy button */}
        <Button
          className="w-full"
          onClick={() => onPurchase(pack.id)}
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>{t("common:messages.loading")}</span>
            </>
          ) : (
            t("subscription:buttons.buy")
          )}
        </Button>
      </CardContent>
    </Card>
  );
}
