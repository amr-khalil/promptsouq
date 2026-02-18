import { checkAdmin } from "@/lib/auth";
import { redirect } from "next/navigation";
import { AdminModerationQueue } from "@/components/dashboard/AdminModerationQueue";

export default async function AdminModerationPage() {
  const { isAdmin, userId } = await checkAdmin();
  if (!userId || !isAdmin) redirect("/dashboard");

  return (
    <div className="space-y-6">
      <AdminModerationQueue />
    </div>
  );
}
