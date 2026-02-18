import { checkAuth } from "@/lib/auth";
import { db } from "@/db";
import { orderItems, orders, prompts, sellerProfiles } from "@/db/schema";
import { sellerEarningsQuerySchema } from "@/lib/schemas/api";
import { mapSellerEarningRow } from "@/lib/mappers";
import { and, eq, sql, desc } from "drizzle-orm";
import { NextResponse, type NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  const userId = await checkAuth();
  if (!userId) {
    return NextResponse.json({ error: { message: "غير مصرح" } }, { status: 401 });
  }

  const params = Object.fromEntries(request.nextUrl.searchParams);
  const parsed = sellerEarningsQuerySchema.safeParse(params);
  if (!parsed.success) {
    return NextResponse.json({ error: { message: "معلمات غير صالحة" } }, { status: 400 });
  }

  const { limit, offset } = parsed.data;

  try {
    // Check seller profile for payouts status
    const [profile] = await db
      .select({ payoutsEnabled: sellerProfiles.payoutsEnabled })
      .from(sellerProfiles)
      .where(eq(sellerProfiles.userId, userId))
      .limit(1);

    const payoutsEnabled = profile?.payoutsEnabled ?? false;

    // Compute summary aggregates
    const [summary] = await db
      .select({
        totalSales: sql<number>`COALESCE(COUNT(*)::int, 0)`,
        grossRevenue: sql<number>`COALESCE(SUM(${orderItems.priceAtPurchase})::int, 0)`,
        totalCommission: sql<number>`COALESCE(SUM(${orderItems.priceAtPurchase} - COALESCE(${orderItems.sellerPayoutAmount}, 0))::int, 0)`,
        netEarnings: sql<number>`COALESCE(SUM(COALESCE(${orderItems.sellerPayoutAmount}, 0))::int, 0)`,
      })
      .from(orderItems)
      .innerJoin(prompts, eq(orderItems.promptId, prompts.id))
      .where(eq(prompts.sellerId, userId));

    // Paginated sales list
    const salesRows = await db
      .select({
        orderId: orderItems.orderId,
        promptId: orderItems.promptId,
        promptTitle: prompts.title,
        saleDate: orders.createdAt,
        priceAtPurchase: orderItems.priceAtPurchase,
        commissionRate: orderItems.commissionRate,
        sellerPayoutAmount: orderItems.sellerPayoutAmount,
      })
      .from(orderItems)
      .innerJoin(orders, eq(orderItems.orderId, orders.id))
      .innerJoin(prompts, eq(orderItems.promptId, prompts.id))
      .where(and(eq(prompts.sellerId, userId), eq(orders.status, "completed")))
      .orderBy(desc(orders.createdAt))
      .limit(limit)
      .offset(offset);

    // Total count for pagination
    const [countResult] = await db
      .select({ count: sql<number>`COUNT(*)::int` })
      .from(orderItems)
      .innerJoin(orders, eq(orderItems.orderId, orders.id))
      .innerJoin(prompts, eq(orderItems.promptId, prompts.id))
      .where(and(eq(prompts.sellerId, userId), eq(orders.status, "completed")));

    const sales = salesRows.map((row) => mapSellerEarningRow(row, payoutsEnabled));

    return NextResponse.json({
      data: {
        summary: {
          totalSales: summary?.totalSales ?? 0,
          grossRevenue: summary?.grossRevenue ?? 0,
          totalCommission: summary?.totalCommission ?? 0,
          netEarnings: summary?.netEarnings ?? 0,
          payoutsEnabled,
        },
        sales,
        total: countResult?.count ?? 0,
      },
    });
  } catch {
    return NextResponse.json({ error: { message: "حدث خطأ في الخادم" } }, { status: 500 });
  }
}
