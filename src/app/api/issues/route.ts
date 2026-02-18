import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { issues, issueStatusChanges } from "@/db/schema";
import { checkAuth, getAuthUser } from "@/lib/auth";
import { issueListParams, createIssueBody } from "@/lib/schemas/issues";
import { apiErrorResponse } from "@/lib/schemas/api";
import { eq, and, desc, count } from "drizzle-orm";

export async function GET(request: NextRequest) {
  const userId = await checkAuth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const params = issueListParams.safeParse(
    Object.fromEntries(request.nextUrl.searchParams),
  );
  if (!params.success) {
    return NextResponse.json(
      apiErrorResponse("VALIDATION_ERROR", "معاملات غير صالحة", params.error.flatten().fieldErrors),
      { status: 400 },
    );
  }

  const { status, limit, offset } = params.data;

  const conditions = [eq(issues.reporterId, userId)];
  if (status) {
    conditions.push(eq(issues.status, status));
  }

  const whereClause = and(...conditions);

  const [rows, [totalResult]] = await Promise.all([
    db
      .select()
      .from(issues)
      .where(whereClause)
      .orderBy(desc(issues.createdAt))
      .limit(limit)
      .offset(offset),
    db
      .select({ count: count() })
      .from(issues)
      .where(whereClause),
  ]);

  // Fetch status changes for all returned issues
  const issueIds = rows.map((r) => r.id);
  let statusChangesMap = new Map<string, { fromStatus: string; toStatus: string; note: string; createdAt: string }[]>();

  if (issueIds.length > 0) {
    const changes = await db
      .select({
        issueId: issueStatusChanges.issueId,
        fromStatus: issueStatusChanges.fromStatus,
        toStatus: issueStatusChanges.toStatus,
        note: issueStatusChanges.note,
        createdAt: issueStatusChanges.createdAt,
      })
      .from(issueStatusChanges)
      .where(
        issueIds.length === 1
          ? eq(issueStatusChanges.issueId, issueIds[0])
          : undefined,
      )
      .orderBy(desc(issueStatusChanges.createdAt));

    // Filter in JS if multiple issue IDs (simpler than SQL ANY with drizzle)
    const relevantChanges = issueIds.length === 1
      ? changes
      : changes.filter((c) => issueIds.includes(c.issueId));

    statusChangesMap = new Map();
    for (const c of relevantChanges) {
      const existing = statusChangesMap.get(c.issueId) ?? [];
      existing.push({
        fromStatus: c.fromStatus,
        toStatus: c.toStatus,
        note: c.note,
        createdAt: c.createdAt.toISOString(),
      });
      statusChangesMap.set(c.issueId, existing);
    }
  }

  return NextResponse.json({
    issues: rows.map((r) => ({
      id: r.id,
      title: r.title,
      description: r.description,
      imageUrl: r.imageUrl,
      status: r.status,
      createdAt: r.createdAt.toISOString(),
      updatedAt: r.updatedAt.toISOString(),
      statusChanges: statusChangesMap.get(r.id) ?? [],
    })),
    total: totalResult.count,
  });
}

export async function POST(request: NextRequest) {
  const userId = await checkAuth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = createIssueBody.safeParse(await request.json());
  if (!body.success) {
    return NextResponse.json(
      apiErrorResponse("VALIDATION_ERROR", "بيانات غير صالحة", body.error.flatten().fieldErrors),
      { status: 400 },
    );
  }

  const user = await getAuthUser();
  const reporterName =
    user?.firstName && user?.lastName
      ? `${user.firstName} ${user.lastName}`
      : user?.firstName ?? "مستخدم";

  const [inserted] = await db
    .insert(issues)
    .values({
      title: body.data.title,
      description: body.data.description,
      imageUrl: body.data.imageUrl ?? null,
      reporterId: userId,
      reporterName,
    })
    .returning();

  return NextResponse.json(
    {
      id: inserted.id,
      title: inserted.title,
      status: inserted.status,
      message: "تم إرسال البلاغ بنجاح",
    },
    { status: 201 },
  );
}
