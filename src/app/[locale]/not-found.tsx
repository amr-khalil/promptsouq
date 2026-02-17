"use client";

import { Button } from "@/components/ui/button";
import { LocaleLink } from "@/components/LocaleLink";
import { useTranslation } from "react-i18next";

export default function NotFound() {
  const { t } = useTranslation("common");
  return (
    <div className="container mx-auto px-4 py-20">
      <div className="max-w-md mx-auto text-center">
        <h1 className="text-8xl font-bold text-muted-foreground/30 mb-4">
          {t("errors.notFoundCode")}
        </h1>
        <h2 className="text-2xl font-bold mb-2">{t("errors.pageNotFound")}</h2>
        <p className="text-muted-foreground mb-8">
          {t("errors.pageNotFoundDescription")}
        </p>
        <Button asChild size="lg">
          <LocaleLink href="/">{t("buttons.backHome")}</LocaleLink>
        </Button>
      </div>
    </div>
  );
}
