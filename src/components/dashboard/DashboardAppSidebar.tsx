"use client";

import { DashboardNavAdmin } from "@/components/dashboard/DashboardNavAdmin";
import { DashboardNavMain } from "@/components/dashboard/DashboardNavMain";
import { DashboardNavSecondary } from "@/components/dashboard/DashboardNavSecondary";
import { DashboardNavSeller } from "@/components/dashboard/DashboardNavSeller";
import { DashboardNavUser } from "@/components/dashboard/DashboardNavUser";
import { LocaleLink } from "@/components/LocaleLink";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { Plus, Store, Zap } from "lucide-react";
import { useParams } from "next/navigation";
import { useTranslation } from "react-i18next";

interface DashboardAppSidebarProps
  extends React.ComponentProps<typeof Sidebar> {
  isSeller: boolean;
  isAdmin: boolean;
}

export function DashboardAppSidebar({
  isSeller,
  isAdmin,
  ...props
}: DashboardAppSidebarProps) {
  const params = useParams();
  const isRtl = params?.locale === "ar";
  const { t } = useTranslation("dashboard");

  return (
    <Sidebar
      collapsible="icon"
      side={isRtl ? "right" : "left"}
      {...props}
    >
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:!p-1.5"
            >
              <LocaleLink href="/dashboard">
                <Zap className="!size-5 text-primary" />
                <span className="text-base font-semibold">SouqPrompt</span>
              </LocaleLink>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              tooltip={t("sidebar.sellPrompt")}
              className="data-[slot=sidebar-menu-button]:!p-1.5"
            >
              <LocaleLink href="/sell">
                <div className="flex size-5 items-center justify-center rounded-full border bg-background">
                  <Plus className="!size-3" />
                </div>
                <span className="text-sm">{t("sidebar.sellPrompt")}</span>
              </LocaleLink>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              tooltip={t("sidebar.backToMarket")}
              className="data-[slot=sidebar-menu-button]:!p-1.5"
            >
              <LocaleLink href="/market">
                <Store className="!size-5" />
                <span className="text-sm">{t("sidebar.backToMarket")}</span>
              </LocaleLink>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <DashboardNavMain />
        {isSeller && <DashboardNavSeller />}
        {isAdmin && <DashboardNavAdmin />}
        <DashboardNavSecondary className="mt-auto" />
      </SidebarContent>
      <SidebarFooter>
        <DashboardNavUser />
      </SidebarFooter>
    </Sidebar>
  );
}
