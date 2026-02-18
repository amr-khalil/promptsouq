"use client";

import { DollarSign, FileText, Image, Store } from "lucide-react";
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

export function DashboardNavSeller() {
  const pathname = usePathname();
  const { t } = useTranslation("dashboard");

  const items = [
    { href: "/dashboard/seller/prompts", label: t("sidebar.myPrompts"), icon: FileText },
    { href: "/dashboard/seller/earnings", label: t("sidebar.salesEarnings"), icon: DollarSign },
    { href: "/dashboard/seller/gallery", label: t("sidebar.galleryImages"), icon: Image },
    { href: "/dashboard/seller/profile", label: t("sidebar.sellerProfile"), icon: Store },
  ];

  const isActive = (href: string) => pathname.includes(href);

  return (
    <SidebarGroup>
      <SidebarGroupLabel>{t("sidebar.seller")}</SidebarGroupLabel>
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
