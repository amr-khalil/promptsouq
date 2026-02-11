"use client";

import { PromptCard } from "@/components/PromptCard";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { categories, prompts, testimonials } from "@/data/mockData";
import {
  Briefcase,
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

const iconMap: Record<string, any> = {
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
  const trendingPrompts = prompts.slice(0, 6);

  return (
    <div>
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-950/20 dark:to-blue-950/20 py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              سوق البرومبتات العربي
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-blue-600">
                PromptSouq
              </span>
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground mb-8">
              اشترِ وبيع برومبتات قوية للذكاء الاصطناعي بسهولة
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" asChild className="text-lg">
                <Link href="/market">
                  <ShoppingBag className="ml-2 h-5 w-5" />
                  تسوق الآن
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild className="text-lg">
                <Link href="/seller">
                  <Zap className="ml-2 h-5 w-5" />
                  ابدأ البيع
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-16 container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            الفئات الشائعة
          </h2>
          <p className="text-muted-foreground text-lg">
            استكشف برومبتات متنوعة لجميع احتياجاتك
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {categories.map((category) => {
            const Icon = iconMap[category.icon] || Sparkles;
            return (
              <Link key={category.id} href={`/market?category=${category.id}`}>
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
      </section>

      {/* Trending Prompts */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              البرومبتات الرائجة
            </h2>
            <p className="text-muted-foreground text-lg">
              الأكثر مبيعاً هذا الأسبوع
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {trendingPrompts.map((prompt) => (
              <PromptCard key={prompt.id} prompt={prompt} />
            ))}
          </div>

          <div className="text-center mt-8">
            <Button size="lg" variant="outline" asChild>
              <Link href="/market">عرض جميع البرومبتات</Link>
            </Button>
          </div>
        </div>
      </section>

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
            {testimonials.map((testimonial) => (
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
                    "{testimonial.content}"
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
