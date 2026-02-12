"use client";

import { PromptCard } from "@/components/PromptCard";
import { ImageWithFallback } from "@/components/figma/ImageWithFallback";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { Prompt, Review } from "@/lib/schemas/api";
import { useCartStore } from "@/stores/cart-store";
import { useAuth } from "@clerk/nextjs";
import {
  CheckCircle2,
  Heart,
  Share2,
  ShoppingCart,
  Star,
} from "lucide-react";
import Link from "next/link";
import { notFound, useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export default function PromptDetails() {
  const { id } = useParams();
  const router = useRouter();
  const [prompt, setPrompt] = useState<Prompt | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [relatedPrompts, setRelatedPrompts] = useState<Prompt[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [purchased, setPurchased] = useState(false);
  const { addItem, isInCart } = useCartStore();
  const { isSignedIn } = useAuth();

  function handleAddToCart() {
    if (!prompt) return;
    if (isInCart(prompt.id)) {
      toast.info("هذا المنتج موجود بالفعل في السلة");
      return;
    }
    addItem({
      promptId: prompt.id,
      title: prompt.title,
      price: prompt.price,
      thumbnail: prompt.thumbnail,
    });
    toast.success("تمت الإضافة إلى السلة");
  }

  function handleBuyNow() {
    if (!prompt) return;
    if (!isInCart(prompt.id)) {
      addItem({
        promptId: prompt.id,
        title: prompt.title,
        price: prompt.price,
        thumbnail: prompt.thumbnail,
      });
    }
    toast.success("جارٍ التوجيه للدفع...");
    router.push("/checkout");
  }

  useEffect(() => {
    async function fetchData() {
      try {
        const [promptRes, reviewsRes, relatedRes] = await Promise.all([
          fetch(`/api/prompts/${id}`),
          fetch(`/api/prompts/${id}/reviews`),
          fetch(`/api/prompts/${id}/related`),
        ]);

        if (promptRes.status === 404) {
          notFound();
          return;
        }

        if (!promptRes.ok) {
          throw new Error("فشل في تحميل البيانات");
        }

        const [promptData, reviewsData, relatedData] = await Promise.all([
          promptRes.json(),
          reviewsRes.json(),
          relatedRes.json(),
        ]);

        setPrompt(promptData.data);
        setReviews(reviewsData.data || []);
        setRelatedPrompts(relatedData.data || []);
      } catch {
        setError("حدث خطأ أثناء تحميل البيانات");
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [id]);

  useEffect(() => {
    if (!isSignedIn || !id) return;
    fetch(`/api/user/purchases?promptId=${id}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.purchased) setPurchased(true);
      })
      .catch(() => {});
  }, [isSignedIn, id]);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Skeleton className="h-4 w-48 mb-6" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <Skeleton className="aspect-video rounded-lg mb-6" />
            <Skeleton className="h-8 w-3/4 mb-4" />
            <Skeleton className="h-4 w-48 mb-6" />
            <Skeleton className="h-16 w-full mb-8" />
            <Skeleton className="h-64 w-full" />
          </div>
          <div className="lg:col-span-1">
            <div className="border rounded-lg p-6">
              <Skeleton className="h-8 w-24 mb-4" />
              <Skeleton className="h-10 w-full mb-3" />
              <Skeleton className="h-10 w-full" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <p className="text-destructive text-lg mb-4">{error}</p>
        <Button onClick={() => window.location.reload()}>
          إعادة المحاولة
        </Button>
      </div>
    );
  }

  if (!prompt) return null;

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <div className="text-sm text-muted-foreground mb-6">
        <Link href="/" className="hover:text-foreground">
          الرئيسية
        </Link>
        {" / "}
        <Link href="/market" className="hover:text-foreground">
          السوق
        </Link>
        {" / "}
        <span className="text-foreground">{prompt.title}</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2">
          {/* Image */}
          <div className="aspect-video rounded-lg overflow-hidden mb-6 bg-muted">
            <ImageWithFallback
              src={prompt.thumbnail}
              alt={prompt.title}
              className="w-full h-full object-cover"
            />
          </div>

          {/* Title and Seller */}
          <div className="mb-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h1 className="text-3xl font-bold mb-2">{prompt.title}</h1>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`h-4 w-4 ${
                          i < Math.floor(prompt.rating)
                            ? "fill-yellow-400 text-yellow-400"
                            : "text-muted-foreground/30"
                        }`}
                      />
                    ))}
                    <span className="mr-1 font-bold">{prompt.rating}</span>
                    <span className="text-muted-foreground">
                      ({prompt.reviews} تقييم)
                    </span>
                  </div>
                  <span className="text-muted-foreground">
                    {prompt.sales} مبيعات
                  </span>
                </div>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="icon">
                  <Heart className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="icon">
                  <Share2 className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Seller Info */}
            <div className="flex items-center gap-3 p-4 border rounded-lg">
              <Avatar className="h-12 w-12">
                <AvatarImage src={prompt.seller.avatar} />
                <AvatarFallback>{prompt.seller.name[0]}</AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <div className="font-bold">{prompt.seller.name}</div>
                <div className="text-sm text-muted-foreground flex items-center gap-1">
                  <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                  {prompt.seller.rating} تقييم البائع
                </div>
              </div>
              <Button variant="outline" size="sm">
                عرض الملف
              </Button>
            </div>
          </div>

          {/* Tabs */}
          <Tabs defaultValue="description" className="mb-8">
            <TabsList className="w-full justify-start">
              <TabsTrigger value="description">الوصف</TabsTrigger>
              <TabsTrigger value="samples">أمثلة</TabsTrigger>
              <TabsTrigger value="reviews">التقييمات</TabsTrigger>
            </TabsList>

            <TabsContent value="description" className="mt-6">
              <div className="space-y-4">
                <div>
                  <h3 className="font-bold mb-2">عن هذا البرومبت</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    {prompt.description}
                  </p>
                </div>

                <Separator />

                <div>
                  <h3 className="font-bold mb-2">حالات الاستخدام</h3>
                  <ul className="space-y-2">
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-5 w-5 text-green-600 shrink-0 mt-0.5" />
                      <span className="text-muted-foreground">
                        مثالي لإنشاء محتوى احترافي في دقائق
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-5 w-5 text-green-600 shrink-0 mt-0.5" />
                      <span className="text-muted-foreground">
                        يوفر الوقت والجهد في العمليات الإبداعية
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-5 w-5 text-green-600 shrink-0 mt-0.5" />
                      <span className="text-muted-foreground">
                        نتائج قابلة للتخصيص حسب احتياجاتك
                      </span>
                    </li>
                  </ul>
                </div>

                <Separator />

                <div>
                  <h3 className="font-bold mb-2">النموذج الموصى به</h3>
                  <p className="text-muted-foreground">{prompt.aiModel}</p>
                </div>

                {purchased && prompt.fullContent && (
                  <>
                    <Separator />
                    <div>
                      <h3 className="font-bold mb-2">محتوى البرومبت الكامل</h3>
                      <div className="bg-muted p-4 rounded-lg font-mono text-sm whitespace-pre-wrap">
                        {prompt.fullContent}
                      </div>
                    </div>
                  </>
                )}
              </div>
            </TabsContent>

            <TabsContent value="samples" className="mt-6">
              {prompt.samples.length > 0 ? (
                <div className="space-y-4">
                  {prompt.samples.map((sample, index) => (
                    <Card key={index}>
                      <CardContent className="p-4">
                        <div className="text-sm font-mono bg-muted p-4 rounded">
                          {sample}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  لا توجد أمثلة متاحة
                </div>
              )}
            </TabsContent>

            <TabsContent value="reviews" className="mt-6">
              <div className="space-y-4">
                {reviews.map((review) => (
                  <Card key={review.id}>
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <Avatar>
                          <AvatarImage src={review.userAvatar} />
                          <AvatarFallback>{review.userName[0]}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-1">
                            <div className="font-bold">{review.userName}</div>
                            <div className="text-sm text-muted-foreground">
                              {new Date(review.date).toLocaleDateString(
                                "ar-SA",
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-1 mb-2">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`h-3 w-3 ${
                                  i < review.rating
                                    ? "fill-yellow-400 text-yellow-400"
                                    : "text-muted-foreground/30"
                                }`}
                              />
                            ))}
                          </div>
                          <p className="text-muted-foreground text-sm">
                            {review.comment}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-1">
          <div className="sticky top-20">
            <Card>
              <CardContent className="p-6">
                <div className="mb-6">
                  <div className="text-3xl font-bold mb-2">${prompt.price}</div>
                  <div className="flex flex-wrap gap-2 mb-4">
                    <Badge>{prompt.aiModel}</Badge>
                    <Badge variant="outline">{prompt.difficulty}</Badge>
                    {purchased && (
                      <Badge className="bg-green-600 text-white">
                        <CheckCircle2 className="h-3 w-3 ml-1" />
                        تم الشراء
                      </Badge>
                    )}
                  </div>
                </div>

                {!purchased && (
                  <div className="space-y-3">
                    <Button className="w-full" size="lg" onClick={handleBuyNow}>
                      <ShoppingCart className="ml-2 h-5 w-5" />
                      شراء الآن
                    </Button>
                    <Button
                      className="w-full"
                      size="lg"
                      variant="outline"
                      onClick={handleAddToCart}
                    >
                      إضافة للسلة
                    </Button>
                  </div>
                )}

                <Separator className="my-6" />

                <div className="space-y-3 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">الفئة:</span>
                    <Badge variant="secondary">{prompt.category}</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">المبيعات:</span>
                    <span className="font-bold">{prompt.sales}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">التقييم:</span>
                    <div className="flex items-center gap-1">
                      <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                      <span className="font-bold">{prompt.rating}</span>
                    </div>
                  </div>
                </div>

                <Separator className="my-6" />

                <div>
                  <h4 className="font-bold mb-3">الوسوم:</h4>
                  <div className="flex flex-wrap gap-2">
                    {prompt.tags.map((tag, index) => (
                      <Badge key={index} variant="outline">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Trust Badges */}
            <Card className="mt-4">
              <CardContent className="p-4">
                <div className="space-y-3 text-sm">
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-600 shrink-0 mt-0.5" />
                    <span className="text-muted-foreground">
                      دفع آمن ومضمون
                    </span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-600 shrink-0 mt-0.5" />
                    <span className="text-muted-foreground">
                      وصول فوري بعد الشراء
                    </span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-600 shrink-0 mt-0.5" />
                    <span className="text-muted-foreground">
                      ضمان استرداد لمدة 7 أيام
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Related Prompts */}
      {relatedPrompts.length > 0 && (
        <div className="mt-16">
          <h2 className="text-2xl font-bold mb-6">برومبتات ذات صلة</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {relatedPrompts.map((relatedPrompt) => (
              <PromptCard key={relatedPrompt.id} prompt={relatedPrompt} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
