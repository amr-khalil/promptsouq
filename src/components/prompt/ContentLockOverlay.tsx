"use client";

import { Button } from "@/components/ui/button";
import { Lock } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export function ContentLockOverlay() {
  const pathname = usePathname();
  const redirectParam = encodeURIComponent(pathname);

  return (
    <div className="relative overflow-hidden rounded-lg border">
      {/* Decorative blurred placeholder */}
      <div className="h-64 bg-gradient-to-br from-muted/60 via-muted/30 to-muted/60 backdrop-blur-xl" />

      {/* Lock overlay */}
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-background/80 backdrop-blur-sm">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-muted">
          <Lock className="h-7 w-7 text-muted-foreground" />
        </div>
        <p className="text-lg font-semibold">سجل دخولك لرؤية المحتوى</p>
        <div className="flex gap-3">
          <Button asChild>
            <Link href={`/sign-in?redirect_url=${redirectParam}`}>
              تسجيل الدخول
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href={`/sign-up?redirect_url=${redirectParam}`}>
              إنشاء حساب
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
