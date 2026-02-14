import { db } from "@/db";
import { prompts } from "@/db/schema";
import { checkAuth } from "@/lib/auth";
import { mapSellerPromptRow } from "@/lib/mappers";
import { apiErrorResponse, sellerPromptsQuerySchema } from "@/lib/schemas/api";
import { and, asc, desc, eq, ilike, type SQL } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const userId = await checkAuth();
    if (!userId) {
      return NextResponse.json(
        apiErrorResponse("FORBIDDEN", "يجب تسجيل الدخول أولاً"),
        { status: 401 },
      );
    }

    const rawParams: Record<string, string> = {};
    for (const [key, value] of request.nextUrl.searchParams.entries()) {
      rawParams[key] = value;
    }

    const parsed = sellerPromptsQuerySchema.safeParse(rawParams);
    if (!parsed.success) {
      return NextResponse.json(
        apiErrorResponse(
          "VALIDATION_ERROR",
          "معطيات البحث غير صالحة",
          parsed.error.flatten() as unknown as Record<string, unknown>,
        ),
        { status: 400 },
      );
    }

    const { status, search, sortBy } = parsed.data;

    const conditions: SQL[] = [eq(prompts.sellerId, userId)];

    if (status) {
      conditions.push(eq(prompts.status, status));
    }

    if (search) {
      conditions.push(ilike(prompts.title, `%${search}%`));
    }

    const orderBy =
      sortBy === "oldest" ? asc(prompts.createdAt) : desc(prompts.createdAt);

    const rows = await db
      .select()
      .from(prompts)
      .where(and(...conditions))
      .orderBy(orderBy);

    return NextResponse.json({ data: rows.map(mapSellerPromptRow) });
  } catch {
    return NextResponse.json(
      apiErrorResponse("INTERNAL_ERROR", "حدث خطأ داخلي في الخادم"),
      { status: 500 },
    );
  }
}
