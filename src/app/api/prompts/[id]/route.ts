import { db } from "@/db";
import { prompts } from "@/db/schema";
import { mapPromptRow } from "@/lib/mappers";
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

    const rows = await db
      .select()
      .from(prompts)
      .where(eq(prompts.id, parsed.data))
      .limit(1);

    if (rows.length === 0) {
      return NextResponse.json(
        apiErrorResponse("NOT_FOUND", "البرومبت غير موجود"),
        { status: 404 },
      );
    }

    return NextResponse.json({ data: mapPromptRow(rows[0]) });
  } catch {
    return NextResponse.json(
      apiErrorResponse("INTERNAL_ERROR", "حدث خطأ داخلي في الخادم"),
      { status: 500 },
    );
  }
}
