"use client";

import { FavoriteButton } from "@/components/dashboard/FavoriteButton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import type { Prompt } from "@/lib/schemas/api";
import { Heart, Star } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

interface FavoriteItem extends Prompt {
  favoritedAt: string;
}

export default function FavoritesPage() {
  const [favorites, setFavorites] = useState<FavoriteItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchFavorites() {
      try {
        const res = await fetch("/api/favorites");
        if (!res.ok) throw new Error("فشل في تحميل المفضلة");
        const json = await res.json();
        setFavorites(json.data);
      } catch {
        setError("حدث خطأ أثناء تحميل المفضلة");
      } finally {
        setLoading(false);
      }
    }
    fetchFavorites();
  }, []);

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
      <h2 className="text-xl font-bold">المفضلة</h2>

      {favorites.length === 0 ? (
        <div className="text-center py-12">
          <Heart className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-bold mb-2">لا توجد مفضلات بعد</h3>
          <p className="text-muted-foreground mb-4">
            تصفح السوق وأضف البرومبتات المفضلة لديك
          </p>
          <Button asChild>
            <Link href="/market">تصفح السوق</Link>
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          {favorites.map((item) => (
            <Card key={item.id} className="hover:bg-muted/50 transition-colors">
              <CardContent className="p-4">
                <div className="flex items-center gap-4">
                  <Link
                    href={`/prompt/${item.id}`}
                    className="relative w-20 h-20 rounded-lg overflow-hidden shrink-0"
                  >
                    <Image
                      src={item.thumbnail}
                      alt={item.title}
                      fill
                      className="object-cover"
                      sizes="80px"
                    />
                  </Link>
                  <div className="flex-1 min-w-0">
                    <Link href={`/prompt/${item.id}`}>
                      <h3 className="font-bold truncate hover:text-primary transition-colors">
                        {item.title}
                      </h3>
                    </Link>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="secondary" className="text-xs">
                        {item.aiModel}
                      </Badge>
                      <div className="flex items-center gap-1 text-sm">
                        <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                        <span>{item.rating}</span>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      {item.seller.name}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <div className="font-bold">${item.price}</div>
                    <FavoriteButton
                      promptId={item.id}
                      isFavorited={true}
                      size="icon"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
