"use client";

import { ImageWithFallback } from "@/components/figma/ImageWithFallback";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useCartStore } from "@/stores/cart-store";
import { useAuth } from "@/hooks/use-auth";
import { CheckCircle2, Lock, ShoppingBag } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

export default function Checkout() {
  const router = useRouter();
  const { isSignedIn, isLoaded } = useAuth();
  const { items } = useCartStore();
  const [isProcessing, setIsProcessing] = useState(false);

  const subtotal = items.reduce((sum, item) => sum + item.price, 0);
  const tax = subtotal * 0.05;
  const total = subtotal + tax;

  async function handleCheckout() {
    if (!isSignedIn) {
      toast.error("يجب تسجيل الدخول أولاً");
      router.push("/sign-in");
      return;
    }

    setIsProcessing(true);

    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: items.map((item) => ({ promptId: item.promptId })),
          referralSources: Object.fromEntries(
            items.map((item) => {
              const ref = sessionStorage.getItem(`ref_${item.promptId}`);
              return [item.promptId, ref === "direct" ? "direct" : "marketplace"];
            }),
          ),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || "حدث خطأ أثناء إنشاء جلسة الدفع");
        return;
      }

      if (data.url) {
        window.location.href = data.url;
      }
    } catch {
      toast.error("حدث خطأ أثناء الاتصال بالخادم");
    } finally {
      setIsProcessing(false);
    }
  }

  if (!isLoaded) {
    return null;
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
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">إتمام الشراء</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>الدفع عبر Stripe</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground">
                  سيتم توجيهك إلى صفحة الدفع الآمنة من Stripe لإتمام عملية
                  الشراء.
                </p>

                <Button
                  size="lg"
                  className="w-full"
                  disabled={isProcessing}
                  onClick={handleCheckout}
                >
                  {isProcessing ? (
                    "جاري التوجيه..."
                  ) : (
                    <>
                      <Lock className="ml-2 h-5 w-5" />
                      إتمام الدفع ${total.toFixed(2)}
                    </>
                  )}
                </Button>

                <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                  <Lock className="h-4 w-4" />
                  <span>معاملتك آمنة ومشفرة</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <Card className="sticky top-20">
              <CardHeader>
                <CardTitle>ملخص الطلب</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4 mb-6">
                  {items.map((item) => (
                    <div key={item.promptId} className="flex gap-3">
                      <ImageWithFallback
                        src={item.thumbnail}
                        alt={item.title}
                        className="w-16 h-16 rounded object-cover"
                      />
                      <div className="flex-1 min-w-0">
                        <h4 className="font-bold text-sm line-clamp-2 mb-1">
                          {item.title}
                        </h4>
                        <div className="text-sm font-bold">${item.price}</div>
                      </div>
                    </div>
                  ))}
                </div>

                <Separator className="my-4" />

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">
                      المجموع الفرعي:
                    </span>
                    <span>${subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">الضريبة (5%):</span>
                    <span>${tax.toFixed(2)}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between font-bold text-lg">
                    <span>الإجمالي:</span>
                    <span className="text-primary">${total.toFixed(2)}</span>
                  </div>
                </div>

                <Separator className="my-6" />

                <div className="space-y-3">
                  <div className="flex items-start gap-2 text-sm">
                    <CheckCircle2 className="h-4 w-4 text-green-600 shrink-0 mt-0.5" />
                    <span className="text-muted-foreground">
                      وصول فوري بعد الدفع
                    </span>
                  </div>
                  <div className="flex items-start gap-2 text-sm">
                    <CheckCircle2 className="h-4 w-4 text-green-600 shrink-0 mt-0.5" />
                    <span className="text-muted-foreground">
                      ضمان استرداد لمدة 7 أيام
                    </span>
                  </div>
                  <div className="flex items-start gap-2 text-sm">
                    <CheckCircle2 className="h-4 w-4 text-green-600 shrink-0 mt-0.5" />
                    <span className="text-muted-foreground">
                      دعم فني متاح 24/7
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
