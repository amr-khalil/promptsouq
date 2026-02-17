import { db } from "@/db";
import { prompts } from "@/db/schema";
import { apiErrorResponse } from "@/lib/schemas/api";
import { desc, eq } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const rows = await db
      .select({
        title: prompts.title,
        titleEn: prompts.titleEn,
      })
      .from(prompts)
      .where(eq(prompts.status, "approved"))
      .orderBy(desc(prompts.sales))
      .limit(5);

    return NextResponse.json({ data: rows });
  } catch {
    return NextResponse.json(
      apiErrorResponse("INTERNAL_ERROR", "حدث خطأ داخلي في الخادم"),
      { status: 500 },
    );
  }
}
