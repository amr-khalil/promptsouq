import { db } from "@/db";
import { orderItems, orders, prompts, sellerProfiles } from "@/db/schema";
import { stripe } from "@/lib/stripe";
import { eq, inArray, sql } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = request.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  let event;
  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!,
    );
  } catch {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object;
    const userId = session.client_reference_id;
    const promptIds: string[] = JSON.parse(
      session.metadata?.promptIds ?? "[]",
    );
    const referralSources: Record<string, string> = JSON.parse(
      session.metadata?.referralSources ?? "{}",
    );
    const sellerAccounts: Record<string, string> = JSON.parse(
      session.metadata?.sellerAccounts ?? "{}",
    );

    if (userId && promptIds.length > 0) {
      // Fetch prompt details for seller info
      const promptDetails = await db
        .select({
          id: prompts.id,
          sellerId: prompts.sellerId,
          price: prompts.price,
        })
        .from(prompts)
        .where(inArray(prompts.id, promptIds));

      const promptMap = Object.fromEntries(
        promptDetails.map((p) => [p.id, p]),
      );

      const [order] = await db
        .insert(orders)
        .values({
          userId,
          stripeSessionId: session.id,
          stripePaymentIntentId:
            typeof session.payment_intent === "string"
              ? session.payment_intent
              : null,
          amountTotal: session.amount_total ?? 0,
          currency: session.currency ?? "usd",
          status: "completed",
        })
        .returning({ id: orders.id });

      await db.insert(orderItems).values(
        promptIds.map((promptId) => {
          const detail = promptMap[promptId];
          const referral = referralSources[promptId] ?? "marketplace";
          const commissionRate = referral === "direct" ? 0 : 0.2;
          const priceAtPurchase = detail
            ? Math.round(detail.price * 100)
            : Math.round((session.amount_total ?? 0) / promptIds.length);
          const sellerPayout = Math.round(
            priceAtPurchase * (1 - commissionRate),
          );

          return {
            orderId: order.id,
            promptId,
            priceAtPurchase,
            referralSource: referral,
            commissionRate,
            sellerPayoutAmount: sellerPayout,
            sellerStripeAccountId: sellerAccounts[promptId] ?? null,
          };
        }),
      );

      // Update seller stats: increment sales count and earnings
      const sellerUpdates: Record<
        string,
        { sales: number; earnings: number }
      > = {};
      for (const promptId of promptIds) {
        const detail = promptMap[promptId];
        if (detail?.sellerId) {
          if (!sellerUpdates[detail.sellerId]) {
            sellerUpdates[detail.sellerId] = { sales: 0, earnings: 0 };
          }
          const referral = referralSources[promptId] ?? "marketplace";
          const rate = referral === "direct" ? 0 : 0.2;
          const price = Math.round(detail.price * 100);
          sellerUpdates[detail.sellerId].sales += 1;
          sellerUpdates[detail.sellerId].earnings += Math.round(
            price * (1 - rate),
          );
        }
      }

      // Update each seller's profile and prompt sales count
      for (const [sellerId, update] of Object.entries(sellerUpdates)) {
        await db
          .update(sellerProfiles)
          .set({
            totalSales: sql`${sellerProfiles.totalSales} + ${update.sales}`,
            totalEarnings: sql`${sellerProfiles.totalEarnings} + ${update.earnings}`,
            updatedAt: new Date(),
          })
          .where(eq(sellerProfiles.userId, sellerId));
      }

      // Increment sales count on each prompt
      for (const promptId of promptIds) {
        await db
          .update(prompts)
          .set({
            sales: sql`${prompts.sales} + 1`,
            updatedAt: new Date(),
          })
          .where(eq(prompts.id, promptId));
      }
    }
  }

  return NextResponse.json({ received: true });
}
