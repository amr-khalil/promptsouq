"use client";

import { Button } from "@/components/ui/button";
import { LocaleLink } from "@/components/LocaleLink";
import { useTranslation } from "react-i18next";

export default function Error({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const { t } = useTranslation("common");
  return (
    <div className="container mx-auto px-4 py-20">
      <div className="max-w-md mx-auto text-center">
        <h2 className="text-2xl font-bold mb-2">{t("errors.unexpectedError")}</h2>
        <p className="text-muted-foreground mb-8">
          {t("errors.loadPageFailed")}
        </p>
        <div className="flex gap-4 justify-center">
          <Button onClick={reset}>{t("buttons.retry")}</Button>
          <Button variant="outline" asChild>
            <LocaleLink href="/">{t("buttons.backHome")}</LocaleLink>
          </Button>
        </div>
      </div>
    </div>
  );
}
