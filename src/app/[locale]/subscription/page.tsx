import { db } from "@/db";
import { creditTopupPacks, subscriptionPlans } from "@/db/schema";
import { getTranslation } from "@/i18n/server";
import { type Locale, defaultLocale, locales } from "@/i18n/settings";
import type { Metadata } from "next";
import { asc } from "drizzle-orm";
import { SubscriptionPageClient } from "./subscription-page-client";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale: rawLocale } = await params;
  const locale = (locales as readonly string[]).includes(rawLocale)
    ? (rawLocale as Locale)
    : defaultLocale;
  const { i18n } = await getTranslation(locale, "subscription");
  return {
    title: i18n.getResource(locale, "subscription", "metaTitle") as string,
    description: i18n.getResource(locale, "subscription", "metaDescription") as string,
  };
}

export default async function SubscriptionPage() {
  const [plans, packs] = await Promise.all([
    db
      .select()
      .from(subscriptionPlans)
      .orderBy(asc(subscriptionPlans.sortOrder)),
    db
      .select()
      .from(creditTopupPacks)
      .orderBy(asc(creditTopupPacks.sortOrder)),
  ]);

  const serializedPlans = plans.map((plan) => ({
    id: plan.id,
    name: plan.name,
    nameAr: plan.nameAr,
    monthlyCredits: plan.monthlyCredits,
    monthlyPrice: plan.monthlyPrice,
    sixMonthPrice: plan.sixMonthPrice,
    yearlyPrice: plan.yearlyPrice,
    features: plan.features as string[],
    theme: plan.theme,
    icon: plan.icon,
    sortOrder: plan.sortOrder,
  }));

  const serializedPacks = packs.map((pack) => ({
    id: pack.id,
    credits: pack.credits,
    price: pack.price,
  }));

  return (
    <SubscriptionPageClient plans={serializedPlans} packs={serializedPacks} />
  );
}
