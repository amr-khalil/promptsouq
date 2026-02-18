import { db } from "@/db";
import {
  creditBalances,
  subscriptionPlans,
  userSubscriptions,
} from "@/db/schema";
import { subscriptionCheckoutSchema } from "@/lib/schemas/subscription";
import { stripe } from "@/lib/stripe";
import { checkAuth } from "@/lib/auth";
import { eq, and } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const userId = await checkAuth();

    if (!userId) {
      return NextResponse.json(
        { error: "يجب تسجيل الدخول أولاً" },
        { status: 401 },
      );
    }

    const body = await request.json();
    const parsed = subscriptionCheckoutSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "بيانات غير صالحة", details: parsed.error.flatten() },
        { status: 400 },
      );
    }

    const { planId, billingCycle } = parsed.data;

    // Check if user already has an active subscription
    const [existingSub] = await db
      .select({ id: userSubscriptions.id })
      .from(userSubscriptions)
      .where(
        and(
          eq(userSubscriptions.userId, userId),
          eq(userSubscriptions.status, "active"),
        ),
      )
      .limit(1);

    if (existingSub) {
      return NextResponse.json(
        { error: "لديك اشتراك نشط بالفعل. يمكنك إدارته من لوحة التحكم" },
        { status: 409 },
      );
    }

    // Get or create Stripe customer
    const [balanceRow] = await db
      .select({ stripeCustomerId: creditBalances.stripeCustomerId })
      .from(creditBalances)
      .where(eq(creditBalances.userId, userId))
      .limit(1);

    let stripeCustomerId = balanceRow?.stripeCustomerId;

    if (!stripeCustomerId) {
      const customer = await stripe.customers.create({
        metadata: { userId },
      });
      stripeCustomerId = customer.id;

      // Upsert credit_balances with the new Stripe customer ID
      await db
        .insert(creditBalances)
        .values({
          userId,
          stripeCustomerId,
          subscriptionCredits: 0,
          topupCredits: 0,
        })
        .onConflictDoUpdate({
          target: creditBalances.userId,
          set: { stripeCustomerId, updatedAt: new Date() },
        });
    }

    // Look up the plan to get the correct Stripe price ID
    const [plan] = await db
      .select()
      .from(subscriptionPlans)
      .where(eq(subscriptionPlans.id, planId))
      .limit(1);

    if (!plan) {
      return NextResponse.json(
        { error: "الخطة المحددة غير موجودة" },
        { status: 404 },
      );
    }

    // Determine price and recurring interval based on billing cycle
    const priceAmount =
      billingCycle === "monthly"
        ? plan.monthlyPrice
        : billingCycle === "six_month"
          ? plan.sixMonthPrice
          : plan.yearlyPrice;

    const recurringInterval: "month" | "year" =
      billingCycle === "yearly" ? "year" : "month";
    const intervalCount = billingCycle === "six_month" ? 6 : 1;

    // Create Stripe Checkout Session with inline price_data
    const session = await stripe.checkout.sessions.create({
      customer: stripeCustomerId,
      mode: "subscription",
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: `${plan.nameAr} — سوق البرومبتات`,
              description: `${plan.monthlyCredits} رصيد شهرياً`,
            },
            unit_amount: priceAmount,
            recurring: {
              interval: recurringInterval,
              interval_count: intervalCount,
            },
          },
          quantity: 1,
        },
      ],
      metadata: { userId, planId, billingCycle },
      subscription_data: {
        metadata: { userId, planId, billingCycle },
      },
      success_url: `${process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"}/subscription?success=true`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"}/subscription?canceled=true`,
    });

    return NextResponse.json({ url: session.url });
  } catch {
    return NextResponse.json(
      { error: "حدث خطأ في إنشاء جلسة الدفع" },
      { status: 500 },
    );
  }
}
