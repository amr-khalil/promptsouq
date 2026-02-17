"use client";

import type { Prompt } from "@/lib/schemas/api";
import { ArrowLeft, Bot, ImageIcon, Star } from "lucide-react";
import { LocaleLink } from "@/components/LocaleLink";
import { useTranslation } from "react-i18next";
import { Skeleton } from "./ui/skeleton";

interface FreePromptsCarouselProps {
  prompts: Prompt[];
  loading: boolean;
}

function PromptScrollCard({ prompt }: { prompt: Prompt }) {
  const { t } = useTranslation(["home", "common"]);
  const isTextPrompt = prompt.aiModel.toLowerCase().includes("gpt");

  return (
    <LocaleLink
      href={`/prompt/${prompt.id}`}
      className="group relative min-w-[280px] w-[280px] bg-[#18181b] rounded-2xl overflow-hidden border border-white/10 hover:border-[#7f0df2] transition-all duration-300 hover:shadow-[0_0_10px_#7f0df2,0_0_20px_#7f0df2] cursor-pointer snap-start shrink-0"
    >
      {/* Image */}
      <div className="relative aspect-[4/5] overflow-hidden">
        {prompt.thumbnail ? (
          <img
            src={prompt.thumbnail}
            alt={prompt.title}
            className="object-cover w-full h-full group-hover:scale-110 transition-transform duration-700"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-emerald-900 to-emerald-600 flex items-center justify-center p-6 group-hover:scale-110 transition-transform duration-700">
            <Bot className="w-16 h-16 text-white/50" />
          </div>
        )}

        {/* AI Model Badge */}
        <div className="absolute top-3 right-3 bg-black/60 backdrop-blur-md text-white text-xs font-bold px-2 py-1 rounded flex items-center gap-1">
          {isTextPrompt ? (
            <Bot className="w-3.5 h-3.5" />
          ) : (
            <ImageIcon className="w-3.5 h-3.5" />
          )}
          {prompt.aiModel}
        </div>
      </div>

      {/* Content */}
      <div className="p-4 relative">
        {/* Price Badge */}
        <div className="absolute -top-4 left-4 bg-[#faff00] text-black font-bold px-3 py-1 rounded shadow-lg text-sm">
          {t("price.free", { ns: "common" })}
        </div>

        <h3 className="text-white font-bold text-lg mb-1 line-clamp-1 group-hover:text-[#7f0df2] transition-colors">
          {prompt.title}
        </h3>
        <p className="text-gray-400 text-xs mb-3 line-clamp-2">
          {prompt.description}
        </p>

        {/* Seller + Rating */}
        <div className="flex items-center justify-between border-t border-white/5 pt-3">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full overflow-hidden bg-gradient-to-tr from-blue-400 to-purple-500">
              {prompt.seller.avatar && (
                <img
                  src={prompt.seller.avatar}
                  alt={prompt.seller.name}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.currentTarget.style.display = "none";
                  }}
                />
              )}
            </div>
            <span className="text-xs text-gray-300">{prompt.seller.name}</span>
          </div>
          <div className="flex items-center text-[#faff00] text-xs font-bold gap-0.5">
            <Star className="w-3.5 h-3.5 fill-current" />
            {prompt.rating.toFixed(1)}
          </div>
        </div>
      </div>
    </LocaleLink>
  );
}

function CardSkeleton() {
  return (
    <div className="min-w-[280px] w-[280px] bg-[#18181b] rounded-2xl overflow-hidden border border-white/10 snap-start shrink-0">
      <Skeleton className="aspect-[4/5] w-full" />
      <div className="p-4 space-y-3">
        <Skeleton className="h-5 w-3/4" />
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-3 w-2/3" />
        <div className="flex justify-between border-t border-white/5 pt-3">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-4 w-10" />
        </div>
      </div>
    </div>
  );
}

export function FreePromptsCarousel({
  prompts,
  loading,
}: FreePromptsCarouselProps) {
  const { t } = useTranslation(["home", "common"]);

  return (
    <section className="py-16 bg-[#0f0f0f]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-end justify-between mb-8">
          <div>
            <h2 className="text-3xl font-bold text-white mb-2 flex items-center gap-2">
              <span className="w-2 h-8 bg-[#faff00] rounded-full block" />
              {t("freePrompts.title", { ns: "home" })}
            </h2>
            <p className="text-gray-400 text-sm">
              {t("freePrompts.subtitle", { ns: "home" })}
            </p>
          </div>
          <LocaleLink
            href="/market?priceType=free"
            className="text-[#7f0df2] hover:text-white font-bold text-sm flex items-center gap-1 group"
          >
            {t("buttons.viewAll", { ns: "common" })}
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          </LocaleLink>
        </div>

        {/* Horizontal Scroll */}
        <div className="flex overflow-x-auto gap-6 pb-8 hide-scroll snap-x">
          {loading
            ? Array.from({ length: 5 }).map((_, i) => <CardSkeleton key={i} />)
            : prompts.map((prompt) => (
                <PromptScrollCard key={prompt.id} prompt={prompt} />
              ))}
        </div>
      </div>
    </section>
  );
}
