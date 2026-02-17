"use client";

import type { Prompt } from "@/lib/schemas/api";
import { useCartStore } from "@/stores/cart-store";
import { CheckCircle2, Heart, Star } from "lucide-react";
import { LocaleLink } from "@/components/LocaleLink";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { Button } from "./ui/button";

interface GamingPromptCardProps {
  prompt: Prompt;
}

// Custom Gaming Card Wrapper with chamfered corners
const GamingCard = ({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) => {
  // Polygon shape: Rounded top corners, chamfered (cut) bottom corners
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

  return (
    <div
      className={`relative group drop-shadow-[0_0_0_1px_rgba(95,61,239,0.5)] transition-transform hover:-translate-y-1 ${className}`}
    >
      {/* Outer Border Layer (Purple #5F3DEF) */}
      <div className="absolute inset-0 bg-[#5F3DEF]" style={clipPathStyle} />

      {/* Inner Content Layer (Dark BG) */}
      <div
        className="relative h-full bg-[#161621] text-card-foreground"
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
};

export function GamingPromptCard({ prompt }: GamingPromptCardProps) {
  const { t } = useTranslation("common");
  const { addItem, isInCart } = useCartStore();
  const inCart = isInCart(prompt.id);
  const isFree = prompt.isFree || prompt.price === 0;

  function handleAddToCart(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (isFree || inCart) return;
    addItem({
      promptId: prompt.id,
      title: prompt.title,
      price: prompt.price,
      thumbnail: prompt.thumbnail,
    });
    toast.success(t("messages.addedToCart"));
  }

  return (
    <LocaleLink href={`/prompt/${prompt.id}`}>
      <GamingCard className="h-full">
        {/* Top Image Section Wrapper */}
        <div className="relative">
          {/* Actual Image Container (Clipped) */}
          <div className="h-44 w-full overflow-hidden relative">
            <img
              src={prompt.thumbnail}
              alt={prompt.title}
              className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
            />

            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#161621] via-transparent to-transparent opacity-90" />

            {/* Badge: Category (Top Right for RTL) */}
            <div className="absolute right-0 top-0 rounded-bl-[16px] bg-[#5F3DEF] px-4 py-1.5 text-[11px] font-bold tracking-wide text-white">
              {prompt.aiModel}
            </div>

            {/* Action: Wishlist (Top Left for RTL) */}
            <button
              className="absolute left-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-[#5F3DEF] text-white transition-colors hover:bg-pink-600"
              onClick={(e) => {
                e.preventDefault();
                toast.success(t("labels.addedToFavorites"));
              }}
            >
              <Heart className="h-4 w-4" />
            </button>
          </div>

          {/* Badge: Difficulty (Floating Bottom Center) */}
          <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 transform z-20 w-max">
            <div className="flex items-center gap-1 rounded-full border border-slate-700 bg-[#252533] px-5 py-1 text-[10px] font-extrabold uppercase tracking-wider text-slate-200 shadow-xl">
              {prompt.difficulty}
            </div>
          </div>
        </div>

        {/* Content Section */}
        <div className="flex flex-col px-4 pt-6 pb-4 bg-[#161621]">
          {/* Title */}
          <h3 className="line-clamp-2 min-h-[2.5rem] text-[13px] font-bold leading-relaxed text-white text-right">
            {prompt.title}
          </h3>

          {/* Divider Line */}
          <div className="my-3 h-[1px] w-full bg-slate-800/80"></div>

          {/* Seller Info Row */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {/* Circle Avatar */}
              <div className="relative h-9 w-9 rounded-full border-2 border-[#5F3DEF] overflow-hidden bg-[#2a2a3d]">
                <img
                  src={
                    prompt.seller.avatar ||
                    `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(prompt.seller.name)}&backgroundColor=ffdfbf`
                  }
                  className="h-full w-full object-cover"
                  alt={prompt.seller.name}
                  onError={(e) => {
                    e.currentTarget.src = `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(prompt.seller.name)}&backgroundColor=ffdfbf`;
                  }}
                />
              </div>

              <div className="flex flex-col text-right">
                <span className="text-[11px] font-bold text-white leading-tight">
                  {prompt.seller.name}
                </span>
                <span className="text-[10px] font-medium text-slate-400 flex items-center gap-1">
                  {t("labels.verified")}{" "}
                  <CheckCircle2
                    className="h-3 w-3 text-[#5F3DEF]"
                    fill="currentColor"
                    color="#161621"
                  />
                </span>
              </div>
            </div>

            {/* Rating Stars - Yellow Accent */}
            <div className="flex flex-col items-end">
              <div className="flex gap-0.5">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`h-2.5 w-2.5 ${
                      i < Math.floor(prompt.rating)
                        ? "fill-yellow-400 text-yellow-400"
                        : "text-slate-700"
                    }`}
                  />
                ))}
              </div>
              <span className="text-[10px] text-yellow-400 font-bold mt-0.5 flex items-center gap-1">
                {prompt.sales} <Heart className="h-2 w-2 fill-yellow-400" />
              </span>
            </div>
          </div>

          {/* Price Button - Full Width Pill */}
          <div className="mt-4">
            {isFree ? (
              <Button
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-full h-9 shadow-[0_4px_14px_0_rgba(16,185,129,0.39)] hover:shadow-[0_6px_20px_rgba(16,185,129,0.23)] hover:-translate-y-0.5 transition-all"
              >
                {t("labels.freeView")}
              </Button>
            ) : (
              <Button
                className="w-full bg-[#5F3DEF] hover:bg-[#4a3df5] text-white font-bold rounded-full h-9 shadow-[0_4px_14px_0_rgba(95,61,239,0.39)] hover:shadow-[0_6px_20px_rgba(95,61,239,0.23)] hover:-translate-y-0.5 transition-all"
                onClick={handleAddToCart}
                disabled={inCart}
              >
                {inCart ? t("buttons.inCart") : t("price.currency", { amount: prompt.price })}
              </Button>
            )}
          </div>
        </div>
      </GamingCard>
    </LocaleLink>
  );
}
