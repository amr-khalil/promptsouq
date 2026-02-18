"use client";

import {
  Coins,
  Heart,
  ShoppingBag,
  Sparkles,
  User,
  AlertTriangle,
} from "lucide-react";
import { LocaleLink } from "@/components/LocaleLink";
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { usePathname } from "next/navigation";
import { useTranslation } from "react-i18next";

export function DashboardNavMain() {
  const pathname = usePathname();
  const { t } = useTranslation("dashboard");

  const items = [
    { href: "/dashboard", label: t("sidebar.profile"), icon: User },
    { href: "/dashboard/purchases", label: t("sidebar.purchases"), icon: ShoppingBag },
    { href: "/dashboard/credits", label: t("sidebar.credits"), icon: Coins },
    { href: "/dashboard/generations", label: t("sidebar.generations"), icon: Sparkles },
    { href: "/dashboard/favorites", label: t("sidebar.favorites"), icon: Heart },
    { href: "/dashboard/issues", label: t("sidebar.reportIssues"), icon: AlertTriangle },
  ];

  const isActive = (href: string) => {
    if (href === "/dashboard") {
      return pathname === "/dashboard" || !!pathname.match(/^\/[a-z]{2}\/dashboard$/);
    }
    return pathname.includes(href);
  };

  return (
    <SidebarGroup>
      <SidebarGroupLabel>{t("sidebar.buyer")}</SidebarGroupLabel>
      <SidebarGroupContent>
        <SidebarMenu>
          {items.map((item) => (
            <SidebarMenuItem key={item.href}>
              <SidebarMenuButton
                asChild
                tooltip={item.label}
                isActive={isActive(item.href)}
              >
                <LocaleLink href={item.href}>
                  <item.icon />
                  <span>{item.label}</span>
                </LocaleLink>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}
