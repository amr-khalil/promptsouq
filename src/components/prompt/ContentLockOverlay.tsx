"use client";

import { LocaleLink } from "@/components/LocaleLink";
import { Button } from "@/components/ui/button";
import { Lock } from "lucide-react";
import { usePathname } from "next/navigation";
import { useTranslation } from "react-i18next";

export function ContentLockOverlay() {
  const { t } = useTranslation(["prompt", "common"]);
  const pathname = usePathname();
  const redirectParam = encodeURIComponent(pathname);

  return (
    <div className="relative overflow-hidden rounded-lg border">
      {/* Decorative blurred placeholder */}
      <div className="h-64 bg-gradient-to-br from-muted/60 via-muted/30 to-muted/60 backdrop-blur-xl" />

      {/* Lock overlay */}
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-background/80 backdrop-blur-sm">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-muted">
          <Lock className="h-7 w-7 text-muted-foreground" />
        </div>
        <p className="text-lg font-semibold">{t("prompt:contentLock.signInToView")}</p>
        <div className="flex gap-3">
          <Button asChild>
            <LocaleLink href={`/sign-in?redirect_url=${redirectParam}`}>
              {t("common:buttons.signIn")}
            </LocaleLink>
          </Button>
          <Button variant="outline" asChild>
            <LocaleLink href={`/sign-up?redirect_url=${redirectParam}`}>
              {t("common:buttons.createAccount")}
            </LocaleLink>
          </Button>
        </div>
      </div>
    </div>
  );
}
