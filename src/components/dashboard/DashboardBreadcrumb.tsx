"use client";

import { LocaleLink } from "@/components/LocaleLink";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { usePathname } from "next/navigation";
import { Fragment } from "react";
import { useTranslation } from "react-i18next";

const segmentLabels: Record<string, string> = {
  dashboard: "sidebar.dashboard",
  purchases: "sidebar.purchases",
  credits: "sidebar.credits",
  generations: "sidebar.generations",
  favorites: "sidebar.favorites",
  issues: "sidebar.reportIssues",
  settings: "sidebar.settings",
  seller: "sidebar.seller",
  admin: "sidebar.admin",
  prompts: "sidebar.myPrompts",
  earnings: "sidebar.salesEarnings",
  profile: "sidebar.sellerProfile",
  gallery: "sidebar.galleryImages",
  moderation: "sidebar.moderation",
  orders: "sidebar.orders",
  analytics: "sidebar.analytics",
};

export function DashboardBreadcrumb() {
  const pathname = usePathname();
  const { t } = useTranslation("dashboard");

  // Strip locale prefix and split into segments
  const pathWithoutLocale = pathname.replace(/^\/(ar|en)/, "");
  const segments = pathWithoutLocale.split("/").filter(Boolean);

  // Build breadcrumb items from segments
  const crumbs = segments.map((segment, index) => {
    const href = "/" + segments.slice(0, index + 1).join("/");
    const labelKey = segmentLabels[segment];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const label = labelKey ? t(labelKey as any) : segment;
    return { href, label, isLast: index === segments.length - 1 };
  });

  return (
    <Breadcrumb>
      <BreadcrumbList>
        {crumbs.map((crumb, index) => (
          <Fragment key={crumb.href}>
            {index > 0 && <BreadcrumbSeparator />}
            <BreadcrumbItem>
              {crumb.isLast ? (
                <BreadcrumbPage>{crumb.label}</BreadcrumbPage>
              ) : (
                <BreadcrumbLink asChild>
                  <LocaleLink href={crumb.href}>{crumb.label}</LocaleLink>
                </BreadcrumbLink>
              )}
            </BreadcrumbItem>
          </Fragment>
        ))}
      </BreadcrumbList>
    </Breadcrumb>
  );
}
