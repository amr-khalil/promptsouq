import { Skeleton } from "@/components/ui/skeleton";

export default function SellLoading() {
  return (
    <div className="container mx-auto max-w-3xl px-4 py-8">
      <div className="mb-8 text-center space-y-2">
        <Skeleton className="h-9 w-48 mx-auto" />
        <Skeleton className="h-5 w-72 mx-auto" />
      </div>

      <div className="mb-8 flex items-center justify-center gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="flex items-center gap-4">
            <Skeleton className="h-10 w-10 rounded-full" />
            {i < 4 && <Skeleton className="h-px w-12" />}
          </div>
        ))}
      </div>

      <div className="rounded-lg border bg-card p-6 space-y-6">
        <div className="grid grid-cols-2 gap-6">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
        </div>
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-24 w-full" />
        <div className="grid grid-cols-3 gap-6">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
        </div>
      </div>
    </div>
  );
}
