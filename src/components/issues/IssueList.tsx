"use client";

import { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";
import { ChevronDown, ChevronUp, AlertCircle } from "lucide-react";

interface StatusChange {
  fromStatus: string;
  toStatus: string;
  note: string;
  createdAt: string;
}

interface Issue {
  id: string;
  title: string;
  description: string;
  imageUrl: string | null;
  status: string;
  createdAt: string;
  updatedAt: string;
  statusChanges: StatusChange[];
}

const statusColors: Record<string, string> = {
  open: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  in_progress: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
  resolved: "bg-green-500/10 text-green-400 border-green-500/20",
};

export function IssueList({ refreshKey }: { refreshKey?: number }) {
  const { t } = useTranslation("issues");
  const [issues, setIssues] = useState<Issue[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string | undefined>();
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const fetchIssues = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (statusFilter) params.set("status", statusFilter);
      const res = await fetch(`/api/issues?${params}`);
      if (!res.ok) return;
      const data = await res.json();
      setIssues(data.issues);
    } finally {
      setLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => {
    fetchIssues();
  }, [fetchIssues, refreshKey]);

  const statuses = [undefined, "open", "in_progress", "resolved"] as const;

  return (
    <div className="space-y-4">
      {/* Status filter tabs */}
      <div className="flex gap-2 flex-wrap">
        {statuses.map((s) => (
          <button
            key={s ?? "all"}
            onClick={() => setStatusFilter(s)}
            className={cn(
              "px-3 py-1.5 rounded-lg text-sm font-medium transition-colors",
              statusFilter === s
                ? "bg-[#7f0df2]/10 text-[#7f0df2] border border-[#7f0df2]/30"
                : "text-zinc-400 hover:text-white border border-zinc-800 hover:border-zinc-600",
            )}
          >
            {s ? t(`status.${s}` as "status.open") : t("all")}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-20 rounded-xl bg-zinc-800/50 animate-pulse" />
          ))}
        </div>
      ) : issues.length === 0 ? (
        <div className="text-center py-12">
          <AlertCircle className="w-10 h-10 text-zinc-600 mx-auto mb-3" />
          <p className="text-zinc-400">{t("empty")}</p>
        </div>
      ) : (
        <div className="space-y-3">
          {issues.map((issue) => {
            const expanded = expandedId === issue.id;
            return (
              <div
                key={issue.id}
                className="rounded-xl border border-zinc-800 bg-zinc-900/50 overflow-hidden"
              >
                <button
                  onClick={() => setExpandedId(expanded ? null : issue.id)}
                  className="w-full flex items-center justify-between p-4 text-start"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-white font-medium text-sm line-clamp-1">
                        {issue.title}
                      </h3>
                      <span
                        className={cn(
                          "shrink-0 text-xs px-2 py-0.5 rounded-full border",
                          statusColors[issue.status] ?? statusColors.open,
                        )}
                      >
                        {t(`status.${issue.status}` as "status.open")}
                      </span>
                    </div>
                    <p className="text-zinc-500 text-xs">
                      {new Date(issue.createdAt).toLocaleDateString("ar")}
                    </p>
                  </div>
                  {expanded ? (
                    <ChevronUp className="w-4 h-4 text-zinc-500 shrink-0" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-zinc-500 shrink-0" />
                  )}
                </button>

                {expanded && (
                  <div className="px-4 pb-4 border-t border-zinc-800 pt-3 space-y-3">
                    <p className="text-zinc-300 text-sm whitespace-pre-wrap">
                      {issue.description}
                    </p>

                    {issue.imageUrl && (
                      <img
                        src={issue.imageUrl}
                        alt="Issue screenshot"
                        className="rounded-lg border border-zinc-700 max-h-64 object-contain"
                      />
                    )}

                    {issue.statusChanges.length > 0 && (
                      <div className="space-y-2 pt-2 border-t border-zinc-800">
                        {issue.statusChanges.map((sc, i) => (
                          <div key={i} className="flex gap-3 text-xs">
                            <div className="w-2 h-2 rounded-full bg-[#7f0df2] mt-1.5 shrink-0" />
                            <div>
                              <p className="text-zinc-400">
                                {t(`status.${sc.fromStatus}` as "status.open")} → {t(`status.${sc.toStatus}` as "status.open")}
                                <span className="text-zinc-600 ms-2">
                                  {new Date(sc.createdAt).toLocaleDateString("ar")}
                                </span>
                              </p>
                              <p className="text-zinc-300 mt-0.5">{sc.note}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
