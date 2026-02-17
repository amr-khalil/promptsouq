"use client";

import type { Prompt } from "@/lib/schemas/api";
import { Bot, ImageIcon, Sparkles, Star } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { Skeleton } from "./ui/skeleton";

interface NewArrivalsGridProps {
  prompts: Prompt[];
  loading: boolean;
}

type FilterTab = "الكل" | "صور" | "نصوص" | "صوت";

const IMAGE_MODELS = ["midjourney", "dall-e", "stable diffusion", "sd", "mj"];
const TEXT_MODELS = ["gpt", "claude", "gemini", "llama", "chatgpt"];

function matchesFilter(prompt: Prompt, filter: FilterTab): boolean {
  if (filter === "الكل") return true;
  const model = prompt.aiModel.toLowerCase();
  if (filter === "صور") return IMAGE_MODELS.some((m) => model.includes(m));
  if (filter === "نصوص") return TEXT_MODELS.some((m) => model.includes(m));
  // "صوت" — audio models (none currently, show none)
  return false;
}

function NewArrivalCard({ prompt }: { prompt: Prompt }) {
  const isTextPrompt = TEXT_MODELS.some((m) =>
    prompt.aiModel.toLowerCase().includes(m),
  );

  return (
    <Link
      href={`/prompt/${prompt.id}`}
      className="group bg-[#18181b] rounded-xl overflow-hidden border border-white/5 hover:border-[#7f0df2]/50 transition-all hover:-translate-y-1 cursor-pointer"
    >
      {/* Image */}
      <div className="h-48 overflow-hidden relative">
        {prompt.thumbnail ? (
          <img
            src={prompt.thumbnail}
            alt={prompt.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="h-full w-full bg-gradient-to-bl from-purple-900 to-indigo-900 flex items-center justify-center">
            <Bot className="w-12 h-12 text-white/30 group-hover:text-white/60 transition-colors" />
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-white font-bold line-clamp-1">{prompt.title}</h3>
          <span className="text-[#faff00] font-bold text-sm shrink-0 ms-2">
            {prompt.isFree || prompt.price === 0 ? "مجاني" : `$${prompt.price}`}
          </span>
        </div>
        <div className="flex items-center gap-2 text-xs text-gray-400 mb-3">
          <span className="bg-zinc-800 px-1.5 py-0.5 rounded flex items-center gap-1">
            {isTextPrompt ? (
              <Bot className="w-3 h-3" />
            ) : (
              <ImageIcon className="w-3 h-3" />
            )}
            {prompt.aiModel}
          </span>
          <span>{prompt.category}</span>
        </div>
        {/* Rating */}
        <div className="flex items-center gap-1">
          {[...Array(5)].map((_, i) => (
            <Star
              key={i}
              className={`w-3 h-3 ${
                i < Math.floor(prompt.rating)
                  ? "fill-yellow-400 text-yellow-400"
                  : "text-zinc-700"
              }`}
            />
          ))}
          <span className="text-[10px] text-gray-500 ms-1">
            ({prompt.reviews})
          </span>
        </div>
      </div>
    </Link>
  );
}

function CardSkeleton() {
  return (
    <div className="bg-[#18181b] rounded-xl overflow-hidden border border-white/5">
      <Skeleton className="h-48 w-full" />
      <div className="p-4 space-y-3">
        <div className="flex justify-between">
          <Skeleton className="h-5 w-3/4" />
          <Skeleton className="h-5 w-12" />
        </div>
        <Skeleton className="h-3 w-1/2" />
        <Skeleton className="h-3 w-20" />
      </div>
    </div>
  );
}

const FILTER_TABS: FilterTab[] = ["الكل", "صور", "نصوص", "صوت"];

export function NewArrivalsGrid({ prompts, loading }: NewArrivalsGridProps) {
  const [activeTab, setActiveTab] = useState<FilterTab>("الكل");

  const filtered = prompts.filter((p) => matchesFilter(p, activeTab));

  return (
    <section className="py-16 bg-[#0f0f0f]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-3xl font-bold text-white flex items-center gap-2">
            <Sparkles className="w-7 h-7 text-[#7f0df2] animate-bounce" />
            وصل حديثاً
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
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {loading ? (
            Array.from({ length: 4 }).map((_, i) => <CardSkeleton key={i} />)
          ) : filtered.length > 0 ? (
            filtered
              .slice(0, 8)
              .map((prompt) => (
                <NewArrivalCard key={prompt.id} prompt={prompt} />
              ))
          ) : (
            <div className="col-span-full text-center py-12 text-gray-500">
              لا توجد نتائج لهذا الفلتر
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
