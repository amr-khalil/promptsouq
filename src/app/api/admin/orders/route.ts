import { checkAdmin } from "@/lib/auth";
import { db } from "@/db";
import { orders, orderItems, prompts } from "@/db/schema";
import { adminOrdersQuerySchema } from "@/lib/schemas/api";
import { mapAdminOrderRow } from "@/lib/mappers";
import { and, eq, gte, lte, sql, desc } from "drizzle-orm";
import { NextResponse, type NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  const { isAdmin } = await checkAdmin();
  if (!isAdmin) {
    return NextResponse.json({ error: { message: "غير مصرح" } }, { status: 403 });
  }

  const params = Object.fromEntries(request.nextUrl.searchParams);
  const parsed = adminOrdersQuerySchema.safeParse(params);
  if (!parsed.success) {
    return NextResponse.json({ error: { message: "معلمات غير صالحة" } }, { status: 400 });
  }

  const { status, sellerId, dateFrom, dateTo, limit, offset } = parsed.data;

  try {
    const conditions = [];
    if (status) conditions.push(eq(orders.status, status));
    if (dateFrom) conditions.push(gte(orders.createdAt, new Date(dateFrom)));
    if (dateTo) conditions.push(lte(orders.createdAt, new Date(dateTo)));

    // If filtering by sellerId, we need to join through orderItems → prompts
    if (sellerId) {
      const orderIdsForSeller = db
        .selectDistinct({ orderId: orderItems.orderId })
        .from(orderItems)
        .innerJoin(prompts, eq(orderItems.promptId, prompts.id))
        .where(eq(prompts.sellerId, sellerId));

      conditions.push(sql`${orders.id} IN (${orderIdsForSeller})`);
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    // Count
    const [countResult] = await db
      .select({ count: sql<number>`COUNT(*)::int` })
      .from(orders)
      .where(whereClause);

    // Fetch orders with item count
    const rows = await db
      .select({
        id: orders.id,
        userId: orders.userId,
        stripeSessionId: orders.stripeSessionId,
        stripePaymentIntentId: orders.stripePaymentIntentId,
        amountTotal: orders.amountTotal,
        currency: orders.currency,
        status: orders.status,
        createdAt: orders.createdAt,
        updatedAt: orders.updatedAt,
        itemCount: sql<number>`(SELECT COUNT(*)::int FROM order_items WHERE order_id = ${orders.id})`,
      })
      .from(orders)
      .where(whereClause)
      .orderBy(desc(orders.createdAt))
      .limit(limit)
      .offset(offset);

    const data = rows.map((row) => mapAdminOrderRow({ ...row, itemCount: row.itemCount }));

    return NextResponse.json({
      data,
      total: countResult?.count ?? 0,
    });
  } catch {
    return NextResponse.json({ error: { message: "حدث خطأ في الخادم" } }, { status: 500 });
  }
}
