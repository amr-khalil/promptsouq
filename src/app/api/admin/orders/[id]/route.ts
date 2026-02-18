import { checkAdmin } from "@/lib/auth";
import { db } from "@/db";
import { orders, orderItems, prompts } from "@/db/schema";
import { mapAdminOrderDetailRow } from "@/lib/mappers";
import { eq } from "drizzle-orm";
import { NextResponse, type NextRequest } from "next/server";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { isAdmin } = await checkAdmin();
  if (!isAdmin) {
    return NextResponse.json({ error: { message: "غير مصرح" } }, { status: 403 });
  }

  const { id } = await params;

  try {
    // Fetch order
    const [order] = await db
      .select()
      .from(orders)
      .where(eq(orders.id, id))
      .limit(1);

    if (!order) {
      return NextResponse.json({ error: { message: "الطلب غير موجود" } }, { status: 404 });
    }

    // Fetch items with prompt info
    const items = await db
      .select({
        id: orderItems.id,
        orderId: orderItems.orderId,
        promptId: orderItems.promptId,
        priceAtPurchase: orderItems.priceAtPurchase,
        createdAt: orderItems.createdAt,
        referralSource: orderItems.referralSource,
        commissionRate: orderItems.commissionRate,
        sellerPayoutAmount: orderItems.sellerPayoutAmount,
        sellerStripeAccountId: orderItems.sellerStripeAccountId,
        promptTitle: prompts.title,
        sellerId: prompts.sellerId,
        sellerName: prompts.sellerName,
      })
      .from(orderItems)
      .innerJoin(prompts, eq(orderItems.promptId, prompts.id))
      .where(eq(orderItems.orderId, id));

    const data = mapAdminOrderDetailRow(order, items);

    return NextResponse.json({ data });
  } catch {
    return NextResponse.json({ error: { message: "حدث خطأ في الخادم" } }, { status: 500 });
  }
}
