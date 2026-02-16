import { Skeleton } from "@/components/ui/skeleton";

export default function SubscriptionLoading() {
  return (
    <div className="container mx-auto px-4 py-12">
      {/* Title skeleton */}
      <div className="mb-10 flex flex-col items-center gap-3">
        <Skeleton className="h-9 w-48" />
        <Skeleton className="h-5 w-80" />
      </div>

      {/* Toggle skeleton */}
      <div className="mb-10 flex justify-center">
        <div className="inline-flex items-center gap-1 rounded-full bg-muted p-1">
          <Skeleton className="h-10 w-20 rounded-full" />
          <Skeleton className="h-10 w-20 rounded-full" />
          <Skeleton className="h-10 w-20 rounded-full" />
        </div>
      </div>

      {/* Cards grid skeleton */}
      <div className="mx-auto grid max-w-5xl grid-cols-1 gap-6 lg:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div
            key={i}
            className="flex flex-col overflow-hidden rounded-xl border shadow-sm"
          >
            {/* Header skeleton */}
            <Skeleton className="h-24 w-full rounded-none" />

            {/* Body skeleton */}
            <div className="flex flex-col gap-4 p-6">
              <div className="flex flex-col items-center gap-2">
                <Skeleton className="h-8 w-24" />
                <Skeleton className="h-10 w-32" />
              </div>

              <div className="flex flex-col gap-3">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-4/5" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-full" />
              </div>
            </div>

            {/* Footer skeleton */}
            <div className="mt-auto p-6 pt-0">
              <Skeleton className="h-10 w-full rounded-md" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
