import { db } from "@/db";
import { prompts } from "@/db/schema";
import { checkAuth } from "@/lib/auth";
import {
  apiErrorResponse,
  promptSubmissionSchema,
  uuidParamSchema,
} from "@/lib/schemas/api";
import { eq, and } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const userId = await checkAuth();
    if (!userId) {
      return NextResponse.json(
        apiErrorResponse("FORBIDDEN", "يجب تسجيل الدخول أولاً"),
        { status: 401 },
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

    const [row] = await db
      .select()
      .from(prompts)
      .where(and(eq(prompts.id, parsed.data), eq(prompts.sellerId, userId)))
      .limit(1);

    if (!row) {
      return NextResponse.json(
        apiErrorResponse("NOT_FOUND", "البرومبت غير موجود"),
        { status: 404 },
      );
    }

    return NextResponse.json({
      data: {
        id: row.id,
        title: row.title,
        titleEn: row.titleEn,
        description: row.description,
        descriptionEn: row.descriptionEn,
        price: row.price,
        isFree: row.price === 0,
        category: row.category,
        aiModel: row.aiModel,
        generationType: row.generationType,
        modelVersion: row.modelVersion,
        maxTokens: row.maxTokens,
        temperature: row.temperature,
        difficulty: row.difficulty,
        tags: row.tags,
        thumbnail: row.thumbnail,
        gallery: row.gallery,
        fullContent: row.fullContent,
        instructions: row.instructions,
        exampleOutputs: row.exampleOutputs,
        examplePrompts: row.examplePrompts,
        status: row.status,
        rejectionReason: row.rejectionReason,
        createdAt: row.createdAt.toISOString(),
      },
    });
  } catch {
    return NextResponse.json(
      apiErrorResponse("INTERNAL_ERROR", "حدث خطأ داخلي في الخادم"),
      { status: 500 },
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const userId = await checkAuth();
    if (!userId) {
      return NextResponse.json(
        apiErrorResponse("FORBIDDEN", "يجب تسجيل الدخول أولاً"),
        { status: 401 },
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

    // Verify ownership
    const [existing] = await db
      .select({ sellerId: prompts.sellerId })
      .from(prompts)
      .where(eq(prompts.id, parsedId.data))
      .limit(1);

    if (!existing || existing.sellerId !== userId) {
      return NextResponse.json(
        apiErrorResponse("NOT_FOUND", "البرومبت غير موجود"),
        { status: 404 },
      );
    }

    const body = await request.json();
    const parsed = promptSubmissionSchema.safeParse({ isFree: false, ...body });
    if (!parsed.success) {
      return NextResponse.json(
        apiErrorResponse(
          "VALIDATION_ERROR",
          "بيانات البرومبت غير صالحة",
          parsed.error.flatten() as unknown as Record<string, unknown>,
        ),
        { status: 400 },
      );
    }

    const data = parsed.data;
    const effectivePrice = data.isFree ? 0 : data.price;

    const [updated] = await db
      .update(prompts)
      .set({
        title: data.title,
        titleEn: data.titleEn || data.title,
        description: data.description,
        descriptionEn: data.descriptionEn || data.description,
        price: effectivePrice,
        category: data.category,
        aiModel: data.aiModel,
        generationType: data.generationType,
        modelVersion: data.modelVersion ?? null,
        maxTokens: data.maxTokens ?? null,
        temperature: data.temperature ?? null,
        difficulty: data.difficulty,
        tags: data.tags,
        thumbnail: data.thumbnail ?? "",
        gallery: (data.examplePrompts ?? []).map((ex) => ex.image).filter(Boolean) as string[],
        fullContent: data.fullContent,
        instructions: data.instructions ?? null,
        exampleOutputs: data.exampleOutputs ?? [],
        examplePrompts: data.examplePrompts ?? [],
        samples: data.exampleOutputs ?? [],
        status: "pending",
        rejectionReason: null,
        reviewedAt: null,
        reviewedBy: null,
        updatedAt: new Date(),
      })
      .where(eq(prompts.id, parsedId.data))
      .returning({
        id: prompts.id,
        status: prompts.status,
        title: prompts.title,
        updatedAt: prompts.updatedAt,
      });

    return NextResponse.json({
      data: { ...updated, updatedAt: updated.updatedAt.toISOString() },
    });
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
    const userId = await checkAuth();
    if (!userId) {
      return NextResponse.json(
        apiErrorResponse("FORBIDDEN", "يجب تسجيل الدخول أولاً"),
        { status: 401 },
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
      .where(and(eq(prompts.id, parsed.data), eq(prompts.sellerId, userId)))
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
