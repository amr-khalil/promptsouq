import { db } from "@/db";
import { creditBalances, creditTransactions } from "@/db/schema";
import { eq, sql } from "drizzle-orm";

// ─── Custom Error ───────────────────────────────────────────────

export class InsufficientCreditsError extends Error {
  constructor(message = "Insufficient credits") {
    super(message);
    this.name = "InsufficientCreditsError";
  }
}

// ─── Types ──────────────────────────────────────────────────────

type CreditSource = "subscription" | "topup";

interface CreditBalanceResult {
  subscriptionCredits: number;
  topupCredits: number;
  total: number;
}

interface DeductResult extends CreditBalanceResult {
  creditSource: CreditSource;
}

// ─── Get or Create Credit Balance ───────────────────────────────

export async function getOrCreateCreditBalance(userId: string) {
  const [existing] = await db
    .select()
    .from(creditBalances)
    .where(eq(creditBalances.userId, userId));

  if (existing) return existing;

  const [inserted] = await db
    .insert(creditBalances)
    .values({ userId, subscriptionCredits: 0, topupCredits: 0 })
    .returning();

  return inserted;
}

// ─── Deduct Credits ─────────────────────────────────────────────

export async function deductCredits(
  userId: string,
  amount: number,
): Promise<DeductResult> {
  return db.transaction(async (tx) => {
    // Select current balance inside transaction
    const [balance] = await tx
      .select()
      .from(creditBalances)
      .where(eq(creditBalances.userId, userId));

    if (!balance) {
      throw new InsufficientCreditsError();
    }

    const total = balance.subscriptionCredits + balance.topupCredits;

    if (total < amount) {
      throw new InsufficientCreditsError();
    }

    // Deduction order: subscription first, then topup
    let subDeduction: number;
    let topupDeduction: number;
    let creditSource: CreditSource;

    if (balance.subscriptionCredits >= amount) {
      // Entire deduction from subscription
      subDeduction = amount;
      topupDeduction = 0;
      creditSource = "subscription";
    } else {
      // Partial from subscription, remainder from topup
      subDeduction = balance.subscriptionCredits;
      topupDeduction = amount - balance.subscriptionCredits;
      creditSource = balance.subscriptionCredits > 0 ? "subscription" : "topup";
    }

    const newSubscriptionCredits = balance.subscriptionCredits - subDeduction;
    const newTopupCredits = balance.topupCredits - topupDeduction;
    const newTotal = newSubscriptionCredits + newTopupCredits;

    // Update balance
    await tx
      .update(creditBalances)
      .set({
        subscriptionCredits: newSubscriptionCredits,
        topupCredits: newTopupCredits,
        updatedAt: new Date(),
      })
      .where(eq(creditBalances.userId, userId));

    // Record transaction
    await tx.insert(creditTransactions).values({
      userId,
      type: "generation_deduction",
      amount: -amount,
      creditSource,
      balanceAfter: newTotal,
    });

    return {
      subscriptionCredits: newSubscriptionCredits,
      topupCredits: newTopupCredits,
      total: newTotal,
      creditSource,
    };
  });
}

// ─── Grant Subscription Credits ─────────────────────────────────

export async function grantSubscriptionCredits(
  userId: string,
  amount: number,
): Promise<CreditBalanceResult> {
  return db.transaction(async (tx) => {
    const [result] = await tx
      .insert(creditBalances)
      .values({ userId, subscriptionCredits: amount, topupCredits: 0 })
      .onConflictDoUpdate({
        target: creditBalances.userId,
        set: {
          subscriptionCredits: sql`${creditBalances.subscriptionCredits} + ${amount}`,
          updatedAt: new Date(),
        },
      })
      .returning();

    const newTotal = result.subscriptionCredits + result.topupCredits;

    await tx.insert(creditTransactions).values({
      userId,
      type: "subscription_grant",
      amount: +amount,
      creditSource: "subscription",
      balanceAfter: newTotal,
    });

    return {
      subscriptionCredits: result.subscriptionCredits,
      topupCredits: result.topupCredits,
      total: newTotal,
    };
  });
}

// ─── Grant Top-up Credits ───────────────────────────────────────

export async function grantTopupCredits(
  userId: string,
  amount: number,
): Promise<CreditBalanceResult> {
  return db.transaction(async (tx) => {
    const [result] = await tx
      .insert(creditBalances)
      .values({ userId, subscriptionCredits: 0, topupCredits: amount })
      .onConflictDoUpdate({
        target: creditBalances.userId,
        set: {
          topupCredits: sql`${creditBalances.topupCredits} + ${amount}`,
          updatedAt: new Date(),
        },
      })
      .returning();

    const newTotal = result.subscriptionCredits + result.topupCredits;

    await tx.insert(creditTransactions).values({
      userId,
      type: "topup_grant",
      amount: +amount,
      creditSource: "topup",
      balanceAfter: newTotal,
    });

    return {
      subscriptionCredits: result.subscriptionCredits,
      topupCredits: result.topupCredits,
      total: newTotal,
    };
  });
}

// ─── Reset Subscription Credits ─────────────────────────────────

export async function resetSubscriptionCredits(
  userId: string,
  newAmount: number,
): Promise<CreditBalanceResult> {
  return db.transaction(async (tx) => {
    // Get current balance
    const [balance] = await tx
      .select()
      .from(creditBalances)
      .where(eq(creditBalances.userId, userId));

    const oldSubscriptionCredits = balance?.subscriptionCredits ?? 0;

    // Upsert with new subscription credits value
    const [result] = await tx
      .insert(creditBalances)
      .values({ userId, subscriptionCredits: newAmount, topupCredits: 0 })
      .onConflictDoUpdate({
        target: creditBalances.userId,
        set: {
          subscriptionCredits: newAmount,
          updatedAt: new Date(),
        },
      })
      .returning();

    const newTotal = result.subscriptionCredits + result.topupCredits;

    // Record reset (negative): clear old subscription credits
    if (oldSubscriptionCredits > 0) {
      await tx.insert(creditTransactions).values({
        userId,
        type: "subscription_reset",
        amount: -oldSubscriptionCredits,
        creditSource: "subscription",
        balanceAfter: newTotal - newAmount + 0, // balance after removing old sub credits, before granting new
      });
    }

    // Record grant (positive): add new subscription credits
    await tx.insert(creditTransactions).values({
      userId,
      type: "subscription_grant",
      amount: +newAmount,
      creditSource: "subscription",
      balanceAfter: newTotal,
    });

    return {
      subscriptionCredits: result.subscriptionCredits,
      topupCredits: result.topupCredits,
      total: newTotal,
    };
  });
}
