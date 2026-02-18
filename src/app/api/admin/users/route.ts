import { db } from "@/db";
import { profiles } from "@/db/schema";
import { checkAdmin } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const { isAdmin, userId } = await checkAdmin();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!isAdmin) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { searchParams } = request.nextUrl;
  const page = Math.max(1, parseInt(searchParams.get("page") ?? "1", 10));
  const perPage = Math.min(
    50,
    Math.max(1, parseInt(searchParams.get("perPage") ?? "20", 10)),
  );
  const search = searchParams.get("search")?.trim() ?? "";
  const roleFilter = searchParams.get("role") ?? "";

  const supabaseAdmin = createAdminClient();
  const { data, error } = await supabaseAdmin.auth.admin.listUsers({
    page,
    perPage,
  });

  if (error) {
    return NextResponse.json(
      { error: "Failed to fetch users" },
      { status: 500 },
    );
  }

  // Fetch all profiles for display names/avatars
  const allProfiles = await db.select().from(profiles);
  const profileMap = new Map(allProfiles.map((p) => [p.id, p]));

  let users = data.users.map((u) => {
    const profile = profileMap.get(u.id);
    const role =
      (u.app_metadata as { role?: string } | undefined)?.role ?? "user";
    return {
      id: u.id,
      email: u.email ?? "",
      firstName: profile?.firstName ?? null,
      lastName: profile?.lastName ?? null,
      displayName: profile?.displayName ?? null,
      avatarUrl: profile?.avatarUrl ?? null,
      role,
      createdAt: u.created_at,
      lastSignInAt: u.last_sign_in_at ?? null,
    };
  });

  // Client-side filtering since Supabase admin API doesn't support search
  if (search) {
    const lower = search.toLowerCase();
    users = users.filter(
      (u) =>
        u.email.toLowerCase().includes(lower) ||
        (u.displayName ?? "").toLowerCase().includes(lower) ||
        (u.firstName ?? "").toLowerCase().includes(lower) ||
        (u.lastName ?? "").toLowerCase().includes(lower),
    );
  }

  if (roleFilter && (roleFilter === "admin" || roleFilter === "user")) {
    users = users.filter((u) => u.role === roleFilter);
  }

  return NextResponse.json({
    data: users,
    total: data.total,
    page,
    perPage,
  });
}
