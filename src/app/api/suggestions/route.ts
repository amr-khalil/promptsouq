import { db } from "@/db";
import { prompts } from "@/db/schema";
import { apiErrorResponse, suggestionsQuerySchema } from "@/lib/schemas/api";
import { eq, sql } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const rawParams: Record<string, string> = {};
    for (const [key, value] of searchParams.entries()) {
      rawParams[key] = value;
    }

    const parsed = suggestionsQuerySchema.safeParse(rawParams);
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

    const { q, limit } = parsed.data;
    const effectiveLimit = limit ?? 6;
    const pattern = `%${q}%`;

    const rows = await db
      .select({
        id: prompts.id,
        title: prompts.title,
        aiModel: prompts.aiModel,
      })
      .from(prompts)
      .where(
        sql`${eq(prompts.status, "approved")} AND (
          ${prompts.title} ILIKE ${pattern}
          OR ${prompts.titleEn} ILIKE ${pattern}
          OR array_to_string(${prompts.tags}, ' ') ILIKE ${pattern}
        )`,
      )
      .orderBy(
        sql`CASE
          WHEN ${prompts.title} ILIKE ${pattern} THEN 0
          WHEN ${prompts.titleEn} ILIKE ${pattern} THEN 1
          ELSE 2
        END`,
      )
      .limit(effectiveLimit);

    return NextResponse.json({ data: rows });
  } catch {
    return NextResponse.json(
      apiErrorResponse("INTERNAL_ERROR", "حدث خطأ داخلي في الخادم"),
      { status: 500 },
    );
  }
}
