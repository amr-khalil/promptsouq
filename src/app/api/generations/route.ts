import { db } from "@/db";
import { generations, prompts } from "@/db/schema";
import { generationsListQuerySchema } from "@/lib/schemas/generation";
import { apiErrorResponse } from "@/lib/schemas/api";
import { checkAuth } from "@/lib/auth";
import { and, count, desc, eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const userId = await checkAuth();
    if (!userId) {
      return NextResponse.json(
        apiErrorResponse("FORBIDDEN", "غير مصرح"),
        { status: 401 },
      );
    }

    const rawParams: Record<string, string> = {};
    for (const [key, value] of request.nextUrl.searchParams.entries()) {
      rawParams[key] = value;
    }

    const parsed = generationsListQuerySchema.safeParse(rawParams);
    if (!parsed.success) {
      return NextResponse.json(
        apiErrorResponse("VALIDATION_ERROR", "بيانات غير صالحة"),
        { status: 400 },
      );
    }

    const { limit, offset, promptId } = parsed.data;

    const whereConditions = promptId
      ? and(eq(generations.userId, userId), eq(generations.promptId, promptId))
      : eq(generations.userId, userId);

    const [rows, totalResult] = await Promise.all([
      db
        .select({
          id: generations.id,
          promptId: generations.promptId,
          promptTitle: prompts.title,
          generationType: generations.generationType,
          model: generations.model,
          resultText: generations.resultText,
          resultImageUrl: generations.resultImageUrl,
          status: generations.status,
          creditsConsumed: generations.creditsConsumed,
          createdAt: generations.createdAt,
        })
        .from(generations)
        .innerJoin(prompts, eq(prompts.id, generations.promptId))
        .where(whereConditions)
        .orderBy(desc(generations.createdAt))
        .limit(limit)
        .offset(offset),
      db
        .select({ count: count() })
        .from(generations)
        .where(whereConditions),
    ]);

    return NextResponse.json({
      data: rows,
      total: totalResult[0].count,
    });
  } catch {
    return NextResponse.json(
      apiErrorResponse("INTERNAL_ERROR", "حدث خطأ داخلي"),
      { status: 500 },
    );
  }
}
