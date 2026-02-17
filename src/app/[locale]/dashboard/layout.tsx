import { DashboardSidebar } from "@/components/dashboard/DashboardSidebar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">لوحة التحكم</h1>
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <DashboardSidebar />
        <main className="lg:col-span-3">{children}</main>
      </div>
    </div>
  );
}
