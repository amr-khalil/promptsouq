import { db } from "@/db";
import { orderItems, orders, prompts, reviews } from "@/db/schema";
import { mapReviewRow } from "@/lib/mappers";
import {
  apiErrorResponse,
  reviewSubmitSchema,
  uuidParamSchema,
} from "@/lib/schemas/api";
import { auth, currentUser } from "@clerk/nextjs/server";
import { and, avg, count, eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

async function recalculateRating(promptId: string) {
  const [agg] = await db
    .select({
      avgRating: avg(reviews.rating),
      reviewCount: count(),
    })
    .from(reviews)
    .where(eq(reviews.promptId, promptId));

  await db
    .update(prompts)
    .set({
      rating: agg.avgRating ? parseFloat(String(agg.avgRating)) : 0,
      reviewsCount: agg.reviewCount,
    })
    .where(eq(prompts.id, promptId));
}

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

    const promptRows = await db
      .select({ id: prompts.id })
      .from(prompts)
      .where(eq(prompts.id, parsed.data))
      .limit(1);

    if (promptRows.length === 0) {
      return NextResponse.json(
        apiErrorResponse("NOT_FOUND", "البرومبت غير موجود"),
        { status: 404 },
      );
    }

    const rows = await db
      .select()
      .from(reviews)
      .where(eq(reviews.promptId, parsed.data));

    return NextResponse.json({ data: rows.map(mapReviewRow) });
  } catch {
    return NextResponse.json(
      apiErrorResponse("INTERNAL_ERROR", "حدث خطأ داخلي في الخادم"),
      { status: 500 },
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json(
        { error: "يجب تسجيل الدخول أولاً" },
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

    // Verify prompt exists
    const [prompt] = await db
      .select({ id: prompts.id })
      .from(prompts)
      .where(eq(prompts.id, id))
      .limit(1);

    if (!prompt) {
      return NextResponse.json(
        apiErrorResponse("NOT_FOUND", "البرومبت غير موجود"),
        { status: 404 },
      );
    }

    // Verify purchase ownership
    const [purchase] = await db
      .select({ promptId: orderItems.promptId })
      .from(orderItems)
      .innerJoin(orders, eq(orders.id, orderItems.orderId))
      .where(and(eq(orders.userId, userId), eq(orderItems.promptId, id)))
      .limit(1);

    if (!purchase) {
      return NextResponse.json(
        apiErrorResponse("FORBIDDEN", "يجب شراء البرومبت أولاً"),
        { status: 403 },
      );
    }

    // Check for existing review
    const [existing] = await db
      .select({ id: reviews.id })
      .from(reviews)
      .where(and(eq(reviews.userId, userId), eq(reviews.promptId, id)))
      .limit(1);

    if (existing) {
      return NextResponse.json(
        apiErrorResponse("CONFLICT", "لقد قمت بتقييم هذا البرومبت مسبقاً"),
        { status: 409 },
      );
    }

    // Parse body
    const body = await request.json();
    const bodyParsed = reviewSubmitSchema.safeParse(body);
    if (!bodyParsed.success) {
      return NextResponse.json(
        apiErrorResponse("VALIDATION_ERROR", "بيانات غير صالحة", {
          fieldErrors: bodyParsed.error.flatten().fieldErrors,
        }),
        { status: 400 },
      );
    }

    const user = await currentUser();
    const today = new Date().toISOString().split("T")[0];

    const [newReview] = await db
      .insert(reviews)
      .values({
        promptId: id,
        userId,
        userName: user?.fullName ?? user?.firstName ?? "مستخدم",
        userAvatar: user?.imageUrl ?? "",
        rating: bodyParsed.data.rating,
        comment: bodyParsed.data.comment ?? "",
        date: today,
      })
      .returning();

    await recalculateRating(id);

    return NextResponse.json({ data: mapReviewRow(newReview) }, { status: 201 });
  } catch {
    return NextResponse.json(
      apiErrorResponse("INTERNAL_ERROR", "حدث خطأ داخلي"),
      { status: 500 },
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json(
        { error: "يجب تسجيل الدخول أولاً" },
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

    // Find existing review
    const [existing] = await db
      .select()
      .from(reviews)
      .where(and(eq(reviews.userId, userId), eq(reviews.promptId, id)))
      .limit(1);

    if (!existing) {
      return NextResponse.json(
        apiErrorResponse("NOT_FOUND", "لم يتم العثور على تقييمك"),
        { status: 404 },
      );
    }

    // Parse body
    const body = await request.json();
    const bodyParsed = reviewSubmitSchema.safeParse(body);
    if (!bodyParsed.success) {
      return NextResponse.json(
        apiErrorResponse("VALIDATION_ERROR", "بيانات غير صالحة", {
          fieldErrors: bodyParsed.error.flatten().fieldErrors,
        }),
        { status: 400 },
      );
    }

    const today = new Date().toISOString().split("T")[0];

    const [updated] = await db
      .update(reviews)
      .set({
        rating: bodyParsed.data.rating,
        comment: bodyParsed.data.comment ?? "",
        date: today,
      })
      .where(eq(reviews.id, existing.id))
      .returning();

    await recalculateRating(id);

    return NextResponse.json({ data: mapReviewRow(updated) });
  } catch {
    return NextResponse.json(
      apiErrorResponse("INTERNAL_ERROR", "حدث خطأ داخلي"),
      { status: 500 },
    );
  }
}
