import { db } from "@/db";
import { generations, prompts } from "@/db/schema";
import { apiErrorResponse } from "@/lib/schemas/api";
import { checkAuth } from "@/lib/auth";
import { eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const idParamSchema = z.string().uuid("معرّف غير صالح");

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const userId = await checkAuth();
    if (!userId) {
      return NextResponse.json(
        apiErrorResponse("FORBIDDEN", "غير مصرح"),
        { status: 401 },
      );
    }

    const { id } = await params;
    const parsed = idParamSchema.safeParse(id);
    if (!parsed.success) {
      return NextResponse.json(
        apiErrorResponse("VALIDATION_ERROR", "معرّف غير صالح"),
        { status: 400 },
      );
    }

    const rows = await db
      .select({
        id: generations.id,
        userId: generations.userId,
        promptId: generations.promptId,
        promptTitle: prompts.title,
        generationType: generations.generationType,
        model: generations.model,
        inputPrompt: generations.inputPrompt,
        resultText: generations.resultText,
        resultImageUrl: generations.resultImageUrl,
        status: generations.status,
        creditsConsumed: generations.creditsConsumed,
        createdAt: generations.createdAt,
        completedAt: generations.completedAt,
      })
      .from(generations)
      .innerJoin(prompts, eq(prompts.id, generations.promptId))
      .where(eq(generations.id, parsed.data))
      .limit(1);

    if (rows.length === 0) {
      return NextResponse.json(
        apiErrorResponse("NOT_FOUND", "النتيجة غير موجودة"),
        { status: 404 },
      );
    }

    const row = rows[0];

    // Verify ownership
    if (row.userId !== userId) {
      return NextResponse.json(
        apiErrorResponse("FORBIDDEN", "غير مصرح بالوصول لهذه النتيجة"),
        { status: 403 },
      );
    }

    // Strip userId from response
    const { userId: _ownerId, ...generation } = row;

    return NextResponse.json({ generation });
  } catch {
    return NextResponse.json(
      apiErrorResponse("INTERNAL_ERROR", "حدث خطأ داخلي"),
      { status: 500 },
    );
  }
}
