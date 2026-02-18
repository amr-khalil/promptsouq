"use client";

import { SellerPromptsTable } from "@/components/dashboard/SellerPromptsTable";
import { useTranslation } from "react-i18next";

export default function SellerPromptsPage() {
  const { t } = useTranslation("dashboard");

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold">{t("seller.prompts.title")}</h2>
      <SellerPromptsTable />
    </div>
  );
}
