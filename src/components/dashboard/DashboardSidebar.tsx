"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { useUser } from "@clerk/nextjs";
import {
  AlertCircle,
  AlertTriangle,
  BarChart3,
  Coins,
  DollarSign,
  FileText,
  Heart,
  Image,
  ImagePlus,
  Receipt,
  Settings,
  Shield,
  ShoppingBag,
  SlidersHorizontal,
  Sparkles,
  Store,
  User,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslation } from "react-i18next";

interface NavItem {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

const buyerNavItems: NavItem[] = [
  { href: "/dashboard", label: "الملف الشخصي", icon: User },
  { href: "/dashboard/purchases", label: "المشتريات", icon: ShoppingBag },
  { href: "/dashboard/credits", label: "الرصيد", icon: Coins },
  { href: "/dashboard/generations", label: "التوليدات", icon: Sparkles },
  { href: "/dashboard/favorites", label: "المفضلة", icon: Heart },
  { href: "/dashboard/issues", label: "البلاغات", icon: AlertTriangle },
  { href: "/dashboard/settings", label: "الإعدادات", icon: Settings },
];

interface DashboardSidebarProps {
  isSeller: boolean;
  isAdmin: boolean;
}

export function DashboardSidebar({ isSeller, isAdmin }: DashboardSidebarProps) {
  const pathname = usePathname();
  const { user } = useUser();
  const { t } = useTranslation("dashboard");

  const sellerNavItems: NavItem[] = [
    { href: "/dashboard/seller/prompts", label: t("sidebar.myPrompts"), icon: FileText },
    { href: "/dashboard/seller/earnings", label: t("sidebar.salesEarnings"), icon: DollarSign },
    { href: "/dashboard/seller/gallery", label: t("sidebar.galleryImages"), icon: Image },
    { href: "/dashboard/seller/profile", label: t("sidebar.sellerProfile"), icon: Store },
  ];

  const adminNavItems: NavItem[] = [
    { href: "/dashboard/admin/moderation", label: t("sidebar.moderation"), icon: Shield },
    { href: "/dashboard/admin/gallery", label: t("sidebar.galleryModeration"), icon: ImagePlus },
    { href: "/dashboard/admin/issues", label: t("sidebar.issues"), icon: AlertCircle },
    { href: "/dashboard/admin/orders", label: t("sidebar.orders"), icon: Receipt },
    { href: "/dashboard/admin/analytics", label: t("sidebar.analytics"), icon: BarChart3 },
    { href: "/dashboard/admin/settings", label: t("sidebar.settings"), icon: SlidersHorizontal },
  ];

  const isActive = (href: string) => {
    if (href === "/dashboard") return pathname === "/dashboard" || pathname.match(/^\/[a-z]{2}\/dashboard$/);
    // Match locale-prefixed routes
    return pathname.includes(href);
  };

  const renderNavGroup = (items: NavItem[], groupLabel?: string) => (
    <>
      {groupLabel && (
        <>
          <Separator className="my-3" />
          <p className="text-xs font-semibold text-muted-foreground mb-2 px-2">
            {groupLabel}
          </p>
        </>
      )}
      {items.map((item) => (
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
            <item.icon className="me-2 h-4 w-4" />
            {item.label}
          </Link>
        </Button>
      ))}
    </>
  );

  const renderMobileNavGroup = (items: NavItem[]) =>
    items.map((item) => (
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
          <item.icon className="me-1 h-4 w-4" />
          {item.label}
        </Link>
      </Button>
    ));

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
              {renderNavGroup(buyerNavItems)}
              {isSeller && renderNavGroup(sellerNavItems, t("sidebar.seller"))}
              {isAdmin && renderNavGroup(adminNavItems, t("sidebar.admin"))}
            </nav>
          </CardContent>
        </Card>
      </aside>

      {/* Mobile Horizontal Nav */}
      <nav className="lg:hidden flex gap-1 overflow-x-auto pb-2 mb-4">
        {renderMobileNavGroup(buyerNavItems)}
        {isSeller && (
          <>
            <Separator orientation="vertical" className="h-8 mx-1 self-center" />
            {renderMobileNavGroup(sellerNavItems)}
          </>
        )}
        {isAdmin && (
          <>
            <Separator orientation="vertical" className="h-8 mx-1 self-center" />
            {renderMobileNavGroup(adminNavItems)}
          </>
        )}
      </nav>
    </>
  );
}
