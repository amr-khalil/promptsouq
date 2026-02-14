"use client";

import { PromptCard } from "@/components/PromptCard";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
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
import { Slider } from "@/components/ui/slider";
import type { Category, Prompt } from "@/lib/schemas/api";
import { Filter, X } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

export default function Market() {
  const searchParams = useSearchParams();
  const categoryParam = searchParams.get("category");

  const [categories, setCategories] = useState<Category[]>([]);
  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [selectedCategories, setSelectedCategories] = useState<string[]>(
    categoryParam ? [categoryParam] : [],
  );
  const [selectedModels, setSelectedModels] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState([0, 100]);
  const [sortBy, setSortBy] = useState("bestselling");

  const aiModels = ["ChatGPT", "Midjourney", "DALL·E"];

  const toggleCategory = (categoryId: string) => {
    setSelectedCategories((prev) =>
      prev.includes(categoryId)
        ? prev.filter((c) => c !== categoryId)
        : [...prev, categoryId],
    );
  };

  const toggleModel = (model: string) => {
    setSelectedModels((prev) =>
      prev.includes(model) ? prev.filter((m) => m !== model) : [...prev, model],
    );
  };

  const clearFilters = () => {
    setSelectedCategories([]);
    setSelectedModels([]);
    setPriceRange([0, 100]);
  };

  // Fetch categories once on mount
  useEffect(() => {
    fetch("/api/categories")
      .then((res) => res.json())
      .then((data) => setCategories(data.data))
      .catch(() => {});
  }, []);

  // Fetch prompts when filters change
  const fetchPrompts = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const params = new URLSearchParams();
      if (selectedCategories.length > 0) {
        params.set("category", selectedCategories.join(","));
      }
      if (selectedModels.length > 0) {
        params.set("aiModel", selectedModels.join(","));
      }
      if (priceRange[0] > 0) {
        params.set("priceMin", String(priceRange[0]));
      }
      if (priceRange[1] < 100) {
        params.set("priceMax", String(priceRange[1]));
      }
      params.set("sortBy", sortBy);

      const res = await fetch(`/api/prompts?${params.toString()}`);
      if (!res.ok) throw new Error("فشل في تحميل البيانات");

      const data = await res.json();
      setPrompts(data.data);
    } catch {
      setError("حدث خطأ أثناء تحميل البيانات");
    } finally {
      setLoading(false);
    }
  }, [selectedCategories, selectedModels, priceRange, sortBy]);

  useEffect(() => {
    fetchPrompts();
  }, [fetchPrompts]);

  const filtersContent = (
    <div className="space-y-6">
      {/* Categories */}
      <div>
        <h3 className="font-bold mb-3">الفئات</h3>
        <div className="space-y-2">
          {categories.map((category) => (
            <div key={category.id} className="flex items-center">
              <Checkbox
                id={`cat-${category.id}`}
                checked={selectedCategories.includes(category.id)}
                onCheckedChange={() => toggleCategory(category.id)}
              />
              <Label
                htmlFor={`cat-${category.id}`}
                className="mr-2 cursor-pointer"
              >
                {category.name} ({category.count})
              </Label>
            </div>
          ))}
        </div>
      </div>

      {/* AI Models */}
      <div>
        <h3 className="font-bold mb-3">نموذج الذكاء الاصطناعي</h3>
        <div className="space-y-2">
          {aiModels.map((model) => (
            <div key={model} className="flex items-center">
              <Checkbox
                id={`model-${model}`}
                checked={selectedModels.includes(model)}
                onCheckedChange={() => toggleModel(model)}
              />
              <Label htmlFor={`model-${model}`} className="mr-2 cursor-pointer">
                {model}
              </Label>
            </div>
          ))}
        </div>
      </div>

      {/* Price Range */}
      <div>
        <h3 className="font-bold mb-3">نطاق السعر</h3>
        <div className="px-2">
          <Slider
            min={0}
            max={100}
            step={5}
            value={priceRange}
            onValueChange={setPriceRange}
            className="mb-2"
          />
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>${priceRange[0]}</span>
            <span>${priceRange[1]}</span>
          </div>
        </div>
      </div>

      <Button variant="outline" className="w-full" onClick={clearFilters}>
        <X className="ml-2 h-4 w-4" />
        مسح الفلاتر
      </Button>
    </div>
  );

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-3xl md:text-4xl font-bold mb-2">سوق البرومبتات</h1>
        <p className="text-muted-foreground">
          استكشف {prompts.length} من البرومبتات الاحترافية
        </p>
      </div>

      <div className="flex flex-col md:flex-row gap-4">
        {/* Filters Sidebar - Desktop */}
        <aside className="hidden md:block w-64 shrink-0">
          <div className="sticky top-20 border rounded-lg p-4 bg-card">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold">الفلاتر</h2>
              <Filter className="h-4 w-4" />
            </div>
            {filtersContent}
          </div>
        </aside>

        {/* Mobile Filters */}
        <div className="md:hidden">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" className="w-full">
                <Filter className="ml-2 h-4 w-4" />
                الفلاتر
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[300px]">
              <SheetHeader>
                <SheetTitle>الفلاتر</SheetTitle>
              </SheetHeader>
              <div className="mt-6">{filtersContent}</div>
            </SheetContent>
          </Sheet>
        </div>

        {/* Main Content */}
        <div className="flex-1">
          {/* Sort */}
          <div className="flex items-center justify-between mb-6">
            <div className="text-sm text-muted-foreground">
              {prompts.length} نتيجة
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm">ترتيب حسب:</span>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="bestselling">الأكثر مبيعاً</SelectItem>
                  <SelectItem value="newest">الأحدث</SelectItem>
                  <SelectItem value="rating">الأعلى تقييماً</SelectItem>
                  <SelectItem value="price-low">السعر: من الأقل</SelectItem>
                  <SelectItem value="price-high">السعر: من الأعلى</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Error State */}
          {error && (
            <div className="text-center py-12">
              <p className="text-destructive text-lg mb-4">{error}</p>
              <Button variant="outline" onClick={fetchPrompts}>
                إعادة المحاولة
              </Button>
            </div>
          )}

          {/* Loading State */}
          {loading && !error && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="border rounded-lg overflow-hidden">
                  <Skeleton className="aspect-video" />
                  <div className="p-4">
                    <Skeleton className="h-5 w-16 mb-2" />
                    <Skeleton className="h-4 w-full mb-2" />
                    <Skeleton className="h-3 w-full mb-3" />
                    <Skeleton className="h-3 w-24 mb-3" />
                    <div className="flex items-center justify-between">
                      <Skeleton className="h-5 w-16" />
                      <Skeleton className="h-8 w-16" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Prompts Grid */}
          {!loading && !error && prompts.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {prompts.map((prompt) => (
                <PromptCard key={prompt.id} prompt={prompt} />
              ))}
            </div>
          )}

          {/* Empty State */}
          {!loading && !error && prompts.length === 0 && (
            <div className="text-center py-12">
              <p className="text-muted-foreground text-lg mb-4">
                لم يتم العثور على نتائج
              </p>
              <Button variant="outline" onClick={clearFilters}>
                مسح الفلاتر
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
