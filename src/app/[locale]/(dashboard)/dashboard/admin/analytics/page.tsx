import { checkAdmin } from "@/lib/auth";
import { redirect } from "next/navigation";
import { AdminAnalyticsCards } from "@/components/dashboard/AdminAnalyticsCards";

export default async function AdminAnalyticsPage() {
  const { isAdmin } = await checkAdmin();
  if (!isAdmin) redirect("/dashboard");

  return (
    <div className="space-y-6">
      <AdminAnalyticsCards />
    </div>
  );
}
