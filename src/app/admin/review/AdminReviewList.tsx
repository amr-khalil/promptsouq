"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Clock, Package } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

interface AdminPrompt {
  id: string;
  title: string;
  titleEn: string;
  aiModel: string;
  generationType: string | null;
  price: number;
  sellerName: string;
  sellerId: string | null;
  thumbnail: string;
  status: string;
  createdAt: string;
}

interface AdminReviewListProps {
  initialPrompts: AdminPrompt[];
}

export function AdminReviewList({ initialPrompts }: AdminReviewListProps) {
  const [fetchedPrompts, setFetchedPrompts] = useState<Record<string, AdminPrompt[]>>({});
  const [statusFilter, setStatusFilter] = useState("pending");

  useEffect(() => {
    if (statusFilter === "pending") return;
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(`/api/admin/prompts?status=${statusFilter}&limit=50`);
        if (res.ok && !cancelled) {
          const json = await res.json();
          setFetchedPrompts((prev) => ({ ...prev, [statusFilter]: json.data as AdminPrompt[] }));
        }
      } catch {
        // Keep existing data on error
      }
    })();
    return () => { cancelled = true; };
  }, [statusFilter]);

  const prompts = useMemo(
    () => (statusFilter === "pending" ? initialPrompts : (fetchedPrompts[statusFilter] ?? [])),
    [statusFilter, initialPrompts, fetchedPrompts],
  );

  return (
    <div>
      <div className="mb-6">
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="الحالة" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="pending">قيد المراجعة</SelectItem>
            <SelectItem value="approved">مقبول</SelectItem>
            <SelectItem value="rejected">مرفوض</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {prompts.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">لا توجد برومبتات</h3>
            <p className="text-muted-foreground">
              لا توجد برومبتات {statusFilter === "pending" ? "في انتظار المراجعة" : "بهذه الحالة"}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {prompts.map((prompt) => (
            <Card key={prompt.id}>
              <CardContent className="p-4">
                <div className="flex items-center gap-4">
                  <div className="relative w-16 h-16 rounded overflow-hidden shrink-0">
                    <Image
                      src={prompt.thumbnail}
                      alt={prompt.title}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold truncate">{prompt.title}</h3>
                    <div className="flex items-center gap-3 text-sm text-muted-foreground mt-1">
                      <span>{prompt.aiModel}</span>
                      <span>&#183;</span>
                      <span>${prompt.price}</span>
                      <span>&#183;</span>
                      <span>{prompt.sellerName}</span>
                    </div>
                    <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      <span>
                        {new Date(prompt.createdAt).toLocaleDateString("ar", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge
                      variant={
                        prompt.status === "approved"
                          ? "default"
                          : prompt.status === "rejected"
                            ? "destructive"
                            : "secondary"
                      }
                    >
                      {prompt.status === "approved"
                        ? "مقبول"
                        : prompt.status === "rejected"
                          ? "مرفوض"
                          : "قيد المراجعة"}
                    </Badge>
                    <Button asChild size="sm">
                      <Link href={`/admin/review/${prompt.id}`}>
                        مراجعة
                      </Link>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
