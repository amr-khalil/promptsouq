"use client";

import { useCartItemCount } from "@/hooks/use-cart";
import {
  SignInButton,
  SignUpButton,
  SignedIn,
  SignedOut,
  UserButton,
} from "@clerk/nextjs";
import { Menu, ShoppingCart, User } from "lucide-react";
import Link from "next/link";
import { Button } from "./ui/button";
import { Sheet, SheetContent, SheetTrigger } from "./ui/sheet";

export function Header() {
  const cartCount = useCartItemCount();

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between gap-4">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 shrink-0">
            <div className="w-8 h-8 bg-gradient-to-br from-purple-600 to-blue-500 rounded-lg flex items-center justify-center">
              <img src="/logo.png" alt="Logo" className="w-8 h-8" />
            </div>
            <div className="hidden sm:block">
              <div className="font-bold text-lg">سوق البرومبتات</div>
            </div>
          </Link>

          {/* Desktop Navigation */}
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
          </nav>

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
                    <SignedIn>
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
