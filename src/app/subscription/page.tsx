import { db } from "@/db";
import { creditTopupPacks, subscriptionPlans } from "@/db/schema";
import { asc } from "drizzle-orm";
import { SubscriptionPageClient } from "./subscription-page-client";

export const metadata = {
  title: "الاشتراكات | سوق البرومبتات",
  description: "اختر خطة الاشتراك المناسبة لك",
};

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
