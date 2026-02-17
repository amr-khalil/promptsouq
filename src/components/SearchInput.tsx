"use client";

import { Badge } from "@/components/ui/badge";
import { BorderBeam } from "@/components/ui/border-beam";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useRecentSearchesStore } from "@/stores/recent-searches-store";
import { Clock, Search, TrendingUp, X } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";

interface Suggestion {
  id: string;
  title: string;
  aiModel: string;
}

interface TrendingItem {
  title: string;
  titleEn: string;
}

interface SearchInputProps {
  onSearch?: (query: string) => void;
  placeholder?: string;
  className?: string;
  defaultValue?: string;
  navigateOnSearch?: string;
}

export default function SearchInput({
  onSearch,
  placeholder,
  className = "",
  defaultValue = "",
  navigateOnSearch,
}: SearchInputProps) {
  const { t, i18n } = useTranslation("common");
  const [query, setQuery] = useState(defaultValue);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [trendingItems, setTrendingItems] = useState<TrendingItem[]>([]);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const params = useParams();
  const locale = (params?.locale as string) ?? "en";

  const localePath = (path: string) =>
    locale === "ar" ? `/ar${path}` : path;

  const { searches: recentSearches, addSearch, removeSearch, clearAll } =
    useRecentSearchesStore();

  const isArabic = i18n.language === "ar";

  // Fetch trending data on mount
  useEffect(() => {
    async function fetchTrending() {
      try {
        const res = await fetch("/api/trending");
        if (res.ok) {
          const json = await res.json();
          setTrendingItems(json.data ?? []);
        }
      } catch {
        // silently fail — trending section won't appear
      }
    }
    fetchTrending();
  }, []);

  const fetchSuggestions = useCallback(async (q: string) => {
    if (q.length < 2) {
      setSuggestions([]);
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch(
        `/api/suggestions?q=${encodeURIComponent(q)}&limit=6`,
      );
      if (res.ok) {
        const json = await res.json();
        setSuggestions(json.data ?? []);
        setIsOpen(true);
      }
    } catch {
      // silently fail
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleInputChange = (value: string) => {
    setQuery(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (value.length >= 2) {
      debounceRef.current = setTimeout(() => fetchSuggestions(value), 300);
    } else {
      setSuggestions([]);
      // Show recent/trending when input is cleared to < 2 chars
      setIsOpen(true);
    }
  };

  const handleSearch = () => {
    setIsOpen(false);
    if (!query.trim()) return;
    // Save to recent searches on explicit form submit
    addSearch(query.trim());
    if (onSearch) {
      onSearch(query.trim());
    } else if (navigateOnSearch) {
      router.push(
        `${localePath(navigateOnSearch)}?search=${encodeURIComponent(query.trim())}`,
      );
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSearch();
  };

  const handleSuggestionClick = (suggestion: Suggestion) => {
    setIsOpen(false);
    setQuery(suggestion.title);
    router.push(`/prompt/${suggestion.id}`);
  };

  const handleRecentClick = (term: string) => {
    setIsOpen(false);
    setQuery(term);
    if (onSearch) {
      onSearch(term);
    } else if (navigateOnSearch) {
      router.push(
        `${localePath(navigateOnSearch)}?search=${encodeURIComponent(term)}`,
      );
    }
  };

  const handleTrendingClick = (item: TrendingItem) => {
    const term = isArabic ? item.title : item.titleEn;
    setIsOpen(false);
    setQuery(term);
    if (onSearch) {
      onSearch(term);
    } else if (navigateOnSearch) {
      router.push(
        `${localePath(navigateOnSearch)}?search=${encodeURIComponent(term)}`,
      );
    }
  };

  const handleClear = () => {
    setQuery("");
    setSuggestions([]);
    // Show recent/trending after clearing
    setIsOpen(true);
  };

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Close on Escape
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      setIsOpen(false);
    }
  };

  // Deduplication: filter trending items that match recent search terms
  const filteredTrending = trendingItems.filter(
    (item) =>
      !recentSearches.some(
        (r) =>
          r.term.toLowerCase() === item.title.toLowerCase() ||
          r.term.toLowerCase() === item.titleEn.toLowerCase(),
      ),
  );

  // Determine which panel to show
  const showSuggestions = query.length >= 2;
  const hasRecent = recentSearches.length > 0;
  const hasTrending = filteredTrending.length > 0;
  const showRecentTrending =
    !showSuggestions && isFocused && (hasRecent || hasTrending);

  const resolvedPlaceholder = placeholder ?? t("search.placeholder");

  return (
    <>
      {/* Dark blurred backdrop when search is focused */}
      {isFocused && (
        <div
          className="fixed inset-0 z-40 bg-black/70  transition-opacity duration-300"
          onClick={() => setIsFocused(false)}
          aria-hidden
        />
      )}
      <div
        ref={containerRef}
        className={`relative ${className} ${isFocused ? "z-50" : ""}`}
      >
        <form onSubmit={handleSubmit}>
          <div className="relative overflow-hidden rounded-lg">
            <Input
              type="text"
              placeholder={resolvedPlaceholder}
              className="w-full pr-10 pl-24 h-12 text-base border-transparent bg-background"
              value={query}
              onChange={(e) => handleInputChange(e.target.value)}
              onKeyDown={handleKeyDown}
              onFocus={() => {
                setIsFocused(true);
                setIsOpen(true);
              }}
              onBlur={() => setIsFocused(false)}
            />
            {query && (
              <button
                type="button"
                onClick={handleClear}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground z-10"
              >
                <X className="h-4 w-4" />
              </button>
            )}
            <Button
              type="submit"
              variant="neonGradient"
              className="absolute left-1 top-1/2 -translate-y-1/2 h-10 px-4 z-10"
            >
              <Search className="h-4 w-4 ml-1" />
              {t("buttons.search")}
            </Button>
            <BorderBeam
              size={1300}
              duration={6}
              delay={3}
              borderWidth={2}
              colorFrom="#a855f7"
              colorTo="#6366f1"
              reverse
            />
          </div>
        </form>

        {/* Recent + Trending dropdown */}
        {isOpen && showRecentTrending && (
          <div className="absolute z-50 w-full mt-1 bg-popover border border-border rounded-lg shadow-lg overflow-hidden">
            {/* Recent Searches Section */}
            {hasRecent && (
              <div>
                <div className="flex items-center justify-between px-4 pt-3 pb-1">
                  <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                    {t("search.recentSearches")}
                  </span>
                  <button
                    type="button"
                    className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                    onMouseDown={(e) => {
                      e.preventDefault();
                      clearAll();
                      if (!hasTrending) setIsOpen(false);
                    }}
                  >
                    {t("buttons.clearAll")}
                  </button>
                </div>
                <ul>
                  {recentSearches.map((s) => (
                    <li key={s.term}>
                      <div className="flex items-center w-full px-4 py-2.5 hover:bg-accent transition-colors group">
                        <button
                          type="button"
                          className="flex items-center gap-3 flex-1 min-w-0 text-right"
                          onMouseDown={(e) => {
                            e.preventDefault();
                            handleRecentClick(s.term);
                          }}
                        >
                          <Clock className="h-4 w-4 shrink-0 text-muted-foreground" />
                          <span className="text-sm truncate">{s.term}</span>
                        </button>
                        <button
                          type="button"
                          className="shrink-0 p-1 text-muted-foreground hover:text-foreground opacity-0 group-hover:opacity-100 transition-opacity"
                          onMouseDown={(e) => {
                            e.preventDefault();
                            removeSearch(s.term);
                          }}
                          title={t("search.removeSearch")}
                        >
                          <X className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Trending Searches Section */}
            {hasTrending && (
              <div>
                {hasRecent && (
                  <div className="border-t border-border" />
                )}
                <div className="px-4 pt-3 pb-1">
                  <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                    {t("search.trendingSearches")}
                  </span>
                </div>
                <ul>
                  {filteredTrending.map((item) => {
                    const displayTitle = isArabic
                      ? item.title
                      : item.titleEn;
                    return (
                      <li key={item.title}>
                        <button
                          type="button"
                          className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-accent transition-colors text-right"
                          onMouseDown={(e) => {
                            e.preventDefault();
                            handleTrendingClick(item);
                          }}
                        >
                          <TrendingUp className="h-4 w-4 shrink-0 text-primary" />
                          <span className="text-sm truncate">
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

        {/* Suggestions dropdown (existing behavior for 2+ chars) */}
        {isOpen && showSuggestions && (
          <div className="absolute z-50 w-full mt-1 bg-popover border border-border rounded-lg shadow-lg overflow-hidden">
            {isLoading ? (
              <div className="p-4 text-center text-sm text-muted-foreground">
                {t("messages.searching")}
              </div>
            ) : suggestions.length === 0 ? (
              <div className="p-4 text-center text-sm text-muted-foreground">
                {t("messages.noResults")}
              </div>
            ) : (
              <ul>
                {suggestions.map((s) => (
                  <li key={s.id}>
                    <button
                      type="button"
                      className="w-full flex items-center justify-between px-4 py-3 hover:bg-accent transition-colors text-right"
                      onMouseDown={(e) => {
                        e.preventDefault();
                        handleSuggestionClick(s);
                      }}
                    >
                      <span className="text-sm font-medium truncate">
                        {s.title}
                      </span>
                      <Badge
                        variant="secondary"
                        className="mr-2 shrink-0 text-xs"
                      >
                        {s.aiModel}
                      </Badge>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </div>
    </>
  );
}
