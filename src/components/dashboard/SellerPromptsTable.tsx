"use client";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { PromptStatusBadge } from "./PromptStatusBadge";
import { Edit, Plus, Trash2 } from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";

interface SellerPrompt {
  id: string;
  title: string;
  titleEn: string;
  aiModel: string;
  generationType: string | null;
  status: string;
  price: number;
  sales: number;
  thumbnail: string;
  rejectionReason: string | null;
  createdAt: string;
}

type StatusFilter = "all" | "pending" | "approved" | "rejected";

export function SellerPromptsTable() {
  const { t } = useTranslation("dashboard");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [search, setSearch] = useState("");
  const [prompts, setPrompts] = useState<SellerPrompt[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleteSales, setDeleteSales] = useState(0);
  const [deleting, setDeleting] = useState(false);

  const fetchPrompts = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (statusFilter !== "all") params.set("status", statusFilter);
      if (search) params.set("search", search);
      const res = await fetch(`/api/seller/prompts?${params}`);
      if (!res.ok) throw new Error();
      const json = await res.json();
      setPrompts(json.data ?? []);
    } catch {
      setPrompts([]);
    } finally {
      setLoading(false);
    }
  }, [statusFilter, search]);

  useEffect(() => {
    fetchPrompts();
  }, [fetchPrompts]);

  const handleDelete = async () => {
    if (!deleteId) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/seller/prompts/${deleteId}`, { method: "DELETE" });
      if (!res.ok) {
        toast.error(t("common.error"));
        return;
      }
      toast.success(t("seller.prompts.deleteTitle"));
      setDeleteId(null);
      fetchPrompts();
    } catch {
      toast.error(t("common.error"));
    } finally {
      setDeleting(false);
    }
  };

  const statusTabs: { key: StatusFilter; label: string }[] = [
    { key: "all", label: t("seller.prompts.all") },
    { key: "pending", label: t("seller.prompts.pending") },
    { key: "approved", label: t("seller.prompts.approved") },
    { key: "rejected", label: t("seller.prompts.rejected") },
  ];

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex gap-2 flex-wrap">
          {statusTabs.map((tab) => (
            <Button
              key={tab.key}
              variant={statusFilter === tab.key ? "default" : "outline"}
              size="sm"
              onClick={() => setStatusFilter(tab.key)}
            >
              {tab.label}
            </Button>
          ))}
        </div>
        <div className="flex-1">
          <Input
            placeholder={t("seller.prompts.search")}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="max-w-xs"
          />
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardContent className="p-4">
                <div className="flex items-center gap-4">
                  <Skeleton className="w-16 h-16 rounded" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-2/3" />
                    <Skeleton className="h-3 w-1/3" />
                  </div>
                  <Skeleton className="h-9 w-20" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : prompts.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <p className="text-muted-foreground mb-4">
              {search ? t("seller.prompts.noResults") : t("seller.prompts.empty")}
            </p>
            {!search && (
              <>
                <p className="text-sm text-muted-foreground mb-4">
                  {t("seller.prompts.emptyDescription")}
                </p>
                <Button asChild>
                  <Link href="/sell">
                    <Plus className="me-2 h-4 w-4" />
                    {t("seller.prompts.createNew")}
                  </Link>
                </Button>
              </>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {prompts.map((prompt) => (
            <Card key={prompt.id}>
              <CardContent className="p-4">
                <div className="flex items-start gap-4">
                  {prompt.thumbnail && (
                    <img
                      src={prompt.thumbnail}
                      alt=""
                      className="w-16 h-16 rounded object-cover shrink-0"
                    />
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-medium truncate">{prompt.title}</h3>
                      <PromptStatusBadge status={prompt.status as "pending" | "approved" | "rejected"} />
                    </div>
                    <div className="flex items-center gap-3 text-sm text-muted-foreground">
                      <span>{prompt.aiModel}</span>
                      <span>${prompt.price}</span>
                      <span>
                        {prompt.sales} {t("seller.prompts.sales")}
                      </span>
                      <span>{new Date(prompt.createdAt).toLocaleDateString("ar-EG")}</span>
                    </div>
                    {prompt.rejectionReason && prompt.status === "rejected" && (
                      <div className="mt-2 text-sm bg-red-50 dark:bg-red-900/20 p-2 rounded">
                        <span className="font-medium text-red-800 dark:text-red-400">
                          {t("seller.prompts.rejectionReason")}:
                        </span>{" "}
                        {prompt.rejectionReason}
                      </div>
                    )}
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <Button variant="outline" size="sm" asChild>
                      <Link href={`/sell?edit=${prompt.id}`}>
                        <Edit className="h-4 w-4" />
                        <span className="hidden sm:inline ms-1">{t("seller.prompts.edit")}</span>
                      </Link>
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-destructive hover:bg-destructive/10"
                      onClick={() => {
                        setDeleteId(prompt.id);
                        setDeleteSales(prompt.sales);
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("seller.prompts.deleteTitle")}</AlertDialogTitle>
            <AlertDialogDescription>
              {deleteSales > 0
                ? t("seller.prompts.deleteWithSales")
                : t("seller.prompts.deleteDescription")}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("common.cancel")}</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {t("seller.prompts.delete")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
