import { db } from "@/db";
import { prompts } from "@/db/schema";
import { checkAuth, getAuthUser } from "@/lib/auth";
import { mapPromptRow } from "@/lib/mappers";
import {
  apiErrorResponse,
  promptsQuerySchema,
  promptSubmissionSchema,
} from "@/lib/schemas/api";
import { and, asc, count, desc, eq, gt, gte, inArray, isNull, lte, sql, type SQL } from "drizzle-orm";
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

    const {
      search,
      category,
      aiModel,
      generationType,
      priceMin,
      priceMax,
      sortBy: rawSortBy,
      limit: rawLimit,
      offset: rawOffset,
      sellerId,
      priceType,
    } = parsed.data;

    const effectiveLimit = rawLimit ?? 20;
    const effectiveOffset = rawOffset ?? 0;
    // Default sort: "relevant" when search present, "trending" otherwise
    const effectiveSortBy = rawSortBy ?? (search ? "relevant" : "trending");

    const conditions: SQL[] = [eq(prompts.status, "approved"), isNull(prompts.deletedAt)];

    // Seller filter
    if (sellerId) {
      conditions.push(eq(prompts.sellerId, sellerId));
    }

    // Search filter
    if (search) {
      const pattern = `%${search}%`;
      conditions.push(
        sql`(
          ${prompts.title} ILIKE ${pattern}
          OR ${prompts.titleEn} ILIKE ${pattern}
          OR ${prompts.description} ILIKE ${pattern}
          OR ${prompts.descriptionEn} ILIKE ${pattern}
          OR array_to_string(${prompts.tags}, ' ') ILIKE ${pattern}
        )`,
      );
    }

    // Generation type filter (single value)
    if (generationType) {
      conditions.push(eq(prompts.generationType, generationType));
    }

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

    // Filter by price type (free/paid/all)
    if (priceType === "free") {
      conditions.push(eq(prompts.price, 0));
    } else if (priceType === "paid") {
      conditions.push(gt(prompts.price, 0));
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    // Sort
    let orderByClause;
    switch (effectiveSortBy) {
      case "trending":
        orderByClause = sql`(${prompts.sales} * 2 + EXTRACT(EPOCH FROM (NOW() - ${prompts.createdAt})) / -86400 + 30) DESC`;
        break;
      case "popular":
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
      case "relevant": {
        if (search) {
          const pattern = `%${search}%`;
          orderByClause = sql`CASE
            WHEN ${prompts.title} ILIKE ${pattern} THEN 0
            WHEN ${prompts.titleEn} ILIKE ${pattern} THEN 1
            WHEN ${prompts.description} ILIKE ${pattern} THEN 2
            WHEN ${prompts.descriptionEn} ILIKE ${pattern} THEN 3
            ELSE 4
          END ASC, ${prompts.sales} DESC`;
        } else {
          orderByClause = desc(prompts.sales);
        }
        break;
      }
      default:
        orderByClause = desc(prompts.sales);
    }

    // Get total count
    const [{ value: totalCount }] = await db
      .select({ value: count() })
      .from(prompts)
      .where(whereClause);

    // Get paginated results
    const rows = await db
      .select()
      .from(prompts)
      .where(whereClause)
      .orderBy(orderByClause)
      .limit(effectiveLimit)
      .offset(effectiveOffset);

    return NextResponse.json({
      data: rows.map(mapPromptRow),
      total: totalCount,
    });
  } catch {
    return NextResponse.json(
      apiErrorResponse("INTERNAL_ERROR", "حدث خطأ داخلي في الخادم"),
      { status: 500 },
    );
  }
}

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

    const user = await getAuthUser();
    const sellerName =
      user?.firstName && user?.lastName
        ? `${user.firstName} ${user.lastName}`
        : user?.firstName ?? "بائع";
    const sellerAvatar = user?.avatarUrl ?? "";

    const data = parsed.data;
    const effectivePrice = data.isFree ? 0 : data.price;

    const [inserted] = await db
      .insert(prompts)
      .values({
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
        sellerId: userId,
        sellerName,
        sellerAvatar,
        sellerRating: 0,
        status: "pending",
        samples: data.exampleOutputs ?? [],
      })
      .returning({
        id: prompts.id,
        status: prompts.status,
        title: prompts.title,
        createdAt: prompts.createdAt,
      });

    return NextResponse.json(
      { data: { ...inserted, createdAt: inserted.createdAt.toISOString() } },
      { status: 201 },
    );
  } catch {
    return NextResponse.json(
      apiErrorResponse("INTERNAL_ERROR", "حدث خطأ داخلي في الخادم"),
      { status: 500 },
    );
  }
}
