import { db } from "@/db";
import { orderItems, orders, prompts } from "@/db/schema";
import { mapPromptRow } from "@/lib/mappers";
import { apiErrorResponse, uuidParamSchema } from "@/lib/schemas/api";
import { auth } from "@clerk/nextjs/server";
import { and, eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { error: "يجب تسجيل الدخول أولاً" },
        { status: 401 },
      );
    }

    const { id } = await params;
    const parseResult = uuidParamSchema.safeParse(id);
    if (!parseResult.success) {
      return NextResponse.json(
        apiErrorResponse("VALIDATION_ERROR", "معرّف غير صالح"),
        { status: 400 },
      );
    }

    // Check prompt exists
    const [prompt] = await db
      .select()
      .from(prompts)
      .where(eq(prompts.id, id))
      .limit(1);

    if (!prompt) {
      return NextResponse.json(
        apiErrorResponse("NOT_FOUND", "البرومبت غير موجود"),
        { status: 404 },
      );
    }

    // Verify ownership
    const [purchase] = await db
      .select({ purchasedAt: orders.createdAt })
      .from(orderItems)
      .innerJoin(orders, eq(orders.id, orderItems.orderId))
      .where(
        and(
          eq(orders.userId, userId),
          eq(orderItems.promptId, id),
        ),
      )
      .limit(1);

    if (!purchase) {
      return NextResponse.json(
        apiErrorResponse("FORBIDDEN", "لم تقم بشراء هذا البرومبت"),
        { status: 403 },
      );
    }

    return NextResponse.json({
      data: {
        ...mapPromptRow(prompt),
        purchasedAt: purchase.purchasedAt.toISOString(),
      },
    });
  } catch {
    return NextResponse.json(
      apiErrorResponse("INTERNAL_ERROR", "حدث خطأ داخلي"),
      { status: 500 },
    );
  }
}
