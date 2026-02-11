import { prompts } from "@/data/mockData";
import { apiErrorResponse, relatedQuerySchema } from "@/lib/schemas/api";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const currentPrompt = prompts.find((p) => p.id === id);

    if (!currentPrompt) {
      return NextResponse.json(
        apiErrorResponse("NOT_FOUND", "البرومبت غير موجود"),
        { status: 404 },
      );
    }

    const rawParams: Record<string, string> = {};
    for (const [key, value] of request.nextUrl.searchParams.entries()) {
      rawParams[key] = value;
    }

    const parsed = relatedQuerySchema.safeParse(rawParams);
    const limit = parsed.success ? parsed.data.limit : 3;

    const related = prompts
      .filter(
        (p) => p.category === currentPrompt.category && p.id !== id,
      )
      .slice(0, limit);

    return NextResponse.json({ data: related });
  } catch {
    return NextResponse.json(
      apiErrorResponse("INTERNAL_ERROR", "حدث خطأ داخلي في الخادم"),
      { status: 500 },
    );
  }
}
