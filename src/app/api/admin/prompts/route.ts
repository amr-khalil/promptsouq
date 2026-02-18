import { db } from "@/db";
import { prompts } from "@/db/schema";
import { checkAdmin } from "@/lib/auth";
import { apiErrorResponse, adminPromptsQuerySchema } from "@/lib/schemas/api";
import { and, asc, count, eq, isNull } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const { isAdmin, userId } = await checkAdmin();
    if (!userId) {
      return NextResponse.json(
        apiErrorResponse("FORBIDDEN", "يجب تسجيل الدخول أولاً"),
        { status: 401 },
      );
    }
    if (!isAdmin) {
      return NextResponse.json(
        apiErrorResponse("FORBIDDEN", "ليس لديك صلاحية الوصول"),
        { status: 403 },
      );
    }

    const rawParams: Record<string, string> = {};
    for (const [key, value] of request.nextUrl.searchParams.entries()) {
      rawParams[key] = value;
    }

    const parsed = adminPromptsQuerySchema.safeParse(rawParams);
    if (!parsed.success) {
      return NextResponse.json(
        apiErrorResponse(
          "VALIDATION_ERROR",
          "معطيات غير صالحة",
          parsed.error.flatten() as unknown as Record<string, unknown>,
        ),
        { status: 400 },
      );
    }

    const { status, limit } = parsed.data;

    // Count-only mode for badge
    if (request.nextUrl.searchParams.get("countOnly") === "true") {
      const [row] = await db
        .select({ count: count() })
        .from(prompts)
        .where(and(eq(prompts.status, status), isNull(prompts.deletedAt)));
      return NextResponse.json({ data: { count: row.count } });
    }

    const rows = await db
      .select({
        id: prompts.id,
        title: prompts.title,
        titleEn: prompts.titleEn,
        aiModel: prompts.aiModel,
        generationType: prompts.generationType,
        price: prompts.price,
        sellerName: prompts.sellerName,
        sellerId: prompts.sellerId,
        status: prompts.status,
        createdAt: prompts.createdAt,
      })
      .from(prompts)
      .where(and(eq(prompts.status, status), isNull(prompts.deletedAt)))
      .orderBy(asc(prompts.createdAt))
      .limit(limit);

    return NextResponse.json({
      data: rows.map((r) => ({
        ...r,
        createdAt: r.createdAt.toISOString(),
      })),
    });
  } catch {
    return NextResponse.json(
      apiErrorResponse("INTERNAL_ERROR", "حدث خطأ داخلي في الخادم"),
      { status: 500 },
    );
  }
}
