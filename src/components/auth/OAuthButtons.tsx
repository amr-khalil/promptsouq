"use client";

import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import { Facebook, Mail } from "lucide-react";
import { useTranslation } from "react-i18next";

interface OAuthButtonsProps {
  mode: "sign-in" | "sign-up";
}

export function OAuthButtons({ mode }: OAuthButtonsProps) {
  const { t } = useTranslation("auth");
  const supabase = createClient();

  const signInWithProvider = async (provider: "google" | "facebook") => {
    await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
  };

  const label = mode === "sign-in" ? t("oauth.signInWith") : t("oauth.signUpWith");

  return (
    <div className="grid grid-cols-2 gap-3">
      <Button
        variant="outline"
        className="w-full"
        onClick={() => signInWithProvider("google")}
        type="button"
      >
        <Mail className="ml-2 h-4 w-4" />
        {label ? `Google` : "Google"}
      </Button>
      <Button
        variant="outline"
        className="w-full"
        onClick={() => signInWithProvider("facebook")}
        type="button"
      >
        <Facebook className="ml-2 h-4 w-4" />
        {label ? `Facebook` : "Facebook"}
      </Button>
    </div>
  );
}
