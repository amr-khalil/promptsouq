import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { issues, issueStatusChanges } from "@/db/schema";
import { checkAdmin } from "@/lib/auth";
import { adminIssueListParams } from "@/lib/schemas/issues";
import { apiErrorResponse } from "@/lib/schemas/api";
import { eq, and, desc, asc, count } from "drizzle-orm";

export async function GET(request: NextRequest) {
  const { isAdmin } = await checkAdmin();
  if (!isAdmin) {
    return NextResponse.json(
      apiErrorResponse("FORBIDDEN", "غير مصرح"),
      { status: 403 },
    );
  }

  const params = adminIssueListParams.safeParse(
    Object.fromEntries(request.nextUrl.searchParams),
  );
  if (!params.success) {
    return NextResponse.json(
      apiErrorResponse("VALIDATION_ERROR", "معاملات غير صالحة", params.error.flatten().fieldErrors),
      { status: 400 },
    );
  }

  const { status, limit, offset, sort } = params.data;

  const conditions = [];
  if (status) {
    conditions.push(eq(issues.status, status));
  }

  const whereClause = conditions.length > 0 ? and(...conditions) : undefined;
  const orderBy = sort === "oldest" ? asc(issues.createdAt) : desc(issues.createdAt);

  const [rows, [totalResult]] = await Promise.all([
    db
      .select()
      .from(issues)
      .where(whereClause)
      .orderBy(orderBy)
      .limit(limit)
      .offset(offset),
    db
      .select({ count: count() })
      .from(issues)
      .where(whereClause),
  ]);

  // Fetch status changes for all returned issues
  const issueIds = rows.map((r) => r.id);
  const statusChangesMap = new Map<string, { fromStatus: string; toStatus: string; note: string; createdAt: string }[]>();

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
      .orderBy(desc(issueStatusChanges.createdAt));

    const relevantChanges = changes.filter((c) => issueIds.includes(c.issueId));

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
      reporterName: r.reporterName,
      reporterId: r.reporterId,
      status: r.status,
      createdAt: r.createdAt.toISOString(),
      updatedAt: r.updatedAt.toISOString(),
      statusChanges: statusChangesMap.get(r.id) ?? [],
    })),
    total: totalResult.count,
  });
}
