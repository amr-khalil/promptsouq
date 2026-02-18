"use client";

import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertTriangle, CheckCircle } from "lucide-react";
import { useTranslation } from "react-i18next";

interface PaymentBadgeProps {
  isActivated: boolean;
  isLoading: boolean;
  onGoToSetup?: () => void;
}

export function PaymentBadge({
  isActivated,
  isLoading,
  onGoToSetup,
}: PaymentBadgeProps) {
  const { t } = useTranslation("sell");

  if (isLoading) {
    return <Skeleton className="h-7 w-40" />;
  }

  if (isActivated) {
    return (
      <Badge variant="outline" className="gap-1.5 border-green-500/30 bg-green-500/10 text-green-700 dark:text-green-400">
        <CheckCircle className="h-3.5 w-3.5" />
        {t("paymentBadge.activated")}
      </Badge>
    );
  }

  return (
    <button type="button" onClick={onGoToSetup} className="inline-flex">
      <Badge variant="outline" className="gap-1.5 border-yellow-500/30 bg-yellow-500/10 text-yellow-700 dark:text-yellow-400 cursor-pointer hover:bg-yellow-500/20">
        <AlertTriangle className="h-3.5 w-3.5" />
        {t("paymentBadge.notActivated")}
      </Badge>
    </button>
  );
}
