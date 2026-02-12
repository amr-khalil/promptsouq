"use client";

import { PurchaseCard } from "@/components/dashboard/PurchaseCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { z } from "zod";
import type { purchaseListItemSchema } from "@/lib/schemas/api";
import { PackageOpen, Search } from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

type PurchaseItem = z.infer<typeof purchaseListItemSchema>;

export default function PurchasesPage() {
  const [purchases, setPurchases] = useState<PurchaseItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [aiModelFilter, setAiModelFilter] = useState("all");

  useEffect(() => {
    async function fetchPurchases() {
      try {
        const res = await fetch("/api/user/purchases");
        if (!res.ok) throw new Error("فشل في تحميل المشتريات");
        const json = await res.json();
        setPurchases(json.data);
      } catch {
        setError("حدث خطأ أثناء تحميل المشتريات");
      } finally {
        setLoading(false);
      }
    }
    fetchPurchases();
  }, []);

  const aiModels = useMemo(() => {
    const models = new Set(purchases.map((p) => p.aiModel));
    return Array.from(models).sort();
  }, [purchases]);

  const filtered = useMemo(() => {
    return purchases.filter((p) => {
      const matchesSearch =
        !searchQuery ||
        p.title.includes(searchQuery) ||
        p.titleEn.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesModel =
        aiModelFilter === "all" || p.aiModel === aiModelFilter;
      return matchesSearch && matchesModel;
    });
  }, [purchases, searchQuery, aiModelFilter]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-destructive mb-4">{error}</p>
        <Button onClick={() => window.location.reload()}>إعادة المحاولة</Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold">المشتريات</h2>

      {purchases.length > 0 && (
        <div className="flex gap-3">
          <div className="relative flex-1">
            <Input
              type="search"
              placeholder="ابحث في مشترياتك..."
              className="pr-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          </div>
          <Select value={aiModelFilter} onValueChange={setAiModelFilter}>
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="نموذج الذكاء" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">الكل</SelectItem>
              {aiModels.map((model) => (
                <SelectItem key={model} value={model}>
                  {model}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {purchases.length === 0 ? (
        <div className="text-center py-12">
          <PackageOpen className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-bold mb-2">لا توجد مشتريات بعد</h3>
          <p className="text-muted-foreground mb-4">
            تصفح السوق واشترِ أول برومبت لك
          </p>
          <Button asChild>
            <Link href="/market">تصفح السوق</Link>
          </Button>
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">
            لا توجد نتائج مطابقة لبحثك
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((item) => (
            <PurchaseCard key={item.id} item={item} />
          ))}
        </div>
      )}
    </div>
  );
}
