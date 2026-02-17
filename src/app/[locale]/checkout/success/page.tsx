"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useCartStore } from "@/stores/cart-store";
import { CheckCircle2, Loader2 } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

export default function CheckoutSuccess() {
  const clearCart = useCartStore((state) => state.clearCart);
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("session_id");
  const [verifying, setVerifying] = useState(!!sessionId);

  useEffect(() => {
    clearCart();
  }, [clearCart]);

  useEffect(() => {
    if (!sessionId) return;

    fetch("/api/checkout/verify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sessionId }),
    })
      .catch(() => {})
      .finally(() => setVerifying(false));
  }, [sessionId]);

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-lg mx-auto text-center">
        <Card>
          <CardContent className="p-8">
            <CheckCircle2 className="h-16 w-16 text-green-600 mx-auto mb-4" />
            <h1 className="text-2xl font-bold mb-2">تمت عملية الشراء بنجاح!</h1>
            <p className="text-muted-foreground mb-6">
              شكراً لك! تم إتمام الدفع بنجاح. يمكنك الآن الوصول إلى
              البرومبتات التي اشتريتها.
            </p>
            <div className="space-y-3">
              <Button size="lg" className="w-full" asChild disabled={verifying}>
                {verifying ? (
                  <span className="flex items-center justify-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    جارٍ تأكيد الطلب...
                  </span>
                ) : (
                  <Link href="/dashboard/purchases">عرض مشترياتي</Link>
                )}
              </Button>
              <Button size="lg" variant="outline" className="w-full" asChild>
                <Link href="/market">تصفح المزيد من البرومبتات</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
