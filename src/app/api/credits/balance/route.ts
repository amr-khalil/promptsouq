import { getOrCreateCreditBalance } from "@/lib/credits";
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function GET() {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
  }

  const balance = await getOrCreateCreditBalance(userId);

  return NextResponse.json({
    subscription: balance.subscriptionCredits,
    topup: balance.topupCredits,
    total: balance.subscriptionCredits + balance.topupCredits,
  });
}
