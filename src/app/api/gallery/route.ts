import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { galleryImages, prompts } from "@/db/schema";
import { galleryListParams, galleryUploadBody } from "@/lib/schemas/gallery";
import { apiErrorResponse } from "@/lib/schemas/api";
import { checkAuth } from "@/lib/auth";
import { eq, and, desc, lt, gte, sql } from "drizzle-orm";

export async function GET(request: NextRequest) {
  const params = galleryListParams.safeParse(
    Object.fromEntries(request.nextUrl.searchParams),
  );
  if (!params.success) {
    return NextResponse.json(
      apiErrorResponse("VALIDATION_ERROR", "معاملات غير صالحة", params.error.flatten().fieldErrors),
      { status: 400 },
    );
  }

  const { limit, cursor, period, category } = params.data;

  const conditions = [eq(galleryImages.status, "approved")];

  // Cursor-based pagination
  if (cursor) {
    conditions.push(lt(galleryImages.createdAt, new Date(cursor)));
  }

  // Period filter
  if (period !== "all") {
    const now = new Date();
    let since: Date;
    if (period === "today") {
      since = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    } else if (period === "week") {
      since = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    } else {
      since = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    }
    conditions.push(gte(galleryImages.createdAt, since));
  }

  // Category filter
  if (category) {
    conditions.push(eq(prompts.category, category));
  }

  // Fetch limit+1 to detect hasMore
  const rows = await db
    .select({
      id: galleryImages.id,
      imageUrl: galleryImages.imageUrl,
      caption: galleryImages.caption,
      likesCount: galleryImages.likesCount,
      createdAt: galleryImages.createdAt,
      sellerId: galleryImages.sellerId,
      promptId: prompts.id,
      promptTitle: prompts.title,
      promptPrice: prompts.price,
      promptCategory: prompts.category,
      sellerName: prompts.sellerName,
      sellerAvatar: prompts.sellerAvatar,
    })
    .from(galleryImages)
    .innerJoin(prompts, eq(galleryImages.promptId, prompts.id))
    .where(and(...conditions))
    .orderBy(desc(galleryImages.createdAt))
    .limit(limit + 1);

  const hasMore = rows.length > limit;
  const items = hasMore ? rows.slice(0, limit) : rows;
  const nextCursor = hasMore
    ? items[items.length - 1].createdAt.toISOString()
    : null;

  return NextResponse.json({
    images: items.map((row) => ({
      id: row.id,
      imageUrl: row.imageUrl,
      caption: row.caption,
      likesCount: row.likesCount,
      createdAt: row.createdAt.toISOString(),
      prompt: {
        id: row.promptId,
        title: row.promptTitle,
        isFree: row.promptPrice === 0,
        category: row.promptCategory,
      },
      seller: {
        id: row.sellerId,
        name: row.sellerName,
        avatar: row.sellerAvatar,
      },
    })),
    nextCursor,
    hasMore,
  });
}

export async function POST(request: NextRequest) {
  const userId = await checkAuth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = galleryUploadBody.safeParse(await request.json());
  if (!body.success) {
    return NextResponse.json(
      apiErrorResponse("VALIDATION_ERROR", "بيانات غير صالحة", body.error.flatten().fieldErrors),
      { status: 400 },
    );
  }

  const { imageUrl, promptId, caption } = body.data;

  // Verify seller owns the prompt and it's approved
  const [prompt] = await db
    .select({ id: prompts.id })
    .from(prompts)
    .where(
      and(
        eq(prompts.id, promptId),
        eq(prompts.sellerId, userId),
        eq(prompts.status, "approved"),
      ),
    )
    .limit(1);

  if (!prompt) {
    return NextResponse.json(
      apiErrorResponse("FORBIDDEN", "لا يمكنك رفع صورة لهذا البرومبت"),
      { status: 403 },
    );
  }

  const [inserted] = await db
    .insert(galleryImages)
    .values({
      imageUrl,
      promptId,
      sellerId: userId,
      caption: caption ?? null,
      status: "pending",
    })
    .returning({ id: galleryImages.id });

  return NextResponse.json(
    {
      id: inserted.id,
      status: "pending",
      message: "تم رفع الصورة بنجاح وستتم مراجعتها قريباً",
    },
    { status: 201 },
  );
}
