"use client";

import { useRecentSearchesStore } from "@/stores/recent-searches-store";
import { Clock, Sparkles, TrendingUp, X } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";

interface TrendingItem {
  title: string;
  titleEn: string;
}

interface HeroSearchBarProps {
  className?: string;
}

export default function HeroSearchBar({ className = "" }: HeroSearchBarProps) {
  const { t, i18n } = useTranslation(["home", "common"]);
  const [query, setQuery] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [trendingItems, setTrendingItems] = useState<TrendingItem[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const params = useParams();
  const locale = (params?.locale as string) ?? "en";
  const isArabic = i18n.language === "ar";

  const { searches: recentSearches, addSearch, removeSearch, clearAll } =
    useRecentSearchesStore();

  const localePath = useCallback(
    (path: string) => (locale === "ar" ? `/ar${path}` : path),
    [locale],
  );

  // Fetch trending on mount
  useEffect(() => {
    async function fetchTrending() {
      try {
        const res = await fetch("/api/trending");
        if (res.ok) {
          const json = await res.json();
          setTrendingItems(json.data ?? []);
        }
      } catch {
        // silently fail
      }
    }
    fetchTrending();
  }, []);

  // Close on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
        setIsFocused(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const navigate = (term: string) => {
    setIsOpen(false);
    setIsFocused(false);
    setQuery(term);
    router.push(
      `${localePath("/market")}?search=${encodeURIComponent(term)}`,
    );
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    addSearch(query.trim());
    navigate(query.trim());
  };

  const handleRecentClick = (term: string) => {
    navigate(term);
  };

  const handleTrendingClick = (item: TrendingItem) => {
    const term = isArabic ? item.title : item.titleEn;
    navigate(term);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      setIsOpen(false);
    }
  };

  // Deduplication
  const filteredTrending = trendingItems.filter(
    (item) =>
      !recentSearches.some(
        (r) =>
          r.term.toLowerCase() === item.title.toLowerCase() ||
          r.term.toLowerCase() === item.titleEn.toLowerCase(),
      ),
  );

  const hasRecent = recentSearches.length > 0;
  const hasTrending = filteredTrending.length > 0;
  const showDropdown =
    isOpen && isFocused && query.length < 2 && (hasRecent || hasTrending);

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      <form
        onSubmit={handleSearch}
        className="bg-[#1a1a20]/90 backdrop-blur-xl border border-[#7f0df2]/30 clip-search-container flex items-center p-1.5 focus-within:border-[#faff00] focus-within:shadow-[0_0_15px_rgba(250,255,0,0.3)] transition-all duration-300 shadow-xl"
      >
        <div className="pl-4 pr-6 text-[#7f0df2]">
          <Sparkles className="w-6 h-6" />
        </div>
        <input
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => {
            setIsFocused(true);
            setIsOpen(true);
          }}
          onBlur={() => setIsFocused(false)}
          onKeyDown={handleKeyDown}
          placeholder={t("hero.searchPlaceholder", { ns: "home" })}
          className="w-full bg-transparent border-none text-white text-base placeholder-zinc-500 focus:ring-0 focus:outline-none px-2 font-display tracking-wide h-12"
        />
        <button
          type="submit"
          className="bg-[#7f0df2] hover:bg-[#9d4dff] text-white px-8 py-3 font-bold text-sm tracking-wider uppercase transition-colors shadow-[0_0_15px_rgba(127,13,242,0.4)] clip-button-start"
        >
          {t("buttons.start", { ns: "common" })}
        </button>
      </form>

      {/* Recent + Trending dropdown */}
      {showDropdown && (
        <div className="absolute z-50 w-full mt-1 bg-[#1a1a20]/95 backdrop-blur-xl border border-[#7f0df2]/30 rounded-lg shadow-lg overflow-hidden">
          {/* Recent Searches */}
          {hasRecent && (
            <div>
              <div className="flex items-center justify-between px-4 pt-3 pb-1">
                <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wide">
                  {t("search.recentSearches", { ns: "common" })}
                </span>
                <button
                  type="button"
                  className="text-xs text-zinc-400 hover:text-white transition-colors"
                  onMouseDown={(e) => {
                    e.preventDefault();
                    clearAll();
                    if (!hasTrending) setIsOpen(false);
                  }}
                >
                  {t("buttons.clearAll", { ns: "common" })}
                </button>
              </div>
              <ul>
                {recentSearches.map((s) => (
                  <li key={s.term}>
                    <div className="flex items-center w-full px-4 py-2.5 hover:bg-white/5 transition-colors group">
                      <button
                        type="button"
                        className="flex items-center gap-3 flex-1 min-w-0 text-right"
                        onMouseDown={(e) => {
                          e.preventDefault();
                          handleRecentClick(s.term);
                        }}
                      >
                        <Clock className="h-4 w-4 shrink-0 text-zinc-400" />
                        <span className="text-sm text-white truncate">
                          {s.term}
                        </span>
                      </button>
                      <button
                        type="button"
                        className="shrink-0 p-1 text-zinc-500 hover:text-white opacity-0 group-hover:opacity-100 transition-opacity"
                        onMouseDown={(e) => {
                          e.preventDefault();
                          removeSearch(s.term);
                        }}
                        title={t("search.removeSearch", { ns: "common" })}
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Trending Searches */}
          {hasTrending && (
            <div>
              {hasRecent && <div className="border-t border-white/10" />}
              <div className="px-4 pt-3 pb-1">
                <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wide">
                  {t("search.trendingSearches", { ns: "common" })}
                </span>
              </div>
              <ul>
                {filteredTrending.map((item) => {
                  const displayTitle = isArabic ? item.title : item.titleEn;
                  return (
                    <li key={item.title}>
                      <button
                        type="button"
                        className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-white/5 transition-colors text-right"
                        onMouseDown={(e) => {
                          e.preventDefault();
                          handleTrendingClick(item);
                        }}
                      >
                        <TrendingUp className="h-4 w-4 shrink-0 text-[#7f0df2]" />
                        <span className="text-sm text-white truncate">
                          {displayTitle}
                        </span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
