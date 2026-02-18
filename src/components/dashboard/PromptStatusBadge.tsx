"use client";

import { Badge } from "@/components/ui/badge";
import { useTranslation } from "react-i18next";

interface PromptStatusBadgeProps {
  status: "pending" | "approved" | "rejected";
  deletedAt?: string | null;
}

const statusStyles: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
  approved: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
  rejected: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
  deleted: "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400",
};

export function PromptStatusBadge({ status, deletedAt }: PromptStatusBadgeProps) {
  const { t } = useTranslation("dashboard");

  const effectiveStatus = deletedAt ? "deleted" : status;
  const label = t(`status.${effectiveStatus}`);

  return (
    <Badge variant="outline" className={statusStyles[effectiveStatus]}>
      {label}
    </Badge>
  );
}
