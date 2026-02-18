import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { galleryImages, galleryLikes, prompts } from "@/db/schema";
import { checkAuth } from "@/lib/auth";
import { apiErrorResponse } from "@/lib/schemas/api";
import { eq, and, ne, desc, sql } from "drizzle-orm";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const userId = await checkAuth();

  // Fetch the gallery image with prompt data
  const [row] = await db
    .select({
      id: galleryImages.id,
      imageUrl: galleryImages.imageUrl,
      caption: galleryImages.caption,
      likesCount: galleryImages.likesCount,
      createdAt: galleryImages.createdAt,
      sellerId: galleryImages.sellerId,
      promptId: prompts.id,
      promptTitle: prompts.title,
      promptTitleEn: prompts.titleEn,
      promptPrice: prompts.price,
      promptCategory: prompts.category,
      promptFullContent: prompts.fullContent,
      sellerName: prompts.sellerName,
      sellerAvatar: prompts.sellerAvatar,
      sellerRating: prompts.sellerRating,
    })
    .from(galleryImages)
    .innerJoin(prompts, eq(galleryImages.promptId, prompts.id))
    .where(
      and(
        eq(galleryImages.id, id),
        eq(galleryImages.status, "approved"),
      ),
    )
    .limit(1);

  if (!row) {
    return NextResponse.json(
      apiErrorResponse("NOT_FOUND", "الصورة غير موجودة"),
      { status: 404 },
    );
  }

  // Check if user has liked
  let userHasLiked = false;
  if (userId) {
    const [likeRow] = await db
      .select({ id: galleryLikes.id })
      .from(galleryLikes)
      .where(
        and(
          eq(galleryLikes.galleryImageId, id),
          eq(galleryLikes.userId, userId),
        ),
      )
      .limit(1);
    userHasLiked = !!likeRow;
  }

  // Fetch related images (same category or seller, exclude current)
  const relatedRows = await db
    .select({
      id: galleryImages.id,
      imageUrl: galleryImages.imageUrl,
      likesCount: galleryImages.likesCount,
    })
    .from(galleryImages)
    .innerJoin(prompts, eq(galleryImages.promptId, prompts.id))
    .where(
      and(
        eq(galleryImages.status, "approved"),
        ne(galleryImages.id, id),
        sql`(${prompts.category} = ${row.promptCategory} OR ${galleryImages.sellerId} = ${row.sellerId})`,
      ),
    )
    .orderBy(desc(galleryImages.likesCount))
    .limit(6);

  const isFree = row.promptPrice === 0;

  return NextResponse.json({
    id: row.id,
    imageUrl: row.imageUrl,
    caption: row.caption,
    likesCount: row.likesCount,
    createdAt: row.createdAt.toISOString(),
    userHasLiked,
    prompt: {
      id: row.promptId,
      title: row.promptTitle,
      titleEn: row.promptTitleEn,
      isFree,
      price: row.promptPrice,
      promptPreview: !isFree && row.promptFullContent
        ? row.promptFullContent.slice(0, 100) + "..."
        : null,
      fullContent: isFree ? row.promptFullContent : null,
      category: row.promptCategory,
    },
    seller: {
      id: row.sellerId,
      name: row.sellerName,
      avatar: row.sellerAvatar,
      rating: row.sellerRating,
    },
    relatedImages: relatedRows.map((r) => ({
      id: r.id,
      imageUrl: r.imageUrl,
      likesCount: r.likesCount,
    })),
  });
}
