import { checkAdmin } from "@/lib/auth";
import { roleUpdateSchema } from "@/lib/schemas/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { NextRequest, NextResponse } from "next/server";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { isAdmin, userId } = await checkAdmin();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!isAdmin) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id: targetId } = await params;

  // Prevent self-demotion
  if (targetId === userId) {
    return NextResponse.json(
      { error: "Cannot change your own role" },
      { status: 400 },
    );
  }

  const body = await request.json();
  const parsed = roleUpdateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid input", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const supabaseAdmin = createAdminClient();
  const { data, error } = await supabaseAdmin.auth.admin.updateUserById(targetId, {
    app_metadata: { role: parsed.data.role },
  });

  if (error) {
    return NextResponse.json(
      { error: "Failed to update role" },
      { status: 500 },
    );
  }

  return NextResponse.json({
    id: data.user.id,
    email: data.user.email,
    role: parsed.data.role,
  });
}
