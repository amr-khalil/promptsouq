import { db } from "@/db";
import { prompts, reviews } from "@/db/schema";
import { mapReviewRow } from "@/lib/mappers";
import { apiErrorResponse, uuidParamSchema } from "@/lib/schemas/api";
import { eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const parsed = uuidParamSchema.safeParse(id);

    if (!parsed.success) {
      return NextResponse.json(
        apiErrorResponse("VALIDATION_ERROR", "معرّف غير صالح"),
        { status: 400 },
      );
    }

    // Verify prompt exists
    const promptRows = await db
      .select({ id: prompts.id })
      .from(prompts)
      .where(eq(prompts.id, parsed.data))
      .limit(1);

    if (promptRows.length === 0) {
      return NextResponse.json(
        apiErrorResponse("NOT_FOUND", "البرومبت غير موجود"),
        { status: 404 },
      );
    }

    const rows = await db
      .select()
      .from(reviews)
      .where(eq(reviews.promptId, parsed.data));

    return NextResponse.json({ data: rows.map(mapReviewRow) });
  } catch {
    return NextResponse.json(
      apiErrorResponse("INTERNAL_ERROR", "حدث خطأ داخلي في الخادم"),
      { status: 500 },
    );
  }
}
