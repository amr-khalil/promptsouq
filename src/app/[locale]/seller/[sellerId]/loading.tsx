export default function SellerLoading() {
  return (
    <div className="min-h-screen bg-[#0B0E14]">
      <div className="container mx-auto px-4 py-8">
        {/* Profile Header Skeleton */}
        <div className="flex flex-col items-center text-center mb-10 animate-pulse">
          <div className="w-24 h-24 rounded-full bg-slate-800 mb-4" />
          <div className="h-7 w-40 bg-slate-800 rounded mb-2" />
          <div className="h-4 w-16 bg-slate-800 rounded mb-3" />
          <div className="h-5 w-20 bg-slate-800 rounded mb-3" />
          <div className="h-4 w-64 bg-slate-800 rounded" />
        </div>

        {/* Stats Grid Skeleton */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-10 animate-pulse">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="rounded-xl border border-slate-800 bg-[#161b26] p-4 text-center"
            >
              <div className="h-4 w-12 bg-slate-800 rounded mx-auto mb-2" />
              <div className="h-7 w-16 bg-slate-800 rounded mx-auto" />
            </div>
          ))}
        </div>

        {/* Prompts Grid Skeleton */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 animate-pulse">
          {Array.from({ length: 8 }).map((_, i) => (
            <div
              key={i}
              className="rounded-xl border border-slate-800 bg-[#161b26] overflow-hidden"
            >
              <div className="h-48 bg-slate-800" />
              <div className="p-4 space-y-2">
                <div className="h-4 w-3/4 bg-slate-800 rounded" />
                <div className="h-3 w-full bg-slate-800 rounded" />
                <div className="h-3 w-1/2 bg-slate-800 rounded" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
