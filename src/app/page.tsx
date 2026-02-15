"use client";

import FeaturedSellers from "@/components/FeaturedSellers";
import { GamingPromptCard } from "@/components/GamingPromptCard";
import Hero from "@/components/Hero";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import type { Category, Prompt, Testimonial } from "@/lib/schemas/api";
import {
  Briefcase,
  ChevronRight,
  GraduationCap,
  Image,
  MessageSquare,
  Palette,
  PenTool,
  Search,
  ShoppingBag,
  Sparkles,
  Star,
  TrendingUp,
  Zap,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

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

export default function Home() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [trendingPrompts, setTrendingPrompts] = useState<Prompt[]>([]);
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeFilter, setActiveFilter] = useState("الكل");

  useEffect(() => {
    async function fetchData() {
      try {
        const [categoriesRes, promptsRes, testimonialsRes] = await Promise.all([
          fetch("/api/categories"),
          fetch("/api/prompts?sortBy=bestselling&limit=8"),
          fetch("/api/testimonials"),
        ]);

        if (!categoriesRes.ok || !promptsRes.ok || !testimonialsRes.ok) {
          throw new Error("فشل في تحميل البيانات");
        }

        const [categoriesData, promptsData, testimonialsData] =
          await Promise.all([
            categoriesRes.json(),
            promptsRes.json(),
            testimonialsRes.json(),
          ]);

        setCategories(categoriesData.data);
        setTrendingPrompts([...promptsData.data]);
        setTestimonials(testimonialsData.data);
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
      {/* Categories Section */}
      {/* <section className="py-16 container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            الفئات الشائعة
          </h2>
          <p className="text-muted-foreground text-lg">
            استكشف برومبتات متنوعة لجميع احتياجاتك
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {loading
            ? Array.from({ length: 8 }).map((_, i) => (
                <Card key={i}>
                  <CardContent className="p-6 text-center">
                    <Skeleton className="w-12 h-12 mx-auto mb-3 rounded-full" />
                    <Skeleton className="h-4 w-20 mx-auto mb-1" />
                    <Skeleton className="h-3 w-16 mx-auto" />
                  </CardContent>
                </Card>
              ))
            : categories.map((category) => {
                const Icon = iconMap[category.icon] || Sparkles;
                return (
                  <Link
                    key={category.id}
                    href={`/market?category=${category.id}`}
                  >
                    <Card className="hover:shadow-lg transition-all hover:scale-105 cursor-pointer">
                      <CardContent className="p-6 text-center">
                        <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-primary/10 flex items-center justify-center">
                          <Icon className="h-6 w-6 text-primary" />
                        </div>
                        <h3 className="font-bold mb-1">{category.name}</h3>
                        <p className="text-sm text-muted-foreground">
                          {category.count} برومبت
                        </p>
                      </CardContent>
                    </Card>
                  </Link>
                );
              })}
        </div>
      </section> */}

      {/* Featured Prompts - Gaming Style */}
      <section className="py-16 bg-[#0f0f16]">
        <div className="container mx-auto px-4">
          {/* Header Section */}
          <div className="mb-8 flex flex-col justify-between gap-6 md:flex-row md:items-end">
            <div>
              <h2 className="flex items-center gap-2 text-3xl font-bold text-white tracking-tight">
                <ChevronRight className="h-6 w-6 text-yellow-500 stroke-3" />
                <span className="text-yellow-400">أوامر</span> مميزة
              </h2>
              <div className="mt-3 flex gap-6 text-sm font-medium text-slate-400">
                <button className="text-yellow-400 border-b-2 border-yellow-400 pb-1 hover:text-yellow-300 transition-colors">
                  جديد.
                </button>
                <button className="hover:text-white transition-colors pb-1 border-b-2 border-transparent hover:border-slate-700">
                  الأكثر مشاهدة.
                </button>
              </div>
            </div>

            {/* Filter Pills */}
            <div className="flex flex-wrap gap-2">
              {[
                "الكل",
                "كتابة إبداعية",
                "تصميم جرافيك",
                "تطوير برمجيات",
                "تسويق رقمي",
                "إنتاجية",
              ].map((filter) => (
                <Badge
                  key={filter}
                  onClick={() => setActiveFilter(filter)}
                  className={`cursor-pointer px-5 py-2 text-sm font-medium rounded-full transition-all border-0
                      ${
                        activeFilter === filter
                          ? "bg-yellow-500 text-black hover:bg-yellow-400 shadow-[0_0_15px_-3px_rgba(234,179,8,0.5)]"
                          : "bg-[#1f1f2e] text-slate-400 hover:bg-[#2a2a3d] hover:text-white"
                      }`}
                >
                  {filter}
                </Badge>
              ))}
            </div>
          </div>

          {/* Products Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {loading
              ? Array.from({ length: 8 }).map((_, i) => (
                  <Card key={i} className="overflow-hidden bg-[#161621]">
                    <Skeleton className="h-44 w-full" />
                    <CardContent className="p-4">
                      <Skeleton className="h-5 w-16 mb-2" />
                      <Skeleton className="h-4 w-full mb-2" />
                      <Skeleton className="h-3 w-full mb-3" />
                      <Skeleton className="h-3 w-24 mb-3" />
                      <div className="flex items-center justify-between">
                        <Skeleton className="h-5 w-16" />
                        <Skeleton className="h-8 w-16" />
                      </div>
                    </CardContent>
                  </Card>
                ))
              : trendingPrompts.map((prompt) => (
                  <GamingPromptCard key={prompt.id} prompt={prompt} />
                ))}
          </div>

          {/* Show More Button */}
          <div className="mt-10 flex justify-center">
            <Button
              asChild
              variant="outline"
              size="lg"
              className="border-yellow-500/30 bg-[#1f1f2e] text-yellow-400 hover:bg-yellow-500/10 hover:text-yellow-300 hover:border-yellow-400 px-8 py-3 text-base font-medium rounded-full transition-all shadow-[0_0_15px_-5px_rgba(234,179,8,0.3)] hover:shadow-[0_0_20px_-3px_rgba(234,179,8,0.5)]"
            >
              <Link href="/market">
                عرض المزيد
                <ChevronRight className="mr-2 h-5 w-5 rotate-180" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Featured Sellers */}
      <FeaturedSellers />

      {/* How It Works */}
      <section className="py-16 container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">كيف يعمل؟</h2>
          <p className="text-muted-foreground text-lg">
            ثلاث خطوات بسيطة للبدء
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          <Card>
            <CardContent className="p-8 text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                <Search className="h-8 w-8 text-purple-600" />
              </div>
              <h3 className="font-bold text-xl mb-3">١. تصفح</h3>
              <p className="text-muted-foreground">
                ابحث عن البرومبت المناسب من بين مئات البرومبتات المتاحة في مختلف
                الفئات
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-8 text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                <ShoppingBag className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="font-bold text-xl mb-3">٢. شراء / بيع</h3>
              <p className="text-muted-foreground">
                اشتر برومبتات احترافية أو ابدأ ببيع إبداعاتك الخاصة بسهولة وأمان
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-8 text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                <Zap className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="font-bold text-xl mb-3">٣. استخدام</h3>
              <p className="text-muted-foreground">
                استخدم البرومبتات مع أدوات الذكاء الاصطناعي المفضلة لديك واحصل
                على نتائج مذهلة
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              ماذا يقول عملاؤنا
            </h2>
            <p className="text-muted-foreground text-lg">
              آراء المستخدمين الذين جربوا منصتنا
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {loading
              ? Array.from({ length: 3 }).map((_, i) => (
                  <Card key={i}>
                    <CardContent className="p-6">
                      <Skeleton className="h-4 w-24 mb-4" />
                      <Skeleton className="h-3 w-full mb-2" />
                      <Skeleton className="h-3 w-3/4 mb-4" />
                      <div className="flex items-center gap-3">
                        <Skeleton className="w-10 h-10 rounded-full" />
                        <div>
                          <Skeleton className="h-4 w-20 mb-1" />
                          <Skeleton className="h-3 w-16" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              : testimonials.map((testimonial) => (
                  <Card key={testimonial.id}>
                    <CardContent className="p-6">
                      <div className="flex items-center gap-1 mb-4">
                        {[...Array(testimonial.rating)].map((_, i) => (
                          <Star
                            key={i}
                            className="h-4 w-4 fill-yellow-400 text-yellow-400"
                          />
                        ))}
                      </div>
                      <p className="text-muted-foreground mb-4">
                        &ldquo;{testimonial.content}&rdquo;
                      </p>
                      <div className="flex items-center gap-3">
                        <img
                          src={testimonial.avatar}
                          alt={testimonial.name}
                          className="w-10 h-10 rounded-full object-cover"
                        />
                        <div>
                          <div className="font-bold">{testimonial.name}</div>
                          <div className="text-sm text-muted-foreground">
                            {testimonial.role}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
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
