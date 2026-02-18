import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { featureRequests, featureVotes } from "@/db/schema";
import { checkAuth, getAuthUser } from "@/lib/auth";
import { featureRequestListParams, createFeatureRequestBody } from "@/lib/schemas/feature-requests";
import { apiErrorResponse } from "@/lib/schemas/api";
import { eq, and, desc, count, sql } from "drizzle-orm";

export async function GET(request: NextRequest) {
  const params = featureRequestListParams.safeParse(
    Object.fromEntries(request.nextUrl.searchParams),
  );
  if (!params.success) {
    return NextResponse.json(
      apiErrorResponse("VALIDATION_ERROR", "معاملات غير صالحة", params.error.flatten().fieldErrors),
      { status: 400 },
    );
  }

  const { sort, limit, offset, status } = params.data;
  const userId = await checkAuth();

  const conditions = [];
  if (status) {
    conditions.push(eq(featureRequests.status, status));
  }

  const orderBy = sort === "votes"
    ? desc(featureRequests.voteCount)
    : desc(featureRequests.createdAt);

  const [rows, [totalResult]] = await Promise.all([
    db
      .select()
      .from(featureRequests)
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .orderBy(orderBy)
      .limit(limit)
      .offset(offset),
    db
      .select({ count: count() })
      .from(featureRequests)
      .where(conditions.length > 0 ? and(...conditions) : undefined),
  ]);

  // Check user votes if authenticated
  let userVotedIds = new Set<string>();
  if (userId && rows.length > 0) {
    const requestIds = rows.map((r) => r.id);
    const votes = await db
      .select({ featureRequestId: featureVotes.featureRequestId })
      .from(featureVotes)
      .where(
        and(
          eq(featureVotes.userId, userId),
          sql`${featureVotes.featureRequestId} = ANY(${requestIds})`,
        ),
      );
    userVotedIds = new Set(votes.map((v) => v.featureRequestId));
  }

  return NextResponse.json({
    requests: rows.map((r) => ({
      id: r.id,
      title: r.title,
      description: r.description,
      authorName: r.authorName,
      voteCount: r.voteCount,
      status: r.status,
      createdAt: r.createdAt.toISOString(),
      userHasVoted: userVotedIds.has(r.id),
    })),
    total: totalResult.count,
  });
}

export async function POST(request: NextRequest) {
  const userId = await checkAuth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = createFeatureRequestBody.safeParse(await request.json());
  if (!body.success) {
    return NextResponse.json(
      apiErrorResponse("VALIDATION_ERROR", "بيانات غير صالحة", body.error.flatten().fieldErrors),
      { status: 400 },
    );
  }

  const user = await getAuthUser();
  const authorName =
    user?.firstName && user?.lastName
      ? `${user.firstName} ${user.lastName}`
      : user?.firstName ?? "مستخدم";

  const [inserted] = await db
    .insert(featureRequests)
    .values({
      title: body.data.title,
      description: body.data.description,
      authorId: userId,
      authorName,
    })
    .returning();

  return NextResponse.json(
    {
      id: inserted.id,
      title: inserted.title,
      description: inserted.description,
      authorName: inserted.authorName,
      voteCount: inserted.voteCount,
      status: inserted.status,
      createdAt: inserted.createdAt.toISOString(),
    },
    { status: 201 },
  );
}
