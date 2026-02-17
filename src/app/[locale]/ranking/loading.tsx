import { Skeleton } from "@/components/ui/skeleton";

export default function RankingLoading() {
  const heights = ["h-64", "h-72", "h-80", "h-72", "h-64"];
  const widths = [
    "w-44 md:w-48",
    "w-48 md:w-56",
    "w-56 md:w-64",
    "w-48 md:w-56",
    "w-44 md:w-48",
  ];

  return (
    <div className="min-h-screen bg-[#05050f] text-slate-200">
      <div className="max-w-7xl mx-auto px-4 py-8 md:px-6 lg:px-8">
        {/* Header skeleton */}
        <div className="mb-12">
          <Skeleton className="h-8 w-48 bg-slate-800" />
          <Skeleton className="h-4 w-64 mt-2 bg-slate-800" />
        </div>

        {/* Podium skeleton */}
        <div className="flex items-end justify-center gap-2 md:gap-4 mb-20 overflow-x-auto pb-4">
          {heights.map((h, i) => (
            <div
              key={i}
              className={`rounded-xl border border-purple-500/20 bg-gradient-to-b from-purple-900/40 to-slate-900 animate-pulse shrink-0 ${h} ${widths[i]}`}
            >
              <div className="flex flex-col items-center pt-8 gap-3">
                <Skeleton className="h-4 w-20 bg-slate-800" />
                <Skeleton className="w-20 h-20 rounded-full bg-slate-800" />
                <Skeleton className="h-6 w-16 rounded-full bg-slate-800" />
              </div>
            </div>
          ))}
        </div>

        {/* Table skeleton */}
        <div className="space-y-4">
          <Skeleton className="h-10 w-full bg-slate-800 rounded" />
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="h-12 w-full bg-slate-800/50 rounded" />
          ))}
        </div>
      </div>
    </div>
  );
}
