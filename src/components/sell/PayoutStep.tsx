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
import { useTranslation } from "react-i18next";

interface ConnectStatus {
  hasAccount: boolean;
  chargesEnabled: boolean;
  payoutsEnabled: boolean;
  detailsSubmitted: boolean;
  isFullyOnboarded: boolean;
}

const countryCodes = [
  "SA", "AE", "EG", "JO", "KW", "BH", "QA", "OM", "MA", "TN", "US", "GB", "DE", "FR",
] as const;

interface PayoutStepProps {
  onPaymentActivated?: () => void;
}

export function PayoutStep({ onPaymentActivated }: PayoutStepProps) {
  const { t } = useTranslation("sell");
  const [status, setStatus] = useState<ConnectStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [connecting, setConnecting] = useState(false);
  const [country, setCountry] = useState("");

  const fetchStatus = useCallback(async () => {
    try {
      const res = await fetch("/api/connect/status");
      const json = await res.json();
      const data = json.data as ConnectStatus | undefined;
      setStatus(data ?? null);
      if (data?.isFullyOnboarded) {
        onPaymentActivated?.();
      }
    } catch {
      // Ignore — will show default not-connected state
    } finally {
      setLoading(false);
    }
  }, [onPaymentActivated]);

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
        <h3 className="text-xl font-semibold">{t("payout.connected")}</h3>
        <p className="text-muted-foreground text-center">
          {t("payout.connectedDesc")}
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
        <h3 className="text-xl font-semibold">{t("payout.completeSetupTitle")}</h3>
        <p className="text-muted-foreground text-center">
          {t("payout.completeSetupDesc")}
        </p>
        <Button onClick={handleCompleteOnboarding} disabled={connecting}>
          {connecting && <Loader2 className="h-4 w-4 animate-spin me-2" />}
          {t("payout.completeSetup")}
        </Button>
      </div>
    );
  }

  // No account — show setup form
  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h3 className="text-xl font-semibold">{t("payout.title")}</h3>
        <p className="text-muted-foreground">
          {t("payout.subtitle")}
        </p>
      </div>

      <div className="mx-auto max-w-sm space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">{t("payout.country")}</label>
          <Select value={country} onValueChange={setCountry}>
            <SelectTrigger>
              <SelectValue placeholder={t("payout.countryPlaceholder")} />
            </SelectTrigger>
            <SelectContent>
              {countryCodes.map((code) => (
                <SelectItem key={code} value={code}>
                  {t(`payout.countries.${code}`)}
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
          {t("payout.enablePayments")}
        </Button>
      </div>

      <div className="rounded-lg border p-4 space-y-2 text-sm">
        <p className="font-medium">{t("payout.infoTitle")}</p>
        <ul className="space-y-1 text-muted-foreground list-disc list-inside">
          <li>{t("payout.infoPersonalLink")}</li>
          <li>{t("payout.infoMarketplace")}</li>
          <li>{t("payout.infoSecure")}</li>
        </ul>
      </div>
    </div>
  );
}
