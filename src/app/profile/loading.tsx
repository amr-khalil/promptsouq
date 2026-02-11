import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function ProfileLoading() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-1">
          <Card>
            <CardContent className="p-6 text-center">
              <Skeleton className="w-24 h-24 mx-auto mb-4 rounded-full" />
              <Skeleton className="h-5 w-24 mx-auto mb-1" />
              <Skeleton className="h-3 w-32 mx-auto mb-2" />
              <Skeleton className="h-5 w-16 mx-auto" />
            </CardContent>
          </Card>
        </div>
        <div className="lg:col-span-3">
          <Skeleton className="h-10 w-64 mb-6" />
          <Card>
            <CardContent className="p-6 space-y-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div
                  key={i}
                  className="flex items-center gap-4 p-4 border rounded-lg"
                >
                  <Skeleton className="w-20 h-20 rounded" />
                  <div className="flex-1">
                    <Skeleton className="h-4 w-3/4 mb-2" />
                    <Skeleton className="h-3 w-32" />
                  </div>
                  <Skeleton className="h-8 w-20" />
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
