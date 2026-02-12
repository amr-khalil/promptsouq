import { db } from "@/db";
import { prompts } from "@/db/schema";
import { checkoutRequestSchema } from "@/lib/schemas/api";
import { stripe } from "@/lib/stripe";
import { auth } from "@clerk/nextjs/server";
import { inArray } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { error: "يجب تسجيل الدخول أولاً" },
        { status: 401 },
      );
    }

    const body = await request.json();
    const parsed = checkoutRequestSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "السلة فارغة" },
        { status: 400 },
      );
    }

    const promptIds = parsed.data.items.map((item) => item.promptId);

    const promptRows = await db
      .select()
      .from(prompts)
      .where(inArray(prompts.id, promptIds));

    if (promptRows.length !== promptIds.length) {
      return NextResponse.json(
        { error: "بعض المنتجات غير متوفرة" },
        { status: 404 },
      );
    }

    const origin = request.nextUrl.origin;

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: promptRows.map((prompt) => ({
        price_data: {
          currency: "usd",
          product_data: {
            name: prompt.title,
            images: [prompt.thumbnail],
          },
          unit_amount: Math.round(prompt.price * 100),
        },
        quantity: 1,
      })),
      success_url: `${origin}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/cart`,
      client_reference_id: userId,
      metadata: {
        userId,
        promptIds: JSON.stringify(promptIds),
      },
    });

    return NextResponse.json({ url: session.url });
  } catch {
    return NextResponse.json(
      { error: "حدث خطأ في إنشاء جلسة الدفع" },
      { status: 500 },
    );
  }
}
