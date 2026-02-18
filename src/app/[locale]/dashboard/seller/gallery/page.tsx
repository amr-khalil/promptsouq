"use client";

import { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { GalleryUploadForm } from "@/components/gallery/GalleryUploadForm";
import { cn } from "@/lib/utils";
import { Image as ImageIcon } from "lucide-react";

interface GallerySubmission {
  id: string;
  imageUrl: string;
  caption: string | null;
  status: string;
  createdAt: string;
  rejectionReason?: string | null;
  prompt: { id: string; title: string };
}

const statusColors: Record<string, string> = {
  pending: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
  approved: "bg-green-500/10 text-green-400 border-green-500/20",
  rejected: "bg-red-500/10 text-red-400 border-red-500/20",
};

export default function SellerGalleryPage() {
  const { t } = useTranslation("gallery");
  const [submissions, setSubmissions] = useState<GallerySubmission[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchSubmissions = useCallback(async () => {
    setLoading(true);
    try {
      // Fetch seller's own gallery images (all statuses)
      const res = await fetch("/api/gallery?seller=me&limit=50");
      if (!res.ok) return;
      const data = await res.json();
      setSubmissions(data.images ?? []);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSubmissions();
  }, [fetchSubmissions]);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-white">{t("submissions.title")}</h1>

      <GalleryUploadForm onUploaded={fetchSubmissions} />

      {/* Submissions list */}
      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="aspect-square rounded-xl bg-zinc-800/50 animate-pulse" />
          ))}
        </div>
      ) : submissions.length === 0 ? (
        <div className="text-center py-12">
          <ImageIcon className="w-12 h-12 text-zinc-600 mx-auto mb-3" />
          <p className="text-zinc-400">{t("submissions.empty")}</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {submissions.map((sub) => (
            <div key={sub.id} className="rounded-xl border border-zinc-800 overflow-hidden bg-zinc-900/50">
              <div className="aspect-square relative">
                <img
                  src={sub.imageUrl}
                  alt={sub.caption ?? "Gallery image"}
                  className="w-full h-full object-cover"
                />
                <span
                  className={cn(
                    "absolute top-2 end-2 text-xs px-2 py-0.5 rounded-full border",
                    statusColors[sub.status] ?? statusColors.pending,
                  )}
                >
                  {t(`submissions.${sub.status}` as "submissions.pending")}
                </span>
              </div>
              <div className="p-3 space-y-1">
                <p className="text-white text-sm font-medium line-clamp-1">
                  {sub.prompt.title}
                </p>
                <p className="text-zinc-500 text-xs">
                  {new Date(sub.createdAt).toLocaleDateString("ar")}
                </p>
                {sub.status === "rejected" && sub.rejectionReason && (
                  <p className="text-red-400 text-xs mt-1">
                    {t("submissions.rejectionReason")}: {sub.rejectionReason}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
