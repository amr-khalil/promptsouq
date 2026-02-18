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
import { Zap } from "lucide-react";
import { useParams } from "next/navigation";

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

  return (
    <Sidebar
      collapsible="offcanvas"
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
