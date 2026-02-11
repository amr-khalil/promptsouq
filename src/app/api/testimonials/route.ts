import { testimonials } from "@/data/mockData";
import { apiErrorResponse } from "@/lib/schemas/api";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    return NextResponse.json({ data: testimonials });
  } catch {
    return NextResponse.json(
      apiErrorResponse("INTERNAL_ERROR", "حدث خطأ داخلي في الخادم"),
      { status: 500 },
    );
  }
}
