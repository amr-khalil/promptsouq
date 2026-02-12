import { db } from "@/db";
import { prompts } from "@/db/schema";
import { mapPromptRow } from "@/lib/mappers";
import { apiErrorResponse, searchQuerySchema } from "@/lib/schemas/api";
import { ilike, or, sql } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const rawParams: Record<string, string> = {};
    for (const [key, value] of request.nextUrl.searchParams.entries()) {
      rawParams[key] = value;
    }

    const parsed = searchQuerySchema.safeParse(rawParams);

    if (!parsed.success) {
      return NextResponse.json(
        apiErrorResponse(
          "VALIDATION_ERROR",
          "يرجى إدخال كلمة بحث",
          parsed.error.flatten() as unknown as Record<string, unknown>,
        ),
        { status: 400 },
      );
    }

    const pattern = `%${parsed.data.q}%`;

    const rows = await db
      .select()
      .from(prompts)
      .where(
        or(
          ilike(prompts.title, pattern),
          ilike(prompts.titleEn, pattern),
          ilike(prompts.description, pattern),
          ilike(prompts.descriptionEn, pattern),
          ilike(sql`array_to_string(${prompts.tags}, ' ')`, pattern),
        ),
      );

    return NextResponse.json({ data: rows.map(mapPromptRow) });
  } catch {
    return NextResponse.json(
      apiErrorResponse("INTERNAL_ERROR", "حدث خطأ داخلي في الخادم"),
      { status: 500 },
    );
  }
}
