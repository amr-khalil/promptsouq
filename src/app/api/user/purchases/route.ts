import { db } from "@/db";
import { orderItems, orders, prompts } from "@/db/schema";
import { mapPurchaseRow } from "@/lib/mappers";
import { apiErrorResponse, purchaseQuerySchema } from "@/lib/schemas/api";
import { auth } from "@clerk/nextjs/server";
import { and, desc, eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { error: "يجب تسجيل الدخول أولاً" },
        { status: 401 },
      );
    }

    const rawParams: Record<string, string> = {};
    for (const [key, value] of request.nextUrl.searchParams.entries()) {
      rawParams[key] = value;
    }

    const parsed = purchaseQuerySchema.safeParse(rawParams);
    const promptId = parsed.success ? parsed.data.promptId : undefined;

    // Check mode: return whether user owns a specific prompt
    if (promptId) {
      const rows = await db
        .select({ promptId: orderItems.promptId })
        .from(orderItems)
        .innerJoin(orders, eq(orders.id, orderItems.orderId))
        .where(
          and(
            eq(orders.userId, userId),
            eq(orderItems.promptId, promptId),
          ),
        )
        .limit(1);

      return NextResponse.json({ purchased: rows.length > 0 });
    }

    // List mode: return all purchased prompts with details
    const rows = await db
      .select({
        prompt: prompts,
        purchasedAt: orders.createdAt,
        priceAtPurchase: orderItems.priceAtPurchase,
      })
      .from(orderItems)
      .innerJoin(orders, eq(orders.id, orderItems.orderId))
      .innerJoin(prompts, eq(prompts.id, orderItems.promptId))
      .where(eq(orders.userId, userId))
      .orderBy(desc(orders.createdAt));

    // Deduplicate by promptId (keep earliest purchase)
    const seen = new Set<string>();
    const unique = rows.filter((r) => {
      if (seen.has(r.prompt.id)) return false;
      seen.add(r.prompt.id);
      return true;
    });

    return NextResponse.json({ data: unique.map(mapPurchaseRow) });
  } catch {
    return NextResponse.json(
      apiErrorResponse("INTERNAL_ERROR", "حدث خطأ داخلي"),
      { status: 500 },
    );
  }
}
