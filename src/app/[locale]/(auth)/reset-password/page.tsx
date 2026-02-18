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
import { passwordResetSchema, type PasswordResetInput } from "@/lib/schemas/auth";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import * as React from "react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";

export default function ResetPassword() {
  const { t } = useTranslation(["auth", "common"]);
  const [success, setSuccess] = React.useState(false);
  const [serverError, setServerError] = React.useState("");
  const supabase = createClient();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<PasswordResetInput>({
    resolver: zodResolver(passwordResetSchema),
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  });

  const onSubmit = async (data: PasswordResetInput) => {
    setServerError("");

    const { error } = await supabase.auth.updateUser({
      password: data.password,
    });

    if (error) {
      if (error.message.includes("session")) {
        setServerError(t("auth:errors.expiredToken"));
      } else {
        setServerError(error.message || t("auth:errors.resetFailed"));
      }
      return;
    }

    setSuccess(true);
  };

  if (success) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-md mx-auto">
          <Card>
            <CardHeader className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-600 to-blue-500 rounded-lg flex items-center justify-center mx-auto mb-4">
                <span className="text-white font-bold text-2xl">PS</span>
              </div>
              <CardTitle className="text-2xl">
                {t("auth:resetPassword.success")}
              </CardTitle>
              <CardDescription>
                {t("auth:resetPassword.successDescription")}
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <LocaleLink
                href="/sign-in"
                className="text-sm text-primary hover:underline font-bold"
              >
                {t("auth:links.signIn")}
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
              {t("auth:resetPassword.title")}
            </CardTitle>
            <CardDescription>
              {t("auth:resetPassword.subtitle")}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <Label htmlFor="password">
                  {t("auth:labels.newPassword")}
                </Label>
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
                  {t("auth:labels.confirmNewPassword")}
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

              {serverError && (
                <p className="text-sm text-destructive text-center">
                  {serverError}
                </p>
              )}

              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting && (
                  <Loader2 className="ml-2 h-4 w-4 animate-spin" />
                )}
                {t("auth:buttons.resetPassword")}
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
