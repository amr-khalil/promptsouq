"use client";

import { ImageWithFallback } from "@/components/figma/ImageWithFallback";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import type { Prompt } from "@/lib/schemas/api";
import { ArrowRight, ShoppingBag, Trash2 } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function Cart() {
  const [cartItems, setCartItems] = useState<Prompt[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch("/api/prompts?sortBy=bestselling&limit=3");
        if (!res.ok) throw new Error("فشل في تحميل البيانات");

        const data = await res.json();
        setCartItems(data.data);
      } catch {
        setError("حدث خطأ أثناء تحميل البيانات");
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  const removeItem = (id: string) => {
    setCartItems(cartItems.filter((item) => item.id !== id));
  };

  const subtotal = cartItems.reduce((sum, item) => sum + item.price, 0);
  const tax = subtotal * 0.05;
  const total = subtotal + tax;

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Skeleton className="h-8 w-32 mb-8" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <Card>
              <CardContent className="p-6 space-y-6">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="flex gap-4">
                    <Skeleton className="w-24 h-24 rounded" />
                    <div className="flex-1">
                      <Skeleton className="h-4 w-3/4 mb-2" />
                      <Skeleton className="h-3 w-24 mb-3" />
                      <Skeleton className="h-5 w-16" />
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
          <div className="lg:col-span-1">
            <Card>
              <CardContent className="p-6">
                <Skeleton className="h-6 w-32 mb-6" />
                <div className="space-y-3">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-6 w-full" />
                </div>
                <Skeleton className="h-10 w-full mt-6" />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <p className="text-destructive text-lg mb-4">{error}</p>
        <Button onClick={() => window.location.reload()}>
          إعادة المحاولة
        </Button>
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-2xl mx-auto text-center">
          <ShoppingBag className="h-20 w-20 mx-auto mb-4 text-muted-foreground opacity-50" />
          <h1 className="text-3xl font-bold mb-2">السلة فارغة</h1>
          <p className="text-muted-foreground mb-6">
            لم تقم بإضافة أي برومبتات إلى السلة بعد
          </p>
          <Button size="lg" asChild>
            <Link href="/market">تصفح البرومبتات</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">سلة التسوق</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Cart Items */}
        <div className="lg:col-span-2">
          <Card>
            <CardContent className="p-6">
              <div className="space-y-6">
                {cartItems.map((item) => (
                  <div key={item.id}>
                    <div className="flex gap-4">
                      <ImageWithFallback
                        src={item.thumbnail}
                        alt={item.title}
                        className="w-24 h-24 rounded object-cover"
                      />
                      <div className="flex-1">
                        <Link href={`/prompt/${item.id}`}>
                          <h3 className="font-bold mb-2 hover:text-primary transition-colors">
                            {item.title}
                          </h3>
                        </Link>
                        <div className="flex items-center gap-2 mb-3">
                          <Badge variant="secondary">{item.aiModel}</Badge>
                          <span className="text-sm text-muted-foreground">
                            {item.category}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="font-bold text-lg">${item.price}</div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeItem(item.id)}
                            className="text-destructive hover:text-destructive"
                          >
                            <Trash2 className="h-4 w-4 ml-2" />
                            حذف
                          </Button>
                        </div>
                      </div>
                    </div>
                    {item.id !== cartItems[cartItems.length - 1].id && (
                      <Separator className="mt-6" />
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Button variant="outline" className="mt-4" asChild>
            <Link href="/market">
              <ArrowRight className="ml-2 h-4 w-4" />
              متابعة التسوق
            </Link>
          </Button>
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <Card className="sticky top-20">
            <CardContent className="p-6">
              <h2 className="font-bold text-xl mb-6">ملخص الطلب</h2>

              <div className="space-y-3 mb-6">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">المجموع الفرعي:</span>
                  <span className="font-bold">${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">الضريبة (5%):</span>
                  <span className="font-bold">${tax.toFixed(2)}</span>
                </div>
                <Separator />
                <div className="flex justify-between text-lg">
                  <span className="font-bold">الإجمالي:</span>
                  <span className="font-bold text-primary">
                    ${total.toFixed(2)}
                  </span>
                </div>
              </div>

              <Button size="lg" className="w-full mb-3" asChild>
                <Link href="/checkout">إتمام الشراء</Link>
              </Button>

              <div className="text-xs text-muted-foreground text-center">
                دفع آمن ومشفر • ضمان استرداد لمدة 7 أيام
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
