"use client";

import { CreditBadge } from "@/components/credits/CreditBadge";
import { useCartItemCount } from "@/hooks/use-cart";
import {
  SignInButton,
  SignUpButton,
  SignedIn,
  SignedOut,
  UserButton,
  useUser,
} from "@clerk/nextjs";
import { Menu, Shield, ShoppingCart, User } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Button } from "./ui/button";
import { Sheet, SheetContent, SheetTrigger } from "./ui/sheet";

function useAdminPendingCount(isAdmin: boolean) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!isAdmin) return;
    let cancelled = false;

    const fetchCount = async () => {
      try {
        const res = await fetch(
          "/api/admin/prompts?status=pending&countOnly=true",
        );
        if (res.ok && !cancelled) {
          const json = await res.json();
          setCount(json.data?.count ?? 0);
        }
      } catch {
        // Ignore
      }
    };

    fetchCount();
    // Poll every 5 minutes
    const interval = setInterval(fetchCount, 300_000);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [isAdmin]);

  return count;
}

export function Header() {
  const cartCount = useCartItemCount();
  const { user } = useUser();
  const isAdmin =
    (user?.publicMetadata as { role?: string } | undefined)?.role === "admin";
  const pendingCount = useAdminPendingCount(isAdmin);

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center gap-4">
          {/* Logo - Left */}
          <div className="flex-1 flex items-center">
            <Link href="/" className="flex items-center gap-2 shrink-0">
              <img
                src="/logo.png"
                alt="Logo"
                className="w-24 h-24x object-contain shrink-0"
              />
              <div className="hidden sm:block">
                <div className="font-bold text-lg whitespace-nowrap">
                  سوق البرومبتات
                </div>
              </div>
            </Link>
          </div>

          {/* Center Navigation */}
          <nav className="hidden md:flex items-center gap-2">
            <Button variant="ghost" asChild>
              <Link href="/"> الرئيسية</Link>
            </Button>
            <Button variant="ghost" asChild>
              <Link href="/market">تصفح الأوامر</Link>
            </Button>
            <Button variant="ghost" asChild>
              <Link href="/sell">بيع الأوامر</Link>
            </Button>
            <Button variant="ghost" asChild>
              <Link href="/subscription">الأسعار</Link>
            </Button>
          </nav>

          {/* Right Actions */}
          <div className="flex-1 hidden md:flex items-center justify-end gap-2">
            <Button variant="ghost" size="icon" asChild className="relative">
              <Link href="/cart">
                <ShoppingCart className="h-5 w-5" />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                    {cartCount}
                  </span>
                )}
              </Link>
            </Button>
            <SignedIn>
              <CreditBadge />
              {isAdmin && (
                <Button
                  variant="ghost"
                  size="icon"
                  asChild
                  className="relative"
                >
                  <Link href="/admin/review">
                    <Shield className="h-5 w-5" />
                    {pendingCount > 0 && (
                      <span className="absolute -top-1 -right-1 bg-destructive text-destructive-foreground text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                        {pendingCount}
                      </span>
                    )}
                  </Link>
                </Button>
              )}
              <Button variant="ghost" size="icon" asChild>
                <Link href="/dashboard">
                  <User className="h-5 w-5" />
                </Link>
              </Button>
              <UserButton />
            </SignedIn>
            <SignedOut>
              <SignInButton>
                <Button variant="ghost">تسجيل الدخول</Button>
              </SignInButton>
              <SignUpButton>
                <Button variant={"neonGradient"}>إنشاء حساب</Button>
              </SignUpButton>
            </SignedOut>
          </div>

          {/* Mobile Menu */}
          <div className="flex md:hidden items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              asChild
              className="shrink-0 relative"
            >
              <Link href="/cart">
                <ShoppingCart className="h-5 w-5" />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                    {cartCount}
                  </span>
                )}
              </Link>
            </Button>

            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="shrink-0">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[300px]">
                <div className="flex flex-col gap-4 mt-8">
                  <div className="flex flex-col gap-2">
                    <Button variant="ghost" asChild>
                      <Link href="/market">تصفح الأوامر</Link>
                    </Button>
                    <Button variant="ghost" asChild>
                      <Link href="/sell">بيع الأوامر</Link>
                    </Button>
                    <Button variant="ghost" asChild>
                      <Link href="/subscription">الأسعار</Link>
                    </Button>
                    <SignedIn>
                      <CreditBadge />
                      {isAdmin && (
                        <Button
                          variant="ghost"
                          asChild
                          className="justify-start"
                        >
                          <Link href="/admin/review">
                            <Shield className="h-4 w-4 me-2" />
                            مراجعة البرومبتات
                            {pendingCount > 0 && (
                              <span className="ms-auto bg-destructive text-destructive-foreground text-xs font-bold rounded-full h-5 min-w-5 px-1.5 flex items-center justify-center">
                                {pendingCount}
                              </span>
                            )}
                          </Link>
                        </Button>
                      )}
                      <Button variant="ghost" asChild>
                        <Link href="/dashboard">لوحة التحكم</Link>
                      </Button>
                      <div className="flex justify-center py-2">
                        <UserButton />
                      </div>
                    </SignedIn>
                    <SignedOut>
                      <SignInButton>
                        <Button variant="ghost" className="w-full">
                          تسجيل الدخول
                        </Button>
                      </SignInButton>
                      <SignUpButton>
                        <Button className="w-full">إنشاء حساب</Button>
                      </SignUpButton>
                    </SignedOut>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
}
