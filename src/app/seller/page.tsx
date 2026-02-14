"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import {
  CheckCircle,
  Clock,
  Copy,
  DollarSign,
  Package,
  Plus,
  Search,
  ShoppingBag,
  XCircle,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";

interface SellerPrompt {
  id: string;
  title: string;
  titleEn: string;
  aiModel: string;
  generationType: string;
  status: string;
  price: number;
  sales: number;
  thumbnail: string;
  rejectionReason: string | null;
  createdAt: string;
}

interface SellerStats {
  totalPrompts: number;
  approvedCount: number;
  pendingCount: number;
  rejectedCount: number;
  totalSales: number;
  totalEarnings: number;
}

const statusConfig: Record<string, { label: string; variant: "default" | "secondary" | "destructive"; icon: typeof CheckCircle }> = {
  approved: { label: "مقبول", variant: "default", icon: CheckCircle },
  pending: { label: "قيد المراجعة", variant: "secondary", icon: Clock },
  rejected: { label: "مرفوض", variant: "destructive", icon: XCircle },
};

export default function SellerDashboard() {
  const [prompts, setPrompts] = useState<SellerPrompt[]>([]);
  const [stats, setStats] = useState<SellerStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("newest");

  const fetchData = useCallback(async () => {
    try {
      const params = new URLSearchParams();
      if (statusFilter !== "all") params.set("status", statusFilter);
      if (search) params.set("search", search);
      params.set("sortBy", sortBy);

      const [promptsRes, statsRes] = await Promise.all([
        fetch(`/api/seller/prompts?${params}`),
        fetch("/api/seller/stats"),
      ]);

      if (!promptsRes.ok || !statsRes.ok) {
        throw new Error("فشل في تحميل البيانات");
      }

      const [promptsData, statsData] = await Promise.all([
        promptsRes.json(),
        statsRes.json(),
      ]);

      setPrompts(promptsData.data);
      setStats(statsData.data);
    } catch {
      setError("حدث خطأ أثناء تحميل البيانات");
    } finally {
      setLoading(false);
    }
  }, [statusFilter, search, sortBy]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Skeleton className="h-8 w-48 mb-2" />
        <Skeleton className="h-4 w-64 mb-8" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <Skeleton className="h-8 w-8 mb-2" />
                <Skeleton className="h-6 w-24 mb-1" />
                <Skeleton className="h-3 w-20" />
              </CardContent>
            </Card>
          ))}
        </div>
        <Card>
          <CardContent className="p-6 space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex items-center gap-4 p-4 border rounded-lg">
                <Skeleton className="w-16 h-16 rounded" />
                <div className="flex-1">
                  <Skeleton className="h-4 w-3/4 mb-2" />
                  <Skeleton className="h-3 w-32" />
                </div>
                <Skeleton className="h-5 w-20" />
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <p className="text-destructive text-lg mb-4">{error}</p>
        <Button onClick={() => window.location.reload()}>إعادة المحاولة</Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">لوحة تحكم البائع</h1>
          <p className="text-muted-foreground">إدارة البرومبتات وتتبع المبيعات</p>
        </div>
        <Button asChild>
          <Link href="/sell">
            <Plus className="h-4 w-4 me-2" />
            بيع برومبت
          </Link>
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <Package className="h-8 w-8 text-blue-600 mb-2" />
            <div className="text-2xl font-bold mb-1">{stats?.totalPrompts ?? 0}</div>
            <p className="text-sm text-muted-foreground">إجمالي البرومبتات</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <CheckCircle className="h-8 w-8 text-green-600 mb-2" />
            <div className="text-2xl font-bold mb-1">{stats?.approvedCount ?? 0}</div>
            <p className="text-sm text-muted-foreground">مقبول</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <Clock className="h-8 w-8 text-yellow-600 mb-2" />
            <div className="text-2xl font-bold mb-1">{stats?.pendingCount ?? 0}</div>
            <p className="text-sm text-muted-foreground">قيد المراجعة</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <ShoppingBag className="h-8 w-8 text-purple-600 mb-2" />
            <div className="text-2xl font-bold mb-1">{stats?.totalSales ?? 0}</div>
            <p className="text-sm text-muted-foreground">إجمالي المبيعات</p>
          </CardContent>
        </Card>
      </div>

      {stats?.totalEarnings ? (
        <Card className="mb-8">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <DollarSign className="h-8 w-8 text-green-600" />
              <div>
                <div className="text-2xl font-bold text-green-600">
                  ${((stats.totalEarnings ?? 0) / 100).toFixed(2)}
                </div>
                <p className="text-sm text-muted-foreground">إجمالي الأرباح</p>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : null}

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>البرومبتات</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4 mb-6 sm:flex-row">
            <div className="relative flex-1">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="بحث..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pr-9"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="الحالة" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">الكل</SelectItem>
                <SelectItem value="approved">مقبول</SelectItem>
                <SelectItem value="pending">قيد المراجعة</SelectItem>
                <SelectItem value="rejected">مرفوض</SelectItem>
              </SelectContent>
            </Select>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="الترتيب" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">الأحدث</SelectItem>
                <SelectItem value="oldest">الأقدم</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {prompts.length === 0 ? (
            <div className="text-center py-12">
              <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">لا توجد برومبتات</h3>
              <p className="text-muted-foreground mb-4">
                ابدأ ببيع أول برومبت لك في السوق
              </p>
              <Button asChild>
                <Link href="/sell">
                  <Plus className="h-4 w-4 me-2" />
                  بيع برومبت
                </Link>
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {prompts.map((prompt) => {
                const config = statusConfig[prompt.status] ?? statusConfig.pending;
                const StatusIcon = config.icon;

                return (
                  <div
                    key={prompt.id}
                    className="flex items-center gap-4 p-4 border rounded-lg"
                  >
                    <div className="relative w-16 h-16 rounded overflow-hidden shrink-0">
                      <Image
                        src={prompt.thumbnail}
                        alt={prompt.title}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-bold truncate">{prompt.title}</h3>
                        <Badge variant={config.variant}>
                          <StatusIcon className="h-3 w-3 me-1" />
                          {config.label}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-3 text-sm text-muted-foreground">
                        <span>{prompt.aiModel}</span>
                        <span>&#183;</span>
                        <span>${prompt.price}</span>
                        {prompt.sales > 0 && (
                          <>
                            <span>&#183;</span>
                            <span>{prompt.sales} مبيعات</span>
                          </>
                        )}
                      </div>
                      {prompt.rejectionReason && (
                        <p className="text-sm text-destructive mt-1">
                          سبب الرفض: {prompt.rejectionReason}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      {prompt.status === "approved" && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => {
                            const url = `${window.location.origin}/prompt/${prompt.id}?ref=direct`;
                            navigator.clipboard.writeText(url);
                            toast.success("تم نسخ رابط المشاركة");
                          }}
                        >
                          <Copy className="h-3 w-3 me-1" />
                          <span className="hidden sm:inline text-xs">نسخ الرابط</span>
                        </Button>
                      )}
                      <span className="text-sm text-muted-foreground whitespace-nowrap">
                        {new Date(prompt.createdAt).toLocaleDateString("ar")}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
