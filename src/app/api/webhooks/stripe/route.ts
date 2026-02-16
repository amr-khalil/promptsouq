import { db } from "@/db";
import {
  creditBalances,
  creditTopupPacks,
  orderItems,
  orders,
  prompts,
  sellerProfiles,
  subscriptionPlans,
  userSubscriptions,
} from "@/db/schema";
import {
  grantSubscriptionCredits,
  grantTopupCredits,
  resetSubscriptionCredits,
} from "@/lib/credits";
import { stripe } from "@/lib/stripe";
import { eq, inArray, sql } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

// ─── Subscription Created ──────────────────────────────────────

async function handleSubscriptionCreated(subscription: Stripe.Subscription) {
  const userId = subscription.metadata?.userId;
  const planId = subscription.metadata?.planId;
  const billingCycle = subscription.metadata?.billingCycle;

  if (!userId || !planId || !billingCycle) {
    console.error(
      "Missing metadata on subscription.created:",
      subscription.id,
    );
    return;
  }

  // Look up the plan to get monthlyCredits
  const [plan] = await db
    .select()
    .from(subscriptionPlans)
    .where(eq(subscriptionPlans.id, planId));

  if (!plan) {
    console.error("Unknown planId in subscription.created:", planId);
    return;
  }

  const customerId =
    typeof subscription.customer === "string"
      ? subscription.customer
      : subscription.customer.id;

  // In newer Stripe SDK versions, current_period is on SubscriptionItem
  const firstItem = subscription.items.data[0];
  const periodStart = new Date(firstItem.current_period_start * 1000);
  const periodEnd = new Date(firstItem.current_period_end * 1000);

  // Upsert user_subscriptions
  await db
    .insert(userSubscriptions)
    .values({
      userId,
      planId,
      stripeSubscriptionId: subscription.id,
      stripeCustomerId: customerId,
      status: subscription.status,
      billingCycle,
      currentPeriodStart: periodStart,
      currentPeriodEnd: periodEnd,
      cancelAtPeriodEnd: subscription.cancel_at_period_end,
    })
    .onConflictDoUpdate({
      target: userSubscriptions.userId,
      set: {
        planId,
        stripeSubscriptionId: subscription.id,
        stripeCustomerId: customerId,
        status: subscription.status,
        billingCycle,
        currentPeriodStart: periodStart,
        currentPeriodEnd: periodEnd,
        cancelAtPeriodEnd: subscription.cancel_at_period_end,
        updatedAt: new Date(),
      },
    });

  // Grant subscription credits
  await grantSubscriptionCredits(userId, plan.monthlyCredits);

  // Store stripeCustomerId in credit_balances via upsert
  await db
    .insert(creditBalances)
    .values({
      userId,
      subscriptionCredits: 0,
      topupCredits: 0,
      stripeCustomerId: customerId,
    })
    .onConflictDoUpdate({
      target: creditBalances.userId,
      set: {
        stripeCustomerId: customerId,
        updatedAt: new Date(),
      },
    });
}

// ─── Subscription Updated ──────────────────────────────────────

async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
  const firstItem = subscription.items.data[0];
  const periodStart = new Date(firstItem.current_period_start * 1000);
  const periodEnd = new Date(firstItem.current_period_end * 1000);

  await db
    .update(userSubscriptions)
    .set({
      status: subscription.status,
      currentPeriodStart: periodStart,
      currentPeriodEnd: periodEnd,
      cancelAtPeriodEnd: subscription.cancel_at_period_end,
      updatedAt: new Date(),
    })
    .where(eq(userSubscriptions.stripeSubscriptionId, subscription.id));
}

// ─── Subscription Deleted ──────────────────────────────────────

async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  await db
    .update(userSubscriptions)
    .set({
      status: "canceled",
      updatedAt: new Date(),
    })
    .where(eq(userSubscriptions.stripeSubscriptionId, subscription.id));
}

// ─── Invoice Payment Succeeded (Renewals) ──────────────────────

async function handleInvoicePaymentSucceeded(invoice: Stripe.Invoice) {
  // Only handle subscription invoices
  // In newer Stripe SDK, subscription lives under parent.subscription_details
  const subDetail = invoice.parent?.subscription_details?.subscription;
  const subscriptionId =
    typeof subDetail === "string" ? subDetail : subDetail?.id ?? null;

  if (!subscriptionId) return;

  // Look up user_subscriptions by stripeSubscriptionId
  const [userSub] = await db
    .select()
    .from(userSubscriptions)
    .where(eq(userSubscriptions.stripeSubscriptionId, subscriptionId));

  if (!userSub) {
    console.error(
      "No user subscription found for invoice renewal:",
      subscriptionId,
    );
    return;
  }

  // Look up plan to get monthlyCredits
  const [plan] = await db
    .select()
    .from(subscriptionPlans)
    .where(eq(subscriptionPlans.id, userSub.planId));

  if (!plan) {
    console.error(
      "Unknown planId for renewal:",
      userSub.planId,
    );
    return;
  }

  // Reset subscription credits for the new billing period
  await resetSubscriptionCredits(userSub.userId, plan.monthlyCredits);
}

// ─── Top-up Checkout Completed ─────────────────────────────────

async function handleTopupCompleted(session: Stripe.Checkout.Session) {
  const userId = session.metadata?.userId;
  const packId = session.metadata?.packId;

  if (!userId || !packId) {
    console.error("Missing metadata on topup session:", session.id);
    return;
  }

  // Look up the pack to get credits
  const [pack] = await db
    .select()
    .from(creditTopupPacks)
    .where(eq(creditTopupPacks.id, packId));

  if (!pack) {
    console.error("Unknown packId in topup session:", packId);
    return;
  }

  await grantTopupCredits(userId, pack.credits);
}

// ─── Prompt Purchase Checkout Completed ────────────────────────

async function handlePromptPurchaseCompleted(
  session: Stripe.Checkout.Session,
) {
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

  if (!userId || promptIds.length === 0) return;

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

// ─── Subscription Checkout Completed ─────────────────────────────
// Most reliable handler: checkout.session.completed always fires and
// always carries session-level metadata (userId, planId, billingCycle).

async function handleSubscriptionCheckoutCompleted(
  session: Stripe.Checkout.Session,
) {
  const userId = session.metadata?.userId;
  const planId = session.metadata?.planId;
  const billingCycle = session.metadata?.billingCycle;

  if (!userId || !planId || !billingCycle) {
    console.error(
      "Missing metadata on subscription checkout session:",
      session.id,
    );
    return;
  }

  // Look up the plan to get monthlyCredits
  const [plan] = await db
    .select()
    .from(subscriptionPlans)
    .where(eq(subscriptionPlans.id, planId));

  if (!plan) {
    console.error("Unknown planId in subscription checkout:", planId);
    return;
  }

  // Get subscription ID from the session
  const subscriptionId =
    typeof session.subscription === "string"
      ? session.subscription
      : (session.subscription as { id: string } | null)?.id ?? null;

  // Get customer ID
  const customerId =
    typeof session.customer === "string"
      ? session.customer
      : (session.customer as { id: string } | null)?.id ?? null;

  if (subscriptionId && customerId) {
    const now = new Date();
    // Upsert user_subscriptions
    await db
      .insert(userSubscriptions)
      .values({
        userId,
        planId,
        stripeSubscriptionId: subscriptionId,
        stripeCustomerId: customerId,
        status: "active",
        billingCycle,
        currentPeriodStart: now,
        currentPeriodEnd: now,
      })
      .onConflictDoUpdate({
        target: userSubscriptions.userId,
        set: {
          planId,
          stripeSubscriptionId: subscriptionId,
          stripeCustomerId: customerId,
          status: "active",
          billingCycle,
          updatedAt: now,
        },
      });

    // Store stripeCustomerId in credit_balances
    await db
      .insert(creditBalances)
      .values({
        userId,
        subscriptionCredits: 0,
        topupCredits: 0,
        stripeCustomerId: customerId,
      })
      .onConflictDoUpdate({
        target: creditBalances.userId,
        set: {
          stripeCustomerId: customerId,
          updatedAt: new Date(),
        },
      });
  }

  // Grant subscription credits
  await grantSubscriptionCredits(userId, plan.monthlyCredits);
}

// ─── Main Webhook Handler ──────────────────────────────────────

export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = request.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!,
    );
  } catch {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;

      if (session.mode === "subscription") {
        await handleSubscriptionCheckoutCompleted(session);
      } else if (session.metadata?.type === "topup") {
        await handleTopupCompleted(session);
      } else {
        await handlePromptPurchaseCompleted(session);
      }
      break;
    }

    case "customer.subscription.created": {
      // Backup handler — credits may already be granted by checkout.session.completed
      // grantSubscriptionCredits uses SQL addition, so if called twice it would double-grant.
      // We skip this if the checkout handler already ran (check if user already has credits).
      const subscription = event.data.object as Stripe.Subscription;
      const userId = subscription.metadata?.userId;
      if (userId) {
        const [balance] = await db
          .select({ sub: creditBalances.subscriptionCredits })
          .from(creditBalances)
          .where(eq(creditBalances.userId, userId))
          .limit(1);
        // Only grant if subscription credits are still 0 (checkout handler didn't run yet)
        if (!balance || balance.sub === 0) {
          await handleSubscriptionCreated(subscription);
        }
      }
      break;
    }

    case "customer.subscription.updated": {
      const subscription = event.data.object as Stripe.Subscription;
      await handleSubscriptionUpdated(subscription);
      break;
    }

    case "customer.subscription.deleted": {
      const subscription = event.data.object as Stripe.Subscription;
      await handleSubscriptionDeleted(subscription);
      break;
    }

    case "invoice.payment_succeeded": {
      const invoice = event.data.object as Stripe.Invoice;
      await handleInvoicePaymentSucceeded(invoice);
      break;
    }
  }

  return NextResponse.json({ received: true });
}
