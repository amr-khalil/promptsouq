"use client";

import { useState } from "react";
import { useTranslation } from "react-i18next";
import { IssueForm } from "@/components/issues/IssueForm";
import { IssueList } from "@/components/issues/IssueList";

export default function UserIssuesPage() {
  const { t } = useTranslation("issues");
  const [refreshKey, setRefreshKey] = useState(0);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-white">{t("myIssues")}</h1>
      <IssueForm onCreated={() => setRefreshKey((k) => k + 1)} />
      <IssueList refreshKey={refreshKey} />
    </div>
  );
}
