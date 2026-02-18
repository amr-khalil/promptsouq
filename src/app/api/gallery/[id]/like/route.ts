import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { galleryImages, galleryLikes } from "@/db/schema";
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

  // Check image exists
  const [image] = await db
    .select({ id: galleryImages.id })
    .from(galleryImages)
    .where(eq(galleryImages.id, id))
    .limit(1);

  if (!image) {
    return NextResponse.json(
      apiErrorResponse("NOT_FOUND", "الصورة غير موجودة"),
      { status: 404 },
    );
  }

  // Try to insert like (unique constraint will prevent duplicates)
  try {
    await db.transaction(async (tx) => {
      await tx.insert(galleryLikes).values({
        galleryImageId: id,
        userId,
      });
      await tx
        .update(galleryImages)
        .set({ likesCount: sql`${galleryImages.likesCount} + 1` })
        .where(eq(galleryImages.id, id));
    });
  } catch (err: unknown) {
    const pgErr = err as { code?: string };
    if (pgErr.code === "23505") {
      return NextResponse.json(
        apiErrorResponse("CONFLICT", "لقد أعجبت بهذه الصورة مسبقاً"),
        { status: 409 },
      );
    }
    throw err;
  }

  const [updated] = await db
    .select({ likesCount: galleryImages.likesCount })
    .from(galleryImages)
    .where(eq(galleryImages.id, id))
    .limit(1);

  return NextResponse.json({ liked: true, likesCount: updated.likesCount });
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
    .delete(galleryLikes)
    .where(
      and(
        eq(galleryLikes.galleryImageId, id),
        eq(galleryLikes.userId, userId),
      ),
    )
    .returning({ id: galleryLikes.id });

  if (!deleted) {
    return NextResponse.json(
      apiErrorResponse("NOT_FOUND", "الإعجاب غير موجود"),
      { status: 404 },
    );
  }

  await db
    .update(galleryImages)
    .set({ likesCount: sql`GREATEST(${galleryImages.likesCount} - 1, 0)` })
    .where(eq(galleryImages.id, id));

  const [updated] = await db
    .select({ likesCount: galleryImages.likesCount })
    .from(galleryImages)
    .where(eq(galleryImages.id, id))
    .limit(1);

  return NextResponse.json({ liked: false, likesCount: updated.likesCount });
}
