import { db } from "@/db";
import { prompts } from "@/db/schema";
import { mapPromptRow } from "@/lib/mappers";
import { apiErrorResponse, relatedQuerySchema } from "@/lib/schemas/api";
import { and, eq, ne } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const numericId = parseInt(id, 10);

    if (isNaN(numericId)) {
      return NextResponse.json(
        apiErrorResponse("NOT_FOUND", "البرومبت غير موجود"),
        { status: 404 },
      );
    }

    const currentRows = await db
      .select()
      .from(prompts)
      .where(eq(prompts.id, numericId))
      .limit(1);

    if (currentRows.length === 0) {
      return NextResponse.json(
        apiErrorResponse("NOT_FOUND", "البرومبت غير موجود"),
        { status: 404 },
      );
    }

    const rawParams: Record<string, string> = {};
    for (const [key, value] of request.nextUrl.searchParams.entries()) {
      rawParams[key] = value;
    }

    const parsed = relatedQuerySchema.safeParse(rawParams);
    const limit = parsed.success ? parsed.data.limit : 3;

    const related = await db
      .select()
      .from(prompts)
      .where(
        and(
          eq(prompts.category, currentRows[0].category),
          ne(prompts.id, numericId),
        ),
      )
      .limit(limit);

    return NextResponse.json({ data: related.map(mapPromptRow) });
  } catch {
    return NextResponse.json(
      apiErrorResponse("INTERNAL_ERROR", "حدث خطأ داخلي في الخادم"),
      { status: 500 },
    );
  }
}
