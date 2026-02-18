"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { GalleryImageCard, type GalleryImage } from "./GalleryImageCard";
import { ImageDetailModal } from "./ImageDetailModal";
import { Skeleton } from "@/components/ui/skeleton";
import { ImageIcon } from "lucide-react";

interface MasonryGridProps {
  initialImages: GalleryImage[];
  initialNextCursor: string | null;
  initialHasMore: boolean;
  period?: string;
  category?: string;
}

export function MasonryGrid({
  initialImages,
  initialNextCursor,
  initialHasMore,
  period = "all",
  category = "",
}: MasonryGridProps) {
  const { t } = useTranslation("gallery");
  const [images, setImages] = useState<GalleryImage[]>(initialImages);
  const [cursor, setCursor] = useState<string | null>(initialNextCursor);
  const [hasMore, setHasMore] = useState(initialHasMore);
  const [loading, setLoading] = useState(false);
  const [selectedImageId, setSelectedImageId] = useState<string | null>(null);
  const sentinelRef = useRef<HTMLDivElement>(null);

  // Reset when filters change
  useEffect(() => {
    let cancelled = false;
    setLoading(true);

    const fetchFiltered = async () => {
      const params = new URLSearchParams({ period, limit: "20" });
      if (category) params.set("category", category);

      try {
        const res = await fetch(`/api/gallery?${params}`);
        if (res.ok && !cancelled) {
          const data = await res.json();
          setImages(data.images);
          setCursor(data.nextCursor);
          setHasMore(data.hasMore);
        }
      } catch {
        // Ignore
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchFiltered();
    return () => {
      cancelled = true;
    };
  }, [period, category]);

  // Load more via Intersection Observer
  const loadMore = useCallback(async () => {
    if (loading || !hasMore || !cursor) return;
    setLoading(true);

    const params = new URLSearchParams({ period, limit: "20", cursor });
    if (category) params.set("category", category);

    try {
      const res = await fetch(`/api/gallery?${params}`);
      if (res.ok) {
        const data = await res.json();
        setImages((prev) => [...prev, ...data.images]);
        setCursor(data.nextCursor);
        setHasMore(data.hasMore);
      }
    } catch {
      // Ignore
    } finally {
      setLoading(false);
    }
  }, [loading, hasMore, cursor, period, category]);

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          loadMore();
        }
      },
      { rootMargin: "200px" },
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [loadMore]);

  if (!loading && images.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <ImageIcon className="w-16 h-16 text-zinc-700 mb-4" />
        <p className="text-zinc-400 text-lg">{t("empty")}</p>
      </div>
    );
  }

  return (
    <>
      <div className="columns-1 sm:columns-2 md:columns-3 lg:columns-4 xl:columns-5 gap-4">
        {images.map((image) => (
          <GalleryImageCard
            key={image.id}
            image={image}
            onClick={setSelectedImageId}
          />
        ))}

        {/* Loading skeletons */}
        {loading &&
          Array.from({ length: 4 }).map((_, i) => (
            <div key={`skeleton-${i}`} className="break-inside-avoid mb-4">
              <Skeleton
                className="w-full rounded-xl"
                style={{ height: `${180 + Math.random() * 120}px` }}
              />
            </div>
          ))}
      </div>

      {/* Intersection observer sentinel */}
      <div ref={sentinelRef} className="h-4" />

      {/* Image detail modal */}
      <ImageDetailModal
        imageId={selectedImageId}
        open={!!selectedImageId}
        onClose={() => setSelectedImageId(null)}
        onRelatedClick={setSelectedImageId}
      />
    </>
  );
}
