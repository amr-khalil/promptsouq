import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { featureRequests, featureVotes } from "@/db/schema";
import { checkAuth } from "@/lib/auth";
import { apiErrorResponse } from "@/lib/schemas/api";
import { eq, and, sql } from "drizzle-orm";

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const userId = await checkAuth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  // Check feature request exists
  const [fr] = await db
    .select({ id: featureRequests.id })
    .from(featureRequests)
    .where(eq(featureRequests.id, id))
    .limit(1);

  if (!fr) {
    return NextResponse.json(
      apiErrorResponse("NOT_FOUND", "طلب الميزة غير موجود"),
      { status: 404 },
    );
  }

  try {
    await db.transaction(async (tx) => {
      await tx.insert(featureVotes).values({
        featureRequestId: id,
        userId,
      });
      await tx
        .update(featureRequests)
        .set({ voteCount: sql`${featureRequests.voteCount} + 1` })
        .where(eq(featureRequests.id, id));
    });
  } catch (err: unknown) {
    const pgErr = err as { code?: string };
    if (pgErr.code === "23505") {
      return NextResponse.json(
        apiErrorResponse("CONFLICT", "لقد صوّت على هذا الطلب مسبقاً"),
        { status: 409 },
      );
    }
    throw err;
  }

  const [updated] = await db
    .select({ voteCount: featureRequests.voteCount })
    .from(featureRequests)
    .where(eq(featureRequests.id, id))
    .limit(1);

  return NextResponse.json({ voted: true, voteCount: updated.voteCount });
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const userId = await checkAuth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  const [deleted] = await db
    .delete(featureVotes)
    .where(
      and(
        eq(featureVotes.featureRequestId, id),
        eq(featureVotes.userId, userId),
      ),
    )
    .returning({ id: featureVotes.id });

  if (!deleted) {
    return NextResponse.json(
      apiErrorResponse("NOT_FOUND", "التصويت غير موجود"),
      { status: 404 },
    );
  }

  await db
    .update(featureRequests)
    .set({ voteCount: sql`GREATEST(${featureRequests.voteCount} - 1, 0)` })
    .where(eq(featureRequests.id, id));

  const [updated] = await db
    .select({ voteCount: featureRequests.voteCount })
    .from(featureRequests)
    .where(eq(featureRequests.id, id))
    .limit(1);

  return NextResponse.json({ voted: false, voteCount: updated.voteCount });
}
