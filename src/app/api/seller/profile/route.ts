import { checkAuth } from "@/lib/auth";
import { db } from "@/db";
import { sellerProfiles, prompts } from "@/db/schema";
import { sellerProfileUpdateSchema } from "@/lib/schemas/api";
import { mapSellerProfileEditRow } from "@/lib/mappers";
import { eq } from "drizzle-orm";
import { NextResponse, type NextRequest } from "next/server";

export async function GET() {
  const userId = await checkAuth();
  if (!userId) {
    return NextResponse.json({ error: { message: "غير مصرح" } }, { status: 401 });
  }

  try {
    const [profile] = await db
      .select()
      .from(sellerProfiles)
      .where(eq(sellerProfiles.userId, userId))
      .limit(1);

    if (!profile) {
      return NextResponse.json({ error: { message: "لا يوجد ملف بائع" } }, { status: 404 });
    }

    return NextResponse.json({ data: mapSellerProfileEditRow(profile) });
  } catch {
    return NextResponse.json({ error: { message: "حدث خطأ في الخادم" } }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  const userId = await checkAuth();
  if (!userId) {
    return NextResponse.json({ error: { message: "غير مصرح" } }, { status: 401 });
  }

  try {
    const body = await request.json();
    const parsed = sellerProfileUpdateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: { message: "بيانات غير صالحة", details: parsed.error.flatten() } },
        { status: 400 },
      );
    }

    const { displayName, bio, avatar } = parsed.data;

    // Update seller profile
    const [updated] = await db
      .update(sellerProfiles)
      .set({
        displayName,
        bio: bio ?? null,
        avatar: avatar ?? sellerProfiles.avatar,
        updatedAt: new Date(),
      })
      .where(eq(sellerProfiles.userId, userId))
      .returning();

    if (!updated) {
      return NextResponse.json({ error: { message: "لا يوجد ملف بائع" } }, { status: 404 });
    }

    // Update denormalized seller columns on prompts
    const updateData: Record<string, string> = { sellerName: displayName };
    if (avatar) updateData.sellerAvatar = avatar;

    await db
      .update(prompts)
      .set(updateData)
      .where(eq(prompts.sellerId, userId));

    return NextResponse.json({ data: mapSellerProfileEditRow(updated) });
  } catch {
    return NextResponse.json({ error: { message: "حدث خطأ في الخادم" } }, { status: 500 });
  }
}
