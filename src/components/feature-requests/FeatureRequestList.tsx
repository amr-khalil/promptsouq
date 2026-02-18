"use client";

import { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { FeatureRequestCard, type FeatureRequest } from "./FeatureRequestCard";
import { FeatureRequestForm } from "./FeatureRequestForm";
import { Loader2, Lightbulb } from "lucide-react";
import { cn } from "@/lib/utils";

const PAGE_SIZE = 20;

export function FeatureRequestList() {
  const { t } = useTranslation("feature-requests");
  const { isSignedIn } = useAuth();
  const [requests, setRequests] = useState<FeatureRequest[]>([]);
  const [total, setTotal] = useState(0);
  const [sort, setSort] = useState<"votes" | "newest">("votes");
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  const fetchRequests = useCallback(async (offset: number, sortBy: string, append = false) => {
    if (append) setLoadingMore(true);
    else setLoading(true);

    try {
      const params = new URLSearchParams({
        sort: sortBy,
        limit: String(PAGE_SIZE),
        offset: String(offset),
      });
      const res = await fetch(`/api/feature-requests?${params}`);
      if (!res.ok) return;

      const data = await res.json();
      if (append) {
        setRequests((prev) => [...prev, ...data.requests]);
      } else {
        setRequests(data.requests);
      }
      setTotal(data.total);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, []);

  useEffect(() => {
    fetchRequests(0, sort);
  }, [sort, fetchRequests]);

  function handleSortChange(newSort: "votes" | "newest") {
    if (newSort === sort) return;
    setSort(newSort);
  }

  function handleLoadMore() {
    fetchRequests(requests.length, sort, true);
  }

  function handleCreated(request: FeatureRequest) {
    setRequests((prev) => [request, ...prev]);
    setTotal((prev) => prev + 1);
  }

  function handleVoteChange(id: string, voted: boolean, voteCount: number) {
    setRequests((prev) =>
      prev.map((r) =>
        r.id === id ? { ...r, userHasVoted: voted, voteCount } : r,
      ),
    );
  }

  const hasMore = requests.length < total;

  return (
    <div>
      {/* Controls */}
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div className="flex gap-2">
          <button
            onClick={() => handleSortChange("votes")}
            className={cn(
              "px-4 py-2 rounded-lg text-sm font-medium transition-colors",
              sort === "votes"
                ? "bg-[#7f0df2]/10 text-[#7f0df2] border border-[#7f0df2]/30"
                : "text-zinc-400 hover:text-white border border-zinc-800 hover:border-zinc-600",
            )}
          >
            {t("sort.votes")}
          </button>
          <button
            onClick={() => handleSortChange("newest")}
            className={cn(
              "px-4 py-2 rounded-lg text-sm font-medium transition-colors",
              sort === "newest"
                ? "bg-[#7f0df2]/10 text-[#7f0df2] border border-[#7f0df2]/30"
                : "text-zinc-400 hover:text-white border border-zinc-800 hover:border-zinc-600",
            )}
          >
            {t("sort.newest")}
          </button>
        </div>

        {isSignedIn && <FeatureRequestForm onCreated={handleCreated} />}
      </div>

      {/* List */}
      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="w-6 h-6 animate-spin text-zinc-500" />
        </div>
      ) : requests.length === 0 ? (
        <div className="text-center py-16">
          <Lightbulb className="w-12 h-12 text-zinc-600 mx-auto mb-4" />
          <p className="text-zinc-400">{t("empty")}</p>
          {!isSignedIn && (
            <p className="text-zinc-500 text-sm mt-2">{t("signInPrompt")}</p>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {requests.map((request) => (
            <FeatureRequestCard
              key={request.id}
              request={request}
              onVoteChange={handleVoteChange}
            />
          ))}

          {hasMore && (
            <div className="flex justify-center pt-4">
              <Button
                variant="outline"
                onClick={handleLoadMore}
                disabled={loadingMore}
                className="border-zinc-700 text-zinc-400 hover:text-white"
              >
                {loadingMore ? (
                  <Loader2 className="w-4 h-4 animate-spin me-2" />
                ) : null}
                {loadingMore ? "..." : "تحميل المزيد"}
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
