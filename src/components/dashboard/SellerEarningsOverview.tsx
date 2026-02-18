"use client";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { DollarSign, ShoppingCart, TrendingDown, TrendingUp } from "lucide-react";
import Link from "next/link";
import { useTranslation } from "react-i18next";

interface EarningsSummary {
  totalSales: number;
  grossRevenue: number;
  totalCommission: number;
  netEarnings: number;
  payoutsEnabled: boolean;
}

interface SellerEarningsOverviewProps {
  summary: EarningsSummary | null;
  loading: boolean;
}

function formatCurrency(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`;
}

export function SellerEarningsOverview({ summary, loading }: SellerEarningsOverviewProps) {
  const { t } = useTranslation("dashboard");

  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i}>
            <CardContent className="p-4">
              <Skeleton className="h-4 w-24 mb-2" />
              <Skeleton className="h-8 w-32" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (!summary) return null;

  const metrics = [
    {
      label: t("seller.earnings.totalSales"),
      value: summary.totalSales.toString(),
      icon: ShoppingCart,
      color: "text-blue-500",
    },
    {
      label: t("seller.earnings.grossRevenue"),
      value: formatCurrency(summary.grossRevenue),
      icon: DollarSign,
      color: "text-green-500",
    },
    {
      label: t("seller.earnings.commission"),
      value: formatCurrency(summary.totalCommission),
      icon: TrendingDown,
      color: "text-orange-500",
    },
    {
      label: t("seller.earnings.netEarnings"),
      value: formatCurrency(summary.netEarnings),
      icon: TrendingUp,
      color: "text-emerald-500",
    },
  ];

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {metrics.map((metric) => (
          <Card key={metric.label}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-muted-foreground">{metric.label}</span>
                <metric.icon className={`h-4 w-4 ${metric.color}`} />
              </div>
              <p className="text-2xl font-bold">{metric.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Payout status */}
      <div className="flex items-center gap-2">
        {summary.payoutsEnabled ? (
          <Badge variant="outline" className="border-green-500 text-green-700 dark:text-green-400">
            {t("seller.earnings.payoutsEnabled")}
          </Badge>
        ) : (
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="border-yellow-500 text-yellow-700 dark:text-yellow-400">
              {t("seller.earnings.payoutsDisabled")}
            </Badge>
            <Link href="/sell" className="text-sm text-primary underline">
              {t("seller.earnings.setupPayouts")}
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
