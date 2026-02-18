import { db } from "@/db";
import { profiles } from "@/db/schema";
import { getAuthUser } from "@/lib/auth";
import { profileUpdateSchema } from "@/lib/schemas/auth";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function GET() {
  const user = await getAuthUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return NextResponse.json(user);
}

export async function PUT(request: Request) {
  const user = await getAuthUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const result = profileUpdateSchema.safeParse(body);

  if (!result.success) {
    const fieldErrors = result.error.flatten().fieldErrors;
    return NextResponse.json(
      { error: "Validation failed", fieldErrors },
      { status: 400 },
    );
  }

  const updateData: Record<string, unknown> = {
    ...result.data,
    updatedAt: new Date(),
  };

  // Convert camelCase to snake_case for Drizzle
  const drizzleData: Record<string, unknown> = {};
  if (updateData.firstName !== undefined) drizzleData.firstName = updateData.firstName;
  if (updateData.lastName !== undefined) drizzleData.lastName = updateData.lastName;
  if (updateData.displayName !== undefined) drizzleData.displayName = updateData.displayName;
  if (updateData.avatarUrl !== undefined) drizzleData.avatarUrl = updateData.avatarUrl;
  if (updateData.onboardingCompleted !== undefined) drizzleData.onboardingCompleted = updateData.onboardingCompleted;
  if (updateData.locale !== undefined) drizzleData.locale = updateData.locale;
  drizzleData.updatedAt = updateData.updatedAt;

  const [updated] = await db
    .update(profiles)
    .set(drizzleData)
    .where(eq(profiles.id, user.id))
    .returning();

  return NextResponse.json({
    id: updated.id,
    firstName: updated.firstName,
    lastName: updated.lastName,
    displayName: updated.displayName,
    avatarUrl: updated.avatarUrl,
    onboardingCompleted: updated.onboardingCompleted,
    locale: updated.locale,
    updatedAt: updated.updatedAt?.toISOString(),
  });
}
