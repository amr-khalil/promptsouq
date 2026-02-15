import { db } from "@/db";
import { favorites, prompts, sellerProfiles } from "@/db/schema";
import { mapSellerStorefrontRow } from "@/lib/mappers";
import { apiErrorResponse } from "@/lib/schemas/api";
import { and, eq, sql } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ sellerId: string }> },
) {
  try {
    const { sellerId } = await params;

    // Fetch seller profile
    const [seller] = await db
      .select()
      .from(sellerProfiles)
      .where(eq(sellerProfiles.userId, sellerId))
      .limit(1);

    if (!seller) {
      return NextResponse.json(
        apiErrorResponse("NOT_FOUND", "لم يتم العثور على البائع"),
        { status: 404 },
      );
    }

    // Aggregate stats from approved prompts
    const [stats] = await db
      .select({
        totalSales: sql<number>`COALESCE(SUM(${prompts.sales}), 0)::int`,
        totalReviews: sql<number>`COALESCE(SUM(${prompts.reviewsCount}), 0)::int`,
        avgRating: sql<number>`COALESCE(AVG(${prompts.rating}), 0)::float`,
        promptCount: sql<number>`COUNT(${prompts.id})::int`,
      })
      .from(prompts)
      .where(and(eq(prompts.sellerId, sellerId), eq(prompts.status, "approved")));

    // Get top 3 categories
    const topCats = await db
      .select({
        category: prompts.category,
        cnt: sql<number>`COUNT(*)::int`,
      })
      .from(prompts)
      .where(and(eq(prompts.sellerId, sellerId), eq(prompts.status, "approved")))
      .groupBy(prompts.category)
      .orderBy(sql`COUNT(*) DESC`)
      .limit(3);

    // Count total favorites across all seller's prompts
    const [favStats] = await db
      .select({
        totalFavorites: sql<number>`COUNT(${favorites.id})::int`,
      })
      .from(favorites)
      .innerJoin(prompts, eq(favorites.promptId, prompts.id))
      .where(eq(prompts.sellerId, sellerId));

    return NextResponse.json({
      data: mapSellerStorefrontRow({
        userId: seller.userId,
        displayName: seller.displayName,
        avatar: seller.avatar,
        bio: seller.bio,
        country: seller.country,
        totalSales: stats?.totalSales ?? 0,
        totalReviews: stats?.totalReviews ?? 0,
        avgRating: stats?.avgRating ?? 0,
        promptCount: stats?.promptCount ?? 0,
        topCategories: topCats.map((c) => c.category),
        totalFavorites: favStats?.totalFavorites ?? 0,
        joinedAt: seller.createdAt,
      }),
    });
  } catch (error) {
    console.error("[sellers/[sellerId]] Error:", error);
    return NextResponse.json(
      apiErrorResponse("INTERNAL_ERROR", "حدث خطأ داخلي في الخادم"),
      { status: 500 },
    );
  }
}
