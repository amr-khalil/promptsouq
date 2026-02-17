"use client";

import { ReviewForm } from "@/components/reviews/ReviewForm";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import type { Prompt, Review } from "@/lib/schemas/api";
import {
  AlertCircle,
  Calendar,
  Check,
  Copy,
  Lock,
  Star,
  Tag,
} from "lucide-react";
import Image from "next/image";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";

interface PurchaseDetail extends Prompt {
  purchasedAt: string;
}

export default function PurchaseDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [data, setData] = useState<PurchaseDetail | null>(null);
  const [userReview, setUserReview] = useState<Review | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<{ status: number; message: string } | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    async function fetchData() {
      try {
        const [purchaseRes, reviewRes] = await Promise.all([
          fetch(`/api/purchase/${id}`),
          fetch(`/api/user/reviews?promptId=${id}`),
        ]);

        if (!purchaseRes.ok) {
          const json = await purchaseRes.json();
          setError({
            status: purchaseRes.status,
            message: json.error?.message ?? json.error ?? "حدث خطأ",
          });
          return;
        }

        const purchaseJson = await purchaseRes.json();
        setData(purchaseJson.data);

        if (reviewRes.ok) {
          const reviewJson = await reviewRes.json();
          setUserReview(reviewJson.data);
        }
      } catch {
        setError({ status: 500, message: "حدث خطأ أثناء تحميل البيانات" });
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [id]);

  const handleCopy = async () => {
    if (!data?.fullContent) return;
    try {
      await navigator.clipboard.writeText(data.fullContent);
      setCopied(true);
      toast.success("تم نسخ البرومبت بنجاح!");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("فشل في نسخ البرومبت");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        {error.status === 403 ? (
          <>
            <Lock className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
            <h2 className="text-xl font-bold mb-2">غير مصرح بالوصول</h2>
            <p className="text-muted-foreground">{error.message}</p>
          </>
        ) : (
          <>
            <AlertCircle className="h-16 w-16 mx-auto text-destructive mb-4" />
            <h2 className="text-xl font-bold mb-2">خطأ</h2>
            <p className="text-muted-foreground">{error.message}</p>
          </>
        )}
      </div>
    );
  }

  if (!data) return null;

  const purchaseDate = new Date(data.purchasedAt).toLocaleDateString("ar-SA", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  // Highlight [PLACEHOLDERS] in prompt content
  const highlightedContent = data.fullContent?.replace(
    /\[([^\]]+)\]/g,
    '<span class="bg-primary/20 text-primary font-bold px-1 rounded">[$1]</span>',
  );

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Prompt Template */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>البرومبت</CardTitle>
                <Button
                  onClick={handleCopy}
                  variant={copied ? "default" : "outline"}
                  size="sm"
                >
                  {copied ? (
                    <>
                      <Check className="ml-2 h-4 w-4" />
                      تم النسخ
                    </>
                  ) : (
                    <>
                      <Copy className="ml-2 h-4 w-4" />
                      نسخ البرومبت
                    </>
                  )}
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {data.fullContent ? (
                <div
                  className="bg-muted p-4 rounded-lg text-sm leading-relaxed whitespace-pre-wrap font-mono"
                  dangerouslySetInnerHTML={{
                    __html: highlightedContent ?? "",
                  }}
                />
              ) : (
                <p className="text-muted-foreground">
                  لا يوجد محتوى للبرومبت
                </p>
              )}
            </CardContent>
          </Card>

          {/* Instructions */}
          {data.instructions && (
            <Card>
              <CardHeader>
                <CardTitle>تعليمات الاستخدام</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-sm leading-relaxed whitespace-pre-wrap">
                  {data.instructions}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Example Outputs */}
          {data.samples.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>أمثلة على المخرجات</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {data.samples.map((sample, i) => (
                    <div
                      key={i}
                      className="bg-muted p-4 rounded-lg text-sm leading-relaxed"
                    >
                      {sample}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Prompt Info */}
          <Card>
            <CardContent className="p-6">
              <div className="relative w-full aspect-video rounded-lg overflow-hidden mb-4">
                <Image
                  src={data.thumbnail}
                  alt={data.title}
                  fill
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 33vw"
                />
              </div>
              <h1 className="text-lg font-bold mb-2">{data.title}</h1>
              <p className="text-sm text-muted-foreground mb-4">
                {data.description}
              </p>

              <div className="flex items-center gap-2 mb-3">
                <Badge>{data.aiModel}</Badge>
                <Badge variant="outline">{data.difficulty}</Badge>
              </div>

              <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
                <div className="flex items-center gap-1">
                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  <span>{data.rating}</span>
                  <span>({data.reviews} تقييم)</span>
                </div>
              </div>

              <Separator className="my-3" />

              {/* Seller Info */}
              <div className="flex items-center gap-3">
                <div className="relative w-10 h-10 rounded-full overflow-hidden">
                  <Image
                    src={data.seller.avatar}
                    alt={data.seller.name}
                    fill
                    className="object-cover"
                    sizes="40px"
                  />
                </div>
                <div>
                  <p className="font-bold text-sm">{data.seller.name}</p>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                    <span>{data.seller.rating}</span>
                  </div>
                </div>
              </div>

              <Separator className="my-3" />

              {/* Purchase Info */}
              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                <Calendar className="h-4 w-4" />
                <span>تم الشراء في {purchaseDate}</span>
              </div>

              {/* Tags */}
              {data.tags.length > 0 && (
                <>
                  <Separator className="my-3" />
                  <div className="flex flex-wrap gap-2">
                    {data.tags.map((tag) => (
                      <Badge key={tag} variant="secondary" className="text-xs">
                        <Tag className="ml-1 h-3 w-3" />
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Review Form */}
          <ReviewForm
            promptId={id}
            existingReview={userReview}
            onReviewSaved={setUserReview}
          />
        </div>
      </div>
    </div>
  );
}
