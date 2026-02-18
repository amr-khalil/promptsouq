"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { PromptStatusBadge } from "./PromptStatusBadge";
import { AdminPromptReview } from "./AdminPromptReview";
import { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

interface PromptListItem {
  id: string;
  title: string;
  titleEn: string;
  aiModel: string;
  generationType: string | null;
  price: number;
  sellerName: string;
  sellerId: string | null;
  status: string;
  createdAt: string;
}

type StatusFilter = "pending" | "approved" | "rejected";

export function AdminModerationQueue() {
  const { t } = useTranslation("dashboard");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("pending");
  const [prompts, setPrompts] = useState<PromptListItem[]>([]);
  const [counts, setCounts] = useState({ pending: 0, approved: 0, rejected: 0 });
  const [loading, setLoading] = useState(true);
  const [reviewPromptId, setReviewPromptId] = useState<string | null>(null);

  const fetchCounts = useCallback(async () => {
    const statuses: StatusFilter[] = ["pending", "approved", "rejected"];
    const results = await Promise.all(
      statuses.map(async (s) => {
        const res = await fetch(`/api/admin/prompts?status=${s}&countOnly=true`);
        if (!res.ok) return 0;
        const json = await res.json();
        return json.data?.count ?? 0;
      }),
    );
    setCounts({ pending: results[0], approved: results[1], rejected: results[2] });
  }, []);

  const fetchPrompts = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/prompts?status=${statusFilter}&limit=50`);
      if (!res.ok) throw new Error();
      const json = await res.json();
      setPrompts(json.data ?? []);
    } catch {
      setPrompts([]);
    } finally {
      setLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => {
    fetchCounts();
    fetchPrompts();
  }, [fetchCounts, fetchPrompts]);

  const handleReviewComplete = () => {
    setReviewPromptId(null);
    fetchCounts();
    fetchPrompts();
  };

  const statusTabs: { key: StatusFilter; label: string; count: number; color: string }[] = [
    { key: "pending", label: t("admin.moderation.pending"), count: counts.pending, color: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400" },
    { key: "approved", label: t("admin.moderation.approved"), count: counts.approved, color: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400" },
    { key: "rejected", label: t("admin.moderation.rejected"), count: counts.rejected, color: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400" },
  ];

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold">{t("admin.moderation.title")}</h2>
      {/* Status Tabs */}
      <div className="flex gap-2 flex-wrap">
        {statusTabs.map((tab) => (
          <Button
            key={tab.key}
            variant={statusFilter === tab.key ? "default" : "outline"}
            size="sm"
            onClick={() => setStatusFilter(tab.key)}
            className="gap-2"
          >
            {tab.label}
            <Badge variant="secondary" className={tab.color}>
              {tab.count}
            </Badge>
          </Button>
        ))}
      </div>

      {/* Prompts List */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardContent className="p-4">
                <div className="flex items-center gap-4">
                  <Skeleton className="w-16 h-16 rounded" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-1/2" />
                    <Skeleton className="h-3 w-1/3" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : prompts.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center text-muted-foreground">
            {statusFilter === "pending"
              ? t("admin.moderation.emptyPending")
              : t("admin.moderation.empty")}
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {prompts.map((prompt) => (
            <Card
              key={prompt.id}
              className="cursor-pointer hover:bg-accent/50 transition-colors"
              onClick={() => setReviewPromptId(prompt.id)}
            >
              <CardContent className="p-4">
                <div className="flex items-center gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-medium truncate">{prompt.title}</h3>
                      <PromptStatusBadge status={prompt.status as StatusFilter} />
                    </div>
                    <p className="text-sm text-muted-foreground truncate">
                      {prompt.titleEn}
                    </p>
                    <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                      <span>{prompt.sellerName}</span>
                      <span>{prompt.aiModel}</span>
                      <span>${prompt.price}</span>
                      <span>{new Date(prompt.createdAt).toLocaleDateString("ar-EG")}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Review Dialog */}
      {reviewPromptId && (
        <AdminPromptReview
          promptId={reviewPromptId}
          open={!!reviewPromptId}
          onClose={() => setReviewPromptId(null)}
          onReviewComplete={handleReviewComplete}
        />
      )}
    </div>
  );
}
