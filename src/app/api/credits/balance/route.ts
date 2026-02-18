import { getOrCreateCreditBalance } from "@/lib/credits";
import { checkAuth } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function GET() {
  const userId = await checkAuth();
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
