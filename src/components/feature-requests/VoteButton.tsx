"use client";

import { ArrowBigUp } from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface VoteButtonProps {
  featureRequestId: string;
  initialVoteCount: number;
  initialUserHasVoted: boolean;
  onVoteChange?: (voted: boolean, voteCount: number) => void;
}

export function VoteButton({
  featureRequestId,
  initialVoteCount,
  initialUserHasVoted,
  onVoteChange,
}: VoteButtonProps) {
  const { t } = useTranslation("feature-requests");
  const { isSignedIn } = useAuth();
  const [voted, setVoted] = useState(initialUserHasVoted);
  const [voteCount, setVoteCount] = useState(initialVoteCount);
  const [loading, setLoading] = useState(false);

  async function handleToggle() {
    if (!isSignedIn) {
      toast.error(t("signInPrompt"));
      return;
    }

    const prevVoted = voted;
    const prevCount = voteCount;

    // Optimistic update
    const newVoted = !voted;
    const newCount = newVoted ? voteCount + 1 : voteCount - 1;
    setVoted(newVoted);
    setVoteCount(newCount);

    setLoading(true);
    try {
      const res = await fetch(`/api/feature-requests/${featureRequestId}/vote`, {
        method: newVoted ? "POST" : "DELETE",
      });

      if (!res.ok) {
        // Rollback
        setVoted(prevVoted);
        setVoteCount(prevCount);
        return;
      }

      const data = await res.json();
      setVoteCount(data.voteCount);
      setVoted(data.voted);
      onVoteChange?.(data.voted, data.voteCount);
    } catch {
      // Rollback
      setVoted(prevVoted);
      setVoteCount(prevCount);
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      onClick={handleToggle}
      disabled={loading}
      className={cn(
        "flex flex-col items-center gap-0.5 px-3 py-2 rounded-lg border transition-all min-w-[60px]",
        voted
          ? "border-[#7f0df2] bg-[#7f0df2]/10 text-[#7f0df2]"
          : "border-zinc-700 bg-zinc-800/50 text-zinc-400 hover:border-zinc-500 hover:text-zinc-300",
        loading && "opacity-60 cursor-not-allowed",
      )}
    >
      <ArrowBigUp
        className={cn("w-5 h-5", voted && "fill-current")}
      />
      <span className="text-sm font-bold">{voteCount}</span>
    </button>
  );
}
