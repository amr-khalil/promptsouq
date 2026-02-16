"use client";

import { BillingCycleToggle } from "@/components/subscription/BillingCycleToggle";
import { PricingCard } from "@/components/subscription/PricingCard";
import { TopupPackCard } from "@/components/subscription/TopupPackCard";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Coins, Loader2, Settings } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

type BillingCycle = "monthly" | "six_month" | "yearly";

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

interface PackData {
  id: string;
  credits: number;
  price: number;
}

interface SubscriptionData {
  planId: string;
  planNameAr: string;
  status: string;
  currentPeriodEnd: string | null;
  cancelAtPeriodEnd: boolean;
}

interface CreditData {
  subscription: number;
  topup: number;
  total: number;
}

interface SubscriptionPageClientProps {
  plans: PlanData[];
  packs: PackData[];
}

export function SubscriptionPageClient({ plans, packs }: SubscriptionPageClientProps) {
  const [selectedCycle, setSelectedCycle] = useState<BillingCycle>("monthly");
  const [loadingPlanId, setLoadingPlanId] = useState<string | null>(null);
  const [loadingPackId, setLoadingPackId] = useState<string | null>(null);
  const [currentPlanId, setCurrentPlanId] = useState<string | null>(null);
  const [subscriptionData, setSubscriptionData] = useState<SubscriptionData | null>(null);
  const [credits, setCredits] = useState<CreditData | null>(null);
  const [isManaging, setIsManaging] = useState(false);
  const searchParams = useSearchParams();
  const toastShown = useRef(false);

  // Show toast on redirect from Stripe (once)
  useEffect(() => {
    if (toastShown.current) return;
    if (searchParams.get("success") === "true") {
      toast.success("تم الاشتراك بنجاح!");
      toastShown.current = true;
    } else if (searchParams.get("canceled") === "true") {
      toast.info("تم إلغاء عملية الدفع");
      toastShown.current = true;
    }
  }, [searchParams]);

  // Fetch subscription status — poll on success redirect
  useEffect(() => {
    const isSuccess = searchParams.get("success") === "true";
    let attempts = 0;
    let timer: ReturnType<typeof setTimeout>;
    let cancelled = false;

    async function fetchStatus() {
      try {
        const res = await fetch("/api/subscription/status");
        if (!res.ok || cancelled) return;
        const json = await res.json();

        if (json.subscription?.planId) {
          setCurrentPlanId(json.subscription.planId);
          setSubscriptionData(json.subscription);
        }
        if (json.credits) {
          setCredits(json.credits);
        }

        // If success redirect but no subscription data yet, retry
        if (isSuccess && !json.subscription?.planId && attempts < 5 && !cancelled) {
          attempts++;
          timer = setTimeout(fetchStatus, 2000);
        }
      } catch {
        // User might not be logged in
      }
    }

    fetchStatus();

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [searchParams]);

  const hasActiveSubscription = !!subscriptionData && subscriptionData.status === "active";

  async function handleSubscribe(planId: string) {
    setLoadingPlanId(planId);

    try {
      const res = await fetch("/api/subscription/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ planId, billingCycle: selectedCycle }),
      });

      const json = await res.json();

      if (res.status === 409) {
        toast.error("لديك اشتراك بالفعل");
        return;
      }

      if (!res.ok) {
        toast.error(json.error ?? "حدث خطأ غير متوقع");
        return;
      }

      if (json.url) {
        window.location.href = json.url;
      }
    } catch {
      toast.error("حدث خطأ في الاتصال بالخادم");
    } finally {
      setLoadingPlanId(null);
    }
  }

  async function handleTopup(packId: string) {
    setLoadingPackId(packId);
    try {
      const res = await fetch("/api/credits/topup/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ packId }),
      });
      const json = await res.json();
      if (!res.ok) {
        toast.error(json.error ?? "حدث خطأ غير متوقع");
        return;
      }
      if (json.url) {
        window.location.href = json.url;
      }
    } catch {
      toast.error("حدث خطأ في الاتصال بالخادم");
    } finally {
      setLoadingPackId(null);
    }
  }

  async function handleManageSubscription() {
    setIsManaging(true);
    try {
      const res = await fetch("/api/subscription/manage", {
        method: "POST",
      });
      const json = await res.json();
      if (res.ok && json.url) {
        window.location.href = json.url;
      } else {
        toast.error(json.error ?? "حدث خطأ غير متوقع");
      }
    } catch {
      toast.error("حدث خطأ في الاتصال بالخادم");
    } finally {
      setIsManaging(false);
    }
  }

  return (
    <div className="container mx-auto px-4 py-12">
      {/* Page Header */}
      <div className="mb-10 text-center">
        <h1 className="text-3xl font-bold md:text-4xl">ترقية حسابك</h1>
        <p className="text-muted-foreground mt-3 text-lg">
          اختر الخطة المناسبة واحصل على رصيد شهري لتحميل أفضل البرومبتات
        </p>
      </div>

      {/* Active Subscription Banner */}
      {hasActiveSubscription && (
        <div className="mx-auto mb-10 max-w-2xl">
          <Card className="border-primary/20 bg-primary/5">
            <CardContent className="flex flex-col items-center gap-4 p-6 sm:flex-row sm:justify-between">
              <div className="text-center sm:text-start">
                <p className="text-lg font-bold">
                  {subscriptionData.planNameAr}
                </p>
                <div className="text-muted-foreground mt-1 flex items-center justify-center gap-1.5 text-sm sm:justify-start">
                  <Coins className="h-4 w-4" />
                  <span>
                    الرصيد المتبقي:{" "}
                    <span className="text-foreground font-semibold">
                      {credits?.total ?? 0}
                    </span>{" "}
                    رصيد
                  </span>
                </div>
                {subscriptionData.currentPeriodEnd && (
                  <p className="text-muted-foreground mt-1 text-sm">
                    التجديد:{" "}
                    {new Date(subscriptionData.currentPeriodEnd).toLocaleDateString("ar-SA")}
                  </p>
                )}
              </div>
              <Button
                variant="outline"
                onClick={handleManageSubscription}
                disabled={isManaging}
              >
                {isManaging ? (
                  <>
                    <Loader2 className="ml-2 h-4 w-4 animate-spin" />
                    جارٍ التحميل...
                  </>
                ) : (
                  <>
                    <Settings className="ml-2 h-4 w-4" />
                    إدارة الاشتراك
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Billing Cycle Toggle */}
      <div className="mb-10 flex justify-center">
        <BillingCycleToggle
          selectedCycle={selectedCycle}
          onCycleChange={setSelectedCycle}
        />
      </div>

      {/* Pricing Cards Grid */}
      <div className="mx-auto grid max-w-5xl grid-cols-1 gap-6 lg:grid-cols-3">
        {plans.map((plan) => (
          <PricingCard
            key={plan.id}
            plan={plan}
            billingCycle={selectedCycle}
            currentPlanId={currentPlanId}
            hasActiveSubscription={hasActiveSubscription}
            onSubscribe={handleSubscribe}
            onUpgrade={handleManageSubscription}
            isLoading={loadingPlanId === plan.id}
            isUpgrading={isManaging}
          />
        ))}
      </div>

      {/* Top-up Packs Section */}
      {packs.length > 0 && (
        <div id="topup" className="mt-16">
          <div className="mb-8 text-center">
            <h2 className="text-2xl font-bold">رصيد إضافي</h2>
            <p className="text-muted-foreground mt-2">
              اشترِ رصيداً إضافياً لاستخدامه في التوليد
            </p>
          </div>
          <div className="mx-auto grid max-w-3xl grid-cols-1 gap-4 sm:grid-cols-3">
            {packs.map((pack) => (
              <TopupPackCard
                key={pack.id}
                pack={pack}
                onPurchase={handleTopup}
                isLoading={loadingPackId === pack.id}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
