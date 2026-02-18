"use client";

import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

interface GalleryFiltersProps {
  onFilterChange: (filters: { period: string; category: string }) => void;
}

interface Category {
  slug: string;
  name: string;
  nameEn: string;
}

export function GalleryFilters({ onFilterChange }: GalleryFiltersProps) {
  const { t, i18n } = useTranslation("gallery");
  const [period, setPeriod] = useState("all");
  const [category, setCategory] = useState("");
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    fetch("/api/categories")
      .then((res) => res.json())
      .then((data) => setCategories(data.data ?? []))
      .catch(() => {});
  }, []);

  const handlePeriodChange = (newPeriod: string) => {
    setPeriod(newPeriod);
    onFilterChange({ period: newPeriod, category });
  };

  const handleCategoryChange = (newCategory: string) => {
    setCategory(newCategory);
    onFilterChange({ period, category: newCategory });
  };

  const periods = [
    { value: "all", label: t("filters.all") },
    { value: "today", label: t("filters.today") },
    { value: "week", label: t("filters.week") },
    { value: "month", label: t("filters.month") },
  ];

  const isAr = i18n.language === "ar";

  return (
    <div className="flex flex-col sm:flex-row gap-3 sm:items-center">
      {/* Time period filter chips */}
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
        {periods.map((p) => (
          <button
            key={p.value}
            onClick={() => handlePeriodChange(p.value)}
            className={`shrink-0 px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
              period === p.value
                ? "bg-[#7f0df2] text-white shadow-[0_0_12px_#7f0df2/30]"
                : "bg-zinc-800/50 text-zinc-400 hover:text-white hover:bg-zinc-700/50"
            }`}
          >
            {p.label}
          </button>
        ))}
      </div>

      {/* Category dropdown */}
      <select
        value={category}
        onChange={(e) => handleCategoryChange(e.target.value)}
        className="bg-zinc-800/50 border border-zinc-700 text-sm rounded-lg px-3 py-1.5 text-zinc-300 focus:outline-none focus:border-[#7f0df2] transition-colors"
      >
        <option value="">{t("categories")}</option>
        {categories.map((cat) => (
          <option key={cat.slug} value={cat.slug}>
            {isAr ? cat.name : cat.nameEn}
          </option>
        ))}
      </select>
    </div>
  );
}
