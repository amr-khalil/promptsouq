"use client";

import type { Prompt } from "@/lib/schemas/api";
import { Sparkles } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { PromptGridCard, PromptGridCardSkeleton } from "./PromptGridCard";

interface NewArrivalsGridProps {
  prompts: Prompt[];
  loading: boolean;
}

type FilterTab = "all" | "images" | "text" | "audio";

const IMAGE_MODELS = ["midjourney", "dall-e", "stable diffusion", "sd", "mj"];
const TEXT_MODELS = ["gpt", "claude", "gemini", "llama", "chatgpt"];

function matchesFilter(prompt: Prompt, filter: FilterTab): boolean {
  if (filter === "all") return true;
  const model = prompt.aiModel.toLowerCase();
  if (filter === "images") return IMAGE_MODELS.some((m) => model.includes(m));
  if (filter === "text") return TEXT_MODELS.some((m) => model.includes(m));
  return false;
}

const FILTER_TABS: FilterTab[] = ["all", "images", "text", "audio"];

export function NewArrivalsGrid({ prompts, loading }: NewArrivalsGridProps) {
  const { t } = useTranslation(["home", "common"]);
  const [activeTab, setActiveTab] = useState<FilterTab>("all");

  const filtered = prompts.filter((p) => matchesFilter(p, activeTab));

  const filterTabLabels: Record<FilterTab, string> = {
    all: t("newArrivals.filterTabs.all", { ns: "home" }),
    images: t("newArrivals.filterTabs.images", { ns: "home" }),
    text: t("newArrivals.filterTabs.text", { ns: "home" }),
    audio: t("newArrivals.filterTabs.audio", { ns: "home" }),
  };

  return (
    <section className="py-16 bg-[#0f0f0f]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-3xl font-bold text-white flex items-center gap-2">
            <Sparkles className="w-7 h-7 text-[#7f0df2] animate-bounce" />
            {t("newArrivals.title", { ns: "home" })}
          </h2>
          <div className="hidden md:flex bg-zinc-800/50 p-1 rounded-lg border border-white/5">
            {FILTER_TABS.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${
                  activeTab === tab
                    ? "bg-[#7f0df2] text-white shadow-lg"
                    : "text-gray-400 hover:text-white"
                }`}
              >
                {filterTabLabels[tab]}
              </button>
            ))}
          </div>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {loading ? (
            Array.from({ length: 4 }).map((_, i) => (
              <PromptGridCardSkeleton key={i} />
            ))
          ) : filtered.length > 0 ? (
            filtered
              .slice(0, 8)
              .map((prompt) => (
                <PromptGridCard key={prompt.id} prompt={prompt} />
              ))
          ) : (
            <div className="col-span-full text-center py-12 text-gray-500">
              {t("messages.noResultsForFilter", { ns: "common" })}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
