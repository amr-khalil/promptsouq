import { db } from "@/db";
import { freePromptAccess, prompts } from "@/db/schema";
import { checkAuth } from "@/lib/auth";
import { mapFreeAccessRow } from "@/lib/mappers";
import { apiErrorResponse, uuidParamSchema } from "@/lib/schemas/api";
import { and, desc, eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const userId = await checkAuth();
    if (!userId) {
      return NextResponse.json(
        apiErrorResponse("FORBIDDEN", "يجب تسجيل الدخول أولاً"),
        { status: 401 },
      );
    }

    const body = await request.json();
    const parsed = uuidParamSchema.safeParse(body.promptId);

    if (!parsed.success) {
      return NextResponse.json(
        apiErrorResponse("VALIDATION_ERROR", "معرّف غير صالح"),
        { status: 400 },
      );
    }

    const promptId = parsed.data;

    // Verify prompt exists and is free
    const [prompt] = await db
      .select({ id: prompts.id, price: prompts.price })
      .from(prompts)
      .where(eq(prompts.id, promptId))
      .limit(1);

    if (!prompt) {
      return NextResponse.json(
        apiErrorResponse("NOT_FOUND", "البرومبت غير موجود"),
        { status: 404 },
      );
    }

    if (prompt.price !== 0) {
      return NextResponse.json(
        apiErrorResponse("VALIDATION_ERROR", "هذا البرومبت ليس مجانياً"),
        { status: 400 },
      );
    }

    // Insert access record (ON CONFLICT DO NOTHING for idempotency)
    const [row] = await db
      .insert(freePromptAccess)
      .values({ userId, promptId })
      .onConflictDoNothing({
        target: [freePromptAccess.userId, freePromptAccess.promptId],
      })
      .returning({ accessedAt: freePromptAccess.accessedAt });

    if (row) {
      return NextResponse.json(
        { data: { accessedAt: row.accessedAt.toISOString() } },
        { status: 201 },
      );
    }

    // Already existed — fetch existing record
    const [existing] = await db
      .select({ accessedAt: freePromptAccess.accessedAt })
      .from(freePromptAccess)
      .where(
        and(
          eq(freePromptAccess.userId, userId),
          eq(freePromptAccess.promptId, promptId),
        ),
      )
      .limit(1);

    return NextResponse.json({
      data: { accessedAt: existing.accessedAt.toISOString() },
    });
  } catch {
    return NextResponse.json(
      apiErrorResponse("INTERNAL_ERROR", "حدث خطأ داخلي في الخادم"),
      { status: 500 },
    );
  }
}

export async function GET() {
  try {
    const userId = await checkAuth();
    if (!userId) {
      return NextResponse.json(
        apiErrorResponse("FORBIDDEN", "يجب تسجيل الدخول أولاً"),
        { status: 401 },
      );
    }

    const rows = await db
      .select({
        freeAccess: freePromptAccess,
        prompt: prompts,
      })
      .from(freePromptAccess)
      .innerJoin(prompts, eq(freePromptAccess.promptId, prompts.id))
      .where(eq(freePromptAccess.userId, userId))
      .orderBy(desc(freePromptAccess.accessedAt));

    return NextResponse.json({
      data: rows.map(mapFreeAccessRow),
      total: rows.length,
    });
  } catch {
    return NextResponse.json(
      apiErrorResponse("INTERNAL_ERROR", "حدث خطأ داخلي في الخادم"),
      { status: 500 },
    );
  }
}
