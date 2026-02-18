import { db } from "@/db";
import { sellerProfiles } from "@/db/schema";
import { DashboardSidebar } from "@/components/dashboard/DashboardSidebar";
import { checkAdmin } from "@/lib/auth";
import { eq } from "drizzle-orm";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isAdmin, userId } = await checkAdmin();

  let isSeller = false;
  if (userId) {
    const [profile] = await db
      .select({ userId: sellerProfiles.userId })
      .from(sellerProfiles)
      .where(eq(sellerProfiles.userId, userId))
      .limit(1);
    isSeller = !!profile;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">لوحة التحكم</h1>
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <DashboardSidebar isSeller={isSeller} isAdmin={isAdmin} />
        <main className="lg:col-span-3">{children}</main>
      </div>
    </div>
  );
}
