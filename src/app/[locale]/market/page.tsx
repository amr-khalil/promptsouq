"use client";

import HeroSearchBar from "@/components/HeroSearchBar";
import {
  PromptGridCard,
  PromptGridCardSkeleton,
} from "@/components/PromptGridCard";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import type { Prompt } from "@/lib/schemas/api";
import { Filter, Gift, Loader2, RotateCcw, Search, X } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";

// ─── Constants ────────────────────────────────────────────────────

const PAGE_SIZE = 20;

// ─── Component ────────────────────────────────────────────────────

export default function Market() {
  const { t } = useTranslation(["market", "common"]);
  const searchParams = useSearchParams();
  const router = useRouter();

  // Build translated arrays inside the component
  const GENERATION_TYPES = [
    { value: "all", label: t("filters.generationTypes.all") },
    { value: "text", label: t("filters.generationTypes.text") },
    { value: "image", label: t("filters.generationTypes.image") },
    { value: "code", label: t("filters.generationTypes.code") },
    { value: "marketing", label: t("filters.generationTypes.marketing") },
    { value: "design", label: t("filters.generationTypes.design") },
  ];

  const SORT_OPTIONS = [
    { value: "trending", label: t("sortOptions.trending") },
    { value: "popular", label: t("sortOptions.popular") },
    { value: "newest", label: t("sortOptions.newest") },
    { value: "price-low", label: t("sortOptions.priceLow") },
    { value: "price-high", label: t("sortOptions.priceHigh") },
    { value: "relevant", label: t("sortOptions.relevant") },
    { value: "rating", label: t("sortOptions.rating") },
  ];

  const AI_MODELS = [
    { value: "all", label: t("filters.generationTypes.all") },
    { value: "ChatGPT", label: "ChatGPT" },
    { value: "Claude", label: "Claude" },
    { value: "Midjourney", label: "Midjourney" },
    { value: "DALL·E", label: "DALL·E" },
    { value: "Stable Diffusion", label: "Stable Diffusion" },
    { value: "Gemini", label: "Gemini" },
    { value: "Copilot", label: "Copilot" },
  ];

  const PRICE_OPTIONS = [
    { value: "all", label: t("filters.priceOptions.all") },
    { value: "free", label: t("filters.priceOptions.free") },
    { value: "paid", label: t("filters.priceOptions.paid") },
  ];

  // Derive state from URL
  const searchQuery = searchParams.get("search") ?? "";
  const generationType = searchParams.get("generationType") ?? "all";
  const aiModel = searchParams.get("aiModel") ?? "all";
  const priceType = searchParams.get("priceType") ?? "all";
  const sortBy =
    searchParams.get("sortBy") ?? (searchQuery ? "relevant" : "trending");

  // Local state for data
  const [allPrompts, setAllPrompts] = useState<Prompt[]>([]);
  const [total, setTotal] = useState(0);
  const [offset, setOffset] = useState(0);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState("");
  const fetchIdRef = useRef(0);

  // Build URL params for API
  const buildApiParams = useCallback(
    (currentOffset: number) => {
      const params = new URLSearchParams();
      if (searchQuery) params.set("search", searchQuery);
      if (generationType !== "all")
        params.set("generationType", generationType);
      if (aiModel !== "all") params.set("aiModel", aiModel);
      if (priceType !== "all") params.set("priceType", priceType);
      params.set("sortBy", sortBy);
      params.set("limit", String(PAGE_SIZE));
      params.set("offset", String(currentOffset));
      return params;
    },
    [searchQuery, generationType, aiModel, priceType, sortBy],
  );

  // Fetch prompts (initial or on filter change)
  const fetchPrompts = useCallback(async () => {
    const id = ++fetchIdRef.current;
    setLoading(true);
    setError("");
    setOffset(0);

    try {
      const params = buildApiParams(0);
      const res = await fetch(`/api/prompts?${params.toString()}`);
      if (!res.ok) throw new Error(t("errors.loadFailed", { ns: "common" }));
      const data = await res.json();
      if (id !== fetchIdRef.current) return;
      setAllPrompts(data.data ?? []);
      setTotal(data.total ?? data.data?.length ?? 0);
    } catch {
      if (id !== fetchIdRef.current) return;
      setError(t("errors.loadFailed", { ns: "common" }));
    } finally {
      if (id === fetchIdRef.current) setLoading(false);
    }
  }, [buildApiParams, t]);

  // Load more
  const loadMore = async () => {
    const nextOffset = offset + PAGE_SIZE;
    setLoadingMore(true);
    try {
      const params = buildApiParams(nextOffset);
      const res = await fetch(`/api/prompts?${params.toString()}`);
      if (!res.ok) throw new Error("fail");
      const data = await res.json();
      setAllPrompts((prev) => [...prev, ...(data.data ?? [])]);
      setOffset(nextOffset);
    } catch {
      // silently fail
    } finally {
      setLoadingMore(false);
    }
  };

  // Re-fetch on filter/sort/search change
  useEffect(() => {
    fetchPrompts();
  }, [fetchPrompts]);

  // ─── URL helpers ────────────────────────────────────────────────

  function updateURL(updates: Record<string, string | null>) {
    const params = new URLSearchParams(searchParams.toString());
    for (const [key, value] of Object.entries(updates)) {
      if (value === null || value === "all" || value === "") {
        params.delete(key);
      } else {
        params.set(key, value);
      }
    }
    // Reset offset on filter changes
    params.delete("offset");
    router.replace(`/market?${params.toString()}`, { scroll: false });
  }

  function handleSearch(query: string) {
    updateURL({
      search: query || null,
      sortBy: query ? "relevant" : null,
    });
  }

  function handleGenerationTypeChange(value: string) {
    updateURL({ generationType: value === "all" ? null : value });
  }

  function handleModelChange(value: string) {
    updateURL({ aiModel: value === "all" ? null : value });
  }

  function handlePriceTypeChange(value: string) {
    updateURL({ priceType: value === "all" ? null : value });
  }

  function handleSortChange(value: string) {
    updateURL({ sortBy: value === "trending" && !searchQuery ? null : value });
  }

  function removeFilter(key: string) {
    updateURL({ [key]: null });
  }

  function resetAll() {
    router.replace("/market", { scroll: false });
  }

  // ─── Active filters ─────────────────────────────────────────────

  const activeFilters: { key: string; label: string }[] = [];
  if (generationType !== "all") {
    const found = GENERATION_TYPES.find((gt) => gt.value === generationType);
    activeFilters.push({
      key: "generationType",
      label: found?.label ?? generationType,
    });
  }
  if (aiModel !== "all") {
    const found = AI_MODELS.find((m) => m.value === aiModel);
    activeFilters.push({ key: "aiModel", label: found?.label ?? aiModel });
  }
  if (priceType !== "all") {
    activeFilters.push({
      key: "priceType",
      label:
        priceType === "free"
          ? t("filters.priceOptions.free")
          : t("filters.priceOptions.paid"),
    });
  }
  if (searchQuery) {
    activeFilters.push({ key: "search", label: `"${searchQuery}"` });
  }

  const hasMore = allPrompts.length < total;

  // ─── Filter sidebar content ─────────────────────────────────────

  const filtersContent = (
    <div className="space-y-6">
      {/* Generation Type */}
      <div>
        <h3 className="font-bold mb-3 text-white">{t("filters.type")}</h3>
        <RadioGroup
          value={generationType}
          onValueChange={handleGenerationTypeChange}
          className="space-y-2"
        >
          {GENERATION_TYPES.map((type) => (
            <div key={type.value} className="flex items-center gap-2">
              <RadioGroupItem
                value={type.value}
                id={`type-${type.value}`}
                className="border-gray-600 text-purple-500"
              />
              <Label
                htmlFor={`type-${type.value}`}
                className="cursor-pointer text-gray-300"
              >
                {type.label}
              </Label>
            </div>
          ))}
        </RadioGroup>
      </div>

      {/* AI Model */}
      <div>
        <h3 className="font-bold mb-3 text-white">{t("filters.model")}</h3>
        <RadioGroup
          value={aiModel}
          onValueChange={handleModelChange}
          className="space-y-2"
        >
          {AI_MODELS.map((model) => (
            <div key={model.value} className="flex items-center gap-2">
              <RadioGroupItem
                value={model.value}
                id={`model-${model.value}`}
                className="border-gray-600 text-purple-500"
              />
              <Label
                htmlFor={`model-${model.value}`}
                className="cursor-pointer text-gray-300"
              >
                {model.label}
              </Label>
            </div>
          ))}
        </RadioGroup>
      </div>

      {/* Price Type */}
      <div>
        <h3 className="font-bold mb-3 text-white">{t("filters.price")}</h3>
        <div className="flex gap-2">
          {PRICE_OPTIONS.map((option) => (
            <Button
              key={option.value}
              variant={priceType === option.value ? "default" : "outline"}
              size="sm"
              className={
                priceType === option.value
                  ? "bg-purple-600 text-white hover:bg-purple-700"
                  : "border-gray-700 text-gray-300 hover:bg-gray-800 hover:text-white"
              }
              onClick={() => handlePriceTypeChange(option.value)}
            >
              {option.label}
            </Button>
          ))}
        </div>
      </div>

      {/* Reset */}
      <Button
        variant="outline"
        className="w-full border-gray-700 text-gray-300 hover:bg-gray-800 hover:text-white"
        onClick={resetAll}
      >
        <RotateCcw className="ml-2 h-4 w-4" />
        {t("buttons.reset", { ns: "common" })}
      </Button>
    </div>
  );

  // ─── Render ─────────────────────────────────────────────────────

  return (
    <div className="dark bg-[#0f0f0f] min-h-screen">
      {/* Hero */}
      <section className="bg-[#0f0f0f] border-b border-white/5">
        <div className="container mx-auto px-4 py-12 text-center">
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-3 flex items-center justify-center gap-2">
            <span className="w-2 h-8 bg-[#faff00] rounded-full block" />
            {t("title")}
          </h1>
          <p className="text-gray-400 mb-8 text-lg">{t("subtitle")}</p>
          <div className="max-w-2xl mx-auto">
            <HeroSearchBar
              key={searchQuery}
              onSearch={handleSearch}
              defaultValue={searchQuery}
            />
          </div>
        </div>
      </section>

      {/* Free Prompts Banner */}
      {activeFilters.length === 0 && !loading && (
        <div className="container mx-auto px-4 pt-6">
          <div className="flex items-center justify-between gap-4 rounded-lg border border-emerald-800/40 bg-gradient-to-l from-emerald-950/50 to-gray-900 p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-600/20">
                <Gift className="h-5 w-5 text-emerald-400" />
              </div>
              <div>
                <p className="font-bold text-white text-sm">
                  {t("freeBanner.title")}
                </p>
                <p className="text-xs text-gray-400">
                  {t("freeBanner.subtitle")}
                </p>
              </div>
            </div>
            <Button
              size="sm"
              className="shrink-0 bg-emerald-600 text-white hover:bg-emerald-700"
              onClick={() => handlePriceTypeChange("free")}
            >
              {t("buttons.viewFree", { ns: "common" })}
            </Button>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col md:flex-row gap-6">
          {/* Filters Sidebar - Desktop */}
          <aside className="hidden md:block w-56 shrink-0">
            <div className="sticky top-20 rounded-2xl border border-white/10 bg-[#18181b] p-4">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-bold text-white">
                  {t("labels.filters", { ns: "common" })}
                </h2>
                <Filter className="h-4 w-4 text-gray-400" />
              </div>
              {filtersContent}
            </div>
          </aside>

          {/* Mobile Filters */}
          <div className="md:hidden">
            <Sheet>
              <SheetTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full border-gray-700 text-gray-300 hover:bg-gray-800"
                >
                  <Filter className="ml-2 h-4 w-4" />
                  {t("labels.filters", { ns: "common" })}
                  {activeFilters.length > 0 && (
                    <Badge className="mr-2 bg-purple-600 text-white">
                      {activeFilters.length}
                    </Badge>
                  )}
                </Button>
              </SheetTrigger>
              <SheetContent
                side="right"
                className="w-[300px] bg-gray-900 border-gray-800"
              >
                <SheetHeader>
                  <SheetTitle className="text-white">
                    {t("labels.filters", { ns: "common" })}
                  </SheetTitle>
                </SheetHeader>
                <div className="mt-6">{filtersContent}</div>
              </SheetContent>
            </Sheet>
          </div>

          {/* Results Area */}
          <div className="flex-1 min-w-0">
            {/* Sort + Active Filters */}
            <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
              <div className="text-sm text-gray-400">
                {loading
                  ? t("messages.loading", { ns: "common" })
                  : t("results.showing", { count: allPrompts.length, total })}
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-400">{t("sortLabel")}</span>
                <Select value={sortBy} onValueChange={handleSortChange}>
                  <SelectTrigger className="w-[180px] border-gray-700 bg-gray-900 text-gray-200">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-900 border-gray-700">
                    {SORT_OPTIONS.filter(
                      (o) => o.value !== "relevant" || searchQuery,
                    ).map((option) => (
                      <SelectItem
                        key={option.value}
                        value={option.value}
                        className="text-gray-200 focus:bg-gray-800 focus:text-white"
                      >
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Active Filter Chips */}
            {activeFilters.length > 0 && (
              <div className="flex flex-wrap items-center gap-2 mb-4">
                {activeFilters.map((f) => (
                  <Badge
                    key={f.key}
                    variant="secondary"
                    className="bg-gray-800 text-gray-200 hover:bg-gray-700 gap-1 pl-1"
                  >
                    {f.label}
                    <button
                      onClick={() => removeFilter(f.key)}
                      className="hover:text-white"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
                <button
                  onClick={resetAll}
                  className="text-xs text-purple-400 hover:text-purple-300"
                >
                  {t("buttons.clearAll", { ns: "common" })}
                </button>
              </div>
            )}

            {/* Error State */}
            {error && (
              <div className="text-center py-12">
                <p className="text-red-400 text-lg mb-4">{error}</p>
                <Button
                  variant="outline"
                  onClick={fetchPrompts}
                  className="border-gray-700 text-gray-300"
                >
                  {t("buttons.retry", { ns: "common" })}
                </Button>
              </div>
            )}

            {/* Loading State */}
            {loading && !error && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {Array.from({ length: 8 }).map((_, i) => (
                  <PromptGridCardSkeleton key={i} />
                ))}
              </div>
            )}

            {/* Prompts Grid */}
            {!loading && !error && allPrompts.length > 0 && (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {allPrompts.map((prompt) => (
                    <PromptGridCard key={prompt.id} prompt={prompt} />
                  ))}
                </div>

                {/* Load More */}
                {hasMore && (
                  <div className="text-center mt-8">
                    <Button
                      variant="outline"
                      size="lg"
                      onClick={loadMore}
                      disabled={loadingMore}
                      className="border-gray-700 text-gray-300 hover:bg-gray-800 hover:text-white min-w-[200px]"
                    >
                      {loadingMore ? (
                        <>
                          <Loader2 className="ml-2 h-4 w-4 animate-spin" />
                          {t("messages.loading", { ns: "common" })}
                        </>
                      ) : (
                        t("buttons.loadMore", { ns: "common" })
                      )}
                    </Button>
                  </div>
                )}
              </>
            )}

            {/* Empty State */}
            {!loading && !error && allPrompts.length === 0 && (
              <div className="text-center py-16">
                <Search className="h-12 w-12 text-gray-600 mx-auto mb-4" />
                <p className="text-gray-400 text-lg mb-2">
                  {t("messages.noResults", { ns: "common" })}
                </p>
                <p className="text-gray-500 text-sm mb-6">
                  {t("messages.tryDifferentFilters", { ns: "common" })}
                </p>
                <Button
                  variant="outline"
                  onClick={resetAll}
                  className="border-gray-700 text-gray-300"
                >
                  <RotateCcw className="ml-2 h-4 w-4" />
                  {t("buttons.resetFilters", { ns: "common" })}
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
