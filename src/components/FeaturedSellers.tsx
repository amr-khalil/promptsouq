"use client";

import { Button } from "@/components/ui/button";
import { Check, ChevronRight, Loader2, RefreshCw, Shield, ShoppingCart, Star } from "lucide-react";
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

// --- Gaming Card Shell (Yellow) ---

const clipPathStyle = {
  clipPath: `polygon(
    0% 20px,
    4px 12px,
    12px 4px,
    20px 0%,
    calc(100% - 20px) 0%,
    calc(100% - 12px) 4px,
    calc(100% - 4px) 12px,
    100% 20px,
    100% calc(100% - 18px),
    calc(100% - 18px) 100%,
    18px 100%,
    0% calc(100% - 18px)
  )`,
};

const GamingSellerCard = ({ children }: { children: React.ReactNode }) => (
  <div className="relative group drop-shadow-[0_0_0_1px_rgba(251,191,36,0.5)] transition-transform hover:-translate-y-1 h-full">
    {/* Outer Border Layer (Yellow #fbbf24) */}
    <div className="absolute inset-0 bg-[#fbbf24]" style={clipPathStyle} />

    {/* Inner Content Layer */}
    <div
      className="relative h-full bg-[#161b26] text-card-foreground"
      style={{
        ...clipPathStyle,
        margin: "2px",
        height: "calc(100% - 4px)",
        width: "calc(100% - 4px)",
      }}
    >
      {children}
    </div>
  </div>
);

// --- Sub-Components ---

const Badge = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) => (
  <span
    className={`px-2 py-0.5 text-[10px] font-bold rounded-[4px] uppercase tracking-wide flex items-center justify-center ${className}`}
  >
    {children}
  </span>
);

function tierBadgeClass(tier: string): string {
  switch (tier) {
    case "ذهبي":
      return "bg-[#fbbf24] text-black shadow-[0_0_10px_rgba(251,191,36,0.3)]";
    case "فضي":
      return "bg-slate-300 text-slate-900 shadow-[0_0_10px_rgba(148,163,184,0.3)]";
    default:
      return "bg-amber-700 text-amber-100 shadow-[0_0_10px_rgba(180,83,9,0.2)]";
  }
}

function rankBadgeClass(rank: number): string {
  if (rank === 1) return "bg-[#fbbf24] text-black";
  if (rank === 2) return "bg-slate-300 text-slate-900";
  if (rank === 3) return "bg-amber-700 text-amber-100";
  return "bg-slate-700 text-slate-300";
}

function countryToFlag(code: string): string {
  return code
    .toUpperCase()
    .split("")
    .map((c) => String.fromCodePoint(0x1f1e6 + c.charCodeAt(0) - 65))
    .join("");
}

const SellerCard = ({ seller, rank }: { seller: Seller; rank: number }) => {
  return (
    <Link href={`/seller/${seller.userId}`} className="block h-full">
      <GamingSellerCard>
        <div className="p-4 flex flex-col h-full">
          {/* Header: Rank + Rating | Tier */}
          <div className="flex justify-between items-start mb-5">
            <div className="flex items-center gap-2">
              {/* Rank Badge */}
              <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-black ${rankBadgeClass(rank)}`}>
                #{rank}
              </span>
              <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-300 bg-slate-900/50 px-2 py-1 rounded-full border border-slate-800/50">
                <span className="text-white">{seller.avgRating}</span>
                <span className="text-slate-500">({seller.totalReviews})</span>
                <Star className="w-3 h-3 fill-[#fbbf24] text-[#fbbf24]" />
              </div>
            </div>

            <Badge className={tierBadgeClass(seller.tier)}>
              {seller.tier}
            </Badge>
          </div>

          {/* Identity: Avatar & Name */}
          <div className="flex flex-col items-center mb-5">
            <div className="relative mb-3 group-hover:scale-105 transition-transform duration-300">
              <div className="absolute -inset-1 rounded-full bg-gradient-to-b from-[#fbbf24]/40 to-slate-900" />
              <img
                src={seller.avatar}
                alt={seller.displayName}
                className="relative w-[72px] h-[72px] rounded-full border-[3px] border-[#161b26] bg-slate-800 object-cover"
              />
              <div className="absolute bottom-0 left-0 -translate-x-1 translate-y-1 bg-[#161b26] p-[2px] rounded-full">
                <div className="bg-green-500 rounded-full p-[2px]">
                  <Check className="w-2.5 h-2.5 text-black stroke-[4]" />
                </div>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              <h3 className="text-white font-bold text-lg tracking-tight group-hover:text-[#fbbf24] transition-colors">
                {seller.displayName}
              </h3>
              {seller.country && (
                <span className="text-base leading-none" title={seller.country}>
                  {countryToFlag(seller.country)}
                </span>
              )}
              <Shield className="w-3.5 h-3.5 text-green-500 fill-green-500/10" />
            </div>
          </div>

          {/* Top Prompts by Sales */}
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-3">
              <div className="h-px bg-gradient-to-l from-transparent via-[#fbbf24]/30 to-transparent flex-1" />
              <span className="text-[10px] uppercase tracking-wider text-[#fbbf24]/70 font-semibold">
                الأكثر مبيعاً
              </span>
              <div className="h-px bg-gradient-to-r from-transparent via-[#fbbf24]/30 to-transparent flex-1" />
            </div>

            <div className="space-y-2 pr-1">
              {seller.topPrompts.map((prompt, idx) => (
                <div key={idx} className="flex items-center gap-2 justify-end">
                  <span className="text-[11px] text-slate-400 font-medium truncate flex-1 text-right">
                    {prompt.title}
                  </span>
                  <div className="flex items-center gap-1 shrink-0 text-[10px] text-[#fbbf24]/80 font-bold">
                    <span>{prompt.sales}</span>
                    <ShoppingCart className="w-2.5 h-2.5" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </GamingSellerCard>
    </Link>
  );
};

const SkeletonCard = () => (
  <div className="relative h-full">
    <div className="absolute inset-0 bg-[#fbbf24]/30 animate-pulse" style={clipPathStyle} />
    <div
      className="relative h-full bg-[#161b26]"
      style={{
        ...clipPathStyle,
        margin: "2px",
        height: "calc(100% - 4px)",
        width: "calc(100% - 4px)",
      }}
    >
      <div className="p-4 animate-pulse">
        <div className="flex justify-between items-start mb-5">
          <div className="h-6 w-20 bg-slate-800 rounded-full" />
          <div className="h-5 w-12 bg-slate-800 rounded" />
        </div>
        <div className="flex flex-col items-center mb-5">
          <div className="w-[72px] h-[72px] rounded-full bg-slate-800 mb-3" />
          <div className="h-5 w-24 bg-slate-800 rounded" />
        </div>
        <div className="space-y-2">
          <div className="h-3 w-full bg-slate-800 rounded" />
          <div className="h-3 w-3/4 bg-slate-800 rounded ms-auto" />
          <div className="h-3 w-2/3 bg-slate-800 rounded ms-auto" />
        </div>
      </div>
    </div>
  </div>
);

// --- Main Component ---

export default function FeaturedSellers() {
  const [sellers, setSellers] = useState<Seller[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"rating" | "sales">("rating");

  const fetchSellers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/sellers?sortBy=${activeTab}&limit=8`);
      if (!res.ok) throw new Error("فشل في تحميل البيانات");
      const json = await res.json();
      setSellers(json.data);
    } catch {
      setError("حدث خطأ في تحميل البائعين");
    } finally {
      setLoading(false);
    }
  }, [activeTab]);

  useEffect(() => {
    fetchSellers();
  }, [fetchSellers]);

  return (
    <section className="py-16 bg-[#0B0E14] relative overflow-hidden">
      {/* Decorative Background Elements */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-[#fbbf24]/5 rounded-full blur-[100px]" />
        <div className="absolute bottom-0 left-1/4 w-[500px] h-[500px] bg-[#fbbf24]/3 rounded-full blur-[100px]" />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        {/* Section Header */}
        <div className="mb-8">
          <h2 className="flex items-center gap-2 text-3xl font-bold text-white tracking-tight">
            <ChevronRight className="h-6 w-6 text-yellow-500 stroke-3" />
            <span className="text-yellow-400">بائعين</span> مميزين
          </h2>
          <div className="mt-3 flex gap-6 text-sm font-medium text-slate-400">
            <button
              onClick={() => setActiveTab("rating")}
              className={`pb-1 border-b-2 transition-colors ${
                activeTab === "rating"
                  ? "text-yellow-400 border-yellow-400 hover:text-yellow-300"
                  : "border-transparent hover:text-white hover:border-slate-700"
              }`}
            >
              الأعلى تقييماً.
            </button>
            <button
              onClick={() => setActiveTab("sales")}
              className={`pb-1 border-b-2 transition-colors ${
                activeTab === "sales"
                  ? "text-yellow-400 border-yellow-400 hover:text-yellow-300"
                  : "border-transparent hover:text-white hover:border-slate-700"
              }`}
            >
              الأكثر مبيعاً.
            </button>
          </div>
        </div>

        {/* Error State */}
        {error && (
          <div className="text-center py-12">
            <p className="text-slate-400 mb-4">{error}</p>
            <Button variant="outline" onClick={fetchSellers}>
              <RefreshCw className="w-4 h-4 ml-2" />
              إعادة المحاولة
            </Button>
          </div>
        )}

        {/* Loading State */}
        {loading && !error && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        )}

        {/* Card Grid */}
        {!loading && !error && (
          <>
            {sellers.length === 0 ? (
              <div className="text-center py-12">
                <Loader2 className="w-8 h-8 text-slate-500 mx-auto mb-4" />
                <p className="text-slate-400">لا يوجد بائعين حالياً</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {sellers.map((seller, index) => (
                  <SellerCard key={seller.userId} seller={seller} rank={index + 1} />
                ))}
              </div>
            )}
          </>
        )}

        {/* Show More Button */}
        <div className="text-center mt-8">
          <Button size="lg" variant="outline" asChild>
            <Link href="/market">عرض جميع البائعين</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
