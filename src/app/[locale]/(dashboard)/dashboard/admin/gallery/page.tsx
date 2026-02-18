"use client";

import { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { Check, Image as ImageIcon, Loader2, X } from "lucide-react";

interface AdminGalleryImage {
  id: string;
  imageUrl: string;
  caption: string | null;
  status: string;
  createdAt: string;
  seller: { id: string; name: string };
  prompt: { id: string; title: string };
}

const statusFilters = ["pending", "approved", "rejected"] as const;

const statusColors: Record<string, string> = {
  pending: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
  approved: "bg-green-500/10 text-green-400 border-green-500/20",
  rejected: "bg-red-500/10 text-red-400 border-red-500/20",
};

export default function AdminGalleryPage() {
  const { t } = useTranslation("gallery");
  const [images, setImages] = useState<AdminGalleryImage[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>("pending");

  // Rejection state
  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [submitting, setSubmitting] = useState<string | null>(null);

  const fetchImages = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ status: statusFilter });
      const res = await fetch(`/api/admin/gallery?${params}`);
      if (!res.ok) return;
      const data = await res.json();
      setImages(data.images);
      setTotal(data.total);
    } finally {
      setLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => {
    fetchImages();
  }, [fetchImages]);

  async function handleReview(imageId: string, action: "approve" | "reject") {
    if (action === "reject" && rejectingId !== imageId) {
      setRejectingId(imageId);
      return;
    }

    if (action === "reject" && !rejectionReason) return;

    setSubmitting(imageId);
    try {
      const res = await fetch(`/api/admin/gallery/${imageId}/review`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action,
          ...(action === "reject" ? { rejectionReason } : {}),
        }),
      });

      if (!res.ok) {
        toast.error("فشل تحديث حالة الصورة");
        return;
      }

      toast.success(action === "approve" ? t("moderation.approved") : t("moderation.rejected"));
      setImages((prev) => prev.filter((img) => img.id !== imageId));
      setTotal((prev) => prev - 1);
      setRejectingId(null);
      setRejectionReason("");
    } catch {
      toast.error("فشل تحديث حالة الصورة");
    } finally {
      setSubmitting(null);
    }
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-white">{t("moderation.title")}</h1>

      {/* Status filter */}
      <div className="flex gap-2">
        {statusFilters.map((s) => (
          <button
            key={s}
            onClick={() => setStatusFilter(s)}
            className={cn(
              "px-3 py-1.5 rounded-lg text-sm font-medium transition-colors",
              statusFilter === s
                ? "bg-[#7f0df2]/10 text-[#7f0df2] border border-[#7f0df2]/30"
                : "text-zinc-400 hover:text-white border border-zinc-800 hover:border-zinc-600",
            )}
          >
            {t(`submissions.${s}` as "submissions.pending")}
          </button>
        ))}
        <span className="text-xs text-zinc-500 self-center ms-2">{total}</span>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="aspect-square rounded-xl bg-zinc-800/50 animate-pulse" />
          ))}
        </div>
      ) : images.length === 0 ? (
        <div className="text-center py-12">
          <ImageIcon className="w-12 h-12 text-zinc-600 mx-auto mb-3" />
          <p className="text-zinc-400">{t("moderation.empty")}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {images.map((img) => (
            <div key={img.id} className="rounded-xl border border-zinc-800 overflow-hidden bg-zinc-900/50">
              <div className="aspect-square relative">
                <img
                  src={img.imageUrl}
                  alt={img.caption ?? "Gallery image"}
                  className="w-full h-full object-cover"
                />
                <span
                  className={cn(
                    "absolute top-2 end-2 text-xs px-2 py-0.5 rounded-full border",
                    statusColors[img.status] ?? statusColors.pending,
                  )}
                >
                  {t(`submissions.${img.status}` as "submissions.pending")}
                </span>
              </div>
              <div className="p-3 space-y-2">
                <p className="text-white text-sm font-medium line-clamp-1">
                  {img.prompt.title}
                </p>
                <p className="text-zinc-500 text-xs">
                  {img.seller.name} · {new Date(img.createdAt).toLocaleDateString("ar")}
                </p>

                {img.status === "pending" && (
                  <>
                    {rejectingId === img.id ? (
                      <div className="space-y-2 pt-2 border-t border-zinc-800">
                        <Textarea
                          placeholder={t("moderation.rejectionPlaceholder")}
                          value={rejectionReason}
                          onChange={(e) => setRejectionReason(e.target.value)}
                          rows={2}
                        />
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="destructive"
                            disabled={!rejectionReason || submitting === img.id}
                            onClick={() => handleReview(img.id, "reject")}
                          >
                            {submitting === img.id && <Loader2 className="w-3 h-3 animate-spin me-1" />}
                            {t("moderation.reject")}
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => {
                              setRejectingId(null);
                              setRejectionReason("");
                            }}
                          >
                            إلغاء
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex gap-2 pt-2 border-t border-zinc-800">
                        <Button
                          size="sm"
                          disabled={submitting === img.id}
                          onClick={() => handleReview(img.id, "approve")}
                          className="bg-green-600 hover:bg-green-700 text-white flex-1"
                        >
                          {submitting === img.id ? (
                            <Loader2 className="w-3 h-3 animate-spin me-1" />
                          ) : (
                            <Check className="w-3 h-3 me-1" />
                          )}
                          {t("moderation.approve")}
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          disabled={submitting === img.id}
                          onClick={() => handleReview(img.id, "reject")}
                          className="flex-1"
                        >
                          <X className="w-3 h-3 me-1" />
                          {t("moderation.reject")}
                        </Button>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
