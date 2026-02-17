"use client";

import { ImageWithFallback } from "@/components/figma/ImageWithFallback";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useCartStore } from "@/stores/cart-store";
import { AlertTriangle, ArrowRight, ShoppingBag, Trash2 } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export default function Cart() {
  const { items, removeItem } = useCartStore();
  const [staleIds, setStaleIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (items.length === 0) return;
    Promise.all(
      items.map((item) =>
        fetch(`/api/prompts/${item.promptId}`).then((res) => ({
          promptId: item.promptId,
          exists: res.ok,
        })),
      ),
    ).then((results) => {
      const missing = results
        .filter((r) => !r.exists)
        .map((r) => r.promptId);
      if (missing.length > 0) {
        setStaleIds(new Set(missing));
      }
    });
  }, [items]);

  const subtotal = items.reduce((sum, item) => sum + item.price, 0);
  const tax = subtotal * 0.05;
  const total = subtotal + tax;

  function handleRemove(promptId: string) {
    removeItem(promptId);
    toast.success("تم الحذف من السلة");
  }

  if (items.length === 0) {
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
                {items.map((item, index) => (
                  <div key={item.promptId}>
                    <div className="flex gap-4">
                      <ImageWithFallback
                        src={item.thumbnail}
                        alt={item.title}
                        className="w-24 h-24 rounded object-cover"
                      />
                      <div className="flex-1">
                        <Link href={`/prompt/${item.promptId}`}>
                          <h3 className="font-bold mb-2 hover:text-primary transition-colors">
                            {item.title}
                          </h3>
                        </Link>
                        {staleIds.has(item.promptId) && (
                          <div className="flex items-center gap-1 text-sm text-amber-600 mb-2">
                            <AlertTriangle className="h-4 w-4" />
                            <span>هذا المنتج لم يعد متوفراً</span>
                          </div>
                        )}
                        <div className="flex items-center justify-between">
                          <div className="font-bold text-lg">
                            ${item.price}
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRemove(item.promptId)}
                            className="text-destructive hover:text-destructive"
                          >
                            <Trash2 className="h-4 w-4 ml-2" />
                            حذف
                          </Button>
                        </div>
                      </div>
                    </div>
                    {index !== items.length - 1 && (
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
