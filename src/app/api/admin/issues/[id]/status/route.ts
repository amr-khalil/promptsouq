import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { issues, issueStatusChanges, notifications } from "@/db/schema";
import { checkAdmin } from "@/lib/auth";
import { changeIssueStatusBody } from "@/lib/schemas/issues";
import { apiErrorResponse } from "@/lib/schemas/api";
import { eq } from "drizzle-orm";

export async function PATCH(
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

  const body = changeIssueStatusBody.safeParse(await request.json());
  if (!body.success) {
    return NextResponse.json(
      apiErrorResponse("VALIDATION_ERROR", "بيانات غير صالحة", body.error.flatten().fieldErrors),
      { status: 400 },
    );
  }

  // Get current issue
  const [issue] = await db
    .select()
    .from(issues)
    .where(eq(issues.id, id))
    .limit(1);

  if (!issue) {
    return NextResponse.json(
      apiErrorResponse("NOT_FOUND", "البلاغ غير موجود"),
      { status: 404 },
    );
  }

  const { status: newStatus, note } = body.data;

  await db.transaction(async (tx) => {
    // Insert status change record
    await tx.insert(issueStatusChanges).values({
      issueId: id,
      fromStatus: issue.status,
      toStatus: newStatus,
      note,
      changedBy: userId,
    });

    // Update issue status and updated_at
    await tx
      .update(issues)
      .set({
        status: newStatus,
        updatedAt: new Date(),
      })
      .where(eq(issues.id, id));

    // Create notification for the reporter
    const statusLabels: Record<string, string> = {
      open: "مفتوح",
      in_progress: "قيد المعالجة",
      resolved: "تم الحل",
    };

    await tx.insert(notifications).values({
      userId: issue.reporterId,
      type: "issue_status_changed",
      title: "تحديث حالة البلاغ",
      message: `تم تغيير حالة بلاغك "${issue.title}" إلى ${statusLabels[newStatus] ?? newStatus}`,
      link: "/dashboard/issues",
    });
  });

  return NextResponse.json({
    id,
    status: newStatus,
    message: "تم تحديث حالة البلاغ",
  });
}
