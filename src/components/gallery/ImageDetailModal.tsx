"use client";

import { LocaleLink } from "@/components/LocaleLink";
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";
import { Heart, ExternalLink } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/hooks/use-auth";
import { toast } from "sonner";

interface ImageDetail {
  id: string;
  imageUrl: string;
  caption: string | null;
  likesCount: number;
  createdAt: string;
  userHasLiked: boolean;
  prompt: {
    id: string;
    title: string;
    titleEn: string;
    isFree: boolean;
    price: number;
    promptPreview: string | null;
    fullContent: string | null;
    category: string;
  } | null;
  seller: {
    id: string;
    name: string;
    avatar: string | null;
    rating: number;
  };
  relatedImages: { id: string; imageUrl: string; likesCount: number }[];
}

interface ImageDetailModalProps {
  imageId: string | null;
  open: boolean;
  onClose: () => void;
  onRelatedClick: (id: string) => void;
}

export function ImageDetailModal({
  imageId,
  open,
  onClose,
  onRelatedClick,
}: ImageDetailModalProps) {
  const { t } = useTranslation("gallery");
  const { isSignedIn } = useAuth();
  const [detail, setDetail] = useState<ImageDetail | null>(null);
  const [loading, setLoading] = useState(false);
  const [liked, setLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(0);

  const fetchDetail = useCallback(async (id: string) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/gallery/${id}`);
      if (res.ok) {
        const data = await res.json();
        setDetail(data);
        setLiked(data.userHasLiked);
        setLikesCount(data.likesCount);
      }
    } catch {
      // Ignore
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (open && imageId) {
      fetchDetail(imageId);
    } else {
      setDetail(null);
    }
  }, [open, imageId, fetchDetail]);

  const toggleLike = async () => {
    if (!isSignedIn || !detail) return;

    const wasLiked = liked;
    const prevCount = likesCount;

    // Optimistic update
    setLiked(!wasLiked);
    setLikesCount(wasLiked ? prevCount - 1 : prevCount + 1);

    try {
      const res = await fetch(`/api/gallery/${detail.id}/like`, {
        method: wasLiked ? "DELETE" : "POST",
      });
      if (res.ok) {
        const data = await res.json();
        setLikesCount(data.likesCount);
        setLiked(data.liked);
      } else {
        // Rollback
        setLiked(wasLiked);
        setLikesCount(prevCount);
      }
    } catch {
      setLiked(wasLiked);
      setLikesCount(prevCount);
      toast.error("حدث خطأ");
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-4xl p-0 overflow-hidden">
        {loading || !detail ? (
          <div className="flex items-center justify-center h-96">
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-[#7f0df2] border-t-transparent" />
          </div>
        ) : (
          <div className="flex flex-col md:flex-row max-h-[85vh]">
            {/* Image */}
            <div className="flex-1 bg-black flex items-center justify-center min-h-[300px]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={detail.imageUrl}
                alt={detail.caption ?? detail.prompt?.title ?? ""}
                className="max-h-[85vh] w-full object-contain"
              />
            </div>

            {/* Info panel */}
            <div className="w-full md:w-80 lg:w-96 flex flex-col overflow-y-auto">
              {/* Seller info */}
              <div className="flex items-center gap-3 p-4 border-b">
                <div className="w-10 h-10 rounded-full bg-zinc-700 overflow-hidden shrink-0">
                  {detail.seller.avatar && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={detail.seller.avatar}
                      alt={detail.seller.name}
                      className="w-full h-full object-cover"
                    />
                  )}
                </div>
                <div>
                  <p className="font-medium text-sm">{detail.seller.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(detail.createdAt).toLocaleDateString("ar")}
                  </p>
                </div>
              </div>

              {/* Like + count */}
              <div className="flex items-center gap-3 px-4 py-3 border-b">
                <button
                  onClick={toggleLike}
                  disabled={!isSignedIn}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm transition-all ${
                    liked
                      ? "bg-red-500/10 text-red-500 border border-red-500/30"
                      : "bg-zinc-800 text-zinc-400 hover:text-white border border-zinc-700"
                  }`}
                >
                  <Heart
                    className="w-4 h-4"
                    fill={liked ? "currentColor" : "none"}
                  />
                  <span>{likesCount}</span>
                </button>
                {detail.caption && (
                  <p className="text-sm text-muted-foreground truncate flex-1">
                    {detail.caption}
                  </p>
                )}
              </div>

              {/* Prompt info */}
              <div className="p-4 flex-1">
                <h3 className="text-sm font-semibold mb-2">
                  {t("detail.prompt")}
                </h3>
                {!detail.prompt ? (
                  <p className="text-sm text-muted-foreground italic">
                    {t("detail.promptNotAvailable")}
                  </p>
                ) : detail.prompt.isFree ? (
                  <div className="space-y-2">
                    <p className="text-sm font-medium">{detail.prompt.title}</p>
                    {detail.prompt.fullContent && (
                      <div className="bg-zinc-800/50 rounded-lg p-3 text-sm text-zinc-300 whitespace-pre-wrap max-h-48 overflow-y-auto">
                        {detail.prompt.fullContent}
                      </div>
                    )}
                    <LocaleLink
                      href={`/prompt/${detail.prompt.id}`}
                      className="inline-flex items-center gap-1.5 text-sm text-[#7f0df2] hover:underline"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      {t("detail.viewPrompt")}
                    </LocaleLink>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <p className="text-sm font-medium">{detail.prompt.title}</p>
                    {detail.prompt.promptPreview && (
                      <div className="relative">
                        <div className="bg-zinc-800/50 rounded-lg p-3 text-sm text-zinc-300 blur-sm select-none">
                          {detail.prompt.promptPreview}
                        </div>
                        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-background/80 rounded-lg flex items-end justify-center pb-3">
                          <p className="text-xs text-muted-foreground">
                            {t("detail.blurredText")}
                          </p>
                        </div>
                      </div>
                    )}
                    <LocaleLink
                      href={`/prompt/${detail.prompt.id}`}
                      className="inline-flex items-center gap-1.5 bg-[#7f0df2] text-white text-sm px-4 py-2 rounded-full hover:bg-[#7f0df2]/80 transition-colors"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      {t("detail.viewPrompt")}
                    </LocaleLink>
                  </div>
                )}
              </div>

              {/* Related images */}
              {detail.relatedImages.length > 0 && (
                <div className="p-4 border-t">
                  <h3 className="text-sm font-semibold mb-2">
                    {t("detail.related")}
                  </h3>
                  <div className="grid grid-cols-3 gap-2">
                    {detail.relatedImages.map((img) => (
                      <button
                        key={img.id}
                        onClick={() => onRelatedClick(img.id)}
                        className="aspect-square rounded-lg overflow-hidden bg-zinc-800 hover:ring-2 ring-[#7f0df2] transition-all"
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={img.imageUrl}
                          alt=""
                          className="w-full h-full object-cover"
                          loading="lazy"
                        />
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
