import { db } from "@/db";
import { categories } from "@/db/schema";
import { mapCategoryRow } from "@/lib/mappers";
import { apiErrorResponse } from "@/lib/schemas/api";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const rows = await db.select().from(categories);
    return NextResponse.json({ data: rows.map(mapCategoryRow) });
  } catch (error) {
    console.error("Categories API error:", error);
    return NextResponse.json(
      apiErrorResponse("INTERNAL_ERROR", "حدث خطأ داخلي في الخادم"),
      { status: 500 },
    );
  }
}
