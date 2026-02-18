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
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { createClient } from "@/lib/supabase/client";
import { signUpSchema, type SignUpInput } from "@/lib/schemas/auth";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import * as React from "react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";

export default function SignUp() {
  const { t } = useTranslation(["auth", "common"]);
  const [emailSent, setEmailSent] = React.useState(false);
  const [sentEmail, setSentEmail] = React.useState("");
  const supabase = createClient();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<SignUpInput>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      fullName: "",
      email: "",
      password: "",
      confirmPassword: "",
      acceptTerms: false as unknown as true,
    },
  });

  const [serverError, setServerError] = React.useState("");
  const acceptTerms = watch("acceptTerms");

  const onSubmit = async (data: SignUpInput) => {
    setServerError("");

    const nameParts = data.fullName.trim().split(" ");
    const firstName = nameParts[0];
    const lastName = nameParts.slice(1).join(" ") || undefined;

    const { error } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
      options: {
        data: {
          full_name: data.fullName,
          first_name: firstName,
          last_name: lastName,
        },
        emailRedirectTo: `${window.location.origin}/auth/confirm`,
      },
    });

    if (error) {
      setServerError(error.message || t("auth:errors.signUpFailed"));
      return;
    }

    setSentEmail(data.email);
    setEmailSent(true);
  };

  // Email verification pending UI
  if (emailSent) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-md mx-auto">
          <Card>
            <CardHeader className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-600 to-blue-500 rounded-lg flex items-center justify-center mx-auto mb-4">
                <span className="text-white font-bold text-2xl">PS</span>
              </div>
              <CardTitle className="text-2xl">
                {t("auth:emailVerification.title")}
              </CardTitle>
              <CardDescription>
                {t("auth:emailVerification.sentTo")} {sentEmail}
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-sm text-muted-foreground mb-4">
                {t("auth:emailVerification.checkInbox")}
              </p>
              <Button
                variant="ghost"
                onClick={() => {
                  setEmailSent(false);
                  setServerError("");
                }}
              >
                {t("common:buttons.back")}
              </Button>
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
              {t("auth:signUp.title")}
            </CardTitle>
            <CardDescription>{t("auth:signUp.subtitle")}</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <Label htmlFor="fullName">{t("auth:labels.fullName")}</Label>
                <Input
                  id="fullName"
                  type="text"
                  placeholder={t("auth:placeholders.fullName")}
                  {...register("fullName")}
                  className="mt-1.5"
                />
                {errors.fullName && (
                  <p className="text-sm text-destructive mt-1">
                    {errors.fullName.message}
                  </p>
                )}
              </div>

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
                <Label htmlFor="password">{t("auth:labels.password")}</Label>
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

              <div>
                <Label htmlFor="confirmPassword">
                  {t("auth:labels.confirmPassword")}
                </Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="••••••••"
                  {...register("confirmPassword")}
                  className="mt-1.5"
                />
                {errors.confirmPassword && (
                  <p className="text-sm text-destructive mt-1">
                    {errors.confirmPassword.message}
                  </p>
                )}
              </div>

              <div className="flex items-start gap-2">
                <Checkbox
                  id="terms"
                  checked={acceptTerms}
                  onCheckedChange={(checked) =>
                    setValue("acceptTerms", checked as boolean as true, {
                      shouldValidate: true,
                    })
                  }
                />
                <Label
                  htmlFor="terms"
                  className="text-sm leading-relaxed cursor-pointer"
                >
                  {t("auth:labels.agreeToTerms")}{" "}
                  <a href="#" className="text-primary hover:underline">
                    {t("auth:links.terms")}
                  </a>{" "}
                  {t("common:labels.and")}{" "}
                  <a href="#" className="text-primary hover:underline">
                    {t("auth:links.privacy")}
                  </a>
                </Label>
              </div>
              {errors.acceptTerms && (
                <p className="text-sm text-destructive">
                  {t("auth:errors.acceptTerms")}
                </p>
              )}

              {serverError && (
                <p className="text-sm text-destructive text-center">
                  {serverError}
                </p>
              )}

              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting && (
                  <Loader2 className="ml-2 h-4 w-4 animate-spin" />
                )}
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

              <div className="mt-6">
                <OAuthButtons mode="sign-up" />
              </div>
            </div>

            <div className="mt-6 text-center text-sm">
              <span className="text-muted-foreground">
                {t("auth:signUp.haveAccount")}{" "}
              </span>
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
