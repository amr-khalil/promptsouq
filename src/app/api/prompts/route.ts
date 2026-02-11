import { prompts } from "@/data/mockData";
import { apiErrorResponse, promptsQuerySchema } from "@/lib/schemas/api";
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

    let filtered = [...prompts];

    // Filter by category (comma-separated)
    if (category) {
      const cats = category.split(",").map((c) => c.trim());
      filtered = filtered.filter((p) => cats.includes(p.category));
    }

    // Filter by AI model (comma-separated)
    if (aiModel) {
      const models = aiModel.split(",").map((m) => m.trim());
      filtered = filtered.filter((p) => models.includes(p.aiModel));
    }

    // Filter by price range
    if (priceMin !== undefined) {
      filtered = filtered.filter((p) => p.price >= priceMin);
    }
    if (priceMax !== undefined) {
      filtered = filtered.filter((p) => p.price <= priceMax);
    }

    // Sort
    switch (sortBy) {
      case "bestselling":
        filtered.sort((a, b) => b.sales - a.sales);
        break;
      case "newest":
        // Keep original order
        break;
      case "rating":
        filtered.sort((a, b) => b.rating - a.rating);
        break;
      case "price-low":
        filtered.sort((a, b) => a.price - b.price);
        break;
      case "price-high":
        filtered.sort((a, b) => b.price - a.price);
        break;
    }

    // Limit results
    if (limit !== undefined) {
      filtered = filtered.slice(0, limit);
    }

    return NextResponse.json({ data: filtered });
  } catch {
    return NextResponse.json(
      apiErrorResponse("INTERNAL_ERROR", "حدث خطأ داخلي في الخادم"),
      { status: 500 },
    );
  }
}
