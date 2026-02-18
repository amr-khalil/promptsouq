import { db } from "@/db";
import { prompts } from "@/db/schema";
import { checkAdmin } from "@/lib/auth";
import { mapAdminPromptRow } from "@/lib/mappers";
import { apiErrorResponse, uuidParamSchema } from "@/lib/schemas/api";
import { eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { isAdmin, userId } = await checkAdmin();
    if (!userId) {
      return NextResponse.json(
        apiErrorResponse("FORBIDDEN", "يجب تسجيل الدخول أولاً"),
        { status: 401 },
      );
    }
    if (!isAdmin) {
      return NextResponse.json(
        apiErrorResponse("FORBIDDEN", "ليس لديك صلاحية الوصول"),
        { status: 403 },
      );
    }

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

    return NextResponse.json({ data: mapAdminPromptRow(rows[0]) });
  } catch {
    return NextResponse.json(
      apiErrorResponse("INTERNAL_ERROR", "حدث خطأ داخلي في الخادم"),
      { status: 500 },
    );
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { isAdmin, userId } = await checkAdmin();
    if (!userId) {
      return NextResponse.json(
        apiErrorResponse("FORBIDDEN", "يجب تسجيل الدخول أولاً"),
        { status: 401 },
      );
    }
    if (!isAdmin) {
      return NextResponse.json(
        apiErrorResponse("FORBIDDEN", "ليس لديك صلاحية الوصول"),
        { status: 403 },
      );
    }

    const { id } = await params;
    const parsed = uuidParamSchema.safeParse(id);
    if (!parsed.success) {
      return NextResponse.json(
        apiErrorResponse("VALIDATION_ERROR", "معرّف غير صالح"),
        { status: 400 },
      );
    }

    const [updated] = await db
      .update(prompts)
      .set({ deletedAt: new Date() })
      .where(eq(prompts.id, parsed.data))
      .returning({ id: prompts.id, deletedAt: prompts.deletedAt });

    if (!updated) {
      return NextResponse.json(
        apiErrorResponse("NOT_FOUND", "البرومبت غير موجود"),
        { status: 404 },
      );
    }

    return NextResponse.json({
      data: { id: updated.id, deletedAt: updated.deletedAt?.toISOString() },
    });
  } catch {
    return NextResponse.json(
      apiErrorResponse("INTERNAL_ERROR", "حدث خطأ داخلي في الخادم"),
      { status: 500 },
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { isAdmin, userId } = await checkAdmin();
    if (!userId) {
      return NextResponse.json(
        apiErrorResponse("FORBIDDEN", "يجب تسجيل الدخول أولاً"),
        { status: 401 },
      );
    }
    if (!isAdmin) {
      return NextResponse.json(
        apiErrorResponse("FORBIDDEN", "ليس لديك صلاحية الوصول"),
        { status: 403 },
      );
    }

    const { id } = await params;
    const parsedId = uuidParamSchema.safeParse(id);
    if (!parsedId.success) {
      return NextResponse.json(
        apiErrorResponse("VALIDATION_ERROR", "معرّف غير صالح"),
        { status: 400 },
      );
    }

    const body = await request.json();

    // Only allow updating specific fields
    const allowedFields: Record<string, unknown> = {};
    if (typeof body.title === "string") allowedFields.title = body.title;
    if (typeof body.titleEn === "string") allowedFields.titleEn = body.titleEn;
    if (typeof body.description === "string") allowedFields.description = body.description;
    if (typeof body.descriptionEn === "string") allowedFields.descriptionEn = body.descriptionEn;
    if (typeof body.price === "number") allowedFields.price = body.price;
    if (typeof body.category === "string") allowedFields.category = body.category;
    if (typeof body.aiModel === "string") allowedFields.aiModel = body.aiModel;
    if (typeof body.difficulty === "string") allowedFields.difficulty = body.difficulty;
    if (Array.isArray(body.tags)) allowedFields.tags = body.tags;

    if (Object.keys(allowedFields).length === 0) {
      return NextResponse.json(
        apiErrorResponse("VALIDATION_ERROR", "لا توجد حقول للتحديث"),
        { status: 400 },
      );
    }

    allowedFields.updatedAt = new Date();

    const [updated] = await db
      .update(prompts)
      .set(allowedFields)
      .where(eq(prompts.id, parsedId.data))
      .returning({ id: prompts.id, title: prompts.title });

    if (!updated) {
      return NextResponse.json(
        apiErrorResponse("NOT_FOUND", "البرومبت غير موجود"),
        { status: 404 },
      );
    }

    return NextResponse.json({ data: updated });
  } catch {
    return NextResponse.json(
      apiErrorResponse("INTERNAL_ERROR", "حدث خطأ داخلي في الخادم"),
      { status: 500 },
    );
  }
}
