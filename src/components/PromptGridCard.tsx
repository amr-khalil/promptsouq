"use client";

import { LocaleLink } from "@/components/LocaleLink";
import type { Prompt } from "@/lib/schemas/api";
import { Bot, ImageIcon, Star } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Skeleton } from "./ui/skeleton";

const TEXT_MODELS = ["gpt", "claude", "gemini", "llama", "chatgpt"];

interface PromptGridCardProps {
  prompt: Prompt;
}

export function PromptGridCard({ prompt }: PromptGridCardProps) {
  const { t } = useTranslation(["home", "common"]);
  const isTextPrompt = TEXT_MODELS.some((m) =>
    prompt.aiModel.toLowerCase().includes(m),
  );

  return (
    <LocaleLink
      href={`/prompt/${prompt.id}`}
      className="group relative bg-[#18181b] rounded-2xl overflow-hidden border border-white/10 hover:border-[#7f0df2] transition-all duration-300 hover:shadow-[0_0_10px_#7f0df2,0_0_20px_#7f0df2] cursor-pointer"
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
          {prompt.isFree || prompt.price === 0
            ? t("price.free", { ns: "common" })
            : t("price.currency", { ns: "common", amount: prompt.price })}
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

export function PromptGridCardSkeleton() {
  return (
    <div className="bg-[#18181b] rounded-2xl overflow-hidden border border-white/10">
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

/** Scroll variant — fixed 280px width for horizontal carousels */
export function PromptScrollCard({ prompt }: PromptGridCardProps) {
  return (
    <div className="min-w-[280px] w-[280px] snap-start shrink-0">
      <PromptGridCard prompt={prompt} />
    </div>
  );
}

export function PromptScrollCardSkeleton() {
  return (
    <div className="min-w-[280px] w-[280px] snap-start shrink-0">
      <PromptGridCardSkeleton />
    </div>
  );
}
