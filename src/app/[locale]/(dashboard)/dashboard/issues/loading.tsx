import { Skeleton } from "@/components/ui/skeleton";

export default function IssuesLoading() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-8 w-32" />

      {/* Form skeleton */}
      <div className="space-y-4 p-4 rounded-xl border border-zinc-800">
        <Skeleton className="h-6 w-24" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-10 w-32" />
      </div>

      {/* List skeleton */}
      <div className="flex gap-2">
        <Skeleton className="h-8 w-16" />
        <Skeleton className="h-8 w-16" />
        <Skeleton className="h-8 w-20" />
        <Skeleton className="h-8 w-16" />
      </div>
      <div className="space-y-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-16 w-full rounded-xl" />
        ))}
      </div>
    </div>
  );
}
