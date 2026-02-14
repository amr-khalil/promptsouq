"use client";

import { Button } from "@/components/ui/button";
import { Check, ChevronRight, Shield, Star } from "lucide-react";
import Link from "next/link";

// --- Mock Data for Featured Sellers ---
const FEATURED_SELLERS = [
  {
    id: "1",
    name: "أحمد محمد",
    tier: "ذهبي",
    rating: 4.9,
    reviews: 387,
    verified: true,
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Ahmed&backgroundColor=b6e3f4",
    categories: ["ChatGPT", "Midjourney"],
    gradient: "from-purple-500/20 to-blue-500/5",
  },
  {
    id: "2",
    name: "فاطمة علي",
    tier: "ذهبي",
    rating: 4.9,
    reviews: 524,
    verified: true,
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Fatima&backgroundColor=c0aede",
    categories: ["DALL-E", "Claude"],
    gradient: "from-blue-500/20 to-cyan-500/5",
  },
  {
    id: "3",
    name: "محمد صالح",
    tier: "ذهبي",
    rating: 4.8,
    reviews: 892,
    verified: true,
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Mohamed&backgroundColor=ffdfbf",
    categories: ["Gemini", "ChatGPT"],
    gradient: "from-pink-500/20 to-rose-500/5",
  },
  {
    id: "4",
    name: "سارة خالد",
    tier: "ذهبي",
    rating: 5.0,
    reviews: 456,
    verified: true,
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sara&backgroundColor=d4f1f4",
    categories: ["Midjourney", "DALL-E"],
    gradient: "from-amber-500/20 to-orange-500/5",
  },
  {
    id: "5",
    name: "عمر حسن",
    tier: "ذهبي",
    rating: 4.7,
    reviews: 312,
    verified: true,
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Omar&backgroundColor=ffd5dc",
    categories: ["Claude", "Gemini"],
    gradient: "from-green-500/20 to-emerald-500/5",
  },
  {
    id: "6",
    name: "نور الدين",
    tier: "ذهبي",
    rating: 4.9,
    reviews: 678,
    verified: true,
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Nour&backgroundColor=c7ceea",
    categories: ["ChatGPT", "DALL-E"],
    gradient: "from-indigo-500/20 to-violet-500/5",
  },
  {
    id: "7",
    name: "ليلى أحمد",
    tier: "ذهبي",
    rating: 4.8,
    reviews: 543,
    verified: true,
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Layla&backgroundColor=ffeaa7",
    categories: ["Midjourney", "Claude"],
    gradient: "from-teal-500/20 to-cyan-500/5",
  },
  {
    id: "8",
    name: "يوسف كريم",
    tier: "ذهبي",
    rating: 5.0,
    reviews: 234,
    verified: true,
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Youssef&backgroundColor=dfe6e9",
    categories: ["Gemini", "Midjourney"],
    gradient: "from-rose-500/20 to-pink-500/5",
  },
];

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

const CategoryItem = ({ name }: { name: string }) => (
  <div className="flex items-center gap-2 group cursor-pointer justify-end">
    <span className="text-xs text-slate-400 font-medium group-hover:text-slate-200 transition-colors">
      {name}
    </span>
    <div className="w-2 h-2 rounded-full bg-[#fbbf24] group-hover:scale-110 transition-transform" />
  </div>
);

interface Seller {
  id: string;
  name: string;
  tier: string;
  rating: number;
  reviews: number;
  verified: boolean;
  avatar: string;
  categories: string[];
  gradient: string;
}

const SellerCard = ({ seller }: { seller: Seller }) => {
  return (
    <div className="group relative w-full rounded-2xl border border-slate-800 bg-[#161b26] p-4 transition-all duration-300 hover:border-slate-600 hover:shadow-2xl hover:shadow-indigo-500/10 hover:-translate-y-1 overflow-hidden">
      {/* Dynamic Hover Gradient Background */}
      <div
        className={`absolute inset-0 bg-gradient-to-br ${seller.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none`}
      />

      {/* Header: Tier & Rating */}
      <div className="relative z-10 flex justify-between items-start mb-6">
        <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-300 bg-slate-900/50 px-2 py-1 rounded-full border border-slate-800/50">
          <span className="text-white">{seller.rating}</span>
          <span className="text-slate-500">({seller.reviews})</span>
          <Star className="w-3 h-3 fill-[#fbbf24] text-[#fbbf24]" />
        </div>

        <Badge className="bg-[#fbbf24] text-black shadow-[0_0_10px_rgba(251,191,36,0.3)]">
          {seller.tier}
        </Badge>
      </div>

      {/* Identity: Avatar & Name */}
      <div className="relative z-10 flex flex-col items-center mb-6">
        <div className="relative mb-3 group-hover:scale-105 transition-transform duration-300">
          {/* Avatar Ring */}
          <div className="absolute -inset-1 rounded-full bg-gradient-to-b from-slate-700 to-slate-900" />
          <img
            src={seller.avatar}
            alt={seller.name}
            className="relative w-[72px] h-[72px] rounded-full border-[3px] border-[#161b26] bg-slate-800 object-cover"
          />
          {/* Verified Checkmark Badge */}
          {seller.verified && (
            <div className="absolute bottom-0 left-0 -translate-x-1 translate-y-1 bg-[#161b26] p-[2px] rounded-full">
              <div className="bg-green-500 rounded-full p-[2px]">
                <Check className="w-2.5 h-2.5 text-black stroke-[4]" />
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center gap-1.5">
          <h3 className="text-white font-bold text-lg tracking-tight group-hover:text-[#fbbf24] transition-colors">
            {seller.name}
          </h3>
          {seller.verified && (
            <Shield className="w-3.5 h-3.5 text-green-500 fill-green-500/10" />
          )}
        </div>
      </div>

      {/* Content: Top Categories */}
      <div className="relative z-10">
        <div className="flex items-center gap-2 mb-3">
          <div className="h-px bg-gradient-to-l from-transparent via-slate-700 to-transparent flex-1" />
          <span className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold">
            التصنيفات الأكثر مبيعاً
          </span>
          <div className="h-px bg-gradient-to-r from-transparent via-slate-700 to-transparent flex-1" />
        </div>

        <div className="space-y-2.5 pr-2">
          {seller.categories.map((category, idx) => (
            <CategoryItem key={`${seller.id}-${category}-${idx}`} name={category} />
          ))}
          {/* Add one more for visual balance */}
          {seller.categories[0] && (
            <CategoryItem name={seller.categories[0]} />
          )}
        </div>
      </div>
    </div>
  );
};

// --- Main Component ---

export default function FeaturedSellers() {
  return (
    <section className="py-16 bg-[#0B0E14] relative overflow-hidden">
      {/* Decorative Background Elements */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-indigo-600/10 rounded-full blur-[100px]" />
        <div className="absolute bottom-0 left-1/4 w-[500px] h-[500px] bg-purple-600/5 rounded-full blur-[100px]" />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        {/* Section Header */}
        <div className="mb-8">
          <h2 className="flex items-center gap-2 text-3xl font-bold text-white tracking-tight">
            <ChevronRight className="h-6 w-6 text-yellow-500 stroke-3" />
            <span className="text-yellow-400">بائعين</span> مميزين
          </h2>
          <div className="mt-3 flex gap-6 text-sm font-medium text-slate-400">
            <button className="text-yellow-400 border-b-2 border-yellow-400 pb-1 hover:text-yellow-300 transition-colors">
              الأعلى تقييماً.
            </button>
            <button className="hover:text-white transition-colors pb-1 border-b-2 border-transparent hover:border-slate-700">
              الأكثر مبيعاً.
            </button>
          </div>
        </div>

        {/* Card Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {FEATURED_SELLERS.map((seller) => (
            <SellerCard key={seller.id} seller={seller} />
          ))}
        </div>

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
