"use client";

import { LocaleLink } from "@/components/LocaleLink";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createClient } from "@/lib/supabase/client";
import { Loader2 } from "lucide-react";
import * as React from "react";
import { useTranslation } from "react-i18next";

export default function ForgotPassword() {
  const { t } = useTranslation(["auth", "common"]);
  const [email, setEmail] = React.useState("");
  const [sent, setSent] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState("");
  const supabase = createClient();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(
        email,
        {
          redirectTo: `${window.location.origin}/auth/confirm?next=/reset-password`,
        },
      );

      if (resetError) {
        setError(resetError.message);
        return;
      }

      // Always show success to prevent email enumeration
      setSent(true);
    } catch {
      setError(t("auth:errors.resetFailed"));
    } finally {
      setLoading(false);
    }
  };

  if (sent) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-md mx-auto">
          <Card>
            <CardHeader className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-600 to-blue-500 rounded-lg flex items-center justify-center mx-auto mb-4">
                <span className="text-white font-bold text-2xl">PS</span>
              </div>
              <CardTitle className="text-2xl">
                {t("auth:forgotPassword.emailSent")}
              </CardTitle>
              <CardDescription>
                {t("auth:forgotPassword.emailSentDescription")}
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <LocaleLink
                href="/sign-in"
                className="text-sm text-primary hover:underline"
              >
                {t("auth:links.backToSignIn")}
              </LocaleLink>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-md mx-auto">
        <Card>
          <CardHeader className="text-center">
            <div className="w-16 h-16 bg-gradient-to-br from-purple-600 to-blue-500 rounded-lg flex items-center justify-center mx-auto mb-4">
              <span className="text-white font-bold text-2xl">PS</span>
            </div>
            <CardTitle className="text-2xl">
              {t("auth:forgotPassword.title")}
            </CardTitle>
            <CardDescription>
              {t("auth:forgotPassword.subtitle")}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="email">{t("auth:labels.email")}</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="example@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="mt-1.5"
                />
              </div>

              {error && (
                <p className="text-sm text-destructive text-center">{error}</p>
              )}

              <Button type="submit" className="w-full" disabled={loading}>
                {loading && (
                  <Loader2 className="ml-2 h-4 w-4 animate-spin" />
                )}
                {t("auth:buttons.sendResetLink")}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <LocaleLink
                href="/sign-in"
                className="text-sm text-primary hover:underline"
              >
                {t("auth:links.backToSignIn")}
              </LocaleLink>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
