"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { useUser } from "@clerk/nextjs";
import { Coins, Heart, Settings, ShoppingBag, Sparkles, User } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { href: "/dashboard", label: "الملف الشخصي", icon: User },
  { href: "/dashboard/purchases", label: "المشتريات", icon: ShoppingBag },
  { href: "/dashboard/credits", label: "الرصيد", icon: Coins },
  { href: "/dashboard/generations", label: "التوليدات", icon: Sparkles },
  { href: "/dashboard/favorites", label: "المفضلة", icon: Heart },
  { href: "/dashboard/settings", label: "الإعدادات", icon: Settings },
] as const;

export function DashboardSidebar() {
  const pathname = usePathname();
  const { user } = useUser();

  const isActive = (href: string) => {
    if (href === "/dashboard") return pathname === "/dashboard";
    return pathname.startsWith(href);
  };

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden lg:block">
        <Card>
          <CardContent className="p-6">
            <div className="text-center mb-6">
              <Avatar className="w-20 h-20 mx-auto mb-3">
                <AvatarImage src={user?.imageUrl} />
                <AvatarFallback>
                  {user?.firstName?.charAt(0) ?? "م"}
                </AvatarFallback>
              </Avatar>
              <h2 className="font-bold text-lg">
                {user?.fullName ?? "مستخدم"}
              </h2>
              <p className="text-sm text-muted-foreground">
                {user?.primaryEmailAddress?.emailAddress}
              </p>
            </div>

            <Separator className="my-4" />

            <nav className="space-y-1">
              {navItems.map((item) => (
                <Button
                  key={item.href}
                  variant={isActive(item.href) ? "secondary" : "ghost"}
                  className={cn(
                    "w-full justify-start",
                    isActive(item.href) && "font-bold",
                  )}
                  asChild
                >
                  <Link href={item.href}>
                    <item.icon className="ml-2 h-4 w-4" />
                    {item.label}
                  </Link>
                </Button>
              ))}
            </nav>
          </CardContent>
        </Card>
      </aside>

      {/* Mobile Horizontal Nav */}
      <nav className="lg:hidden flex gap-1 overflow-x-auto pb-2 mb-4">
        {navItems.map((item) => (
          <Button
            key={item.href}
            variant={isActive(item.href) ? "secondary" : "ghost"}
            size="sm"
            className={cn(
              "shrink-0",
              isActive(item.href) && "font-bold",
            )}
            asChild
          >
            <Link href={item.href}>
              <item.icon className="ml-1 h-4 w-4" />
              {item.label}
            </Link>
          </Button>
        ))}
      </nav>
    </>
  );
}
