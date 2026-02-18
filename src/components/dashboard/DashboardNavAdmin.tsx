"use client";

import {
  AlertCircle,
  BarChart3,
  ImagePlus,
  Receipt,
  Shield,
  SlidersHorizontal,
  Users,
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

export function DashboardNavAdmin() {
  const pathname = usePathname();
  const { t } = useTranslation("dashboard");

  const items = [
    { href: "/dashboard/admin/users", label: t("sidebar.users"), icon: Users },
    { href: "/dashboard/admin/moderation", label: t("sidebar.moderation"), icon: Shield },
    { href: "/dashboard/admin/gallery", label: t("sidebar.galleryModeration"), icon: ImagePlus },
    { href: "/dashboard/admin/issues", label: t("sidebar.issues"), icon: AlertCircle },
    { href: "/dashboard/admin/orders", label: t("sidebar.orders"), icon: Receipt },
    { href: "/dashboard/admin/analytics", label: t("sidebar.analytics"), icon: BarChart3 },
    { href: "/dashboard/admin/settings", label: t("sidebar.settings"), icon: SlidersHorizontal },
  ];

  const isActive = (href: string) => pathname.includes(href);

  return (
    <SidebarGroup>
      <SidebarGroupLabel>{t("sidebar.admin")}</SidebarGroupLabel>
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
