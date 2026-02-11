"use client";

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
import { useSignIn } from "@clerk/nextjs";
import type { EmailCodeFactor, OAuthStrategy } from "@clerk/types";
import { Facebook, Loader2, Mail } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import * as React from "react";

export default function SignIn() {
  const { isLoaded, signIn, setActive } = useSignIn();
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [code, setCode] = React.useState("");
  const [showEmailCode, setShowEmailCode] = React.useState(false);
  const [error, setError] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const router = useRouter();

  // Handle email/password sign-in
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isLoaded) return;

    setError("");
    setLoading(true);

    try {
      const signInAttempt = await signIn.create({
        identifier: email,
        password,
      });

      if (signInAttempt.status === "complete") {
        await setActive({
          session: signInAttempt.createdSessionId,
          navigate: async ({ session }) => {
            if (session?.currentTask) {
              console.log(session?.currentTask);
              return;
            }
            router.push("/");
          },
        });
      } else if (signInAttempt.status === "needs_second_factor") {
        const emailCodeFactor = signInAttempt.supportedSecondFactors?.find(
          (factor): factor is EmailCodeFactor =>
            factor.strategy === "email_code",
        );

        if (emailCodeFactor) {
          await signIn.prepareSecondFactor({
            strategy: "email_code",
            emailAddressId: emailCodeFactor.emailAddressId,
          });
          setShowEmailCode(true);
        }
      } else {
        console.error(JSON.stringify(signInAttempt, null, 2));
      }
    } catch (err: any) {
      console.error(JSON.stringify(err, null, 2));
      setError(
        err.errors?.[0]?.longMessage ||
          err.errors?.[0]?.message ||
          "حدث خطأ أثناء تسجيل الدخول",
      );
    } finally {
      setLoading(false);
    }
  };

  // Handle email code verification (2FA / Client Trust)
  const handleEmailCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isLoaded) return;

    setError("");
    setLoading(true);

    try {
      const signInAttempt = await signIn.attemptSecondFactor({
        strategy: "email_code",
        code,
      });

      if (signInAttempt.status === "complete") {
        await setActive({
          session: signInAttempt.createdSessionId,
          navigate: async ({ session }) => {
            if (session?.currentTask) {
              console.log(session?.currentTask);
              return;
            }
            router.push("/");
          },
        });
      } else {
        console.error(JSON.stringify(signInAttempt, null, 2));
      }
    } catch (err: any) {
      console.error(JSON.stringify(err, null, 2));
      setError(
        err.errors?.[0]?.longMessage ||
          err.errors?.[0]?.message ||
          "رمز التحقق غير صحيح",
      );
    } finally {
      setLoading(false);
    }
  };

  // Handle OAuth sign-in (Google / Facebook)
  const signInWith = (strategy: OAuthStrategy) => {
    if (!signIn) return;
    signIn
      .authenticateWithRedirect({
        strategy,
        redirectUrl: "/sign-in/sso-callback",
        redirectUrlComplete: "/",
      })
      .catch((err: any) => {
        console.error(JSON.stringify(err, null, 2));
        setError("حدث خطأ أثناء تسجيل الدخول");
      });
  };

  // Email code verification UI
  if (showEmailCode) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-md mx-auto">
          <Card>
            <CardHeader className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-600 to-blue-500 rounded-lg flex items-center justify-center mx-auto mb-4">
                <span className="text-white font-bold text-2xl">PS</span>
              </div>
              <CardTitle className="text-2xl">تحقق من بريدك</CardTitle>
              <CardDescription>
                تم إرسال رمز التحقق إلى بريدك الإلكتروني
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleEmailCode} className="space-y-4">
                <div>
                  <Label htmlFor="code">رمز التحقق</Label>
                  <Input
                    id="code"
                    type="text"
                    inputMode="numeric"
                    placeholder="أدخل رمز التحقق"
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
                  تحقق
                </Button>
              </form>

              <div className="mt-4 text-center">
                <Button
                  variant="ghost"
                  onClick={() => {
                    setShowEmailCode(false);
                    setCode("");
                    setError("");
                  }}
                >
                  العودة لتسجيل الدخول
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
            <CardTitle className="text-2xl">تسجيل الدخول</CardTitle>
            <CardDescription>
              مرحباً بك في PromptSouq - سوق البرومبتات العربي
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="email">البريد الإلكتروني</Label>
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

              <div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">كلمة المرور</Label>
                  <Link
                    href="/forgot-password"
                    className="text-sm text-primary hover:underline"
                  >
                    نسيت كلمة المرور؟
                  </Link>
                </div>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="mt-1.5"
                />
              </div>

              {error && (
                <p className="text-sm text-destructive text-center">{error}</p>
              )}

              <Button type="submit" className="w-full" disabled={loading}>
                {loading && <Loader2 className="ml-2 h-4 w-4 animate-spin" />}
                تسجيل الدخول
              </Button>
            </form>

            <div className="mt-6">
              <div className="relative">
                <Separator />
                <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-card px-2 text-sm text-muted-foreground">
                  أو
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 mt-6">
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => signInWith("oauth_google")}
                  type="button"
                >
                  <Mail className="ml-2 h-4 w-4" />
                  Google
                </Button>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => signInWith("oauth_facebook")}
                  type="button"
                >
                  <Facebook className="ml-2 h-4 w-4" />
                  Facebook
                </Button>
              </div>
            </div>

            <div className="mt-6 text-center text-sm">
              <span className="text-muted-foreground">ليس لديك حساب؟ </span>
              <Link
                href="/sign-up"
                className="text-primary hover:underline font-bold"
              >
                إنشاء حساب جديد
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
