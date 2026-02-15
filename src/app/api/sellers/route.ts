import { db } from "@/db";
import { prompts, sellerProfiles } from "@/db/schema";
import { mapSellerLeaderboardRow } from "@/lib/mappers";
import { apiErrorResponse, sellersQuerySchema } from "@/lib/schemas/api";
import { and, desc, eq, sql } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const rawParams: Record<string, string> = {};
    for (const [key, value] of searchParams.entries()) {
      rawParams[key] = value;
    }

    const parsed = sellersQuerySchema.safeParse(rawParams);
    if (!parsed.success) {
      return NextResponse.json(
        apiErrorResponse(
          "VALIDATION_ERROR",
          "معاملات غير صالحة",
          parsed.error.flatten() as unknown as Record<string, unknown>,
        ),
        { status: 400 },
      );
    }

    const { sortBy, limit } = parsed.data;

    // Aggregation query: join seller_profiles with approved prompts
    const rows = await db
      .select({
        userId: sellerProfiles.userId,
        displayName: sellerProfiles.displayName,
        avatar: sellerProfiles.avatar,
        bio: sellerProfiles.bio,
        country: sellerProfiles.country,
        totalSales: sql<number>`COALESCE(SUM(${prompts.sales}), 0)::int`,
        totalReviews: sql<number>`COALESCE(SUM(${prompts.reviewsCount}), 0)::int`,
        avgRating: sql<number>`COALESCE(AVG(${prompts.rating}), 0)::float`,
        promptCount: sql<number>`COUNT(${prompts.id})::int`,
        topCategories: sql<string[]>`(
          ARRAY(
            SELECT sub.category FROM (
              SELECT ${prompts.category} as category, COUNT(*) as cnt
              FROM ${prompts}
              WHERE ${prompts.sellerId} = ${sellerProfiles.userId}
                AND ${prompts.status} = 'approved'
              GROUP BY ${prompts.category}
              ORDER BY cnt DESC
              LIMIT 3
            ) sub
          )
        )`,
        topPrompts: sql<{ title: string; sales: number }[]>`(
          SELECT COALESCE(json_agg(sub), '[]'::json) FROM (
            SELECT ${prompts.title} as title, ${prompts.sales} as sales
            FROM ${prompts}
            WHERE ${prompts.sellerId} = ${sellerProfiles.userId}
              AND ${prompts.status} = 'approved'
            ORDER BY ${prompts.sales} DESC
            LIMIT 3
          ) sub
        )`,
      })
      .from(sellerProfiles)
      .innerJoin(
        prompts,
        and(eq(prompts.sellerId, sellerProfiles.userId), eq(prompts.status, "approved")),
      )
      .groupBy(sellerProfiles.userId)
      .having(sql`COUNT(${prompts.id}) > 0`)
      .orderBy(
        sortBy === "sales"
          ? desc(sql`SUM(${prompts.sales})`)
          : desc(sql`AVG(${prompts.rating})`),
      )
      .limit(limit);

    return NextResponse.json({
      data: rows.map(mapSellerLeaderboardRow),
    });
  } catch (error) {
    console.error("[sellers] Error:", error);
    return NextResponse.json(
      apiErrorResponse("INTERNAL_ERROR", "حدث خطأ داخلي في الخادم"),
      { status: 500 },
    );
  }
}
