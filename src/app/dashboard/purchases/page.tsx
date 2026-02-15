"use client";

import { PurchaseCard } from "@/components/dashboard/PurchaseCard";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { z } from "zod";
import type { purchaseListItemSchema } from "@/lib/schemas/api";
import { PackageOpen, Search, Sparkles } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

type PurchaseItem = z.infer<typeof purchaseListItemSchema>;

interface FreeAccessItem {
  id: string;
  title: string;
  titleEn: string;
  thumbnail: string;
  aiModel: string;
  category: string;
  seller: { name: string; avatar: string; rating: number };
  accessedAt: string;
}

export default function PurchasesPage() {
  const [purchases, setPurchases] = useState<PurchaseItem[]>([]);
  const [freeItems, setFreeItems] = useState<FreeAccessItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [freeLoading, setFreeLoading] = useState(true);
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

  useEffect(() => {
    async function fetchFreeAccess() {
      try {
        const res = await fetch("/api/free-access");
        if (!res.ok) throw new Error("فشل في تحميل البرومبتات المجانية");
        const json = await res.json();
        setFreeItems(json.data);
      } catch {
        // Silently fail — free tab just shows empty
      } finally {
        setFreeLoading(false);
      }
    }
    fetchFreeAccess();
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

      <Tabs defaultValue="purchases">
        <TabsList>
          <TabsTrigger value="purchases">مشترياتي</TabsTrigger>
          <TabsTrigger value="free">برومبتات مجانية</TabsTrigger>
        </TabsList>

        <TabsContent value="purchases" className="mt-4 space-y-4">
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
        </TabsContent>

        <TabsContent value="free" className="mt-4">
          {freeLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
            </div>
          ) : freeItems.length === 0 ? (
            <div className="text-center py-12">
              <Sparkles className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-bold mb-2">لم تقم بالوصول إلى أي برومبتات مجانية بعد</h3>
              <p className="text-muted-foreground mb-4">
                تصفح السوق واكتشف البرومبتات المجانية
              </p>
              <Button asChild>
                <Link href="/market">تصفح السوق</Link>
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {freeItems.map((item) => (
                <Card key={item.id}>
                  <CardContent className="flex items-center gap-4 p-4">
                    <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg">
                      <Image
                        src={item.thumbnail}
                        alt={item.title}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <Link
                        href={`/prompt/${item.id}`}
                        className="font-bold hover:underline line-clamp-1"
                      >
                        {item.title}
                      </Link>
                      <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
                        <Badge variant="secondary" className="text-xs">{item.aiModel}</Badge>
                        <span>{item.category}</span>
                      </div>
                    </div>
                    <div className="shrink-0 text-left">
                      <Badge className="bg-green-600 text-white hover:bg-green-700">مجاني</Badge>
                      <p className="text-xs text-muted-foreground mt-1">
                        {new Date(item.accessedAt).toLocaleDateString("ar-SA")}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
