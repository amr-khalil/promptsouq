"use client";

import { LocaleLink } from "@/components/LocaleLink";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/hooks/use-auth";
import {
  Calendar,
  Clock,
  Heart,
  Mail,
  Pencil,
  ShoppingBag,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

function formatDate(date: string | undefined | null, locale: string) {
  if (!date) return "\u2014";
  return new Date(date).toLocaleDateString(locale === "ar" ? "ar-SA" : "en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function formatDateTime(date: string | undefined | null, locale: string) {
  if (!date) return "\u2014";
  return new Date(date).toLocaleDateString(locale === "ar" ? "ar-SA" : "en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function DashboardProfile() {
  const { user, isLoaded } = useAuth();
  const { t, i18n } = useTranslation("dashboard");
  const locale = i18n.language;
  const router = useRouter();
  const [purchaseCount, setPurchaseCount] = useState<number | null>(null);
  const [favoriteCount, setFavoriteCount] = useState<number | null>(null);

  // Redirect to onboarding if not completed
  useEffect(() => {
    if (isLoaded && user && !user.onboardingCompleted) {
      router.push(`/${locale}/dashboard/onboarding`);
    }
  }, [isLoaded, user, locale, router]);

  useEffect(() => {
    fetch("/api/user/purchases")
      .then((res) => res.json())
      .then((json) => setPurchaseCount(json.data?.length ?? 0))
      .catch(() => setPurchaseCount(0));

    fetch("/api/favorites")
      .then((res) => res.json())
      .then((json) => setFavoriteCount(json.data?.length ?? 0))
      .catch(() => setFavoriteCount(0));
  }, []);

  return (
    <div className="space-y-6">
      {/* Profile Header */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row items-start gap-4">
            <Avatar className="w-20 h-20 border-2 border-primary/20">
              <AvatarImage src={user?.avatarUrl ?? undefined} />
              <AvatarFallback className="text-2xl">
                {user?.firstName?.charAt(0) ?? "U"}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h2 className="text-xl font-bold">
                    {user?.displayName || user?.firstName || t("sidebar.profile")}
                  </h2>
                </div>
                <Button variant="outline" size="sm" asChild>
                  <LocaleLink href="/dashboard/settings">
                    <Pencil className="h-3.5 w-3.5 me-1.5" />
                    {t("sidebar.settings")}
                  </LocaleLink>
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <ShoppingBag className="h-4 w-4" />
              {t("sidebar.purchases")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{purchaseCount ?? "\u2014"}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <Heart className="h-4 w-4" />
              {t("sidebar.favorites")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{favoriteCount ?? "\u2014"}</p>
          </CardContent>
        </Card>
      </div>

      {/* Account Details */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">
            {t("sidebar.account")}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-3 text-sm">
            <div className="flex items-center gap-3">
              <Mail className="h-4 w-4 text-muted-foreground shrink-0" />
              <span className="text-muted-foreground min-w-24">
                {locale === "ar" ? "\u0627\u0644\u0628\u0631\u064a\u062f \u0627\u0644\u0625\u0644\u0643\u062a\u0631\u0648\u0646\u064a" : "Email"}
              </span>
              <span className="truncate">
                {user?.email ?? "\u2014"}
              </span>
            </div>

            <Separator />

            <div className="flex items-center gap-3">
              <Calendar className="h-4 w-4 text-muted-foreground shrink-0" />
              <span className="text-muted-foreground min-w-24">
                {locale === "ar" ? "\u062a\u0627\u0631\u064a\u062e \u0627\u0644\u0627\u0646\u0636\u0645\u0627\u0645" : "Joined"}
              </span>
              <span>{formatDate(user?.createdAt, locale)}</span>
            </div>

            <div className="flex items-center gap-3">
              <Clock className="h-4 w-4 text-muted-foreground shrink-0" />
              <span className="text-muted-foreground min-w-24">
                {locale === "ar" ? "\u0622\u062e\u0631 \u062a\u0633\u062c\u064a\u0644 \u062f\u062e\u0648\u0644" : "Last sign in"}
              </span>
              <span>{formatDateTime(user?.lastSignInAt, locale)}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
