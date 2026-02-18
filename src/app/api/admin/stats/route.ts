import { checkAdmin } from "@/lib/auth";
import { db } from "@/db";
import { orders, orderItems, prompts } from "@/db/schema";
import { and, eq, isNull, sql, desc } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function GET() {
  const { isAdmin } = await checkAdmin();
  if (!isAdmin) {
    return NextResponse.json({ error: { message: "غير مصرح" } }, { status: 403 });
  }

  try {
    // Total sales count
    const [salesCount] = await db
      .select({ count: sql<number>`COUNT(*)::int` })
      .from(orders);

    // Total revenue
    const [revenueResult] = await db
      .select({ total: sql<number>`COALESCE(SUM(${orders.amountTotal})::int, 0)` })
      .from(orders);

    // Total commission
    const [commissionResult] = await db
      .select({
        total: sql<number>`COALESCE(SUM(${orderItems.priceAtPurchase} - COALESCE(${orderItems.sellerPayoutAmount}, 0))::int, 0)`,
      })
      .from(orderItems);

    // Active sellers (unique sellers with approved non-deleted prompts)
    const [activeSellersResult] = await db
      .select({ count: sql<number>`COUNT(DISTINCT ${prompts.sellerId})::int` })
      .from(prompts)
      .where(and(eq(prompts.status, "approved"), isNull(prompts.deletedAt)));

    // Active prompts
    const [activePromptsResult] = await db
      .select({ count: sql<number>`COUNT(*)::int` })
      .from(prompts)
      .where(and(eq(prompts.status, "approved"), isNull(prompts.deletedAt)));

    // Pending prompts
    const [pendingPromptsResult] = await db
      .select({ count: sql<number>`COUNT(*)::int` })
      .from(prompts)
      .where(and(eq(prompts.status, "pending"), isNull(prompts.deletedAt)));

    // Top 5 prompts by sales
    const topPrompts = await db
      .select({
        id: prompts.id,
        title: prompts.title,
        titleEn: prompts.titleEn,
        sales: prompts.sales,
        thumbnail: prompts.thumbnail,
        revenue: sql<number>`COALESCE(SUM(${orderItems.priceAtPurchase})::int, 0)`,
      })
      .from(prompts)
      .leftJoin(orderItems, eq(prompts.id, orderItems.promptId))
      .where(and(eq(prompts.status, "approved"), isNull(prompts.deletedAt)))
      .groupBy(prompts.id)
      .orderBy(desc(prompts.sales))
      .limit(5);

    return NextResponse.json({
      data: {
        totalSales: salesCount?.count ?? 0,
        totalRevenue: revenueResult?.total ?? 0,
        totalCommission: commissionResult?.total ?? 0,
        activeSellers: activeSellersResult?.count ?? 0,
        activePrompts: activePromptsResult?.count ?? 0,
        pendingPrompts: pendingPromptsResult?.count ?? 0,
        topPrompts: topPrompts.map((p) => ({
          id: p.id,
          title: p.title,
          titleEn: p.titleEn,
          sales: p.sales,
          thumbnail: p.thumbnail,
          revenue: p.revenue,
        })),
      },
    });
  } catch {
    return NextResponse.json({ error: { message: "حدث خطأ في الخادم" } }, { status: 500 });
  }
}
