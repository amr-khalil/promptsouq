import { db } from "@/db";
import { sellerProfiles } from "@/db/schema";
import { checkAuth } from "@/lib/auth";
import { apiErrorResponse } from "@/lib/schemas/api";
import { stripe } from "@/lib/stripe";
import { eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const userId = await checkAuth();
    if (!userId) {
      return NextResponse.json(
        apiErrorResponse("FORBIDDEN", "يجب تسجيل الدخول أولاً"),
        { status: 401 },
      );
    }

    const rows = await db
      .select()
      .from(sellerProfiles)
      .where(eq(sellerProfiles.userId, userId))
      .limit(1);

    if (rows.length === 0 || !rows[0].stripeAccountId) {
      return NextResponse.json(
        apiErrorResponse("NOT_FOUND", "لا يوجد حساب Stripe لهذا البائع"),
        { status: 404 },
      );
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? request.nextUrl.origin;

    const accountLink = await stripe.accountLinks.create({
      account: rows[0].stripeAccountId,
      refresh_url: `${appUrl}/sell?step=3`,
      return_url: `${appUrl}/seller/onboarding/complete`,
      type: "account_onboarding",
    });

    return NextResponse.json({
      data: { url: accountLink.url },
    });
  } catch {
    return NextResponse.json(
      apiErrorResponse("INTERNAL_ERROR", "حدث خطأ في إنشاء رابط الإعداد"),
      { status: 500 },
    );
  }
}
