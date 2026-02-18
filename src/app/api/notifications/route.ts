import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { notifications } from "@/db/schema";
import { checkAuth } from "@/lib/auth";
import { notificationListParams, markReadBody } from "@/lib/schemas/notifications";
import { apiErrorResponse } from "@/lib/schemas/api";
import { eq, and, desc, count } from "drizzle-orm";

export async function GET(request: NextRequest) {
  const userId = await checkAuth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const params = notificationListParams.safeParse(
    Object.fromEntries(request.nextUrl.searchParams),
  );
  if (!params.success) {
    return NextResponse.json(
      apiErrorResponse("VALIDATION_ERROR", "معاملات غير صالحة", params.error.flatten().fieldErrors),
      { status: 400 },
    );
  }

  const { limit, offset } = params.data;

  const [items, [totalResult], [unreadResult]] = await Promise.all([
    db
      .select()
      .from(notifications)
      .where(eq(notifications.userId, userId))
      .orderBy(desc(notifications.createdAt))
      .limit(limit)
      .offset(offset),
    db
      .select({ count: count() })
      .from(notifications)
      .where(eq(notifications.userId, userId)),
    db
      .select({ count: count() })
      .from(notifications)
      .where(
        and(
          eq(notifications.userId, userId),
          eq(notifications.read, false),
        ),
      ),
  ]);

  return NextResponse.json({
    notifications: items.map((n) => ({
      id: n.id,
      type: n.type,
      title: n.title,
      message: n.message,
      link: n.link,
      read: n.read,
      createdAt: n.createdAt.toISOString(),
    })),
    total: totalResult.count,
    unreadCount: unreadResult.count,
  });
}

export async function PATCH(request: NextRequest) {
  const userId = await checkAuth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = markReadBody.safeParse(await request.json());
  if (!body.success) {
    return NextResponse.json(
      apiErrorResponse("VALIDATION_ERROR", "بيانات غير صالحة", body.error.flatten().fieldErrors),
      { status: 400 },
    );
  }

  const { action, notificationId } = body.data;

  if (action === "read_one") {
    const [updated] = await db
      .update(notifications)
      .set({ read: true })
      .where(
        and(
          eq(notifications.id, notificationId!),
          eq(notifications.userId, userId),
        ),
      )
      .returning({ id: notifications.id });

    if (!updated) {
      return NextResponse.json(
        apiErrorResponse("NOT_FOUND", "الإشعار غير موجود"),
        { status: 404 },
      );
    }
  } else {
    await db
      .update(notifications)
      .set({ read: true })
      .where(
        and(
          eq(notifications.userId, userId),
          eq(notifications.read, false),
        ),
      );
  }

  const [unreadResult] = await db
    .select({ count: count() })
    .from(notifications)
    .where(
      and(
        eq(notifications.userId, userId),
        eq(notifications.read, false),
      ),
    );

  return NextResponse.json({
    message: "تم تحديث الإشعارات",
    unreadCount: unreadResult.count,
  });
}
