import { db } from "@/db";
import { reviews } from "@/db/schema";
import { mapReviewRow } from "@/lib/mappers";
import { apiErrorResponse, uuidParamSchema } from "@/lib/schemas/api";
import { checkAuth } from "@/lib/auth";
import { and, eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const userId = await checkAuth();
    if (!userId) {
      return NextResponse.json(
        { error: "يجب تسجيل الدخول أولاً" },
        { status: 401 },
      );
    }

    const promptId = request.nextUrl.searchParams.get("promptId");
    if (!promptId) {
      return NextResponse.json(
        apiErrorResponse("VALIDATION_ERROR", "يجب توفير معرّف البرومبت"),
        { status: 400 },
      );
    }

    const parseResult = uuidParamSchema.safeParse(promptId);
    if (!parseResult.success) {
      return NextResponse.json(
        apiErrorResponse("VALIDATION_ERROR", "معرّف غير صالح"),
        { status: 400 },
      );
    }

    const [review] = await db
      .select()
      .from(reviews)
      .where(
        and(eq(reviews.userId, userId), eq(reviews.promptId, promptId)),
      )
      .limit(1);

    return NextResponse.json({ data: review ? mapReviewRow(review) : null });
  } catch {
    return NextResponse.json(
      apiErrorResponse("INTERNAL_ERROR", "حدث خطأ داخلي"),
      { status: 500 },
    );
  }
}
