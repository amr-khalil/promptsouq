"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useSignUp } from "@clerk/nextjs";
import type { OAuthStrategy } from "@clerk/types";
import { Facebook, Loader2, Mail } from "lucide-react";
import { LocaleLink } from "@/components/LocaleLink";
import { useTranslation } from "react-i18next";
import { useRouter } from "next/navigation";
import * as React from "react";

export default function SignUp() {
  const { t } = useTranslation(["auth", "common"]);
  const { isLoaded, signUp, setActive } = useSignUp();
  const [formData, setFormData] = React.useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    acceptTerms: false,
  });
  const [verifying, setVerifying] = React.useState(false);
  const [code, setCode] = React.useState("");
  const [error, setError] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const router = useRouter();

  // Handle sign-up form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isLoaded) return;

    setError("");

    if (formData.password !== formData.confirmPassword) {
      setError(t("auth:errors.passwordMismatch"));
      return;
    }

    if (!formData.acceptTerms) {
      setError(t("auth:errors.acceptTerms"));
      return;
    }

    setLoading(true);

    try {
      await signUp.create({
        emailAddress: formData.email,
        password: formData.password,
        firstName: formData.name.split(" ")[0],
        lastName: formData.name.split(" ").slice(1).join(" ") || undefined,
      });

      // Send email verification code
      await signUp.prepareEmailAddressVerification({
        strategy: "email_code",
      });

      setVerifying(true);
    } catch (err: unknown) {
      console.error(JSON.stringify(err, null, 2));
      const clerkErr = err as { errors?: Array<{ longMessage?: string; message?: string }> };
      setError(
        clerkErr.errors?.[0]?.longMessage ||
          clerkErr.errors?.[0]?.message ||
          t("auth:errors.signUpFailed"),
      );
    } finally {
      setLoading(false);
    }
  };

  // Handle email verification code
  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isLoaded) return;

    setError("");
    setLoading(true);

    try {
      const signUpAttempt = await signUp.attemptEmailAddressVerification({
        code,
      });

      if (signUpAttempt.status === "complete") {
        await setActive({
          session: signUpAttempt.createdSessionId,
          navigate: async ({ session }) => {
            if (session?.currentTask) {
              console.log(session?.currentTask);
              return;
            }
            router.push("/");
          },
        });
      } else {
        console.error("Sign-up attempt not complete:", signUpAttempt);
      }
    } catch (err: unknown) {
      console.error(JSON.stringify(err, null, 2));
      const clerkErr = err as { errors?: Array<{ longMessage?: string; message?: string }> };
      setError(
        clerkErr.errors?.[0]?.longMessage ||
          clerkErr.errors?.[0]?.message ||
          t("auth:errors.invalidCode"),
      );
    } finally {
      setLoading(false);
    }
  };

  // Handle OAuth sign-up (Google / Facebook)
  const signUpWith = (strategy: OAuthStrategy) => {
    if (!signUp) return;
    signUp
      .authenticateWithRedirect({
        strategy,
        redirectUrl: "/sign-up/sso-callback",
        redirectUrlComplete: "/",
      })
      .catch((err: unknown) => {
        console.error(JSON.stringify(err, null, 2));
        setError(t("auth:errors.signUpFailed"));
      });
  };

  // Email verification UI
  if (verifying) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-md mx-auto">
          <Card>
            <CardHeader className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-600 to-blue-500 rounded-lg flex items-center justify-center mx-auto mb-4">
                <span className="text-white font-bold text-2xl">PS</span>
              </div>
              <CardTitle className="text-2xl">{t("auth:emailVerification.title")}</CardTitle>
              <CardDescription>
                {t("auth:emailVerification.sentTo")} {formData.email}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleVerify} className="space-y-4">
                <div>
                  <Label htmlFor="code">{t("auth:labels.verificationCode")}</Label>
                  <Input
                    id="code"
                    type="text"
                    inputMode="numeric"
                    placeholder={t("auth:placeholders.verificationCode")}
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    required
                    className="mt-1.5"
                  />
                </div>

                {error && (
                  <p className="text-sm text-destructive text-center">
                    {error}
                  </p>
                )}

                <Button type="submit" className="w-full" disabled={loading}>
                  {loading && <Loader2 className="ml-2 h-4 w-4 animate-spin" />}
                  {t("auth:buttons.verifyAndCreate")}
                </Button>
              </form>

              <div className="mt-4 text-center">
                <Button
                  variant="ghost"
                  onClick={() => {
                    setVerifying(false);
                    setCode("");
                    setError("");
                  }}
                >
                  {t("common:buttons.back")}
                </Button>
              </div>
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
            <CardTitle className="text-2xl">{t("auth:signUp.title")}</CardTitle>
            <CardDescription>
              {t("auth:signUp.subtitle")}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="name">{t("auth:labels.fullName")}</Label>
                <Input
                  id="name"
                  type="text"
                  placeholder={t("auth:placeholders.fullName")}
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  required
                  className="mt-1.5"
                />
              </div>

              <div>
                <Label htmlFor="email">{t("auth:labels.email")}</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="example@email.com"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  required
                  className="mt-1.5"
                />
              </div>

              <div>
                <Label htmlFor="password">{t("auth:labels.password")}</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                  required
                  className="mt-1.5"
                />
              </div>

              <div>
                <Label htmlFor="confirmPassword">{t("auth:labels.confirmPassword")}</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="••••••••"
                  value={formData.confirmPassword}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      confirmPassword: e.target.value,
                    })
                  }
                  required
                  className="mt-1.5"
                />
              </div>

              <div className="flex items-start gap-2">
                <Checkbox
                  id="terms"
                  checked={formData.acceptTerms}
                  onCheckedChange={(checked) =>
                    setFormData({
                      ...formData,
                      acceptTerms: checked as boolean,
                    })
                  }
                  required
                />
                <Label
                  htmlFor="terms"
                  className="text-sm leading-relaxed cursor-pointer"
                >
                  أوافق على{" "}
                  <a href="#" className="text-primary hover:underline">
                    {t("auth:links.terms")}
                  </a>{" "}
                  و
                  <a href="#" className="text-primary hover:underline">
                    {" "}
                    {t("auth:links.privacy")}
                  </a>
                </Label>
              </div>

              {error && (
                <p className="text-sm text-destructive text-center">{error}</p>
              )}

              {/* Required for Clerk's bot sign-up protection */}
              <div id="clerk-captcha" />

              <Button type="submit" className="w-full" disabled={loading}>
                {loading && <Loader2 className="ml-2 h-4 w-4 animate-spin" />}
                {t("auth:buttons.signUp")}
              </Button>
            </form>

            <div className="mt-6">
              <div className="relative">
                <Separator />
                <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-card px-2 text-sm text-muted-foreground">
                  {t("common:labels.or")}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 mt-6">
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => signUpWith("oauth_google")}
                  type="button"
                >
                  <Mail className="ml-2 h-4 w-4" />
                  Google
                </Button>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => signUpWith("oauth_facebook")}
                  type="button"
                >
                  <Facebook className="ml-2 h-4 w-4" />
                  Facebook
                </Button>
              </div>
            </div>

            <div className="mt-6 text-center text-sm">
              <span className="text-muted-foreground">{t("auth:signUp.haveAccount")} </span>
              <LocaleLink
                href="/sign-in"
                className="text-primary hover:underline font-bold"
              >
                {t("auth:links.signIn")}
              </LocaleLink>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
