"use client";

import { OnboardingWizard } from "@/components/dashboard/OnboardingWizard";
import { useAuth } from "@/hooks/use-auth";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useTranslation } from "react-i18next";

export default function OnboardingPage() {
  const { user, isLoaded } = useAuth();
  const router = useRouter();
  const { i18n } = useTranslation();
  const locale = i18n.language;

  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!user) {
    router.push(`/${locale}/sign-in`);
    return null;
  }

  if (user.onboardingCompleted) {
    router.push(`/${locale}/dashboard`);
    return null;
  }

  return (
    <div className="py-8">
      <OnboardingWizard
        userId={user.id}
        firstName={user.firstName}
        lastName={user.lastName}
        avatarUrl={user.avatarUrl}
        onComplete={() => router.push(`/${locale}/dashboard`)}
      />
    </div>
  );
}
