import { checkAdmin } from "@/lib/auth";
import { db } from "@/db";
import { marketplaceSettings } from "@/db/schema";
import { adminSettingsUpdateSchema } from "@/lib/schemas/api";
import { eq } from "drizzle-orm";
import { NextResponse, type NextRequest } from "next/server";

export async function GET() {
  const { isAdmin } = await checkAdmin();
  if (!isAdmin) {
    return NextResponse.json({ error: { message: "غير مصرح" } }, { status: 403 });
  }

  try {
    let [settings] = await db
      .select()
      .from(marketplaceSettings)
      .where(eq(marketplaceSettings.id, 1))
      .limit(1);

    // Seed default if missing
    if (!settings) {
      [settings] = await db
        .insert(marketplaceSettings)
        .values({ id: 1, commissionRate: 0.20, updatedAt: new Date() })
        .onConflictDoNothing()
        .returning();

      if (!settings) {
        [settings] = await db
          .select()
          .from(marketplaceSettings)
          .where(eq(marketplaceSettings.id, 1))
          .limit(1);
      }
    }

    return NextResponse.json({
      data: {
        commissionRate: settings.commissionRate,
        updatedAt: settings.updatedAt.toISOString(),
        updatedBy: settings.updatedBy,
      },
    });
  } catch {
    return NextResponse.json({ error: { message: "حدث خطأ في الخادم" } }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  const { isAdmin, userId } = await checkAdmin();
  if (!isAdmin || !userId) {
    return NextResponse.json({ error: { message: "غير مصرح" } }, { status: 403 });
  }

  try {
    const body = await request.json();
    const parsed = adminSettingsUpdateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: { message: "بيانات غير صالحة", details: parsed.error.flatten() } },
        { status: 400 },
      );
    }

    const { commissionRate } = parsed.data;

    const [updated] = await db
      .update(marketplaceSettings)
      .set({
        commissionRate,
        updatedAt: new Date(),
        updatedBy: userId,
      })
      .where(eq(marketplaceSettings.id, 1))
      .returning();

    if (!updated) {
      // Insert if not exists
      const [inserted] = await db
        .insert(marketplaceSettings)
        .values({ id: 1, commissionRate, updatedAt: new Date(), updatedBy: userId })
        .returning();

      return NextResponse.json({
        data: {
          commissionRate: inserted.commissionRate,
          updatedAt: inserted.updatedAt.toISOString(),
          updatedBy: inserted.updatedBy,
        },
      });
    }

    return NextResponse.json({
      data: {
        commissionRate: updated.commissionRate,
        updatedAt: updated.updatedAt.toISOString(),
        updatedBy: updated.updatedBy,
      },
    });
  } catch {
    return NextResponse.json({ error: { message: "حدث خطأ في الخادم" } }, { status: 500 });
  }
}
