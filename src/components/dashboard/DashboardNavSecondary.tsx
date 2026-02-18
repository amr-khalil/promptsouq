"use client";

import { ExternalLink, Settings } from "lucide-react";
import { LocaleLink } from "@/components/LocaleLink";
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { usePathname } from "next/navigation";
import { useTranslation } from "react-i18next";

export function DashboardNavSecondary({
  ...props
}: React.ComponentPropsWithoutRef<typeof SidebarGroup>) {
  const pathname = usePathname();
  const { t } = useTranslation("dashboard");

  const isActive = (href: string) => pathname.includes(href);

  return (
    <SidebarGroup {...props}>
      <SidebarGroupContent>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              tooltip={t("sidebar.settings")}
              isActive={isActive("/dashboard/settings")}
            >
              <LocaleLink href="/dashboard/settings">
                <Settings />
                <span>{t("sidebar.settings")}</span>
              </LocaleLink>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton asChild tooltip={t("sidebar.backToMarket")}>
              <LocaleLink href="/market">
                <ExternalLink />
                <span>{t("sidebar.backToMarket")}</span>
              </LocaleLink>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}
