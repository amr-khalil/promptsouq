import { db } from "@/db";
import {
  orders,
  orderItems,
  freePromptAccess,
  generations,
} from "@/db/schema";
import {
  deductCredits,
  InsufficientCreditsError,
  getOrCreateCreditBalance,
} from "@/lib/credits";
import { generateContent } from "@/lib/generation";
import { generateRequestSchema } from "@/lib/schemas/generation";
import { auth } from "@clerk/nextjs/server";
import { and, eq, sql } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    // ── Auth ──────────────────────────────────────────────────────
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
    }

    // ── Validate body ────────────────────────────────────────────
    const rawBody = await request.json();
    const parsed = generateRequestSchema.safeParse(rawBody);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "بيانات غير صالحة", details: parsed.error.flatten() },
        { status: 400 },
      );
    }

    const body = parsed.data;

    // ── Ownership check ──────────────────────────────────────────
    // Check paid purchase
    const [purchased] = await db
      .select({ id: orderItems.id })
      .from(orderItems)
      .innerJoin(orders, eq(orderItems.orderId, orders.id))
      .where(
        and(
          eq(orders.userId, userId),
          eq(orderItems.promptId, body.promptId),
        ),
      );

    // Check free access
    const [freeAccess] = await db
      .select({ id: freePromptAccess.id })
      .from(freePromptAccess)
      .where(
        and(
          eq(freePromptAccess.userId, userId),
          eq(freePromptAccess.promptId, body.promptId),
        ),
      );

    if (!purchased && !freeAccess) {
      return NextResponse.json(
        { error: "لا تملك هذا البرومبت" },
        { status: 403 },
      );
    }

    // ── Deduct credits ───────────────────────────────────────────
    let deductResult;
    try {
      deductResult = await deductCredits(userId, 1);
    } catch (err) {
      if (err instanceof InsufficientCreditsError) {
        return NextResponse.json(
          { error: "رصيد الكريدت غير كافٍ" },
          { status: 402 },
        );
      }
      throw err;
    }

    // ── Generate content ─────────────────────────────────────────
    let generationResult;
    let status: "completed" | "failed" = "completed";
    let errorMessage: string | null = null;

    try {
      generationResult = await generateContent({
        type: body.generationType,
        model: body.model,
        prompt: body.inputPrompt,
      });
    } catch (err) {
      status = "failed";
      errorMessage =
        err instanceof Error ? err.message : "حدث خطأ أثناء التوليد";

      // ── Refund credit on failure ─────────────────────────────
      await refundCredit(userId, deductResult);
    }

    // ── Save generation record ───────────────────────────────────
    const [generation] = await db
      .insert(generations)
      .values({
        userId,
        promptId: body.promptId,
        generationType: body.generationType,
        model: body.model,
        inputPrompt: body.inputPrompt,
        resultText: generationResult?.resultText ?? null,
        resultImageUrl: generationResult?.resultImageUrl ?? null,
        status,
        creditsConsumed: status === "completed" ? 1 : 0,
        creditSource: status === "completed" ? deductResult.creditSource : null,
        errorMessage,
        completedAt: new Date(),
      })
      .returning();

    // ── Get updated balance ──────────────────────────────────────
    const balance = await getOrCreateCreditBalance(userId);

    // ── Return response ──────────────────────────────────────────
    if (status === "failed") {
      return NextResponse.json(
        {
          error: errorMessage ?? "فشل التوليد",
          generation: {
            id: generation.id,
            generationType: generation.generationType,
            model: generation.model,
            resultText: null,
            resultImageUrl: null,
            status: "failed",
            creditsConsumed: 0,
            createdAt: generation.createdAt.toISOString(),
          },
          credits: {
            subscription: balance.subscriptionCredits,
            topup: balance.topupCredits,
            total: balance.subscriptionCredits + balance.topupCredits,
          },
        },
        { status: 500 },
      );
    }

    return NextResponse.json({
      generation: {
        id: generation.id,
        generationType: generation.generationType,
        model: generation.model,
        resultText: generation.resultText,
        resultImageUrl: generation.resultImageUrl,
        status: generation.status,
        creditsConsumed: generation.creditsConsumed,
        createdAt: generation.createdAt.toISOString(),
      },
      credits: {
        subscription: balance.subscriptionCredits,
        topup: balance.topupCredits,
        total: balance.subscriptionCredits + balance.topupCredits,
      },
    });
  } catch {
    return NextResponse.json(
      { error: "حدث خطأ داخلي في الخادم" },
      { status: 500 },
    );
  }
}

// ── Refund Helper ──────────────────────────────────────────────────

async function refundCredit(
  userId: string,
  deductResult: { creditSource: string; total: number },
) {
  const { creditSource } = deductResult;
  const column =
    creditSource === "subscription"
      ? "subscription_credits"
      : "topup_credits";

  // Atomic refund: increment the correct column and log a transaction
  await db.execute(sql`
    WITH updated AS (
      UPDATE credit_balances
      SET ${sql.raw(column)} = ${sql.raw(column)} + 1,
          updated_at = NOW()
      WHERE user_id = ${userId}
      RETURNING subscription_credits + topup_credits AS balance_after
    )
    INSERT INTO credit_transactions (user_id, type, amount, credit_source, balance_after)
    SELECT ${userId}, 'generation_refund', 1, ${creditSource}, balance_after
    FROM updated
  `);
}
