import { db } from "@/db";
import { prompts } from "@/db/schema";
import { mapPromptRow } from "@/lib/mappers";
import { apiErrorResponse, promptsQuerySchema } from "@/lib/schemas/api";
import { and, asc, desc, gte, inArray, lte, type SQL } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;

    const rawParams: Record<string, string> = {};
    for (const [key, value] of searchParams.entries()) {
      rawParams[key] = value;
    }

    const parsed = promptsQuerySchema.safeParse(rawParams);

    if (!parsed.success) {
      return NextResponse.json(
        apiErrorResponse(
          "VALIDATION_ERROR",
          "معطيات البحث غير صالحة",
          parsed.error.flatten() as unknown as Record<string, unknown>,
        ),
        { status: 400 },
      );
    }

    const { category, aiModel, priceMin, priceMax, sortBy, limit } =
      parsed.data;

    const conditions: SQL[] = [];

    // Filter by category (comma-separated)
    if (category) {
      const cats = category.split(",").map((c) => c.trim());
      conditions.push(inArray(prompts.category, cats));
    }

    // Filter by AI model (comma-separated)
    if (aiModel) {
      const models = aiModel.split(",").map((m) => m.trim());
      conditions.push(inArray(prompts.aiModel, models));
    }

    // Filter by price range
    if (priceMin !== undefined) {
      conditions.push(gte(prompts.price, priceMin));
    }
    if (priceMax !== undefined) {
      conditions.push(lte(prompts.price, priceMax));
    }

    // Sort
    let orderByClause;
    switch (sortBy) {
      case "bestselling":
        orderByClause = desc(prompts.sales);
        break;
      case "newest":
        orderByClause = desc(prompts.createdAt);
        break;
      case "rating":
        orderByClause = desc(prompts.rating);
        break;
      case "price-low":
        orderByClause = asc(prompts.price);
        break;
      case "price-high":
        orderByClause = desc(prompts.price);
        break;
    }

    const rows = await db
      .select()
      .from(prompts)
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .orderBy(orderByClause ?? desc(prompts.sales))
      .limit(limit ?? 100);

    return NextResponse.json({ data: rows.map(mapPromptRow) });
  } catch {
    return NextResponse.json(
      apiErrorResponse("INTERNAL_ERROR", "حدث خطأ داخلي في الخادم"),
      { status: 500 },
    );
  }
}
