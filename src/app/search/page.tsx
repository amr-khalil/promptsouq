"use client";

import { PromptCard } from "@/components/PromptCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import type { Prompt } from "@/lib/schemas/api";
import { Search as SearchIcon, X } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

export default function Search() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const queryParam = searchParams.get("q") || "";
  const [searchQuery, setSearchQuery] = useState(queryParam);
  const [results, setResults] = useState<Prompt[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    setSearchQuery(queryParam);
  }, [queryParam]);

  useEffect(() => {
    if (!queryParam) {
      setResults([]);
      return;
    }

    async function fetchResults() {
      setLoading(true);
      setError("");

      try {
        const res = await fetch(
          `/api/prompts/search?q=${encodeURIComponent(queryParam)}`,
        );
        if (!res.ok) throw new Error("فشل في البحث");

        const data = await res.json();
        setResults(data.data);
      } catch {
        setError("حدث خطأ أثناء البحث");
      } finally {
        setLoading(false);
      }
    }

    fetchResults();
  }, [queryParam]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      const params = new URLSearchParams(searchParams);
      params.set("q", searchQuery);
      router.push(`/search?${params.toString()}`);
    }
  };

  const clearSearch = () => {
    setSearchQuery("");
    router.push("/search");
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <div className="text-sm text-muted-foreground mb-6">
        <Link href="/" className="hover:text-foreground">
          الرئيسية
        </Link>
        {" / "}
        <span className="text-foreground">البحث</span>
        {queryParam && ` / "${queryParam}"`}
      </div>

      {/* Search Bar */}
      <div className="max-w-2xl mx-auto mb-8">
        <form onSubmit={handleSearch} className="flex gap-2">
          <div className="relative flex-1">
            <Input
              type="search"
              placeholder="ابحث عن برومبت..."
              className="w-full pr-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          </div>
          <Button type="submit">بحث</Button>
        </form>
      </div>

      {/* Results */}
      {queryParam ? (
        <div>
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold">
              نتائج البحث عن &ldquo;{queryParam}&rdquo;
            </h1>
            <Button variant="outline" onClick={clearSearch}>
              <X className="ml-2 h-4 w-4" />
              مسح البحث
            </Button>
          </div>

          {error && (
            <div className="text-center py-12">
              <p className="text-destructive text-lg mb-4">{error}</p>
              <Button
                variant="outline"
                onClick={() => window.location.reload()}
              >
                إعادة المحاولة
              </Button>
            </div>
          )}

          {loading && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="border rounded-lg overflow-hidden">
                  <Skeleton className="aspect-video" />
                  <div className="p-4">
                    <Skeleton className="h-5 w-16 mb-2" />
                    <Skeleton className="h-4 w-full mb-2" />
                    <Skeleton className="h-3 w-full mb-3" />
                    <div className="flex items-center justify-between">
                      <Skeleton className="h-5 w-16" />
                      <Skeleton className="h-8 w-16" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {!loading && !error && results.length > 0 && (
            <>
              <p className="text-muted-foreground mb-6">
                وجدنا {results.length} نتيجة
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {results.map((prompt) => (
                  <PromptCard key={prompt.id} prompt={prompt} />
                ))}
              </div>
            </>
          )}

          {!loading && !error && results.length === 0 && (
            <div className="text-center py-12">
              <SearchIcon className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
              <h2 className="text-2xl font-bold mb-2">لم نعثر على نتائج</h2>
              <p className="text-muted-foreground mb-6">
                جرب كلمات مفتاحية مختلفة أو تصفح الفئات
              </p>
              <div className="flex gap-4 justify-center">
                <Button variant="outline" onClick={clearSearch}>
                  بحث جديد
                </Button>
                <Button asChild>
                  <Link href="/market">تصفح السوق</Link>
                </Button>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="text-center py-12">
          <SearchIcon className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
          <h2 className="text-2xl font-bold mb-2">ابحث عن البرومبتات</h2>
          <p className="text-muted-foreground mb-6">
            اكتب في الأعلى للبحث عن البرومبتات التي تحتاجها
          </p>
          <Button asChild>
            <Link href="/market">تصفح جميع البرومبتات</Link>
          </Button>
        </div>
      )}
    </div>
  );
}
