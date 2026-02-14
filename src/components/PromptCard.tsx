"use client";

import type { Prompt } from "@/lib/schemas/api";
import { useCartStore } from "@/stores/cart-store";
import {
  ExternalLink,
  Eye,
  Maximize2,
  ShoppingCart,
  Star,
  X,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";
import { FavoriteButton } from "./dashboard/FavoriteButton";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Card, CardContent } from "./ui/card";
import { Dialog, DialogContent, DialogTitle } from "./ui/dialog";

interface PromptCardProps {
  prompt: Prompt;
}

export function PromptCard({ prompt }: PromptCardProps) {
  const [previewOpen, setPreviewOpen] = useState(false);
  const { addItem, isInCart } = useCartStore();
  const inCart = isInCart(prompt.id);

  function handleAddToCart(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (inCart) return;
    addItem({
      promptId: prompt.id,
      title: prompt.title,
      price: prompt.price,
      thumbnail: prompt.thumbnail,
    });
    toast.success("تمت الإضافة إلى السلة");
  }

  function handlePreview(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    setPreviewOpen(true);
  }

  return (
    <>
      <div className="card-border-glow aspect-square">
        <Card className="flex h-full w-full flex-col gap-0 overflow-hidden rounded-lg border-0 bg-[#0f0e17] py-0 text-white shadow-xl ring-1 ring-white/10">
          {/* حاوية شبكة الصور */}
          <div className="relative min-h-0 flex-1">
            {/* شارة 'Midjourney' */}
            <Badge
              variant="secondary"
              className="absolute left-0 top-0 z-10 rounded-none rounded-br-md bg-purple-700/50 px-2 py-0.5 text-xs font-medium text-white backdrop-blur-sm hover:bg-[#0f0e17]"
            >
              {prompt.aiModel}
            </Badge>

            {/* أيقونة التوسيع */}
            <button
              className="absolute right-2 top-2 z-10 text-white/80 transition-colors hover:text-white hover:bg-black/60 rounded-full p-1"
              onClick={handlePreview}
            >
              <Maximize2 className="h-4 w-4 drop-shadow-md" />
            </button>

            {/* شبكة الصور 2x2 */}
            <img
              src={prompt.thumbnail}
              alt={prompt.title}
              className="h-full w-full object-cover transition-transform duration-300 hover:scale-105"
            />
          </div>

          {/* المحتوى النصي */}
          <CardContent className="shrink-0 px-2 py-1.5 text-right">
            <h3 className="truncate text-sm font-medium text-white">
              {prompt.title}
            </h3>
            <p className="text-sm font-bold text-white">${prompt.price}</p>
          </CardContent>
        </Card>
      </div>

      {/* نافذة المعاينة */}
      <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
        <DialogContent
          showCloseButton={false}
          className="max-w-3xl border-slate-800 bg-[#0f0e17] p-0 text-white overflow-hidden"
        >
          <DialogTitle className="sr-only">{prompt.title}</DialogTitle>

          {/* الصورة */}
          <div className="relative w-full bg-white/5">
            <Badge
              variant="secondary"
              className="absolute left-3 top-3 z-10 rounded-md bg-purple-700/60 px-2 py-1 text-xs font-semibold text-white backdrop-blur-sm hover:bg-purple-700/80"
            >
              {prompt.aiModel}
            </Badge>

            {/* أزرار الإجراءات */}
            <div className="absolute right-3 top-3 z-10 flex gap-2">
              <button
                className="flex h-8 w-8 items-center justify-center rounded-md bg-[#1a1b26] text-white transition-colors hover:bg-[#2e3048]"
                onClick={() => setPreviewOpen(false)}
              >
                <X className="h-4 w-4" />
              </button>
              <FavoriteButton
                promptId={prompt.id}
                isFavorited={false}
                size="icon"
                className="h-8 w-8 rounded-md bg-[#1a1b26] text-white hover:bg-[#2e3048] [&_svg]:h-4 [&_svg]:w-4"
              />
              <Link
                href={`/prompt/${prompt.id}`}
                className="flex h-8 w-8 items-center justify-center rounded-md bg-[#1a1b26] text-white transition-colors hover:bg-[#2e3048]"
              >
                <ExternalLink className="h-4 w-4" />
              </Link>
            </div>

            <img
              src={prompt.thumbnail}
              alt={prompt.title}
              className="max-h-[50vh] w-full object-contain"
            />
          </div>

          {/* المحتوى */}
          <div className="space-y-4 p-5">
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0 flex-1 space-y-1">
                <h3 className="text-lg font-bold leading-tight text-white">
                  {prompt.title}
                </h3>
                <p className="text-sm text-slate-400">{prompt.titleEn}</p>
              </div>
              <Button
                className="shrink-0 bg-linear-to-r from-[#9333ea] to-[#6366f1] px-5 font-bold text-white hover:opacity-90"
                size="sm"
                onClick={handleAddToCart}
                disabled={inCart}
              >
                <ShoppingCart className="h-4 w-4" />
                {inCart ? "في السلة" : `$${prompt.price}`}
              </Button>
            </div>

            <p className="line-clamp-3 text-sm leading-relaxed text-slate-400">
              {prompt.description}
            </p>

            {/* بيانات إضافية */}
            <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500">
              <span className="flex items-center gap-1">
                <Star className="h-3.5 w-3.5 fill-yellow-500 text-yellow-500" />
                {prompt.rating}
              </span>
              <span className="flex items-center gap-1">
                <Eye className="h-3.5 w-3.5" />
                {prompt.sales} مبيعات
              </span>
              <Badge
                variant="outline"
                className="border-slate-700 text-slate-400"
              >
                {prompt.difficulty}
              </Badge>
              {prompt.tags.slice(0, 3).map((tag) => (
                <Badge
                  key={tag}
                  variant="outline"
                  className="border-slate-700 text-slate-400"
                >
                  {tag}
                </Badge>
              ))}
            </div>

            {/* البائع والإجراءات */}
            <div className="flex items-center justify-between border-t border-slate-800 px-5 py-3">
              <div className="flex items-center gap-3">
                <img
                  src={prompt.seller.avatar}
                  alt={prompt.seller.name}
                  className="h-9 w-9 rounded-full object-cover ring-1 ring-white/10"
                />
                <span className="text-sm font-medium text-white">
                  {prompt.seller.name}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <FavoriteButton
                  promptId={prompt.id}
                  isFavorited={false}
                  size="icon"
                  className="h-9 w-9 rounded-md border border-slate-700 bg-transparent text-slate-400 hover:bg-[#2e3048] hover:text-white [&_svg]:h-4 [&_svg]:w-4"
                />
                <Button variant="neonGradient" size="sm" asChild>
                  <Link href={`/prompt/${prompt.id}`}>عرض الأمر</Link>
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
