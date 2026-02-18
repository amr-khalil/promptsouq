"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  BarChart3,
  Clock,
  DollarSign,
  FileText,
  ShoppingCart,
  Users,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

interface TopPrompt {
  id: string;
  title: string;
  titleEn: string;
  sales: number;
  thumbnail: string;
  revenue: number;
}

interface StatsData {
  totalSales: number;
  totalRevenue: number;
  totalCommission: number;
  activeSellers: number;
  activePrompts: number;
  pendingPrompts: number;
  topPrompts: TopPrompt[];
}

function formatCurrency(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`;
}

export function AdminAnalyticsCards() {
  const { t } = useTranslation("dashboard");
  const [stats, setStats] = useState<StatsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      try {
        const res = await fetch("/api/admin/stats");
        if (!res.ok) throw new Error();
        const json = await res.json();
        setStats(json.data);
      } catch {
        setStats(null);
      } finally {
        setLoading(false);
      }
    }
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <h2 className="text-xl font-bold">{t("admin.analytics.title")}</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Card key={i}>
              <CardContent className="p-4">
                <Skeleton className="h-4 w-24 mb-2" />
                <Skeleton className="h-8 w-32" />
              </CardContent>
            </Card>
          ))}
        </div>
        <Skeleton className="h-5 w-48" />
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </div>
      </div>
    );
  }

  if (!stats) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <p className="text-muted-foreground">{t("admin.analytics.empty")}</p>
        </CardContent>
      </Card>
    );
  }

  const metrics = [
    {
      label: t("admin.analytics.totalSales"),
      value: stats.totalSales.toString(),
      icon: ShoppingCart,
      color: "text-blue-500",
    },
    {
      label: t("admin.analytics.totalRevenue"),
      value: formatCurrency(stats.totalRevenue),
      icon: DollarSign,
      color: "text-green-500",
    },
    {
      label: t("admin.analytics.totalCommission"),
      value: formatCurrency(stats.totalCommission),
      icon: BarChart3,
      color: "text-orange-500",
    },
    {
      label: t("admin.analytics.activeSellers"),
      value: stats.activeSellers.toString(),
      icon: Users,
      color: "text-purple-500",
    },
    {
      label: t("admin.analytics.activePrompts"),
      value: stats.activePrompts.toString(),
      icon: FileText,
      color: "text-cyan-500",
    },
    {
      label: t("admin.analytics.pendingPrompts"),
      value: stats.pendingPrompts.toString(),
      icon: Clock,
      color: "text-yellow-500",
    },
  ];

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold">{t("admin.analytics.title")}</h2>
      {/* Metric cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
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

      {/* Top 5 prompts */}
      {stats.topPrompts.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-lg font-semibold">{t("admin.analytics.topPrompts")}</h3>
          <div className="space-y-2">
            {stats.topPrompts.map((prompt, index) => (
              <Card key={prompt.id}>
                <CardContent className="p-4">
                  <div className="flex items-center gap-4">
                    <span className="text-2xl font-bold text-muted-foreground w-8 text-center">
                      {index + 1}
                    </span>
                    {prompt.thumbnail && (
                      <img
                        src={prompt.thumbnail}
                        alt=""
                        className="w-12 h-12 rounded object-cover shrink-0"
                      />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{prompt.title}</p>
                      <div className="flex items-center gap-3 text-sm text-muted-foreground">
                        <span>
                          {prompt.sales} {t("admin.analytics.sales")}
                        </span>
                        <span>{formatCurrency(prompt.revenue)}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
