import { db } from "@/db";
import { favorites, prompts } from "@/db/schema";
import { mapPromptRow } from "@/lib/mappers";
import {
  apiErrorResponse,
  favoriteRequestSchema,
} from "@/lib/schemas/api";
import { auth } from "@clerk/nextjs/server";
import { desc, eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json(
        { error: "يجب تسجيل الدخول أولاً" },
        { status: 401 },
      );
    }

    const rows = await db
      .select({
        prompt: prompts,
        favoritedAt: favorites.createdAt,
      })
      .from(favorites)
      .innerJoin(prompts, eq(prompts.id, favorites.promptId))
      .where(eq(favorites.userId, userId))
      .orderBy(desc(favorites.createdAt));

    const data = rows.map((r) => ({
      ...mapPromptRow(r.prompt),
      favoritedAt: r.favoritedAt.toISOString(),
    }));

    return NextResponse.json({ data });
  } catch {
    return NextResponse.json(
      apiErrorResponse("INTERNAL_ERROR", "حدث خطأ داخلي"),
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json(
        { error: "يجب تسجيل الدخول أولاً" },
        { status: 401 },
      );
    }

    const body = await request.json();
    const parsed = favoriteRequestSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        apiErrorResponse("VALIDATION_ERROR", "معرّف غير صالح"),
        { status: 400 },
      );
    }

    // Verify prompt exists
    const [prompt] = await db
      .select({ id: prompts.id })
      .from(prompts)
      .where(eq(prompts.id, parsed.data.promptId))
      .limit(1);

    if (!prompt) {
      return NextResponse.json(
        apiErrorResponse("NOT_FOUND", "البرومبت غير موجود"),
        { status: 404 },
      );
    }

    // Insert (unique constraint handles duplicates)
    try {
      const [fav] = await db
        .insert(favorites)
        .values({
          userId,
          promptId: parsed.data.promptId,
        })
        .returning({ promptId: favorites.promptId, createdAt: favorites.createdAt });

      return NextResponse.json(
        { data: { promptId: fav.promptId, favoritedAt: fav.createdAt.toISOString() } },
        { status: 201 },
      );
    } catch (e: unknown) {
      if (e instanceof Error && e.message.includes("unique")) {
        return NextResponse.json(
          apiErrorResponse("CONFLICT", "البرومبت موجود في المفضلة مسبقاً"),
          { status: 409 },
        );
      }
      throw e;
    }
  } catch {
    return NextResponse.json(
      apiErrorResponse("INTERNAL_ERROR", "حدث خطأ داخلي"),
      { status: 500 },
    );
  }
}
