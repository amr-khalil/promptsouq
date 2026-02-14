import { db } from "@/db";
import { sellerProfiles } from "@/db/schema";
import { checkAuth } from "@/lib/auth";
import { apiErrorResponse } from "@/lib/schemas/api";
import { stripe } from "@/lib/stripe";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function GET() {
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
      return NextResponse.json({
        data: {
          hasAccount: false,
          chargesEnabled: false,
          payoutsEnabled: false,
          detailsSubmitted: false,
          isFullyOnboarded: false,
        },
      });
    }

    const account = await stripe.accounts.retrieve(rows[0].stripeAccountId);

    // Sync latest status from Stripe
    if (
      rows[0].chargesEnabled !== account.charges_enabled ||
      rows[0].payoutsEnabled !== account.payouts_enabled ||
      rows[0].detailsSubmitted !== account.details_submitted
    ) {
      await db
        .update(sellerProfiles)
        .set({
          chargesEnabled: account.charges_enabled ?? false,
          payoutsEnabled: account.payouts_enabled ?? false,
          detailsSubmitted: account.details_submitted ?? false,
          updatedAt: new Date(),
        })
        .where(eq(sellerProfiles.userId, userId));
    }

    return NextResponse.json({
      data: {
        hasAccount: true,
        chargesEnabled: account.charges_enabled ?? false,
        payoutsEnabled: account.payouts_enabled ?? false,
        detailsSubmitted: account.details_submitted ?? false,
        isFullyOnboarded:
          (account.charges_enabled ?? false) &&
          (account.payouts_enabled ?? false),
      },
    });
  } catch {
    return NextResponse.json(
      apiErrorResponse("INTERNAL_ERROR", "حدث خطأ في جلب حالة الحساب"),
      { status: 500 },
    );
  }
}
