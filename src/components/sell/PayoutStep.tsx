"use client";

import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { CheckCircle, ExternalLink, Loader2 } from "lucide-react";
import { useCallback, useEffect, useState } from "react";

interface ConnectStatus {
  hasAccount: boolean;
  chargesEnabled: boolean;
  payoutsEnabled: boolean;
  detailsSubmitted: boolean;
  isFullyOnboarded: boolean;
}

const countries = [
  { code: "SA", name: "المملكة العربية السعودية" },
  { code: "AE", name: "الإمارات العربية المتحدة" },
  { code: "EG", name: "مصر" },
  { code: "JO", name: "الأردن" },
  { code: "KW", name: "الكويت" },
  { code: "BH", name: "البحرين" },
  { code: "QA", name: "قطر" },
  { code: "OM", name: "عمان" },
  { code: "MA", name: "المغرب" },
  { code: "TN", name: "تونس" },
  { code: "US", name: "الولايات المتحدة" },
  { code: "GB", name: "المملكة المتحدة" },
  { code: "DE", name: "ألمانيا" },
  { code: "FR", name: "فرنسا" },
];

export function PayoutStep() {
  const [status, setStatus] = useState<ConnectStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [connecting, setConnecting] = useState(false);
  const [country, setCountry] = useState("");

  const fetchStatus = useCallback(async () => {
    try {
      const res = await fetch("/api/connect/status");
      const json = await res.json();
      setStatus(json.data);
    } catch {
      // Ignore — will show default not-connected state
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStatus();
  }, [fetchStatus]);

  const handleCreateAccount = async () => {
    if (!country) return;
    setConnecting(true);
    try {
      const res = await fetch("/api/connect/create-account", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ country }),
      });
      const json = await res.json();
      if (json.data?.onboardingUrl) {
        window.location.href = json.data.onboardingUrl;
      }
    } catch {
      setConnecting(false);
    }
  };

  const handleCompleteOnboarding = async () => {
    setConnecting(true);
    try {
      const res = await fetch("/api/connect/onboarding-link", {
        method: "POST",
      });
      const json = await res.json();
      if (json.data?.url) {
        window.location.href = json.data.url;
      }
    } catch {
      setConnecting(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-32 w-full" />
      </div>
    );
  }

  // Fully onboarded
  if (status?.isFullyOnboarded) {
    return (
      <div className="flex flex-col items-center gap-4 py-8">
        <CheckCircle className="h-16 w-16 text-green-500" />
        <h3 className="text-xl font-semibold">تم ربط حساب Stripe</h3>
        <p className="text-muted-foreground text-center">
          حسابك جاهز لاستقبال المدفوعات. يمكنك المتابعة لرفع البرومبت.
        </p>
      </div>
    );
  }

  // Has account but not fully onboarded
  if (status?.hasAccount) {
    return (
      <div className="flex flex-col items-center gap-4 py-8">
        <div className="rounded-full bg-yellow-100 p-4 dark:bg-yellow-900/30">
          <ExternalLink className="h-8 w-8 text-yellow-600 dark:text-yellow-400" />
        </div>
        <h3 className="text-xl font-semibold">إكمال إعداد Stripe</h3>
        <p className="text-muted-foreground text-center">
          تم إنشاء حسابك لكن يجب إكمال عملية الإعداد لبدء استقبال المدفوعات.
        </p>
        <Button onClick={handleCompleteOnboarding} disabled={connecting}>
          {connecting && <Loader2 className="h-4 w-4 animate-spin me-2" />}
          إكمال الإعداد
        </Button>
      </div>
    );
  }

  // No account — show setup form
  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h3 className="text-xl font-semibold">تفعيل المدفوعات</h3>
        <p className="text-muted-foreground">
          اربط حساب Stripe لبدء استقبال المدفوعات من مبيعات البرومبتات
        </p>
      </div>

      <div className="mx-auto max-w-sm space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">بلد الإقامة</label>
          <Select value={country} onValueChange={setCountry}>
            <SelectTrigger>
              <SelectValue placeholder="اختر البلد" />
            </SelectTrigger>
            <SelectContent>
              {countries.map((c) => (
                <SelectItem key={c.code} value={c.code}>
                  {c.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Button
          className="w-full"
          onClick={handleCreateAccount}
          disabled={!country || connecting}
        >
          {connecting && <Loader2 className="h-4 w-4 animate-spin me-2" />}
          تفعيل المدفوعات
        </Button>
      </div>

      <div className="rounded-lg border p-4 space-y-2 text-sm">
        <p className="font-medium">معلومات المدفوعات:</p>
        <ul className="space-y-1 text-muted-foreground list-disc list-inside">
          <li>بيع عبر رابطك الخاص — بدون عمولة (0%)</li>
          <li>بيع عبر السوق — عمولة 20%</li>
          <li>الدفعات عبر Stripe بشكل آمن</li>
        </ul>
      </div>
    </div>
  );
}
