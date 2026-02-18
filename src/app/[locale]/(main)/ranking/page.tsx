"use client";

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import {
  ChevronRight,
  RefreshCw,
  Star,
  Trophy,
} from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";

// --- Types ---

interface TopPrompt {
  title: string;
  sales: number;
}

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
  topPrompts: TopPrompt[];
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
      {/* Right wing */}
      <path
        d="M100 80 C 110 70, 130 50, 180 20 C 170 30, 160 40, 150 50 C 160 40, 170 45, 190 30 C 170 50, 150 70, 110 90"
        stroke="url(#wing-gr)"
        strokeWidth="3"
        strokeLinecap="round"
      />
      <path
        d="M100 85 C 110 75, 125 60, 160 45 C 150 55, 140 65, 130 70 C 140 60, 150 65, 170 55 C 150 75, 130 85, 110 95"
        stroke="url(#wing-gr)"
        strokeWidth="3"
        strokeLinecap="round"
      />
      <path
        d="M100 90 C 105 85, 120 75, 140 70 C 135 75, 130 80, 125 85 C 135 80, 140 82, 150 75 C 135 88, 120 92, 105 98"
        stroke="url(#wing-gr)"
        strokeWidth="2"
        strokeLinecap="round"
      />
      {/* Left wing */}
      <path
        d="M100 80 C 90 70, 70 50, 20 20 C 30 30, 40 40, 50 50 C 40 40, 30 45, 10 30 C 30 50, 50 70, 90 90"
        stroke="url(#wing-gl)"
        strokeWidth="3"
        strokeLinecap="round"
      />
      <path
        d="M100 85 C 90 75, 75 60, 40 45 C 50 55, 60 65, 70 70 C 60 60, 50 65, 30 55 C 50 75, 70 85, 90 95"
        stroke="url(#wing-gl)"
        strokeWidth="3"
        strokeLinecap="round"
      />
      <path
        d="M100 90 C 95 85, 80 75, 60 70 C 65 75, 70 80, 75 85 C 65 80, 60 82, 50 75 C 65 88, 80 92, 95 98"
        stroke="url(#wing-gl)"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <defs>
        <linearGradient
          id="wing-gr"
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
          id="wing-gl"
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

// Podium display order: rank4, rank2, rank1, rank3, rank5
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
        {/* Content */}
        <div className="flex flex-col items-center w-full pt-6 relative z-10">
          {/* Name + Country */}
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

          {/* Wings + Avatar */}
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

          {/* Rank Badge */}
          <Badge
            className={cn(
              "px-4 py-1 text-sm font-bold shadow-lg border-0 text-white",
              config.badgeBg,
            )}
          >
            #{rank}
          </Badge>
        </div>

        {/* Footer */}
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

        {/* Glow for rank 1 */}
        {rank === 1 && (
          <div className="absolute inset-0 rounded-xl bg-gradient-to-b from-transparent to-pink-500/10 pointer-events-none" />
        )}
      </div>
    </Link>
  );
}

// --- Skeleton Components ---

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

function TableSkeleton() {
  return (
    <>
      {Array.from({ length: 10 }).map((_, i) => (
        <TableRow key={i} className="border-slate-800/50">
          <TableCell>
            <Skeleton className="h-4 w-8 bg-slate-800" />
          </TableCell>
          <TableCell>
            <div className="flex items-center gap-3">
              <Skeleton className="h-8 w-8 rounded-md bg-slate-800" />
              <Skeleton className="h-4 w-24 bg-slate-800" />
            </div>
          </TableCell>
          <TableCell>
            <Skeleton className="h-4 w-10 bg-slate-800" />
          </TableCell>
          <TableCell>
            <Skeleton className="h-4 w-12 bg-slate-800" />
          </TableCell>
          <TableCell>
            <Skeleton className="h-4 w-8 bg-slate-800" />
          </TableCell>
        </TableRow>
      ))}
    </>
  );
}

// --- Main Component ---

export default function RankingPage() {
  const [sellers, setSellers] = useState<Seller[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<"sales" | "rating">("sales");

  const fetchSellers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/sellers?sortBy=${sortBy}&limit=20`);
      if (!res.ok) throw new Error("فشل في تحميل البيانات");
      const json = await res.json();
      setSellers(json.data);
    } catch {
      setError("حدث خطأ في تحميل الترتيب");
    } finally {
      setLoading(false);
    }
  }, [sortBy]);

  useEffect(() => {
    fetchSellers();
  }, [fetchSellers]);

  const podiumSellers = sellers.slice(0, 5);
  const tableSellers = sellers.slice(5);

  return (
    <div className="min-h-screen bg-[#05050f] text-slate-200">
      <div className="max-w-7xl mx-auto px-4 py-8 md:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-12">
          <h1 className="flex items-center gap-2 text-3xl font-bold text-white tracking-tight">
            <ChevronRight className="h-6 w-6 text-purple-400 stroke-3" />
            <span className="text-purple-400">ترتيب</span> البائعين
          </h1>
          <p className="mt-2 text-slate-400 text-sm">
            أفضل البائعين على المنصة حسب الأداء
          </p>
        </div>

        {/* Top 5 Podium */}
        <div className="relative mb-20 overflow-x-auto pb-4">
          {loading ? (
            <PodiumSkeleton />
          ) : error ? (
            <div className="text-center py-12">
              <p className="text-slate-400 mb-4">{error}</p>
              <Button variant="outline" onClick={fetchSellers}>
                <RefreshCw className="w-4 h-4 ml-2" />
                إعادة المحاولة
              </Button>
            </div>
          ) : podiumSellers.length >= 5 ? (
            <div className="flex items-end justify-center gap-2 md:gap-4 min-w-[700px] md:min-w-0 mx-auto">
              {PODIUM_ORDER.map((idx) => (
                <PodiumCard
                  key={podiumSellers[idx].userId}
                  seller={podiumSellers[idx]}
                  rank={idx + 1}
                />
              ))}
            </div>
          ) : (
            /* Less than 5 sellers — show what we have in a simpler row */
            <div className="flex items-end justify-center gap-4">
              {podiumSellers.map((seller, idx) => (
                <PodiumCard
                  key={seller.userId}
                  seller={seller}
                  rank={idx + 1}
                />
              ))}
            </div>
          )}
        </div>

        {/* Tabs */}
        <div className="flex justify-center mb-8 border-b border-slate-800">
          <div className="flex gap-8">
            <button
              onClick={() => setSortBy("sales")}
              className={cn(
                "pb-4 text-sm font-medium transition-colors relative",
                sortBy === "sales"
                  ? "text-white"
                  : "text-slate-500 hover:text-slate-300",
              )}
            >
              الأكثر مبيعاً
              {sortBy === "sales" && (
                <span className="absolute bottom-0 left-0 w-full h-0.5 bg-white rounded-t-full" />
              )}
            </button>
            <button
              onClick={() => setSortBy("rating")}
              className={cn(
                "pb-4 text-sm font-medium transition-colors relative",
                sortBy === "rating"
                  ? "text-white"
                  : "text-slate-500 hover:text-slate-300",
              )}
            >
              الأعلى تقييماً
              {sortBy === "rating" && (
                <span className="absolute bottom-0 left-0 w-full h-0.5 bg-white rounded-t-full" />
              )}
            </button>
          </div>
        </div>

        {/* Sellers Table */}
        {!error && (
          <Table className="text-slate-300">
            <TableHeader>
              <TableRow className="border-slate-800 text-slate-400 hover:bg-transparent">
                <TableHead className="text-slate-400 font-semibold w-24">
                  المرتبة
                </TableHead>
                <TableHead className="text-slate-400 font-semibold">
                  البائع
                </TableHead>
                <TableHead className="text-slate-400 font-semibold">
                  المبيعات
                </TableHead>
                <TableHead className="text-slate-400 font-semibold">
                  التقييم
                </TableHead>
                <TableHead className="text-slate-400 font-semibold">
                  البرومبتات
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableSkeleton />
              ) : (
                tableSellers.map((seller, idx) => {
                  const rank = idx + 6;
                  return (
                    <TableRow
                      key={seller.userId}
                      className="border-slate-800/50 hover:bg-slate-900/50"
                    >
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Trophy size={14} className="text-purple-500" />
                          <span className="font-bold text-white">{rank}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Link
                          href={`/seller/${seller.userId}`}
                          className="flex items-center gap-3 group"
                        >
                          <Avatar className="h-8 w-8 rounded-md border border-slate-700">
                            <AvatarImage
                              src={seller.avatar}
                              alt={seller.displayName}
                            />
                            <AvatarFallback className="bg-slate-800 text-xs rounded-md">
                              {seller.displayName.substring(0, 1)}
                            </AvatarFallback>
                          </Avatar>
                          <span className="font-medium text-slate-200 group-hover:text-purple-400 transition-colors underline decoration-slate-600 underline-offset-4 group-hover:decoration-purple-400/50">
                            {seller.displayName}
                          </span>
                          {seller.country && (
                            <span className="text-xs leading-none">
                              {countryToFlag(seller.country)}
                            </span>
                          )}
                        </Link>
                      </TableCell>
                      <TableCell className="text-white font-medium">
                        {seller.totalSales}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1.5 text-slate-300">
                          <Star
                            size={14}
                            className="text-purple-400 fill-purple-400"
                          />
                          <span>{seller.avgRating.toFixed(1)}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-slate-300">
                        {seller.promptCount}
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        )}
      </div>
    </div>
  );
}
