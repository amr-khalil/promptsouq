import { db } from "@/db";
import { favorites } from "@/db/schema";
import { apiErrorResponse, uuidParamSchema } from "@/lib/schemas/api";
import { checkAuth } from "@/lib/auth";
import { and, eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ promptId: string }> },
) {
  try {
    const userId = await checkAuth();
    if (!userId) {
      return NextResponse.json(
        { error: "يجب تسجيل الدخول أولاً" },
        { status: 401 },
      );
    }

    const { promptId } = await params;
    const parseResult = uuidParamSchema.safeParse(promptId);
    if (!parseResult.success) {
      return NextResponse.json(
        apiErrorResponse("VALIDATION_ERROR", "معرّف غير صالح"),
        { status: 400 },
      );
    }

    const deleted = await db
      .delete(favorites)
      .where(
        and(eq(favorites.userId, userId), eq(favorites.promptId, promptId)),
      )
      .returning({ id: favorites.id });

    if (deleted.length === 0) {
      return NextResponse.json(
        apiErrorResponse("NOT_FOUND", "البرومبت غير موجود في المفضلة"),
        { status: 404 },
      );
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      apiErrorResponse("INTERNAL_ERROR", "حدث خطأ داخلي"),
      { status: 500 },
    );
  }
}
