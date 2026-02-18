import { db } from "@/db";
import { creditBalances, creditTopupPacks } from "@/db/schema";
import { getOrCreateCreditBalance } from "@/lib/credits";
import { topupCheckoutSchema } from "@/lib/schemas/credits";
import { stripe } from "@/lib/stripe";
import { checkAuth } from "@/lib/auth";
import { eq } from "drizzle-orm";
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
    const parsed = topupCheckoutSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "بيانات غير صالحة", details: parsed.error.flatten() },
        { status: 400 },
      );
    }

    const { packId } = parsed.data;

    // Look up pack details
    const [pack] = await db
      .select()
      .from(creditTopupPacks)
      .where(eq(creditTopupPacks.id, packId))
      .limit(1);

    if (!pack) {
      return NextResponse.json(
        { error: "حزمة الرصيد غير موجودة" },
        { status: 404 },
      );
    }

    // Get or create credit balance and Stripe customer
    const balance = await getOrCreateCreditBalance(userId);
    let stripeCustomerId = balance.stripeCustomerId;

    if (!stripeCustomerId) {
      const customer = await stripe.customers.create({
        metadata: { userId },
      });
      stripeCustomerId = customer.id;

      await db
        .update(creditBalances)
        .set({ stripeCustomerId: customer.id, updatedAt: new Date() })
        .where(eq(creditBalances.userId, userId));
    }

    // Create Stripe Checkout Session with inline price_data
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      customer: stripeCustomerId,
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: `${pack.credits} رصيد — سوق البرومبتات`,
            },
            unit_amount: pack.price,
          },
          quantity: 1,
        },
      ],
      metadata: {
        type: "topup",
        packId: pack.id,
        userId,
        credits: pack.credits.toString(),
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
