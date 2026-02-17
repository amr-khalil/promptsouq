import { Skeleton } from "@/components/ui/skeleton";

export default function MarketLoading() {
  return (
    <div className="dark bg-gray-950 min-h-screen">
      {/* Hero Skeleton */}
      <section className="border-b border-gray-800">
        <div className="container mx-auto px-4 py-12 text-center">
          <Skeleton className="h-9 w-48 mx-auto mb-3 bg-gray-800" />
          <Skeleton className="h-5 w-72 mx-auto mb-8 bg-gray-800" />
          <Skeleton className="h-12 max-w-2xl mx-auto rounded-lg bg-gray-800" />
        </div>
      </section>

      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col md:flex-row gap-6">
          {/* Sidebar Skeleton */}
          <aside className="hidden md:block w-56 shrink-0">
            <div className="rounded-lg border border-gray-800 bg-gray-900 p-4">
              <Skeleton className="h-5 w-16 mb-4 bg-gray-800" />
              <div className="space-y-3 mb-6">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <Skeleton className="h-4 w-4 rounded-full bg-gray-800" />
                    <Skeleton className="h-4 w-20 bg-gray-800" />
                  </div>
                ))}
              </div>
              <Skeleton className="h-5 w-20 mb-3 bg-gray-800" />
              <div className="space-y-3 mb-6">
                {Array.from({ length: 7 }).map((_, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <Skeleton className="h-4 w-4 rounded-full bg-gray-800" />
                    <Skeleton className="h-4 w-24 bg-gray-800" />
                  </div>
                ))}
              </div>
              <Skeleton className="h-9 w-full bg-gray-800" />
            </div>
          </aside>

          {/* Grid Skeleton */}
          <div className="flex-1">
            <div className="flex items-center justify-between mb-4">
              <Skeleton className="h-4 w-24 bg-gray-800" />
              <Skeleton className="h-9 w-[180px] bg-gray-800" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <div
                  key={i}
                  className="rounded-lg overflow-hidden bg-gray-900 border border-gray-800"
                >
                  <Skeleton className="aspect-square bg-gray-800" />
                  <div className="p-3">
                    <Skeleton className="h-4 w-full mb-2 bg-gray-800" />
                    <Skeleton className="h-4 w-16 bg-gray-800" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
