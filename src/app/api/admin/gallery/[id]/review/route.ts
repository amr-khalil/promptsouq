import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { galleryImages, notifications } from "@/db/schema";
import { checkAdmin } from "@/lib/auth";
import { galleryReviewBody } from "@/lib/schemas/gallery";
import { apiErrorResponse } from "@/lib/schemas/api";
import { eq } from "drizzle-orm";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { isAdmin, userId } = await checkAdmin();
  if (!isAdmin || !userId) {
    return NextResponse.json(
      apiErrorResponse("FORBIDDEN", "غير مصرح"),
      { status: 403 },
    );
  }

  const { id } = await params;

  const body = galleryReviewBody.safeParse(await request.json());
  if (!body.success) {
    return NextResponse.json(
      apiErrorResponse("VALIDATION_ERROR", "بيانات غير صالحة", body.error.flatten().fieldErrors),
      { status: 400 },
    );
  }

  // Check image exists and is pending
  const [image] = await db
    .select({
      id: galleryImages.id,
      status: galleryImages.status,
      sellerId: galleryImages.sellerId,
    })
    .from(galleryImages)
    .where(eq(galleryImages.id, id))
    .limit(1);

  if (!image) {
    return NextResponse.json(
      apiErrorResponse("NOT_FOUND", "الصورة غير موجودة"),
      { status: 404 },
    );
  }

  if (image.status !== "pending") {
    return NextResponse.json(
      apiErrorResponse("CONFLICT", "تم مراجعة هذه الصورة مسبقاً"),
      { status: 409 },
    );
  }

  const { action, rejectionReason } = body.data;
  const newStatus = action === "approve" ? "approved" : "rejected";

  await db.transaction(async (tx) => {
    await tx
      .update(galleryImages)
      .set({
        status: newStatus,
        rejectionReason: action === "reject" ? rejectionReason ?? null : null,
        reviewedBy: userId,
        reviewedAt: new Date(),
      })
      .where(eq(galleryImages.id, id));

    // Notify seller
    const notificationType = action === "approve" ? "gallery_approved" : "gallery_rejected";
    const notificationTitle = action === "approve"
      ? "تمت الموافقة على صورتك"
      : "تم رفض صورتك";
    const notificationMessage = action === "approve"
      ? "تمت الموافقة على صورتك وستظهر في المعرض"
      : `تم رفض صورتك: ${rejectionReason ?? ""}`;

    await tx.insert(notifications).values({
      userId: image.sellerId,
      type: notificationType,
      title: notificationTitle,
      message: notificationMessage,
      link: "/dashboard/seller/gallery",
    });
  });

  return NextResponse.json({
    id,
    status: newStatus,
    message: "تم تحديث حالة الصورة",
  });
}
