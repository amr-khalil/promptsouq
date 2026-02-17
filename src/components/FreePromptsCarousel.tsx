"use client";

import { LocaleLink } from "@/components/LocaleLink";
import type { Prompt } from "@/lib/schemas/api";
import { ArrowLeft } from "lucide-react";
import { useTranslation } from "react-i18next";
import { PromptScrollCard, PromptScrollCardSkeleton } from "./PromptGridCard";

interface FreePromptsCarouselProps {
  prompts: Prompt[];
  loading: boolean;
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
            ? Array.from({ length: 5 }).map((_, i) => (
                <PromptScrollCardSkeleton key={i} />
              ))
            : prompts.map((prompt) => (
                <PromptScrollCard key={prompt.id} prompt={prompt} />
              ))}
        </div>
      </div>
    </section>
  );
}
