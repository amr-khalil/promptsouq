"use client";

import { Badge } from "@/components/ui/badge";
import { BorderBeam } from "@/components/ui/border-beam";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";

interface Suggestion {
  id: string;
  title: string;
  aiModel: string;
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
  placeholder = "ابحث عن برومبت...",
  className = "",
  defaultValue = "",
  navigateOnSearch,
}: SearchInputProps) {
  const [query, setQuery] = useState(defaultValue);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  const fetchSuggestions = useCallback(async (q: string) => {
    if (q.length < 2) {
      setSuggestions([]);
      setIsOpen(false);
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
    debounceRef.current = setTimeout(() => fetchSuggestions(value), 300);
  };

  const handleSearch = () => {
    setIsOpen(false);
    if (!query.trim()) return;
    if (onSearch) {
      onSearch(query.trim());
    } else if (navigateOnSearch) {
      router.push(
        `${navigateOnSearch}?search=${encodeURIComponent(query.trim())}`,
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

  const handleClear = () => {
    setQuery("");
    setSuggestions([]);
    setIsOpen(false);
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
              placeholder={placeholder}
              className="w-full pr-10 pl-24 h-12 text-base border-transparent bg-background"
              value={query}
              onChange={(e) => handleInputChange(e.target.value)}
              onKeyDown={handleKeyDown}
              onFocus={() => {
                setIsFocused(true);
                if (suggestions.length > 0) setIsOpen(true);
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
              بحث
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

        {/* Suggestions dropdown */}
        {isOpen && (
          <div className="absolute z-50 w-full mt-1 bg-popover border border-border rounded-lg shadow-lg overflow-hidden">
            {isLoading ? (
              <div className="p-4 text-center text-sm text-muted-foreground">
                جاري البحث...
              </div>
            ) : suggestions.length === 0 ? (
              <div className="p-4 text-center text-sm text-muted-foreground">
                لا توجد نتائج
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
