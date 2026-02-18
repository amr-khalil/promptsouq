import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function AdminSettingsLoading() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-7 w-40" />
      <Card>
        <CardContent className="p-6 space-y-4">
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-10 w-48" />
          <Skeleton className="h-4 w-64" />
          <Skeleton className="h-10 w-32" />
        </CardContent>
      </Card>
    </div>
  );
}
