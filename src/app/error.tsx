"use client";

import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function Error({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="container mx-auto px-4 py-20">
      <div className="max-w-md mx-auto text-center">
        <h2 className="text-2xl font-bold mb-2">حدث خطأ غير متوقع</h2>
        <p className="text-muted-foreground mb-8">
          عذراً، حدث خطأ أثناء تحميل الصفحة. يرجى المحاولة مرة أخرى.
        </p>
        <div className="flex gap-4 justify-center">
          <Button onClick={reset}>إعادة المحاولة</Button>
          <Button variant="outline" asChild>
            <Link href="/">العودة للرئيسية</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
