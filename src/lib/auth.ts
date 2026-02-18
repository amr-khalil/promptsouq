import { db } from "@/db";
import { profiles } from "@/db/schema";
import type { AuthUser } from "@/types/auth";
import { eq } from "drizzle-orm";
import { createClient } from "./supabase/server";

/**
 * Check if the current user is authenticated.
 * Returns userId or null.
 */
export async function checkAuth(): Promise<string | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user?.id ?? null;
}

/**
 * Check if the current user has admin role via app_metadata.
 * Returns { isAdmin, userId }.
 */
export async function checkAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { isAdmin: false, userId: null } as const;
  }

  const role = (user.app_metadata as { role?: string } | undefined)?.role;
  return { isAdmin: role === "admin", userId: user.id } as const;
}

/**
 * Get full user profile (auth user + profiles table).
 * Returns AuthUser or null if not authenticated.
 */
export async function getAuthUser(): Promise<AuthUser | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const [profile] = await db
    .select()
    .from(profiles)
    .where(eq(profiles.id, user.id))
    .limit(1);

  const role =
    (user.app_metadata as { role?: string } | undefined)?.role ?? "user";

  return {
    id: user.id,
    email: user.email ?? "",
    firstName: profile?.firstName ?? null,
    lastName: profile?.lastName ?? null,
    displayName: profile?.displayName ?? null,
    avatarUrl: profile?.avatarUrl ?? null,
    role: role === "admin" ? "admin" : "user",
    onboardingCompleted: profile?.onboardingCompleted ?? false,
    emailVerified: !!user.email_confirmed_at,
    createdAt: user.created_at,
    lastSignInAt: user.last_sign_in_at ?? user.created_at,
  };
}
