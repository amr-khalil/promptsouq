"use client";

import { GalleryFilters } from "@/components/gallery/GalleryFilters";
import { MasonryGrid } from "@/components/gallery/MasonryGrid";
import { useState } from "react";
import { useTranslation } from "react-i18next";

export default function GalleryPage() {
  const { t } = useTranslation("gallery");
  const [filters, setFilters] = useState({ period: "all", category: "" });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-4">{t("title")}</h1>
        <GalleryFilters onFilterChange={setFilters} />
      </div>

      <MasonryGrid
        initialImages={[]}
        initialNextCursor={null}
        initialHasMore={true}
        period={filters.period}
        category={filters.category}
      />
    </div>
  );
}
