import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { galleryImages, prompts } from "@/db/schema";
import { checkAdmin } from "@/lib/auth";
import { adminGalleryListParams } from "@/lib/schemas/gallery";
import { apiErrorResponse } from "@/lib/schemas/api";
import { eq, and, desc, count } from "drizzle-orm";

export async function GET(request: NextRequest) {
  const { isAdmin } = await checkAdmin();
  if (!isAdmin) {
    return NextResponse.json(
      apiErrorResponse("FORBIDDEN", "غير مصرح"),
      { status: 403 },
    );
  }

  const params = adminGalleryListParams.safeParse(
    Object.fromEntries(request.nextUrl.searchParams),
  );
  if (!params.success) {
    return NextResponse.json(
      apiErrorResponse("VALIDATION_ERROR", "معاملات غير صالحة", params.error.flatten().fieldErrors),
      { status: 400 },
    );
  }

  const { status, limit, offset } = params.data;

  const whereClause = and(eq(galleryImages.status, status));

  const [rows, [totalResult]] = await Promise.all([
    db
      .select({
        id: galleryImages.id,
        imageUrl: galleryImages.imageUrl,
        caption: galleryImages.caption,
        status: galleryImages.status,
        createdAt: galleryImages.createdAt,
        sellerId: galleryImages.sellerId,
        promptId: prompts.id,
        promptTitle: prompts.title,
        sellerName: prompts.sellerName,
      })
      .from(galleryImages)
      .innerJoin(prompts, eq(galleryImages.promptId, prompts.id))
      .where(whereClause)
      .orderBy(desc(galleryImages.createdAt))
      .limit(limit)
      .offset(offset),
    db
      .select({ count: count() })
      .from(galleryImages)
      .where(whereClause),
  ]);

  return NextResponse.json({
    images: rows.map((row) => ({
      id: row.id,
      imageUrl: row.imageUrl,
      caption: row.caption,
      status: row.status,
      createdAt: row.createdAt.toISOString(),
      seller: { id: row.sellerId, name: row.sellerName },
      prompt: { id: row.promptId, title: row.promptTitle },
    })),
    total: totalResult.count,
  });
}
