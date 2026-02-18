import { db } from "@/db";
import { creditTransactions } from "@/db/schema";
import { creditTransactionsQuerySchema } from "@/lib/schemas/credits";
import { apiErrorResponse } from "@/lib/schemas/api";
import { checkAuth } from "@/lib/auth";
import { count, desc, eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const userId = await checkAuth();
    if (!userId) {
      return NextResponse.json(
        apiErrorResponse("FORBIDDEN", "غير مصرح"),
        { status: 401 },
      );
    }

    const rawParams: Record<string, string> = {};
    for (const [key, value] of request.nextUrl.searchParams.entries()) {
      rawParams[key] = value;
    }

    const parsed = creditTransactionsQuerySchema.safeParse(rawParams);
    if (!parsed.success) {
      return NextResponse.json(
        apiErrorResponse("VALIDATION_ERROR", "بيانات غير صالحة"),
        { status: 400 },
      );
    }

    const { limit, offset } = parsed.data;

    const [transactions, totalResult] = await Promise.all([
      db
        .select({
          id: creditTransactions.id,
          type: creditTransactions.type,
          amount: creditTransactions.amount,
          creditSource: creditTransactions.creditSource,
          referenceType: creditTransactions.referenceType,
          referenceId: creditTransactions.referenceId,
          balanceAfter: creditTransactions.balanceAfter,
          createdAt: creditTransactions.createdAt,
        })
        .from(creditTransactions)
        .where(eq(creditTransactions.userId, userId))
        .orderBy(desc(creditTransactions.createdAt))
        .limit(limit)
        .offset(offset),
      db
        .select({ count: count() })
        .from(creditTransactions)
        .where(eq(creditTransactions.userId, userId)),
    ]);

    return NextResponse.json({
      data: transactions,
      total: totalResult[0].count,
    });
  } catch {
    return NextResponse.json(
      apiErrorResponse("INTERNAL_ERROR", "حدث خطأ داخلي"),
      { status: 500 },
    );
  }
}
