"use client";

import { useTranslation } from "react-i18next";
import { AdminIssueTable } from "@/components/issues/AdminIssueTable";

export default function AdminIssuesPage() {
  const { t } = useTranslation("issues");

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-white">{t("adminIssues")}</h1>
      <AdminIssueTable />
    </div>
  );
}
