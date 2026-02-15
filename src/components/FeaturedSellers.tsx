"use client";

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { ChevronRight, RefreshCw, Star } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

// --- Types ---

interface Seller {
  userId: string;
  displayName: string;
  avatar: string;
  bio: string | null;
  country: string | null;
  totalSales: number;
  totalReviews: number;
  avgRating: number;
  promptCount: number;
  tier: string;
  topCategories: string[];
  topPrompts: { title: string; sales: number }[];
}

// --- Wings SVG ---

function Wings({
  className,
  color = "#c084fc",
}: {
  className?: string;
  color?: string;
}) {
  return (
    <svg
      viewBox="0 0 200 100"
      className={cn("h-full w-full opacity-80", className)}
      fill="none"
    >
      <path
        d="M100 80 C 110 70, 130 50, 180 20 C 170 30, 160 40, 150 50 C 160 40, 170 45, 190 30 C 170 50, 150 70, 110 90"
        stroke="url(#hp-wing-gr)"
        strokeWidth="3"
        strokeLinecap="round"
      />
      <path
        d="M100 85 C 110 75, 125 60, 160 45 C 150 55, 140 65, 130 70 C 140 60, 150 65, 170 55 C 150 75, 130 85, 110 95"
        stroke="url(#hp-wing-gr)"
        strokeWidth="3"
        strokeLinecap="round"
      />
      <path
        d="M100 90 C 105 85, 120 75, 140 70 C 135 75, 130 80, 125 85 C 135 80, 140 82, 150 75 C 135 88, 120 92, 105 98"
        stroke="url(#hp-wing-gr)"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path
        d="M100 80 C 90 70, 70 50, 20 20 C 30 30, 40 40, 50 50 C 40 40, 30 45, 10 30 C 30 50, 50 70, 90 90"
        stroke="url(#hp-wing-gl)"
        strokeWidth="3"
        strokeLinecap="round"
      />
      <path
        d="M100 85 C 90 75, 75 60, 40 45 C 50 55, 60 65, 70 70 C 60 60, 50 65, 30 55 C 50 75, 70 85, 90 95"
        stroke="url(#hp-wing-gl)"
        strokeWidth="3"
        strokeLinecap="round"
      />
      <path
        d="M100 90 C 95 85, 80 75, 60 70 C 65 75, 70 80, 75 85 C 65 80, 60 82, 50 75 C 65 88, 80 92, 95 98"
        stroke="url(#hp-wing-gl)"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <defs>
        <linearGradient
          id="hp-wing-gr"
          x1="100"
          y1="80"
          x2="190"
          y2="20"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor={color} />
          <stop offset="1" stopColor="#ec4899" />
        </linearGradient>
        <linearGradient
          id="hp-wing-gl"
          x1="100"
          y1="80"
          x2="10"
          y2="20"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor={color} />
          <stop offset="1" stopColor="#ec4899" />
        </linearGradient>
      </defs>
    </svg>
  );
}

// --- Helpers ---

function countryToFlag(code: string): string {
  return code
    .toUpperCase()
    .split("")
    .map((c) => String.fromCodePoint(0x1f1e6 + c.charCodeAt(0) - 65))
    .join("");
}

const PODIUM_ORDER = [3, 1, 0, 2, 4];

function getRankConfig(rank: number) {
  if (rank === 1)
    return {
      height: "h-80",
      width: "w-56 md:w-64",
      avatarSize: "w-24 h-24",
      gradient: "from-fuchsia-600 to-purple-900",
      border: "border-pink-500 shadow-[0_0_30px_-5px_rgba(236,72,153,0.3)]",
      badgeBg: "bg-gradient-to-r from-purple-500 to-pink-500",
      wingColor: "#ec4899",
      nameSize: "text-lg",
    };
  if (rank === 2 || rank === 3)
    return {
      height: "h-72",
      width: "w-48 md:w-56",
      avatarSize: "w-20 h-20",
      gradient: "from-purple-800 to-indigo-900",
      border: "border-purple-500/30",
      badgeBg: "bg-indigo-600",
      wingColor: "#a855f7",
      nameSize: "text-base",
    };
  return {
    height: "h-64",
    width: "w-44 md:w-48",
    avatarSize: "w-16 h-16",
    gradient: "from-purple-900/80 to-slate-900",
    border: "border-purple-500/30",
    badgeBg: "bg-indigo-600",
    wingColor: "#a855f7",
    nameSize: "text-sm",
  };
}

// --- Podium Card ---

function PodiumCard({ seller, rank }: { seller: Seller; rank: number }) {
  const config = getRankConfig(rank);

  return (
    <Link href={`/seller/${seller.userId}`} className="block">
      <div
        className={cn(
          "relative flex flex-col items-center justify-between rounded-xl border bg-gradient-to-b text-white transition-transform hover:-translate-y-1 duration-300",
          config.gradient,
          config.border,
          config.height,
          config.width,
        )}
      >
        <div className="flex flex-col items-center w-full pt-6 relative z-10">
          <div className="flex items-center gap-1.5 mb-2">
            <span
              className={cn(
                "font-semibold tracking-wide truncate max-w-[90%]",
                config.nameSize,
              )}
            >
              {seller.displayName}
            </span>
            {seller.country && (
              <span className="text-sm leading-none" title={seller.country}>
                {countryToFlag(seller.country)}
              </span>
            )}
          </div>

          <div className="relative flex items-center justify-center mb-3">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-24 -z-10">
              <Wings color={config.wingColor} />
            </div>
            <Avatar
              className={cn(
                "border-2 border-white/20 shadow-xl",
                config.avatarSize,
              )}
            >
              <AvatarImage src={seller.avatar} alt={seller.displayName} />
              <AvatarFallback className="bg-slate-800 text-white font-bold">
                {seller.displayName.substring(0, 2)}
              </AvatarFallback>
            </Avatar>
          </div>

          <Badge
            className={cn(
              "px-4 py-1 text-sm font-bold shadow-lg border-0 text-white",
              config.badgeBg,
            )}
          >
            #{rank}
          </Badge>
        </div>

        <div className="w-full text-center pb-6 space-y-1">
          <div className="flex items-center justify-center gap-1 text-xs text-slate-400">
            <Star className="w-3 h-3 fill-purple-400 text-purple-400" />
            <span>{seller.avgRating.toFixed(1)}</span>
            <span className="text-slate-500">({seller.totalReviews})</span>
          </div>
          <p className="text-sm font-medium">
            المبيعات:{" "}
            <span className="text-white font-bold">{seller.totalSales}</span>
          </p>
        </div>

        {rank === 1 && (
          <div className="absolute inset-0 rounded-xl bg-gradient-to-b from-transparent to-pink-500/10 pointer-events-none" />
        )}
      </div>
    </Link>
  );
}

// --- Skeleton ---

function PodiumSkeleton() {
  const heights = ["h-64", "h-72", "h-80", "h-72", "h-64"];
  const widths = [
    "w-44 md:w-48",
    "w-48 md:w-56",
    "w-56 md:w-64",
    "w-48 md:w-56",
    "w-44 md:w-48",
  ];

  return (
    <div className="flex items-end justify-center gap-2 md:gap-4 overflow-x-auto pb-4">
      {heights.map((h, i) => (
        <div
          key={i}
          className={cn(
            "rounded-xl border border-purple-500/20 bg-gradient-to-b from-purple-900/40 to-slate-900 animate-pulse shrink-0",
            h,
            widths[i],
          )}
        >
          <div className="flex flex-col items-center pt-8 gap-3">
            <Skeleton className="h-4 w-20 bg-slate-800" />
            <Skeleton className="w-20 h-20 rounded-full bg-slate-800" />
            <Skeleton className="h-6 w-16 rounded-full bg-slate-800" />
          </div>
        </div>
      ))}
    </div>
  );
}

// --- Main Component ---

export default function FeaturedSellers() {
  const [sellers, setSellers] = useState<Seller[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchSellers() {
      try {
        const res = await fetch("/api/sellers?sortBy=sales&limit=5");
        if (!res.ok) throw new Error("فشل في تحميل البيانات");
        const json = await res.json();
        setSellers(json.data);
      } catch {
        setError("حدث خطأ في تحميل البائعين");
      } finally {
        setLoading(false);
      }
    }
    fetchSellers();
  }, []);

  return (
    <section className="py-16 bg-[#05050f] relative overflow-hidden">
      {/* Decorative Background */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-purple-500/5 rounded-full blur-[100px]" />
        <div className="absolute bottom-0 left-1/4 w-[500px] h-[500px] bg-pink-500/3 rounded-full blur-[100px]" />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        {/* Section Header */}
        <div className="mb-8">
          <h2 className="flex items-center gap-2 text-3xl font-bold text-white tracking-tight">
            <ChevronRight className="h-6 w-6 text-purple-400 stroke-3" />
            <span className="text-purple-400">أفضل</span> البائعين
          </h2>
          <p className="mt-2 text-slate-400 text-sm">
            البائعون الأكثر مبيعاً على المنصة
          </p>
        </div>

        {/* Error State */}
        {error && (
          <div className="text-center py-12">
            <p className="text-slate-400 mb-4">{error}</p>
            <Button
              variant="outline"
              onClick={() => window.location.reload()}
            >
              <RefreshCw className="w-4 h-4 ml-2" />
              إعادة المحاولة
            </Button>
          </div>
        )}

        {/* Loading State */}
        {loading && !error && <PodiumSkeleton />}

        {/* Podium */}
        {!loading && !error && (
          <>
            {sellers.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-slate-400">لا يوجد بائعين حالياً</p>
              </div>
            ) : sellers.length >= 5 ? (
              <div className="overflow-x-auto pb-4">
                <div className="flex items-end justify-center gap-2 md:gap-4 min-w-[700px] md:min-w-0 mx-auto">
                  {PODIUM_ORDER.map((idx) => (
                    <PodiumCard
                      key={sellers[idx].userId}
                      seller={sellers[idx]}
                      rank={idx + 1}
                    />
                  ))}
                </div>
              </div>
            ) : (
              <div className="flex items-end justify-center gap-4 overflow-x-auto pb-4">
                {sellers.map((seller, idx) => (
                  <PodiumCard
                    key={seller.userId}
                    seller={seller}
                    rank={idx + 1}
                  />
                ))}
              </div>
            )}

            {/* View Full Ranking CTA */}
            <div className="mt-10 flex justify-center">
              <Button
                asChild
                variant="outline"
                size="lg"
                className="border-purple-500/30 bg-[#1f1f2e] text-purple-400 hover:bg-purple-500/10 hover:text-purple-300 hover:border-purple-400 px-8 py-3 text-base font-medium rounded-full transition-all shadow-[0_0_15px_-5px_rgba(168,85,247,0.3)] hover:shadow-[0_0_20px_-3px_rgba(168,85,247,0.5)]"
              >
                <Link href="/ranking">
                  عرض الترتيب الكامل
                  <ChevronRight className="mr-2 h-5 w-5 rotate-180" />
                </Link>
              </Button>
            </div>
          </>
        )}
      </div>
    </section>
  );
}
