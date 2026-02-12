import { db } from "@/db";
import { testimonials } from "@/db/schema";
import { mapTestimonialRow } from "@/lib/mappers";
import { apiErrorResponse } from "@/lib/schemas/api";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const rows = await db.select().from(testimonials);
    return NextResponse.json({ data: rows.map(mapTestimonialRow) });
  } catch {
    return NextResponse.json(
      apiErrorResponse("INTERNAL_ERROR", "حدث خطأ داخلي في الخادم"),
      { status: 500 },
    );
  }
}
