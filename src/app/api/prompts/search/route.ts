import { prompts } from "@/data/mockData";
import { apiErrorResponse, searchQuerySchema } from "@/lib/schemas/api";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const rawParams: Record<string, string> = {};
    for (const [key, value] of request.nextUrl.searchParams.entries()) {
      rawParams[key] = value;
    }

    const parsed = searchQuerySchema.safeParse(rawParams);

    if (!parsed.success) {
      return NextResponse.json(
        apiErrorResponse(
          "VALIDATION_ERROR",
          "يرجى إدخال كلمة بحث",
          parsed.error.flatten() as unknown as Record<string, unknown>,
        ),
        { status: 400 },
      );
    }

    const q = parsed.data.q.toLowerCase();

    const matching = prompts.filter(
      (prompt) =>
        prompt.title.toLowerCase().includes(q) ||
        prompt.titleEn.toLowerCase().includes(q) ||
        prompt.description.toLowerCase().includes(q) ||
        prompt.tags.some((tag) => tag.toLowerCase().includes(q)),
    );

    return NextResponse.json({ data: matching });
  } catch {
    return NextResponse.json(
      apiErrorResponse("INTERNAL_ERROR", "حدث خطأ داخلي في الخادم"),
      { status: 500 },
    );
  }
}
