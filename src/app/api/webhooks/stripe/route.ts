import { db } from "@/db";
import { orderItems, orders } from "@/db/schema";
import { stripe } from "@/lib/stripe";
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

    if (userId && promptIds.length > 0) {
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
        promptIds.map((promptId) => ({
          orderId: order.id,
          promptId,
          priceAtPurchase: Math.round(
            (session.amount_total ?? 0) / promptIds.length,
          ),
        })),
      );
    }
  }

  return NextResponse.json({ received: true });
}
