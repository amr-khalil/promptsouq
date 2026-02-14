import { db } from "@/db";
import { prompts, sellerProfiles } from "@/db/schema";
import { checkAuth } from "@/lib/auth";
import { apiErrorResponse } from "@/lib/schemas/api";
import { count, eq, sum } from "drizzle-orm";
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

    // Get prompt stats
    const [statsRow] = await db
      .select({
        totalPrompts: count(),
        totalSales: sum(prompts.sales),
      })
      .from(prompts)
      .where(eq(prompts.sellerId, userId));

    // Get per-status counts
    const statusCounts = await db
      .select({
        status: prompts.status,
        count: count(),
      })
      .from(prompts)
      .where(eq(prompts.sellerId, userId))
      .groupBy(prompts.status);

    const statusMap: Record<string, number> = {};
    for (const row of statusCounts) {
      statusMap[row.status] = row.count;
    }

    // Get earnings from seller profile
    const profileRows = await db
      .select({ totalEarnings: sellerProfiles.totalEarnings })
      .from(sellerProfiles)
      .where(eq(sellerProfiles.userId, userId))
      .limit(1);

    return NextResponse.json({
      data: {
        totalPrompts: statsRow?.totalPrompts ?? 0,
        approvedCount: statusMap["approved"] ?? 0,
        pendingCount: statusMap["pending"] ?? 0,
        rejectedCount: statusMap["rejected"] ?? 0,
        totalSales: Number(statsRow?.totalSales ?? 0),
        totalEarnings: profileRows[0]?.totalEarnings ?? 0,
      },
    });
  } catch {
    return NextResponse.json(
      apiErrorResponse("INTERNAL_ERROR", "حدث خطأ داخلي في الخادم"),
      { status: 500 },
    );
  }
}
