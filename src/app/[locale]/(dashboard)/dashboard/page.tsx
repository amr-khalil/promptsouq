"use client";

import { LocaleLink } from "@/components/LocaleLink";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useUser } from "@clerk/nextjs";
import {
  Calendar,
  Clock,
  Heart,
  Mail,
  Pencil,
  Phone,
  Shield,
  ShoppingBag,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

function formatDate(date: Date | undefined | null, locale: string) {
  if (!date) return "—";
  return new Date(date).toLocaleDateString(locale === "ar" ? "ar-SA" : "en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function formatDateTime(date: Date | undefined | null, locale: string) {
  if (!date) return "—";
  return new Date(date).toLocaleDateString(locale === "ar" ? "ar-SA" : "en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function DashboardProfile() {
  const { user } = useUser();
  const { t, i18n } = useTranslation("dashboard");
  const locale = i18n.language;
  const [purchaseCount, setPurchaseCount] = useState<number | null>(null);
  const [favoriteCount, setFavoriteCount] = useState<number | null>(null);

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

  const hasPhone = !!user?.primaryPhoneNumber;
  const has2FA = !!user?.twoFactorEnabled;

  return (
    <div className="space-y-6">
      {/* Profile Header */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row items-start gap-4">
            <Avatar className="w-20 h-20 border-2 border-primary/20">
              <AvatarImage src={user?.imageUrl} />
              <AvatarFallback className="text-2xl">
                {user?.firstName?.charAt(0) ?? "U"}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h2 className="text-xl font-bold">
                    {user?.fullName || user?.firstName || t("sidebar.profile")}
                  </h2>
                  {user?.username && (
                    <p className="text-sm text-muted-foreground">
                      @{user.username}
                    </p>
                  )}
                </div>
                <Button variant="outline" size="sm" asChild>
                  <LocaleLink href="/dashboard/settings">
                    <Pencil className="h-3.5 w-3.5 me-1.5" />
                    {t("sidebar.settings")}
                  </LocaleLink>
                </Button>
              </div>

              <div className="flex flex-wrap gap-2 mt-3">
                {has2FA && (
                  <Badge variant="secondary" className="gap-1">
                    <Shield className="h-3 w-3" />
                    2FA
                  </Badge>
                )}
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
            <p className="text-2xl font-bold">{purchaseCount ?? "—"}</p>
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
            <p className="text-2xl font-bold">{favoriteCount ?? "—"}</p>
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
                {locale === "ar" ? "البريد الإلكتروني" : "Email"}
              </span>
              <span className="truncate">
                {user?.primaryEmailAddress?.emailAddress ?? "—"}
              </span>
            </div>

            {hasPhone && (
              <div className="flex items-center gap-3">
                <Phone className="h-4 w-4 text-muted-foreground shrink-0" />
                <span className="text-muted-foreground min-w-24">
                  {locale === "ar" ? "رقم الهاتف" : "Phone"}
                </span>
                <span>{user?.primaryPhoneNumber?.phoneNumber}</span>
              </div>
            )}

            <Separator />

            <div className="flex items-center gap-3">
              <Calendar className="h-4 w-4 text-muted-foreground shrink-0" />
              <span className="text-muted-foreground min-w-24">
                {locale === "ar" ? "تاريخ الانضمام" : "Joined"}
              </span>
              <span>{formatDate(user?.createdAt, locale)}</span>
            </div>

            <div className="flex items-center gap-3">
              <Clock className="h-4 w-4 text-muted-foreground shrink-0" />
              <span className="text-muted-foreground min-w-24">
                {locale === "ar" ? "آخر تسجيل دخول" : "Last sign in"}
              </span>
              <span>{formatDateTime(user?.lastSignInAt, locale)}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
