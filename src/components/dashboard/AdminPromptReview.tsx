"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { PromptStatusBadge } from "./PromptStatusBadge";
import { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";

interface PromptDetail {
  id: string;
  title: string;
  titleEn: string;
  description: string;
  descriptionEn: string;
  price: number;
  category: string;
  aiModel: string;
  generationType: string | null;
  modelVersion: string | null;
  difficulty: string;
  tags: string[];
  thumbnail: string;
  fullContent?: string;
  instructions?: string;
  exampleOutputs: string[] | null;
  seller: { id: string | null; name: string; avatar: string };
  status: string;
  rejectionReason: string | null;
  createdAt: string;
}

interface AdminPromptReviewProps {
  promptId: string;
  open: boolean;
  onClose: () => void;
  onReviewComplete: () => void;
}

export function AdminPromptReview({
  promptId,
  open,
  onClose,
  onReviewComplete,
}: AdminPromptReviewProps) {
  const { t } = useTranslation("dashboard");
  const [prompt, setPrompt] = useState<PromptDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [rejecting, setRejecting] = useState(false);
  const [reason, setReason] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const fetchPrompt = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/prompts/${promptId}`);
      if (!res.ok) throw new Error();
      const json = await res.json();
      setPrompt(json.data);
    } catch {
      toast.error(t("common.error"));
      onClose();
    } finally {
      setLoading(false);
    }
  }, [promptId, onClose, t]);

  useEffect(() => {
    if (open && promptId) {
      fetchPrompt();
      setRejecting(false);
      setReason("");
    }
  }, [open, promptId, fetchPrompt]);

  const handleAction = async (action: "approve" | "reject") => {
    if (action === "reject" && !rejecting) {
      setRejecting(true);
      return;
    }

    if (action === "reject" && reason.length < 10) {
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch(`/api/admin/prompts/${promptId}/review`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action,
          ...(action === "reject" ? { reason } : {}),
        }),
      });

      if (!res.ok) {
        const json = await res.json();
        toast.error(json.error?.message ?? t("common.error"));
        return;
      }

      toast.success(
        action === "approve"
          ? t("admin.moderation.approved_toast")
          : t("admin.moderation.rejected_toast"),
      );
      onReviewComplete();
    } catch {
      toast.error(t("common.error"));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{t("admin.moderation.reviewPrompt")}</DialogTitle>
        </DialogHeader>

        {loading ? (
          <div className="space-y-4">
            <Skeleton className="h-6 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-32 w-full" />
          </div>
        ) : prompt ? (
          <div className="space-y-4">
            {/* Header */}
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="text-lg font-semibold">{prompt.title}</h3>
                <p className="text-sm text-muted-foreground">{prompt.titleEn}</p>
              </div>
              <PromptStatusBadge status={prompt.status as "pending" | "approved" | "rejected"} />
            </div>

            {/* Meta */}
            <div className="flex flex-wrap gap-2">
              <Badge variant="outline">{prompt.category}</Badge>
              <Badge variant="outline">{prompt.aiModel}</Badge>
              {prompt.modelVersion && <Badge variant="outline">{prompt.modelVersion}</Badge>}
              <Badge variant="outline">{prompt.difficulty}</Badge>
              <Badge variant="outline">${prompt.price}</Badge>
            </div>

            {/* Tags */}
            {prompt.tags.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {prompt.tags.map((tag) => (
                  <Badge key={tag} variant="secondary" className="text-xs">
                    {tag}
                  </Badge>
                ))}
              </div>
            )}

            <Separator />

            {/* Seller */}
            <div>
              <h4 className="font-medium mb-1">{t("admin.moderation.sellerInfo")}</h4>
              <p className="text-sm text-muted-foreground">{prompt.seller.name}</p>
            </div>

            <Separator />

            {/* Description */}
            <div>
              <h4 className="font-medium mb-1">{t("admin.moderation.promptDetails")}</h4>
              <p className="text-sm whitespace-pre-wrap">{prompt.description}</p>
              {prompt.descriptionEn && (
                <p className="text-sm text-muted-foreground mt-2 whitespace-pre-wrap">
                  {prompt.descriptionEn}
                </p>
              )}
            </div>

            {/* Content */}
            {prompt.fullContent && (
              <>
                <Separator />
                <div>
                  <h4 className="font-medium mb-1">{t("admin.moderation.promptContent")}</h4>
                  <pre className="text-sm bg-muted p-3 rounded-md overflow-x-auto max-h-48 whitespace-pre-wrap">
                    {prompt.fullContent}
                  </pre>
                </div>
              </>
            )}

            {/* Instructions */}
            {prompt.instructions && (
              <div>
                <h4 className="font-medium mb-1">{t("admin.moderation.instructions")}</h4>
                <p className="text-sm whitespace-pre-wrap">{prompt.instructions}</p>
              </div>
            )}

            {/* Example Outputs */}
            {prompt.exampleOutputs && prompt.exampleOutputs.length > 0 && (
              <div>
                <h4 className="font-medium mb-1">{t("admin.moderation.exampleOutputs")}</h4>
                <div className="space-y-2">
                  {prompt.exampleOutputs.map((output, i) => (
                    <pre
                      key={i}
                      className="text-sm bg-muted p-3 rounded-md overflow-x-auto whitespace-pre-wrap"
                    >
                      {output}
                    </pre>
                  ))}
                </div>
              </div>
            )}

            {/* Rejection reason (if already rejected) */}
            {prompt.rejectionReason && (
              <div className="bg-red-50 dark:bg-red-900/20 p-3 rounded-md">
                <h4 className="font-medium text-red-800 dark:text-red-400 mb-1">
                  {t("admin.moderation.rejectionReason")}
                </h4>
                <p className="text-sm">{prompt.rejectionReason}</p>
              </div>
            )}

            <Separator />

            {/* Actions (only for pending) */}
            {prompt.status === "pending" && (
              <div className="space-y-3">
                {rejecting && (
                  <div>
                    <Textarea
                      placeholder={t("admin.moderation.rejectionPlaceholder")}
                      value={reason}
                      onChange={(e) => setReason(e.target.value)}
                      rows={3}
                    />
                    {reason.length > 0 && reason.length < 10 && (
                      <p className="text-xs text-red-500 mt-1">
                        {t("admin.moderation.rejectionPlaceholder")}
                      </p>
                    )}
                  </div>
                )}

                <div className="flex gap-2 justify-end">
                  {rejecting && (
                    <Button
                      variant="ghost"
                      onClick={() => {
                        setRejecting(false);
                        setReason("");
                      }}
                    >
                      {t("common.cancel")}
                    </Button>
                  )}
                  <Button
                    variant="destructive"
                    onClick={() => handleAction("reject")}
                    disabled={submitting || (rejecting && reason.length < 10)}
                  >
                    {t("admin.moderation.reject")}
                  </Button>
                  {!rejecting && (
                    <Button
                      onClick={() => handleAction("approve")}
                      disabled={submitting}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      {t("admin.moderation.approve")}
                    </Button>
                  )}
                </div>
              </div>
            )}
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
