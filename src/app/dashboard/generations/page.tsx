"use client";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { FileText, ImageIcon, Coins, Sparkles } from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";

interface Generation {
  id: string;
  promptId: string;
  promptTitle: string;
  generationType: "text" | "image";
  model: string;
  resultText: string | null;
  resultImageUrl: string | null;
  status: string;
  creditsConsumed: number;
  createdAt: string;
}

export default function GenerationsPage() {
  const [generations, setGenerations] = useState<Generation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchGenerations() {
      try {
        const res = await fetch("/api/generations?limit=20&offset=0");
        if (!res.ok) throw new Error("فشل في تحميل التوليدات");
        const json = await res.json();
        setGenerations(json.data);
      } catch {
        setError("حدث خطأ أثناء تحميل التوليدات");
      } finally {
        setLoading(false);
      }
    }
    fetchGenerations();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Card key={i}>
              <CardContent className="p-4 space-y-3">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-24 w-full" />
                <div className="flex gap-2">
                  <Skeleton className="h-5 w-12" />
                  <Skeleton className="h-5 w-16" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-destructive mb-4">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="text-primary underline"
        >
          إعادة المحاولة
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold">التوليدات السابقة</h2>

      {generations.length === 0 ? (
        <div className="text-center py-12">
          <Sparkles className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-bold mb-2">لا توجد توليدات سابقة</h3>
          <p className="text-muted-foreground">
            عند استخدام رصيدك لتوليد محتوى، ستظهر النتائج هنا
          </p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {generations.map((gen) => (
            <Card key={gen.id} className="overflow-hidden">
              <CardContent className="p-4 space-y-3">
                <h3 className="font-bold text-sm line-clamp-1">
                  {gen.promptTitle}
                </h3>

                {/* Result preview */}
                {gen.generationType === "image" && gen.resultImageUrl ? (
                  <div className="relative h-32 w-full rounded-md overflow-hidden bg-muted">
                    <Image
                      src={gen.resultImageUrl}
                      alt={gen.promptTitle}
                      fill
                      className="object-cover"
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    />
                  </div>
                ) : gen.resultText ? (
                  <div className="bg-muted rounded-md p-3 text-sm text-muted-foreground line-clamp-4 min-h-[6rem]">
                    {gen.resultText.length > 100
                      ? `${gen.resultText.slice(0, 100)}...`
                      : gen.resultText}
                  </div>
                ) : (
                  <div className="bg-muted rounded-md p-3 text-sm text-muted-foreground min-h-[6rem] flex items-center justify-center">
                    {gen.status === "pending"
                      ? "جاري التوليد..."
                      : "لا توجد نتيجة"}
                  </div>
                )}

                {/* Badges row */}
                <div className="flex items-center gap-2 flex-wrap">
                  <Badge variant="secondary" className="text-xs">
                    {gen.generationType === "text" ? (
                      <span className="flex items-center gap-1">
                        <FileText className="h-3 w-3" />
                        نص
                      </span>
                    ) : (
                      <span className="flex items-center gap-1">
                        <ImageIcon className="h-3 w-3" />
                        صورة
                      </span>
                    )}
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    {gen.model}
                  </Badge>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground mr-auto">
                    <Coins className="h-3 w-3" />
                    <span>{gen.creditsConsumed}</span>
                  </div>
                </div>

                {/* Date */}
                <p className="text-xs text-muted-foreground">
                  {new Date(gen.createdAt).toLocaleDateString("ar-SA", {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
