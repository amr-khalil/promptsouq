"use client";

import { GamingPromptCard } from "@/components/GamingPromptCard";
import { Button } from "@/components/ui/button";
import type { Prompt } from "@/lib/schemas/api";
import {
  BookOpen,
  Globe,
  Heart,
  MessageSquare,
  RefreshCw,
  ShoppingCart,
  Star,
  Trophy,
} from "lucide-react";
import { notFound, useParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

interface SellerProfile {
  userId: string;
  displayName: string;
  avatar: string;
  bio: string | null;
  country: string | null;
  totalSales: number;
  totalReviews: number;
  avgRating: number;
  promptCount: number;
  totalFavorites: number;
  tier: string;
  topCategories: string[];
  joinedAt: string;
}

function tierBadgeClass(tier: string): string {
  switch (tier) {
    case "ذهبي":
      return "bg-[#fbbf24] text-black";
    case "فضي":
      return "bg-slate-300 text-slate-900";
    default:
      return "bg-amber-700 text-amber-100";
  }
}

const countryNames: Record<string, string> = {
  SA: "السعودية",
  EG: "مصر",
  AE: "الإمارات",
  JO: "الأردن",
  MA: "المغرب",
  KW: "الكويت",
  QA: "قطر",
  BH: "البحرين",
  OM: "عُمان",
  TN: "تونس",
};

export default function SellerStorefrontPage() {
  const { sellerId } = useParams<{ sellerId: string }>();
  const [seller, setSeller] = useState<SellerProfile | null>(null);
  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [is404, setIs404] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [sellerRes, promptsRes] = await Promise.all([
        fetch(`/api/sellers/${sellerId}`),
        fetch(`/api/prompts?sellerId=${sellerId}&limit=100`),
      ]);

      if (sellerRes.status === 404) {
        setIs404(true);
        return;
      }

      if (!sellerRes.ok || !promptsRes.ok) {
        throw new Error("فشل في تحميل البيانات");
      }

      const sellerJson = await sellerRes.json();
      const promptsJson = await promptsRes.json();

      setSeller(sellerJson.data);
      setPrompts(promptsJson.data);
    } catch {
      setError("حدث خطأ في تحميل بيانات البائع");
    } finally {
      setLoading(false);
    }
  }, [sellerId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  if (is404) {
    notFound();
  }

  if (loading) {
    return null; // loading.tsx handles this
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#0B0E14] flex items-center justify-center">
        <div className="text-center">
          <p className="text-slate-400 mb-4">{error}</p>
          <Button variant="outline" onClick={fetchData}>
            <RefreshCw className="w-4 h-4 ml-2" />
            إعادة المحاولة
          </Button>
        </div>
      </div>
    );
  }

  if (!seller) return null;

  const stats = [
    { label: "البرومبتات", value: seller.promptCount, icon: BookOpen },
    { label: "المبيعات", value: seller.totalSales, icon: ShoppingCart },
    { label: "المراجعات", value: seller.totalReviews, icon: MessageSquare },
    { label: "المفضلة", value: seller.totalFavorites, icon: Heart },
    { label: "التقييم", value: seller.avgRating.toFixed(1), icon: Star },
    {
      label: "الدولة",
      value: seller.country ? (countryNames[seller.country] ?? seller.country) : "—",
      icon: Globe,
    },
  ];

  return (
    <div className="min-h-screen bg-[#0B0E14]">
      <div className="container mx-auto px-4 py-8">
        {/* Profile Header */}
        <div className="flex flex-col items-center text-center mb-10">
          <div className="relative mb-4">
            <div className="absolute -inset-1 rounded-full bg-gradient-to-b from-slate-700 to-slate-900" />
            <img
              src={seller.avatar}
              alt={seller.displayName}
              className="relative w-24 h-24 rounded-full border-[3px] border-[#0B0E14] bg-slate-800 object-cover"
            />
          </div>

          <h1 className="text-2xl font-bold text-white mb-1">
            {seller.displayName}
          </h1>

          {seller.country && (
            <span className="text-sm text-slate-400 mb-2">
              {countryNames[seller.country] ?? seller.country}
            </span>
          )}

          <span
            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold mb-3 ${tierBadgeClass(seller.tier)}`}
          >
            <Trophy className="w-3.5 h-3.5" />
            {seller.tier}
          </span>

          {seller.bio && (
            <p className="text-slate-400 text-sm max-w-md">{seller.bio}</p>
          )}
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-10">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="rounded-xl border border-slate-800 bg-[#161b26] p-4 text-center hover:border-slate-700 transition-colors"
            >
              <div className="flex items-center justify-center gap-1.5 text-slate-400 mb-1">
                <stat.icon className="w-4 h-4" />
                <span className="text-xs font-medium">{stat.label}</span>
              </div>
              <div className="text-xl font-bold text-white">{stat.value}</div>
            </div>
          ))}
        </div>

        {/* Prompts Section */}
        <div className="mb-6">
          <h2 className="text-xl font-bold text-white mb-6">
            برومبتات البائع ({seller.promptCount})
          </h2>

          {prompts.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-slate-400">لا توجد برومبتات حالياً</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {prompts.map((prompt) => (
                <GamingPromptCard key={prompt.id} prompt={prompt} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
