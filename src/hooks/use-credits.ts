"use client";

import { useAuth } from "@/hooks/use-auth";
import { useCallback, useEffect, useState } from "react";

interface CreditBalance {
  subscription: number;
  topup: number;
  total: number;
}

export function useCredits() {
  const { isSignedIn, isLoaded } = useAuth();
  const [balance, setBalance] = useState<CreditBalance | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const refresh = useCallback(async () => {
    if (!isSignedIn) {
      setBalance(null);
      return;
    }
    setIsLoading(true);
    try {
      const res = await fetch("/api/credits/balance");
      if (res.ok) {
        const data = await res.json();
        setBalance(data);
      }
    } finally {
      setIsLoading(false);
    }
  }, [isSignedIn]);

  useEffect(() => {
    if (isLoaded && isSignedIn) {
      refresh();
    }
  }, [isLoaded, isSignedIn, refresh]);

  return {
    subscription: balance?.subscription ?? 0,
    topup: balance?.topup ?? 0,
    total: balance?.total ?? 0,
    isLoading,
    refresh,
  };
}
