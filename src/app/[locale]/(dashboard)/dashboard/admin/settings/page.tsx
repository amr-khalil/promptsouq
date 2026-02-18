import { checkAdmin } from "@/lib/auth";
import { redirect } from "next/navigation";
import { AdminSettingsForm } from "@/components/dashboard/AdminSettingsForm";

export default async function AdminSettingsPage() {
  const { isAdmin } = await checkAdmin();
  if (!isAdmin) redirect("/dashboard");

  return (
    <div className="space-y-6">
      <AdminSettingsForm />
    </div>
  );
}
