import { db } from "@/db";
import {
  creditBalances,
  subscriptionPlans,
  userSubscriptions,
} from "@/db/schema";
import { auth } from "@clerk/nextjs/server";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { error: "يجب تسجيل الدخول أولاً" },
        { status: 401 },
      );
    }

    // Query user subscription joined with plan details
    const [subRow] = await db
      .select({
        planId: userSubscriptions.planId,
        planName: subscriptionPlans.name,
        planNameAr: subscriptionPlans.nameAr,
        status: userSubscriptions.status,
        billingCycle: userSubscriptions.billingCycle,
        currentPeriodEnd: userSubscriptions.currentPeriodEnd,
        cancelAtPeriodEnd: userSubscriptions.cancelAtPeriodEnd,
      })
      .from(userSubscriptions)
      .innerJoin(
        subscriptionPlans,
        eq(userSubscriptions.planId, subscriptionPlans.id),
      )
      .where(eq(userSubscriptions.userId, userId))
      .limit(1);

    // Query credit balances
    const [creditRow] = await db
      .select({
        subscriptionCredits: creditBalances.subscriptionCredits,
        topupCredits: creditBalances.topupCredits,
      })
      .from(creditBalances)
      .where(eq(creditBalances.userId, userId))
      .limit(1);

    const subscription = subRow
      ? {
          planId: subRow.planId,
          planName: subRow.planName,
          planNameAr: subRow.planNameAr,
          status: subRow.status,
          billingCycle: subRow.billingCycle,
          currentPeriodEnd: subRow.currentPeriodEnd?.toISOString() ?? null,
          cancelAtPeriodEnd: subRow.cancelAtPeriodEnd,
        }
      : null;

    const subscriptionCredits = creditRow?.subscriptionCredits ?? 0;
    const topupCredits = creditRow?.topupCredits ?? 0;

    return NextResponse.json({
      subscription,
      credits: {
        subscription: subscriptionCredits,
        topup: topupCredits,
        total: subscriptionCredits + topupCredits,
      },
    });
  } catch {
    return NextResponse.json(
      { error: "حدث خطأ في جلب حالة الاشتراك" },
      { status: 500 },
    );
  }
}
