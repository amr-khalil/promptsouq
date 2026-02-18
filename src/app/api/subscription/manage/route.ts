import { db } from "@/db";
import { creditBalances } from "@/db/schema";
import { stripe } from "@/lib/stripe";
import { checkAuth } from "@/lib/auth";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function POST() {
  try {
    const userId = await checkAuth();

    if (!userId) {
      return NextResponse.json(
        { error: "يجب تسجيل الدخول أولاً" },
        { status: 401 },
      );
    }

    // Look up the Stripe customer ID
    const [balanceRow] = await db
      .select({ stripeCustomerId: creditBalances.stripeCustomerId })
      .from(creditBalances)
      .where(eq(creditBalances.userId, userId))
      .limit(1);

    if (!balanceRow?.stripeCustomerId) {
      return NextResponse.json(
        { error: "لم يتم العثور على حساب الدفع" },
        { status: 404 },
      );
    }

    // Create Stripe Billing Portal session
    const session = await stripe.billingPortal.sessions.create({
      customer: balanceRow.stripeCustomerId,
      return_url: `${process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"}/dashboard/credits`,
    });

    return NextResponse.json({ url: session.url });
  } catch {
    return NextResponse.json(
      { error: "حدث خطأ في إنشاء جلسة إدارة الاشتراك" },
      { status: 500 },
    );
  }
}
