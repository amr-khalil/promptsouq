import { db } from "@/db";
import { subscriptionPlans } from "@/db/schema";
import { asc } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const plans = await db
      .select()
      .from(subscriptionPlans)
      .orderBy(asc(subscriptionPlans.sortOrder));

    const data = plans.map((p) => ({
      id: p.id,
      name: p.name,
      nameAr: p.nameAr,
      monthlyCredits: p.monthlyCredits,
      monthlyPrice: p.monthlyPrice,
      sixMonthPrice: p.sixMonthPrice,
      yearlyPrice: p.yearlyPrice,
      features: p.features,
      theme: p.theme,
      icon: p.icon,
      sortOrder: p.sortOrder,
    }));

    return NextResponse.json({ data });
  } catch {
    return NextResponse.json(
      { error: "حدث خطأ في جلب خطط الاشتراك" },
      { status: 500 },
    );
  }
}
