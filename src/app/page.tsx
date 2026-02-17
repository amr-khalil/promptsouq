"use client";

import { BestSellersCarousel } from "@/components/BestSellersCarousel";
import { FeaturedBanner } from "@/components/FeaturedBanner";
import FeaturedSellers from "@/components/FeaturedSellers";
import { FreePromptsCarousel } from "@/components/FreePromptsCarousel";
import Hero from "@/components/Hero";
import HowToSell from "@/components/HowToSell";
import { NewArrivalsGrid } from "@/components/NewArrivalsGrid";
import { Button } from "@/components/ui/button";
import { TESTIMONIALS } from "@/lib/constants";
import type { Category, Prompt } from "@/lib/schemas/api";
import {
  Briefcase,
  Check,
  ChevronRight,
  Crown,
  GraduationCap,
  Image,
  MessageSquare,
  Palette,
  PenTool,
  Sparkles,
  Star,
  StarHalf,
  Sword,
  TrendingUp,
  Zap,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

interface PlanData {
  id: string;
  nameAr: string;
  monthlyCredits: number;
  monthlyPrice: number;
  features: string[];
  theme: string;
  icon: string;
  sortOrder: number;
}

const planIconMap: Record<string, React.ElementType> = {
  Sword,
  Zap,
  Crown,
};

const planThemes: Record<
  string,
  {
    borderColor: string;
    glowShadow: string;
    accentText: string;
    checkColor: string;
    buttonBg: string;
    buttonText: string;
    buttonHover: string;
    cornerBorder: string;
    footerHoverBg: string;
    arrowColor: string;
  }
> = {
  blue: {
    borderColor: "border-blue-500",
    glowShadow: "shadow-[0_0_30px_rgba(59,130,246,0.3)]",
    accentText: "text-blue-400",
    checkColor: "text-blue-400",
    buttonBg: "bg-blue-500",
    buttonText: "text-white",
    buttonHover: "hover:bg-blue-600",
    cornerBorder: "border-blue-500/50",
    footerHoverBg: "group-hover:bg-blue-500/10",
    arrowColor: "text-blue-400",
  },
  green: {
    borderColor: "border-[#7f0df2]",
    glowShadow: "shadow-[0_0_40px_rgba(127,13,242,0.4)]",
    accentText: "text-[#7f0df2]",
    checkColor: "text-[#7f0df2]",
    buttonBg: "bg-[#7f0df2]",
    buttonText: "text-black",
    buttonHover: "hover:bg-[#7f0df2]",
    cornerBorder: "border-[#7f0df2]/50",
    footerHoverBg: "group-hover:bg-[#7f0df2]/10",
    arrowColor: "text-[#7f0df2]",
  },
  purple: {
    borderColor: "border-[#faff00]",
    glowShadow: "shadow-[0_0_30px_rgba(250,255,0,0.25)]",
    accentText: "text-[#faff00]",
    checkColor: "text-[#faff00]",
    buttonBg: "bg-[#faff00]",
    buttonText: "text-black",
    buttonHover: "hover:bg-[#e0e500]",
    cornerBorder: "border-[#faff00]/50",
    footerHoverBg: "group-hover:bg-[#faff00]/10",
    arrowColor: "text-[#faff00]",
  },
};

const iconMap: Record<string, React.ElementType> = {
  MessageSquare,
  Image,
  Palette,
  Briefcase,
  GraduationCap,
  TrendingUp,
  PenTool,
  Sparkles,
};

function RatingStars({ rating }: { rating: number }) {
  const fullStars = Math.floor(rating);
  const hasHalf = rating % 1 !== 0;
  return (
    <div className="flex items-center gap-1">
      {Array.from({ length: fullStars }).map((_, i) => (
        <Star key={i} className="h-4 w-4 fill-[#faff00] text-[#faff00]" />
      ))}
      {hasHalf && (
        <StarHalf className="h-4 w-4 fill-[#faff00] text-[#faff00]" />
      )}
    </div>
  );
}

export default function Home() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [trendingPrompts, setTrendingPrompts] = useState<Prompt[]>([]);
  const [freePrompts, setFreePrompts] = useState<Prompt[]>([]);
  const [newPrompts, setNewPrompts] = useState<Prompt[]>([]);
  const [plans, setPlans] = useState<PlanData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeFilter, setActiveFilter] = useState("الكل");

  useEffect(() => {
    async function fetchData() {
      try {
        const [categoriesRes, promptsRes, freeRes, newRes, plansRes] =
          await Promise.all([
            fetch("/api/categories"),
            fetch("/api/prompts?sortBy=bestselling&limit=8"),
            fetch("/api/prompts?priceType=free&limit=10"),
            fetch("/api/prompts?sortBy=newest&limit=8"),
            fetch("/api/subscription/plans"),
          ]);

        if (!categoriesRes.ok || !promptsRes.ok || !freeRes.ok || !newRes.ok) {
          throw new Error("فشل في تحميل البيانات");
        }

        const [categoriesData, promptsData, freeData, newData] =
          await Promise.all([
            categoriesRes.json(),
            promptsRes.json(),
            freeRes.json(),
            newRes.json(),
          ]);

        setCategories(categoriesData.data);
        setTrendingPrompts([...promptsData.data]);
        setFreePrompts(freeData.data ?? []);
        setNewPrompts(newData.data ?? []);

        if (plansRes.ok) {
          const plansData = await plansRes.json();
          setPlans(plansData.data ?? []);
        }
      } catch {
        setError("حدث خطأ أثناء تحميل البيانات. يرجى المحاولة مرة أخرى.");
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  if (error) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <p className="text-destructive text-lg mb-4">{error}</p>
        <Button onClick={() => window.location.reload()}>إعادة المحاولة</Button>
      </div>
    );
  }

  return (
    <div>
      <Hero />

      {/* Best Sellers Carousel */}
      <BestSellersCarousel prompts={trendingPrompts} loading={loading} />

      {/* Free Prompts Carousel */}
      <FreePromptsCarousel prompts={freePrompts} loading={loading} />

      {/* Featured Banner + Category Cards */}
      <FeaturedBanner />

      {/* New Arrivals Grid */}
      <NewArrivalsGrid prompts={newPrompts} loading={loading} />

      {/* Pricing Section */}
      {plans.length > 0 && (
        <section className="py-16 bg-[#0f0f0f]">
          <div className="container mx-auto px-4">
            <div className="mb-10 text-center">
              <h2 className="text-3xl font-bold text-white mb-2 flex items-center justify-center gap-2">
                <span className="w-2 h-8 bg-[#faff00] rounded-full block" />
                خطط الاشتراك
              </h2>
              <p className="mt-3 text-sm text-gray-400">
                اختر الخطة المناسبة واحصل على رصيد شهري لتوليد المحتوى بالذكاء
                الاصطناعي
              </p>
            </div>

            <div className="mx-auto grid max-w-5xl grid-cols-1 gap-6 md:grid-cols-3 items-center">
              {[...plans]
                .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0))
                .map((plan, index) => {
                  const Icon = planIconMap[plan.icon] ?? Sword;
                  const theme = planThemes[plan.theme] ?? planThemes.blue;
                  const displayPrice = (plan.monthlyPrice / 100)
                    .toFixed(2)
                    .replace(/\.00$/, "");
                  const isPopular = index === 1;

                  return (
                    <div
                      key={plan.id}
                      className={`group relative bg-[#1a1a20] tech-clip-both flex flex-col overflow-hidden transition-all duration-500 ${
                        isPopular
                          ? `md:scale-105 z-10 ${theme.glowShadow}`
                          : "md:scale-95 md:opacity-90 hover:opacity-100"
                      }`}
                    >
                      {/* Popular badge */}
                      {isPopular && (
                        <div className="absolute top-0 left-1/2 -translate-x-1/2 z-20">
                          <div
                            className={`px-4 py-1 text-xs font-bold ${theme.accentText} bg-black/60 backdrop-blur-sm border-b ${theme.cornerBorder}`}
                          >
                            الأكثر شيوعاً
                          </div>
                        </div>
                      )}

                      {/* Decorative Corners */}
                      <div
                        className={`absolute top-0 right-0 w-16 h-16 border-t-2 border-r-2 ${theme.cornerBorder} rounded-tr-lg opacity-30 group-hover:opacity-100 group-hover:w-full group-hover:h-full transition-all duration-700 pointer-events-none`}
                      />
                      <div
                        className={`absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 ${theme.cornerBorder} opacity-30 group-hover:opacity-100 transition-all pointer-events-none`}
                      />

                      {/* Circuit overlay */}
                      <div className="absolute inset-0 bg-circuit opacity-10 group-hover:opacity-20 transition-opacity" />

                      {/* Content */}
                      <div className="relative z-10 flex-1 flex flex-col p-6 pt-8">
                        {/* Icon + Plan Name */}
                        <div className="flex items-center gap-3 mb-6">
                          <div
                            className={`rounded-lg bg-white/5 p-2.5 border ${theme.cornerBorder}`}
                          >
                            <Icon className={`h-5 w-5 ${theme.accentText}`} />
                          </div>
                          <h3 className="text-lg font-bold text-white">
                            {plan.nameAr}
                          </h3>
                        </div>

                        {/* Credits */}
                        <div className="text-center mb-2">
                          <span
                            className={`text-4xl font-bold ${theme.accentText}`}
                          >
                            {plan.monthlyCredits}
                          </span>
                          <span className="text-gray-400 text-sm me-1">
                            {" "}
                            رصيد / شهر
                          </span>
                        </div>

                        {/* Price */}
                        <div className="text-center mb-6">
                          <span className="text-3xl font-extrabold text-white">
                            ${displayPrice}
                          </span>
                          <span className="text-gray-400 text-sm">/شهرياً</span>
                        </div>

                        {/* Divider */}
                        <div className="border-t border-white/5 mb-4" />

                        {/* Features */}
                        <ul className="flex flex-col gap-3 mb-6">
                          {(plan.features as string[])
                            .slice(0, 3)
                            .map((feature) => (
                              <li
                                key={feature}
                                className="flex items-start gap-2 text-sm text-gray-300"
                              >
                                <Check
                                  className={`mt-0.5 h-4 w-4 shrink-0 ${theme.checkColor}`}
                                />
                                <span>{feature}</span>
                              </li>
                            ))}
                        </ul>

                        {/* Subscribe Button */}
                        <div className="mt-auto">
                          <Button
                            asChild
                            className={`w-full font-bold ${theme.buttonBg} ${theme.buttonText} ${theme.buttonHover}`}
                          >
                            <Link href="/subscription">اشترك الآن</Link>
                          </Button>
                        </div>
                      </div>

                      {/* Footer Strip */}
                      <div
                        className={`bg-black/40 backdrop-blur-sm p-3 border-t border-white/5 flex justify-between items-center ${theme.footerHoverBg} transition-colors`}
                      >
                        <span className="text-[10px] text-gray-500 font-mono tracking-wider">
                          PLAN.{plan.id.slice(0, 6).toUpperCase()}
                        </span>
                        <ChevronRight
                          className={`w-4 h-4 ${theme.arrowColor} rotate-180 group-hover:-translate-x-1 transition-transform`}
                        />
                      </div>
                    </div>
                  );
                })}
            </div>

            <div className="mt-8 flex justify-center">
              <Button
                asChild
                variant="outline"
                size="lg"
                className="border-[#7f0df2]/30 bg-[#18181b] text-[#7f0df2] hover:bg-[#7f0df2]/10 hover:text-white hover:border-[#7f0df2] px-8 py-3 text-base font-medium rounded-full transition-all hover:shadow-[0_0_15px_rgba(127,13,242,0.3)]"
              >
                <Link href="/subscription">
                  عرض جميع الخطط
                  <ChevronRight className="mr-2 h-5 w-5 rotate-180" />
                </Link>
              </Button>
            </div>
          </div>
        </section>
      )}

      {/* Featured Sellers */}
      <FeaturedSellers />

      {/* How To Sell */}
      <HowToSell />

      {/* Testimonials Carousel */}
      <section className="py-16 bg-[#0f0f0f] overflow-hidden">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-white mb-2 flex items-center justify-center gap-2">
              <span className="w-2 h-8 bg-[#faff00] rounded-full block" />
              ماذا يقول عملاؤنا
            </h2>
            <p className="text-gray-400 text-sm">
              آراء المستخدمين الذين جربوا منصتنا
            </p>
          </div>
        </div>

        <div className="group/marquee relative" dir="ltr">
          {/* Fade edges */}
          <div className="absolute left-0 top-0 bottom-0 w-20 bg-gradient-to-r from-[#0f0f0f] to-transparent z-10 pointer-events-none" />
          <div className="absolute right-0 top-0 bottom-0 w-20 bg-gradient-to-l from-[#0f0f0f] to-transparent z-10 pointer-events-none" />

          <div className="flex w-max animate-marquee group-hover/marquee:paused">
            {Array.from({ length: 2 }).map((_, setIndex) =>
              TESTIMONIALS.map((testimonial) => (
                <div
                  key={`${setIndex}-${testimonial.id}`}
                  className="w-[320px] mx-3 shrink-0"
                  dir="rtl"
                >
                  <div className="group relative bg-[#1a1a20] tech-clip-both border border-white/5 hover:border-[#7f0df2]/50 p-6 h-full transition-all duration-300 hover:shadow-[0_0_20px_rgba(127,13,242,0.2)]">
                    {/* Circuit overlay */}
                    <div className="absolute inset-0 bg-circuit opacity-5 group-hover:opacity-15 transition-opacity pointer-events-none" />

                    <div className="relative z-10">
                      {/* Stars */}
                      <div className="mb-4">
                        <RatingStars rating={testimonial.rating} />
                      </div>

                      {/* Quote */}
                      <p className="text-gray-300 text-sm mb-5 leading-relaxed line-clamp-4">
                        &ldquo;{testimonial.content}&rdquo;
                      </p>

                      {/* Author */}
                      <div className="flex items-center gap-3 border-t border-white/5 pt-4">
                        <img
                          src={testimonial.avatar}
                          alt={testimonial.name}
                          className="w-10 h-10 rounded-full object-cover ring-2 ring-[#7f0df2]/30"
                        />
                        <div>
                          <div className="font-bold text-white text-sm">
                            {testimonial.name}
                          </div>
                          <div className="text-xs text-gray-500">
                            {testimonial.role}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )),
            )}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-purple-600 to-blue-600 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-5xl font-bold mb-6">
            هل أنت مستعد للبدء؟
          </h2>
          <p className="text-xl mb-8 opacity-90">
            انضم إلى آلاف المستخدمين الذين يستفيدون من برومبتات الذكاء الاصطناعي
          </p>
          <Button size="lg" variant="secondary" className="text-lg" asChild>
            <Link href="/signup">إنشاء حساب مجاني</Link>
          </Button>
        </div>
      </section>
    </div>
  );
}
