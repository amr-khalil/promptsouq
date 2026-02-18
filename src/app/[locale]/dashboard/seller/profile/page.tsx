"use client";

import { SellerProfileForm } from "@/components/dashboard/SellerProfileForm";
import { useTranslation } from "react-i18next";

export default function SellerProfilePage() {
  const { t } = useTranslation("dashboard");

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold">{t("seller.profile.title")}</h2>
      <SellerProfileForm />
    </div>
  );
}
