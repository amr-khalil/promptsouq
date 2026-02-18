import { Skeleton } from "@/components/ui/skeleton";

export default function GalleryLoading() {
  const heights = [200, 280, 220, 260, 240, 300, 190, 250, 270, 230, 210, 290];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Skeleton className="h-10 w-48 mb-4" />
      <div className="flex gap-2 mb-8">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-8 w-24 rounded-full" />
        ))}
      </div>

      <div className="columns-1 sm:columns-2 md:columns-3 lg:columns-4 xl:columns-5 gap-4">
        {heights.map((h, i) => (
          <div key={i} className="break-inside-avoid mb-4">
            <Skeleton className="w-full rounded-xl" style={{ height: `${h}px` }} />
          </div>
        ))}
      </div>
    </div>
  );
}
