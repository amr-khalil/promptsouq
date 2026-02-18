import { db } from "@/db";
import { sellerProfiles } from "@/db/schema";
import { DashboardAppSidebar } from "@/components/dashboard/DashboardAppSidebar";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { checkAdmin } from "@/lib/auth";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
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
    <SidebarProvider
      style={
        {
          "--sidebar-width": "calc(var(--spacing) * 72)",
          "--header-height": "calc(var(--spacing) * 12)",
        } as React.CSSProperties
      }
    >
      <DashboardAppSidebar
        variant="inset"
        isSeller={isSeller}
        isAdmin={isAdmin}
      />
      <SidebarInset>
        <DashboardHeader />
        <div className="flex flex-1 flex-col">
          <div className="flex flex-1 flex-col gap-4 p-4 lg:p-6">
            {children}
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
