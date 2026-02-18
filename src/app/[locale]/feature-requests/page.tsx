"use client";

import { useTranslation } from "react-i18next";
import { FeatureRequestList } from "@/components/feature-requests/FeatureRequestList";

export default function FeatureRequestsPage() {
  const { t } = useTranslation("feature-requests");

  return (
    <div className="max-w-3xl mx-auto px-4 py-24">
      <h1 className="text-3xl font-bold text-white mb-8">{t("title")}</h1>
      <FeatureRequestList />
    </div>
  );
}
