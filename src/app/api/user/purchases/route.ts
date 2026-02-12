import { db } from "@/db";
import { orderItems, orders } from "@/db/schema";
import { purchaseQuerySchema } from "@/lib/schemas/api";
import { auth } from "@clerk/nextjs/server";
import { and, eq } from "drizzle-orm";
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

    const rows = await db
      .select({ promptId: orderItems.promptId })
      .from(orderItems)
      .innerJoin(orders, eq(orders.id, orderItems.orderId))
      .where(eq(orders.userId, userId));

    const purchases = [...new Set(rows.map((r) => r.promptId))];

    return NextResponse.json({ purchases });
  } catch {
    return NextResponse.json(
      { error: "حدث خطأ داخلي" },
      { status: 500 },
    );
  }
}
