import { db } from "@/db";
import { orderItems, orders } from "@/db/schema";
import { stripe } from "@/lib/stripe";
import { checkAuth } from "@/lib/auth";
import { eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const userId = await checkAuth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { sessionId } = await request.json();
    if (!sessionId || typeof sessionId !== "string") {
      return NextResponse.json(
        { error: "Missing sessionId" },
        { status: 400 },
      );
    }

    // Check if order already exists for this session
    const existing = await db
      .select({ id: orders.id })
      .from(orders)
      .where(eq(orders.stripeSessionId, sessionId))
      .limit(1);

    if (existing.length > 0) {
      return NextResponse.json({ status: "already_exists" });
    }

    // Retrieve session from Stripe
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (session.payment_status !== "paid") {
      return NextResponse.json(
        { error: "Payment not completed" },
        { status: 400 },
      );
    }

    // Verify the session belongs to this user
    if (session.client_reference_id !== userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const promptIds: string[] = JSON.parse(
      session.metadata?.promptIds ?? "[]",
    );

    if (promptIds.length === 0) {
      return NextResponse.json(
        { error: "No items in session" },
        { status: 400 },
      );
    }

    // Create order (same logic as webhook handler)
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

    return NextResponse.json({ status: "created" });
  } catch {
    return NextResponse.json(
      { error: "Failed to verify session" },
      { status: 500 },
    );
  }
}
