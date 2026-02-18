import { checkAdmin } from "@/lib/auth";
import { redirect } from "next/navigation";
import { AdminOrdersTable } from "@/components/dashboard/AdminOrdersTable";

export default async function AdminOrdersPage() {
  const { isAdmin } = await checkAdmin();
  if (!isAdmin) redirect("/dashboard");

  return (
    <div className="space-y-6">
      <AdminOrdersTable />
    </div>
  );
}
