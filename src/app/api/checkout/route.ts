import { db } from "@/db";
import { prompts, sellerProfiles } from "@/db/schema";
import { checkoutRequestSchema } from "@/lib/schemas/api";
import { stripe } from "@/lib/stripe";
import { auth } from "@clerk/nextjs/server";
import { inArray } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { error: "يجب تسجيل الدخول أولاً" },
        { status: 401 },
      );
    }

    const body = await request.json();
    const parsed = checkoutRequestSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "السلة فارغة" },
        { status: 400 },
      );
    }

    const promptIds = parsed.data.items.map((item) => item.promptId);

    // Accept referralSources from client: { [promptId]: "direct" | "marketplace" }
    const referralSources: Record<string, string> =
      (body.referralSources as Record<string, string>) ?? {};

    const promptRows = await db
      .select()
      .from(prompts)
      .where(inArray(prompts.id, promptIds));

    if (promptRows.length !== promptIds.length) {
      return NextResponse.json(
        { error: "بعض المنتجات غير متوفرة" },
        { status: 404 },
      );
    }

    // Find unique seller IDs to look up Stripe accounts
    const sellerIds = [
      ...new Set(promptRows.map((p) => p.sellerId).filter(Boolean)),
    ] as string[];

    let sellerAccountMap: Record<string, string> = {};
    if (sellerIds.length > 0) {
      const profiles = await db
        .select({
          userId: sellerProfiles.userId,
          stripeAccountId: sellerProfiles.stripeAccountId,
        })
        .from(sellerProfiles)
        .where(inArray(sellerProfiles.userId, sellerIds));

      sellerAccountMap = Object.fromEntries(
        profiles
          .filter((p) => p.stripeAccountId)
          .map((p) => [p.userId, p.stripeAccountId!]),
      );
    }

    const origin = request.nextUrl.origin;

    // Determine if all items belong to a single seller (destination charge)
    const uniqueSellerAccounts = [
      ...new Set(
        promptRows
          .map((p) => (p.sellerId ? sellerAccountMap[p.sellerId] : null))
          .filter(Boolean),
      ),
    ];

    // Calculate total and application fee
    const totalAmountCents = promptRows.reduce(
      (sum, p) => sum + Math.round(p.price * 100),
      0,
    );

    // For single-seller carts with Stripe Connected accounts, use destination charges
    let paymentIntentData: Record<string, unknown> | undefined;
    if (uniqueSellerAccounts.length === 1) {
      // Determine if any item has a "direct" referral (0% commission)
      const allDirect = promptRows.every(
        (p) => referralSources[p.id] === "direct",
      );
      const feeRate = allDirect ? 0 : 0.2;
      const applicationFee = Math.round(totalAmountCents * feeRate);

      paymentIntentData = {
        application_fee_amount: applicationFee,
        transfer_data: {
          destination: uniqueSellerAccounts[0],
        },
      };
    }

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: promptRows.map((prompt) => ({
        price_data: {
          currency: "usd",
          product_data: {
            name: prompt.title,
            images: [prompt.thumbnail],
          },
          unit_amount: Math.round(prompt.price * 100),
        },
        quantity: 1,
      })),
      ...(paymentIntentData
        ? { payment_intent_data: paymentIntentData as never }
        : {}),
      success_url: `${origin}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/cart`,
      client_reference_id: userId,
      metadata: {
        userId,
        promptIds: JSON.stringify(promptIds),
        referralSources: JSON.stringify(referralSources),
        sellerAccounts: JSON.stringify(
          Object.fromEntries(
            promptRows
              .filter((p) => p.sellerId && sellerAccountMap[p.sellerId])
              .map((p) => [p.id, sellerAccountMap[p.sellerId!]]),
          ),
        ),
      },
    });

    return NextResponse.json({ url: session.url });
  } catch {
    return NextResponse.json(
      { error: "حدث خطأ في إنشاء جلسة الدفع" },
      { status: 500 },
    );
  }
}
