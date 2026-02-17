"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { Coins, CreditCard, Loader2, Settings, Sparkles } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { toast } from "sonner";

interface SubscriptionStatus {
  subscription: {
    planId: string;
    planName: string;
    planNameAr: string;
    status: string;
    billingCycle: string;
    currentPeriodEnd: string;
    cancelAtPeriodEnd: boolean;
  } | null;
  credits: {
    subscription: number;
    topup: number;
    total: number;
  };
}

interface Transaction {
  id: string;
  type: string;
  amount: number;
  balanceAfter: number;
  description: string;
  createdAt: string;
}

const typeLabels: Record<string, string> = {
  subscription_grant: "منح اشتراك",
  subscription_reset: "إعادة تعيين",
  topup_grant: "شراء رصيد",
  generation_deduction: "استخدام توليد",
  generation_refund: "استرداد توليد",
};

const typeBadgeVariant: Record<
  string,
  "default" | "secondary" | "destructive" | "outline"
> = {
  subscription_grant: "default",
  subscription_reset: "secondary",
  topup_grant: "default",
  generation_deduction: "destructive",
  generation_refund: "outline",
};

export default function CreditsPage() {
  const [status, setStatus] = useState<SubscriptionStatus | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [transactionsTotal, setTransactionsTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [txLoading, setTxLoading] = useState(true);
  const [error, setError] = useState("");
  const [isManaging, setIsManaging] = useState(false);

  useEffect(() => {
    async function fetchStatus() {
      try {
        const res = await fetch("/api/subscription/status");
        if (!res.ok) throw new Error("فشل في تحميل حالة الاشتراك");
        const json = await res.json();
        setStatus(json);
      } catch {
        setError("حدث خطأ أثناء تحميل بيانات الرصيد");
      } finally {
        setLoading(false);
      }
    }
    fetchStatus();
  }, []);

  useEffect(() => {
    async function fetchTransactions() {
      try {
        const res = await fetch("/api/credits/transactions?limit=20&offset=0");
        if (!res.ok) throw new Error("فشل في تحميل المعاملات");
        const json = await res.json();
        setTransactions(json.data);
        setTransactionsTotal(json.total);
      } catch {
        // Silently fail — table just shows empty
      } finally {
        setTxLoading(false);
      }
    }
    fetchTransactions();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <div className="grid gap-4 sm:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-4 w-24" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-16" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-destructive mb-4">{error}</p>
        <Button onClick={() => window.location.reload()}>
          إعادة المحاولة
        </Button>
      </div>
    );
  }

  const credits = status?.credits ?? { subscription: 0, topup: 0, total: 0 };
  const subscription = status?.subscription;
  const maxCredits = credits.subscription + credits.topup || 1;
  const progressValue = (credits.total / maxCredits) * 100;

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold">الرصيد والاشتراك</h2>

      {/* Credit balance cards */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              رصيد الاشتراك
            </CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{credits.subscription}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">رصيد مشترى</CardTitle>
            <Coins className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{credits.topup}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              الرصيد الإجمالي
            </CardTitle>
            <Sparkles className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{credits.total}</div>
            <Progress value={progressValue} className="mt-2" />
          </CardContent>
        </Card>
      </div>

      {/* Subscription plan info */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium">خطة الاشتراك</CardTitle>
        </CardHeader>
        <CardContent>
          {subscription ? (
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="space-y-1">
                <p className="text-lg font-bold">{subscription.planNameAr}</p>
                <p className="text-sm text-muted-foreground">
                  دورة الفوترة:{" "}
                  {subscription.billingCycle === "monthly"
                    ? "شهرية"
                    : "سنوية"}
                </p>
                {subscription.currentPeriodEnd && (
                  <p className="text-sm text-muted-foreground">
                    ينتهي في:{" "}
                    {new Date(subscription.currentPeriodEnd).toLocaleDateString(
                      "ar-SA"
                    )}
                  </p>
                )}
                {subscription.cancelAtPeriodEnd && (
                  <Badge variant="destructive" className="mt-1">
                    سيتم الإلغاء عند انتهاء الفترة
                  </Badge>
                )}
              </div>
              <Button
                variant="outline"
                disabled={isManaging}
                onClick={async () => {
                  setIsManaging(true);
                  try {
                    const res = await fetch("/api/subscription/manage", {
                      method: "POST",
                    });
                    const json = await res.json();
                    if (res.ok && json.url) {
                      window.location.href = json.url;
                    } else {
                      toast.error(json.error ?? "حدث خطأ");
                    }
                  } catch {
                    toast.error("حدث خطأ في الاتصال");
                  } finally {
                    setIsManaging(false);
                  }
                }}
              >
                {isManaging ? (
                  <Loader2 className="ml-2 h-4 w-4 animate-spin" />
                ) : (
                  <Settings className="ml-2 h-4 w-4" />
                )}
                إدارة الاشتراك
              </Button>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-3 py-4 sm:flex-row sm:justify-between">
              <p className="text-muted-foreground">لا يوجد اشتراك نشط</p>
              <Button asChild>
                <Link href="/subscription">اشتراك الآن</Link>
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Transaction history */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium">
            سجل المعاملات
            {transactionsTotal > 0 && (
              <span className="text-muted-foreground font-normal mr-2">
                ({transactionsTotal})
              </span>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {txLoading ? (
            <div className="space-y-3">
              {[1, 2, 3, 4, 5].map((i) => (
                <Skeleton key={i} className="h-10 w-full" />
              ))}
            </div>
          ) : transactions.length === 0 ? (
            <div className="text-center py-8">
              <Coins className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
              <p className="text-muted-foreground">لا توجد معاملات بعد</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-muted-foreground">
                    <th className="py-2 text-right font-medium">التاريخ</th>
                    <th className="py-2 text-right font-medium">النوع</th>
                    <th className="py-2 text-right font-medium">المبلغ</th>
                    <th className="py-2 text-right font-medium">
                      الرصيد بعدها
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.map((tx) => (
                    <tr key={tx.id} className="border-b last:border-0">
                      <td className="py-3">
                        {new Date(tx.createdAt).toLocaleDateString("ar-SA", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })}
                      </td>
                      <td className="py-3">
                        <Badge
                          variant={typeBadgeVariant[tx.type] ?? "secondary"}
                        >
                          {typeLabels[tx.type] ?? tx.type}
                        </Badge>
                      </td>
                      <td className="py-3">
                        <span
                          className={
                            tx.amount > 0
                              ? "text-green-600 font-medium"
                              : "text-red-600 font-medium"
                          }
                        >
                          {tx.amount > 0 ? `+${tx.amount}` : tx.amount}
                        </span>
                      </td>
                      <td className="py-3 font-medium">{tx.balanceAfter}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
