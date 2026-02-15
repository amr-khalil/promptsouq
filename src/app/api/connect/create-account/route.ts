import { db } from "@/db";
import { sellerProfiles } from "@/db/schema";
import { checkAuth } from "@/lib/auth";
import { apiErrorResponse, connectAccountSchema } from "@/lib/schemas/api";
import { stripe } from "@/lib/stripe";
import { currentUser } from "@clerk/nextjs/server";
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

    const body = await request.json();
    const parsed = connectAccountSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        apiErrorResponse(
          "VALIDATION_ERROR",
          "بيانات غير صالحة",
          parsed.error.flatten() as unknown as Record<string, unknown>,
        ),
        { status: 400 },
      );
    }

    // Check if seller already has a Stripe account
    const existing = await db
      .select()
      .from(sellerProfiles)
      .where(eq(sellerProfiles.userId, userId))
      .limit(1);

    if (existing.length > 0 && existing[0].stripeAccountId) {
      return NextResponse.json(
        apiErrorResponse("CONFLICT", "لديك حساب Stripe بالفعل"),
        { status: 409 },
      );
    }

    // Create Stripe Connect Express account
    const account = await stripe.accounts.create({
      type: "express",
      country: parsed.data.country,
      metadata: { clerk_user_id: userId },
    });

    // Get user info for display fields
    const user = await currentUser();
    const displayName =
      user?.firstName && user?.lastName
        ? `${user.firstName} ${user.lastName}`
        : user?.firstName ?? "بائع";
    const avatar = user?.imageUrl ?? "";

    // Upsert seller profile
    await db
      .insert(sellerProfiles)
      .values({
        userId,
        displayName,
        avatar,
        stripeAccountId: account.id,
        country: parsed.data.country,
      })
      .onConflictDoUpdate({
        target: sellerProfiles.userId,
        set: {
          stripeAccountId: account.id,
          country: parsed.data.country,
          updatedAt: new Date(),
        },
      });

    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? request.nextUrl.origin;

    // Generate Account Link for onboarding
    const accountLink = await stripe.accountLinks.create({
      account: account.id,
      refresh_url: `${appUrl}/sell?step=3`,
      return_url: `${appUrl}/seller/onboarding/complete`,
      type: "account_onboarding",
    });

    return NextResponse.json(
      {
        data: {
          accountId: account.id,
          onboardingUrl: accountLink.url,
        },
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("[connect/create-account] Error:", error);
    return NextResponse.json(
      apiErrorResponse("INTERNAL_ERROR", "حدث خطأ في إنشاء حساب Stripe"),
      { status: 500 },
    );
  }
}
