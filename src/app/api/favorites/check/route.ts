import { db } from "@/db";
import { favorites } from "@/db/schema";
import {
  apiErrorResponse,
  favoriteCheckQuerySchema,
} from "@/lib/schemas/api";
import { checkAuth } from "@/lib/auth";
import { and, eq, inArray } from "drizzle-orm";
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

    const raw = request.nextUrl.searchParams.get("promptIds") ?? "";
    const parsed = favoriteCheckQuerySchema.safeParse({ promptIds: raw });
    if (!parsed.success) {
      return NextResponse.json(
        apiErrorResponse("VALIDATION_ERROR", "يجب توفير معرّفات البرومبتات"),
        { status: 400 },
      );
    }

    const ids = parsed.data.promptIds.split(",").slice(0, 50);

    const rows = await db
      .select({ promptId: favorites.promptId })
      .from(favorites)
      .where(
        and(
          eq(favorites.userId, userId),
          inArray(favorites.promptId, ids),
        ),
      );

    const favSet = new Set(rows.map((r) => r.promptId));
    const result: Record<string, boolean> = {};
    for (const id of ids) {
      result[id] = favSet.has(id);
    }

    return NextResponse.json({ data: result });
  } catch {
    return NextResponse.json(
      apiErrorResponse("INTERNAL_ERROR", "حدث خطأ داخلي"),
      { status: 500 },
    );
  }
}
