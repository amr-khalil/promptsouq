"use client";

import { useTranslation } from "react-i18next";
import { VoteButton } from "./VoteButton";
import { cn } from "@/lib/utils";

export interface FeatureRequest {
  id: string;
  title: string;
  description: string;
  authorName: string;
  voteCount: number;
  status: string;
  createdAt: string;
  userHasVoted: boolean;
}

const statusColors: Record<string, string> = {
  open: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  under_review: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
  planned: "bg-purple-500/10 text-purple-400 border-purple-500/20",
  completed: "bg-green-500/10 text-green-400 border-green-500/20",
};

function formatRelativeDate(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return "اليوم";
  if (diffDays === 1) return "أمس";
  if (diffDays < 7) return `منذ ${diffDays} أيام`;
  if (diffDays < 30) return `منذ ${Math.floor(diffDays / 7)} أسابيع`;
  return `منذ ${Math.floor(diffDays / 30)} أشهر`;
}

interface FeatureRequestCardProps {
  request: FeatureRequest;
  onVoteChange?: (id: string, voted: boolean, voteCount: number) => void;
}

export function FeatureRequestCard({ request, onVoteChange }: FeatureRequestCardProps) {
  const { t } = useTranslation("feature-requests");

  return (
    <div className="flex gap-4 p-4 rounded-xl border border-zinc-800 bg-zinc-900/50 hover:border-zinc-700 transition-colors">
      <VoteButton
        featureRequestId={request.id}
        initialVoteCount={request.voteCount}
        initialUserHasVoted={request.userHasVoted}
        onVoteChange={(voted, voteCount) => onVoteChange?.(request.id, voted, voteCount)}
      />

      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2 mb-1">
          <h3 className="text-white font-semibold text-base leading-snug line-clamp-1">
            {request.title}
          </h3>
          <span
            className={cn(
              "shrink-0 text-xs px-2 py-0.5 rounded-full border",
              statusColors[request.status] ?? statusColors.open,
            )}
          >
            {t(`status.${request.status}` as "status.open")}
          </span>
        </div>

        <p className="text-zinc-400 text-sm line-clamp-2 mb-2">
          {request.description}
        </p>

        <div className="flex items-center gap-2 text-xs text-zinc-500">
          <span>{request.authorName}</span>
          <span>·</span>
          <span>{formatRelativeDate(request.createdAt)}</span>
        </div>
      </div>
    </div>
  );
}
