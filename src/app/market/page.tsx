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
import { Slider } from "@/components/ui/slider";
import { categories, prompts } from "@/data/mockData";
import { Filter, X } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useState } from "react";

export default function Market() {
  const searchParams = useSearchParams();
  const categoryParam = searchParams.get("category");

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

  let filteredPrompts = prompts.filter((prompt) => {
    if (
      selectedCategories.length > 0 &&
      !selectedCategories.includes(prompt.category)
    ) {
      return false;
    }
    if (selectedModels.length > 0 && !selectedModels.includes(prompt.aiModel)) {
      return false;
    }
    if (prompt.price < priceRange[0] || prompt.price > priceRange[1]) {
      return false;
    }
    return true;
  });

  // Sort
  if (sortBy === "bestselling") {
    filteredPrompts = [...filteredPrompts].sort((a, b) => b.sales - a.sales);
  } else if (sortBy === "newest") {
    filteredPrompts = [...filteredPrompts]; // Already in order
  } else if (sortBy === "rating") {
    filteredPrompts = [...filteredPrompts].sort((a, b) => b.rating - a.rating);
  } else if (sortBy === "price-low") {
    filteredPrompts = [...filteredPrompts].sort((a, b) => a.price - b.price);
  } else if (sortBy === "price-high") {
    filteredPrompts = [...filteredPrompts].sort((a, b) => b.price - a.price);
  }

  const FiltersContent = () => (
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
          استكشف {filteredPrompts.length} من البرومبتات الاحترافية
        </p>
      </div>

      <div className="flex flex-col md:flex-row gap-6">
        {/* Filters Sidebar - Desktop */}
        <aside className="hidden md:block w-64 shrink-0">
          <div className="sticky top-20 border rounded-lg p-4 bg-card">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold">الفلاتر</h2>
              <Filter className="h-4 w-4" />
            </div>
            <FiltersContent />
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
              <div className="mt-6">
                <FiltersContent />
              </div>
            </SheetContent>
          </Sheet>
        </div>

        {/* Main Content */}
        <div className="flex-1">
          {/* Sort */}
          <div className="flex items-center justify-between mb-6">
            <div className="text-sm text-muted-foreground">
              {filteredPrompts.length} نتيجة
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

          {/* Prompts Grid */}
          {filteredPrompts.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredPrompts.map((prompt) => (
                <PromptCard key={prompt.id} prompt={prompt} />
              ))}
            </div>
          ) : (
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
