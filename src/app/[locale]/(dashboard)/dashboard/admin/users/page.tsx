import { checkAdmin } from "@/lib/auth";
import { redirect } from "next/navigation";
import { AdminUsersList } from "@/components/dashboard/AdminUsersList";

export default async function AdminUsersPage() {
  const { isAdmin, userId } = await checkAdmin();
  if (!userId || !isAdmin) redirect("/dashboard");

  return (
    <div className="space-y-6">
      <AdminUsersList />
    </div>
  );
}
