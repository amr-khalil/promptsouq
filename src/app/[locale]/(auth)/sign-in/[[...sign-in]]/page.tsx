"use client";

import { OAuthButtons } from "@/components/auth/OAuthButtons";
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
import { Separator } from "@/components/ui/separator";
import { createClient } from "@/lib/supabase/client";
import { signInSchema, type SignInInput } from "@/lib/schemas/auth";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import * as React from "react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";

export default function SignIn() {
  const { t } = useTranslation(["auth", "common"]);
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createClient();
  const [serverError, setServerError] = React.useState("");

  // Show error from URL params (e.g., from callback failures)
  React.useEffect(() => {
    const urlError = searchParams.get("error");
    if (urlError === "auth-code-error") {
      setServerError(t("auth:errors.oauthFailed"));
    } else if (urlError === "verification-failed") {
      setServerError(t("auth:errors.verificationFailed"));
    }
  }, [searchParams, t]);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignInInput>({
    resolver: zodResolver(signInSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data: SignInInput) => {
    setServerError("");

    const { error } = await supabase.auth.signInWithPassword({
      email: data.email,
      password: data.password,
    });

    if (error) {
      if (error.message.includes("Email not confirmed")) {
        setServerError(t("auth:errors.emailNotVerified"));
      } else {
        setServerError(t("auth:errors.invalidCredentials"));
      }
      return;
    }

    router.push("/dashboard");
    router.refresh();
  };

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-md mx-auto">
        <Card>
          <CardHeader className="text-center">
            <div className="w-16 h-16 bg-gradient-to-br from-purple-600 to-blue-500 rounded-lg flex items-center justify-center mx-auto mb-4">
              <span className="text-white font-bold text-2xl">PS</span>
            </div>
            <CardTitle className="text-2xl">
              {t("auth:signIn.title")}
            </CardTitle>
            <CardDescription>{t("auth:signIn.subtitle")}</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <Label htmlFor="email">{t("auth:labels.email")}</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="example@email.com"
                  {...register("email")}
                  className="mt-1.5"
                />
                {errors.email && (
                  <p className="text-sm text-destructive mt-1">
                    {errors.email.message}
                  </p>
                )}
              </div>

              <div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">{t("auth:labels.password")}</Label>
                  <LocaleLink
                    href="/forgot-password"
                    className="text-sm text-primary hover:underline"
                  >
                    {t("auth:links.forgotPassword")}
                  </LocaleLink>
                </div>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  {...register("password")}
                  className="mt-1.5"
                />
                {errors.password && (
                  <p className="text-sm text-destructive mt-1">
                    {errors.password.message}
                  </p>
                )}
              </div>

              {serverError && (
                <p className="text-sm text-destructive text-center">
                  {serverError}
                </p>
              )}

              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting && (
                  <Loader2 className="ml-2 h-4 w-4 animate-spin" />
                )}
                {t("auth:buttons.signIn")}
              </Button>
            </form>

            <div className="mt-6">
              <div className="relative">
                <Separator />
                <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-card px-2 text-sm text-muted-foreground">
                  {t("common:labels.or")}
                </span>
              </div>

              <div className="mt-6">
                <OAuthButtons mode="sign-in" />
              </div>
            </div>

            <div className="mt-6 text-center text-sm">
              <span className="text-muted-foreground">
                {t("auth:signIn.noAccount")}{" "}
              </span>
              <LocaleLink
                href="/sign-up"
                className="text-primary hover:underline font-bold"
              >
                {t("auth:links.createAccount")}
              </LocaleLink>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
