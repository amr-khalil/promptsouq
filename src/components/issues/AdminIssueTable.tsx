"use client";

import { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ChevronDown, ChevronUp, AlertCircle, Loader2 } from "lucide-react";

interface StatusChange {
  fromStatus: string;
  toStatus: string;
  note: string;
  createdAt: string;
}

interface AdminIssue {
  id: string;
  title: string;
  description: string;
  imageUrl: string | null;
  reporterName: string;
  reporterId: string;
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

export function AdminIssueTable() {
  const { t } = useTranslation("issues");
  const [issues, setIssues] = useState<AdminIssue[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string | undefined>();
  const [sort, setSort] = useState<"newest" | "oldest">("newest");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // Status change form state
  const [changingStatusId, setChangingStatusId] = useState<string | null>(null);
  const [newStatus, setNewStatus] = useState("");
  const [statusNote, setStatusNote] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const fetchIssues = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ sort });
      if (statusFilter) params.set("status", statusFilter);
      const res = await fetch(`/api/admin/issues?${params}`);
      if (!res.ok) return;
      const data = await res.json();
      setIssues(data.issues);
      setTotal(data.total);
    } finally {
      setLoading(false);
    }
  }, [statusFilter, sort]);

  useEffect(() => {
    fetchIssues();
  }, [fetchIssues]);

  async function handleStatusChange(issueId: string) {
    if (!newStatus || statusNote.length < 5) return;

    setSubmitting(true);
    try {
      const res = await fetch(`/api/admin/issues/${issueId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus, note: statusNote }),
      });

      if (!res.ok) {
        toast.error("فشل تحديث الحالة");
        return;
      }

      toast.success(t("statusChange.success"));
      setChangingStatusId(null);
      setNewStatus("");
      setStatusNote("");
      fetchIssues();
    } catch {
      toast.error("فشل تحديث الحالة");
    } finally {
      setSubmitting(false);
    }
  }

  const statuses = [undefined, "open", "in_progress", "resolved"] as const;

  return (
    <div className="space-y-4">
      {/* Controls */}
      <div className="flex items-center justify-between flex-wrap gap-3">
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
        <div className="flex gap-2">
          <button
            onClick={() => setSort("newest")}
            className={cn(
              "px-3 py-1.5 rounded-lg text-xs font-medium transition-colors",
              sort === "newest"
                ? "bg-zinc-700 text-white"
                : "text-zinc-500 hover:text-white",
            )}
          >
            {t("sortNewest")}
          </button>
          <button
            onClick={() => setSort("oldest")}
            className={cn(
              "px-3 py-1.5 rounded-lg text-xs font-medium transition-colors",
              sort === "oldest"
                ? "bg-zinc-700 text-white"
                : "text-zinc-500 hover:text-white",
            )}
          >
            {t("sortOldest")}
          </button>
        </div>
      </div>

      <p className="text-xs text-zinc-500">{total} {t("title").toLowerCase()}</p>

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-16 rounded-xl bg-zinc-800/50 animate-pulse" />
          ))}
        </div>
      ) : issues.length === 0 ? (
        <div className="text-center py-12">
          <AlertCircle className="w-10 h-10 text-zinc-600 mx-auto mb-3" />
          <p className="text-zinc-400">{t("empty")}</p>
        </div>
      ) : (
        <div className="space-y-2">
          {issues.map((issue) => {
            const expanded = expandedId === issue.id;
            return (
              <div
                key={issue.id}
                className="rounded-xl border border-zinc-800 bg-zinc-900/50 overflow-hidden"
              >
                <button
                  onClick={() => setExpandedId(expanded ? null : issue.id)}
                  className="w-full flex items-center gap-4 p-4 text-start"
                >
                  <div className="flex-1 min-w-0">
                    <h3 className="text-white font-medium text-sm line-clamp-1">
                      {issue.title}
                    </h3>
                    <p className="text-zinc-500 text-xs mt-0.5">
                      {issue.reporterName} · {new Date(issue.createdAt).toLocaleDateString("ar")}
                    </p>
                  </div>
                  <span
                    className={cn(
                      "shrink-0 text-xs px-2 py-0.5 rounded-full border",
                      statusColors[issue.status] ?? statusColors.open,
                    )}
                  >
                    {t(`status.${issue.status}` as "status.open")}
                  </span>
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
                        alt="Issue"
                        className="rounded-lg border border-zinc-700 max-h-64 object-contain"
                      />
                    )}

                    {/* Status change history */}
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

                    {/* Status change action */}
                    {changingStatusId === issue.id ? (
                      <div className="space-y-3 pt-2 border-t border-zinc-800">
                        <Select value={newStatus} onValueChange={setNewStatus}>
                          <SelectTrigger className="w-48">
                            <SelectValue placeholder="اختر الحالة" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="open">{t("status.open")}</SelectItem>
                            <SelectItem value="in_progress">{t("status.in_progress")}</SelectItem>
                            <SelectItem value="resolved">{t("status.resolved")}</SelectItem>
                          </SelectContent>
                        </Select>
                        <Textarea
                          placeholder={t("statusChange.notePlaceholder")}
                          value={statusNote}
                          onChange={(e) => setStatusNote(e.target.value)}
                          rows={3}
                        />
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            disabled={submitting || !newStatus || statusNote.length < 5}
                            onClick={() => handleStatusChange(issue.id)}
                            className="bg-[#7f0df2] hover:bg-[#6a0bcc] text-white"
                          >
                            {submitting && <Loader2 className="w-3 h-3 animate-spin me-1" />}
                            {t("statusChange.submit")}
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => {
                              setChangingStatusId(null);
                              setNewStatus("");
                              setStatusNote("");
                            }}
                          >
                            إلغاء
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setChangingStatusId(issue.id)}
                        className="border-zinc-700 text-zinc-400 hover:text-white"
                      >
                        {t("statusChange.submit")}
                      </Button>
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
