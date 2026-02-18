"use client";

import { FavoriteButton } from "@/components/dashboard/FavoriteButton";
import { GenerateButton } from "@/components/generation/GenerateButton";
import { LocaleLink } from "@/components/LocaleLink";
import { ContentLockOverlay } from "@/components/prompt/ContentLockOverlay";
import { PromptGallery } from "@/components/PromptGallery";
import { PromptGridCard } from "@/components/PromptGridCard";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { Prompt, Review } from "@/lib/schemas/api";
import { useCartStore } from "@/stores/cart-store";
import { useAuth } from "@/hooks/use-auth";
import { CheckCircle2, Share2, ShoppingCart, Star } from "lucide-react";
import {
  notFound,
  useParams,
  useRouter,
  useSearchParams,
} from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";

export default function PromptDetails() {
  const { t, i18n } = useTranslation(["prompt", "common"]);
  const { id } = useParams();
  const router = useRouter();
  const [prompt, setPrompt] = useState<Prompt | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [relatedPrompts, setRelatedPrompts] = useState<Prompt[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [purchased, setPurchased] = useState(false);
  const [isFavorited, setIsFavorited] = useState(false);
  const [creditBalance, setCreditBalance] = useState(0);
  const { addItem, isInCart } = useCartStore();
  const { isSignedIn } = useAuth();
  const searchParams = useSearchParams();

  // T038: Store referral source from ?ref= query param
  useEffect(() => {
    const ref = searchParams.get("ref");
    if (ref && id) {
      sessionStorage.setItem(`ref_${id}`, ref);
    }
  }, [searchParams, id]);

  function handleAddToCart() {
    if (!prompt) return;
    if (isInCart(prompt.id)) {
      toast.info(t("common:messages.alreadyInCart"));
      return;
    }
    addItem({
      promptId: prompt.id,
      title: prompt.title,
      price: prompt.price,
      thumbnail: prompt.thumbnail,
    });
    toast.success(t("common:messages.addedToCart"));
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
    toast.success(t("common:messages.redirectingCheckout"));
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
          throw new Error(t("common:errors.loadFailed"));
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
        setError(t("common:errors.loadFailed"));
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
    fetch(`/api/favorites/check?promptIds=${id}`)
      .then((res) => res.json())
      .then((json) => {
        if (json.data?.[id as string]) setIsFavorited(true);
      })
      .catch(() => {});
    fetch("/api/credits/balance")
      .then((res) => res.json())
      .then((data) => {
        if (typeof data.total === "number") setCreditBalance(data.total);
      })
      .catch(() => {});
  }, [isSignedIn, id]);

  // Track free prompt access (fire-and-forget)
  const accessTrackedRef = useRef(false);
  useEffect(() => {
    if (
      !isSignedIn ||
      !prompt?.isFree ||
      prompt.contentLocked ||
      accessTrackedRef.current
    )
      return;
    accessTrackedRef.current = true;
    fetch("/api/free-access", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ promptId: prompt.id }),
    }).catch(() => {});
  }, [isSignedIn, prompt]);

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
          {t("common:buttons.retry")}
        </Button>
      </div>
    );
  }

  if (!prompt) return null;

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <div className="text-sm text-muted-foreground mb-6">
        <LocaleLink href="/" className="hover:text-foreground">
          {t("common:nav.home")}
        </LocaleLink>
        {" / "}
        <LocaleLink href="/market" className="hover:text-foreground">
          {t("common:nav.market")}
        </LocaleLink>
        {" / "}
        <span className="text-foreground">{prompt.title}</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2">
          {/* Gallery */}
          <div className="mb-6">
            <PromptGallery
              images={
                prompt.gallery.length > 0
                  ? prompt.gallery.map((url, i) => ({
                      url,
                      alt: `${prompt.title} - ${i + 1}`,
                    }))
                  : [{ url: prompt.thumbnail, alt: prompt.title }]
              }
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
                      ({prompt.reviews} {t("prompt:sidebar.reviewCount")})
                    </span>
                  </div>
                  <span className="text-muted-foreground">
                    {prompt.sales} {t("common:labels.sales")}
                  </span>
                </div>
              </div>
              <div className="flex gap-2">
                <FavoriteButton
                  promptId={prompt.id}
                  isFavorited={isFavorited}
                />
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
                  {prompt.seller.rating} {t("prompt:sidebar.sellerRating")}
                </div>
              </div>
              <Button variant="outline" size="sm">
                {t("prompt:sidebar.viewProfile")}
              </Button>
            </div>
          </div>

          {/* Tabs */}
          <Tabs defaultValue="description" className="mb-8">
            <TabsList className="w-full justify-start">
              <TabsTrigger value="description">
                {t("prompt:tabs.description")}
              </TabsTrigger>
              <TabsTrigger value="samples">
                {t("prompt:tabs.samples")}
              </TabsTrigger>
              <TabsTrigger value="reviews">
                {t("prompt:tabs.reviews")}
              </TabsTrigger>
            </TabsList>

            <TabsContent value="description" className="mt-6">
              <div className="space-y-4">
                <div>
                  <h3 className="font-bold mb-2">{t("prompt:about.title")}</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    {prompt.description}
                  </p>
                </div>

                <Separator />

                <div>
                  <h3 className="font-bold mb-2">
                    {t("prompt:useCases.title")}
                  </h3>
                  <ul className="space-y-2">
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-5 w-5 text-green-600 shrink-0 mt-0.5" />
                      <span className="text-muted-foreground">
                        {t("prompt:useCases.item1")}
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-5 w-5 text-green-600 shrink-0 mt-0.5" />
                      <span className="text-muted-foreground">
                        {t("prompt:useCases.item2")}
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-5 w-5 text-green-600 shrink-0 mt-0.5" />
                      <span className="text-muted-foreground">
                        {t("prompt:useCases.item3")}
                      </span>
                    </li>
                  </ul>
                </div>

                <Separator />

                <div>
                  <h3 className="font-bold mb-2">
                    {t("prompt:recommendedModel.title")}
                  </h3>
                  <p className="text-muted-foreground">{prompt.aiModel}</p>
                </div>

                {prompt.contentLocked && (
                  <>
                    <Separator />
                    <ContentLockOverlay />
                  </>
                )}

                {!prompt.contentLocked &&
                  (purchased || prompt.isFree) &&
                  prompt.fullContent && (
                    <>
                      <Separator />
                      <div>
                        <h3 className="font-bold mb-2">
                          {t("prompt:fullContent.title")}
                        </h3>
                        <div className="bg-muted p-4 rounded-lg font-mono text-sm whitespace-pre-wrap">
                          {prompt.fullContent}
                        </div>
                      </div>
                    </>
                  )}
              </div>
            </TabsContent>

            <TabsContent value="samples" className="mt-6">
              {prompt.contentLocked ? (
                <ContentLockOverlay />
              ) : prompt.samples.length > 0 ? (
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
                  {t("common:messages.noExamples")}
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
                                i18n.language === "ar" ? "ar-SA" : "en-US",
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
                  <div className="flex items-center gap-3 mb-2">
                    {prompt.isFree ? (
                      <Badge className="bg-green-600 px-3 py-1 text-base text-white hover:bg-green-700">
                        {t("common:labels.free")}
                      </Badge>
                    ) : (
                      <span className="text-3xl font-bold">
                        ${prompt.price}
                      </span>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-2 mb-4">
                    <Badge>{prompt.aiModel}</Badge>
                    <Badge variant="outline">{prompt.difficulty}</Badge>
                    {purchased && (
                      <Badge className="bg-green-600 text-white">
                        <CheckCircle2 className="h-3 w-3 ml-1" />
                        {t("common:labels.purchased")}
                      </Badge>
                    )}
                  </div>
                </div>

                {!purchased && !prompt.isFree && (
                  <div className="space-y-3">
                    <Button className="w-full" size="lg" onClick={handleBuyNow}>
                      <ShoppingCart className="ml-2 h-5 w-5" />
                      {t("common:buttons.buyNow")}
                    </Button>
                    <Button
                      className="w-full"
                      size="lg"
                      variant="outline"
                      onClick={handleAddToCart}
                    >
                      {t("common:buttons.addToCart")}
                    </Button>
                  </div>
                )}

                {isSignedIn &&
                  (purchased || prompt.isFree) &&
                  !prompt.contentLocked && (
                    <div className="mt-3">
                      <GenerateButton
                        promptId={prompt.id}
                        promptContent={prompt.fullContent || prompt.description}
                        userOwnsPrompt={true}
                        creditBalance={creditBalance}
                      />
                    </div>
                  )}

                <Separator className="my-6" />

                <div className="space-y-3 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">
                      {t("common:labels.category")}
                    </span>
                    <Badge variant="secondary">{prompt.category}</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">
                      {t("common:labels.sales")}
                    </span>
                    <span className="font-bold">{prompt.sales}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">
                      {t("common:labels.rating")}
                    </span>
                    <div className="flex items-center gap-1">
                      <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                      <span className="font-bold">{prompt.rating}</span>
                    </div>
                  </div>
                </div>

                <Separator className="my-6" />

                <div>
                  <h4 className="font-bold mb-3">{t("common:labels.tags")}</h4>
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
                      {t("prompt:trust.securePayment")}
                    </span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-600 shrink-0 mt-0.5" />
                    <span className="text-muted-foreground">
                      {t("prompt:trust.instantAccess")}
                    </span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-600 shrink-0 mt-0.5" />
                    <span className="text-muted-foreground">
                      {t("prompt:trust.moneyBackGuarantee")}
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
          <h2 className="text-2xl font-bold mb-6 text-white flex items-center gap-2">
            <span className="w-2 h-8 bg-[#faff00] rounded-full block" />
            {t("prompt:relatedPrompts.title")}
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 max-w-5xl">
            {relatedPrompts.map((relatedPrompt) => (
              <PromptGridCard key={relatedPrompt.id} prompt={relatedPrompt} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
