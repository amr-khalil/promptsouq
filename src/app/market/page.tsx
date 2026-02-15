"use client";

import { PromptCard } from "@/components/PromptCard";
import SearchInput from "@/components/SearchInput";
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
import { Skeleton } from "@/components/ui/skeleton";
import type { Prompt } from "@/lib/schemas/api";
import { Filter, Gift, Loader2, RotateCcw, Search, X } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";

// ─── Constants ────────────────────────────────────────────────────

const AI_MODELS = [
  { value: "all", label: "الكل" },
  { value: "ChatGPT", label: "ChatGPT" },
  { value: "Claude", label: "Claude" },
  { value: "Midjourney", label: "Midjourney" },
  { value: "DALL·E", label: "DALL·E" },
  { value: "Stable Diffusion", label: "Stable Diffusion" },
  { value: "Gemini", label: "Gemini" },
  { value: "Copilot", label: "Copilot" },
];

const GENERATION_TYPES = [
  { value: "all", label: "الكل" },
  { value: "text", label: "نص" },
  { value: "image", label: "صورة" },
  { value: "code", label: "كود" },
  { value: "marketing", label: "تسويق" },
  { value: "design", label: "تصميم" },
];

const SORT_OPTIONS = [
  { value: "trending", label: "الأكثر رواجاً" },
  { value: "popular", label: "الأكثر شعبية" },
  { value: "newest", label: "الأحدث" },
  { value: "price-low", label: "السعر: من الأقل" },
  { value: "price-high", label: "السعر: من الأعلى" },
  { value: "relevant", label: "الأكثر صلة" },
  { value: "rating", label: "الأعلى تقييماً" },
];

const PAGE_SIZE = 20;

// ─── Component ────────────────────────────────────────────────────

export default function Market() {
  const searchParams = useSearchParams();
  const router = useRouter();

  // Derive state from URL
  const searchQuery = searchParams.get("search") ?? "";
  const generationType = searchParams.get("generationType") ?? "all";
  const aiModel = searchParams.get("aiModel") ?? "all";
  const priceType = searchParams.get("priceType") ?? "all";
  const sortBy = searchParams.get("sortBy") ?? (searchQuery ? "relevant" : "trending");

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
      if (generationType !== "all") params.set("generationType", generationType);
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
      if (!res.ok) throw new Error("فشل في تحميل البيانات");
      const data = await res.json();
      if (id !== fetchIdRef.current) return;
      setAllPrompts(data.data ?? []);
      setTotal(data.total ?? data.data?.length ?? 0);
    } catch {
      if (id !== fetchIdRef.current) return;
      setError("حدث خطأ أثناء تحميل البيانات");
    } finally {
      if (id === fetchIdRef.current) setLoading(false);
    }
  }, [buildApiParams]);

  // Load more
  const loadMore = async () => {
    const nextOffset = offset + PAGE_SIZE;
    setLoadingMore(true);
    try {
      const params = buildApiParams(nextOffset);
      const res = await fetch(`/api/prompts?${params.toString()}`);
      if (!res.ok) throw new Error("فشل");
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
    const found = GENERATION_TYPES.find((t) => t.value === generationType);
    activeFilters.push({ key: "generationType", label: found?.label ?? generationType });
  }
  if (aiModel !== "all") {
    const found = AI_MODELS.find((m) => m.value === aiModel);
    activeFilters.push({ key: "aiModel", label: found?.label ?? aiModel });
  }
  if (priceType !== "all") {
    activeFilters.push({
      key: "priceType",
      label: priceType === "free" ? "مجاني" : "مدفوع",
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
        <h3 className="font-bold mb-3 text-white">النوع</h3>
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
        <h3 className="font-bold mb-3 text-white">النموذج</h3>
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
        <h3 className="font-bold mb-3 text-white">السعر</h3>
        <div className="flex gap-2">
          {[
            { value: "all", label: "الكل" },
            { value: "free", label: "مجاني" },
            { value: "paid", label: "مدفوع" },
          ].map((option) => (
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
        إعادة تعيين
      </Button>
    </div>
  );

  // ─── Render ─────────────────────────────────────────────────────

  return (
    <div className="dark bg-gray-950 min-h-screen">
      {/* Hero */}
      <section className="bg-gray-950 border-b border-gray-800">
        <div className="container mx-auto px-4 py-12 text-center">
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-3">
            سوق البرومبتات
          </h1>
          <p className="text-gray-400 mb-8 text-lg">
            اكتشف أفضل برومبتات الذكاء الاصطناعي
          </p>
          <div className="max-w-2xl mx-auto">
            <SearchInput
              key={searchQuery}
              onSearch={handleSearch}
              defaultValue={searchQuery}
              placeholder="ابحث عن برومبت..."
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
                  برومبتات مجانية متاحة!
                </p>
                <p className="text-xs text-gray-400">
                  اكتشف مجموعة من البرومبتات المجانية الاحترافية
                </p>
              </div>
            </div>
            <Button
              size="sm"
              className="shrink-0 bg-emerald-600 text-white hover:bg-emerald-700"
              onClick={() => handlePriceTypeChange("free")}
            >
              عرض المجانية
            </Button>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col md:flex-row gap-6">
          {/* Filters Sidebar - Desktop */}
          <aside className="hidden md:block w-56 shrink-0">
            <div className="sticky top-20 rounded-lg border border-gray-800 bg-gray-900 p-4">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-bold text-white">الفلاتر</h2>
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
                  الفلاتر
                  {activeFilters.length > 0 && (
                    <Badge className="mr-2 bg-purple-600 text-white">
                      {activeFilters.length}
                    </Badge>
                  )}
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[300px] bg-gray-900 border-gray-800">
                <SheetHeader>
                  <SheetTitle className="text-white">الفلاتر</SheetTitle>
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
                {loading ? "جاري التحميل..." : `عرض ${allPrompts.length} من ${total}`}
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-400">ترتيب:</span>
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
                  مسح الكل
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
                  إعادة المحاولة
                </Button>
              </div>
            )}

            {/* Loading State */}
            {loading && !error && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {Array.from({ length: 8 }).map((_, i) => (
                  <div
                    key={i}
                    className="rounded-lg overflow-hidden bg-gray-900 border border-gray-800"
                  >
                    <Skeleton className="aspect-square bg-gray-800" />
                    <div className="p-3">
                      <Skeleton className="h-4 w-full mb-2 bg-gray-800" />
                      <Skeleton className="h-4 w-16 bg-gray-800" />
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Prompts Grid */}
            {!loading && !error && allPrompts.length > 0 && (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {allPrompts.map((prompt) => (
                    <PromptCard key={prompt.id} prompt={prompt} />
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
                          جاري التحميل...
                        </>
                      ) : (
                        "عرض المزيد"
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
                <p className="text-gray-400 text-lg mb-2">لا توجد نتائج</p>
                <p className="text-gray-500 text-sm mb-6">
                  حاول تعديل الفلاتر أو البحث بكلمات مختلفة
                </p>
                <Button
                  variant="outline"
                  onClick={resetAll}
                  className="border-gray-700 text-gray-300"
                >
                  <RotateCcw className="ml-2 h-4 w-4" />
                  إعادة تعيين الفلاتر
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
