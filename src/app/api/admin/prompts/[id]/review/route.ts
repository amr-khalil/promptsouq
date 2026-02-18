import { db } from "@/db";
import { prompts } from "@/db/schema";
import { checkAdmin } from "@/lib/auth";
import { sendPromptApprovedEmail, sendPromptRejectedEmail } from "@/lib/email";
import { adminReviewSchema, apiErrorResponse, uuidParamSchema } from "@/lib/schemas/api";
import { clerkClient } from "@clerk/nextjs/server";
import { eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { isAdmin, userId } = await checkAdmin();
    if (!userId) {
      return NextResponse.json(
        apiErrorResponse("FORBIDDEN", "يجب تسجيل الدخول أولاً"),
        { status: 401 },
      );
    }
    if (!isAdmin) {
      return NextResponse.json(
        apiErrorResponse("FORBIDDEN", "ليس لديك صلاحية الوصول"),
        { status: 403 },
      );
    }

    const { id } = await params;
    const parsedId = uuidParamSchema.safeParse(id);
    if (!parsedId.success) {
      return NextResponse.json(
        apiErrorResponse("VALIDATION_ERROR", "معرّف غير صالح"),
        { status: 400 },
      );
    }

    const body = await request.json();
    const parsed = adminReviewSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        apiErrorResponse(
          "VALIDATION_ERROR",
          "بيانات المراجعة غير صالحة",
          parsed.error.flatten() as unknown as Record<string, unknown>,
        ),
        { status: 400 },
      );
    }

    // Check prompt exists and is pending
    const existing = await db
      .select({
        status: prompts.status,
        sellerId: prompts.sellerId,
        title: prompts.title,
      })
      .from(prompts)
      .where(eq(prompts.id, parsedId.data))
      .limit(1);

    if (existing.length === 0) {
      return NextResponse.json(
        apiErrorResponse("NOT_FOUND", "البرومبت غير موجود"),
        { status: 404 },
      );
    }

    if (existing[0].status !== "pending") {
      return NextResponse.json(
        apiErrorResponse("CONFLICT", "تمت مراجعة هذا البرومبت بالفعل"),
        { status: 409 },
      );
    }

    const { action, reason } = parsed.data;
    const now = new Date();

    const [updated] = await db
      .update(prompts)
      .set({
        status: action === "approve" ? "approved" : "rejected",
        rejectionReason: action === "reject" ? (reason ?? null) : null,
        reviewedAt: now,
        reviewedBy: userId,
        updatedAt: now,
      })
      .where(eq(prompts.id, parsedId.data))
      .returning({
        id: prompts.id,
        status: prompts.status,
        reviewedAt: prompts.reviewedAt,
      });

    // Fire-and-forget email notification to seller
    const { sellerId, title: promptTitle } = existing[0];
    if (sellerId) {
      const clerk = await clerkClient();
      void clerk.users.getUser(sellerId).then((user) => {
        const sellerEmail = user.emailAddresses[0]?.emailAddress;
        if (!sellerEmail) return;
        if (action === "approve") {
          return sendPromptApprovedEmail({ sellerEmail, promptTitle });
        } else {
          return sendPromptRejectedEmail({ sellerEmail, promptTitle, reason });
        }
      }).catch((err) => {
        console.error("Failed to send review email:", err);
      });
    }

    return NextResponse.json({
      data: {
        id: updated.id,
        status: updated.status,
        reviewedAt: updated.reviewedAt?.toISOString(),
      },
    });
  } catch {
    return NextResponse.json(
      apiErrorResponse("INTERNAL_ERROR", "حدث خطأ داخلي في الخادم"),
      { status: 500 },
    );
  }
}
