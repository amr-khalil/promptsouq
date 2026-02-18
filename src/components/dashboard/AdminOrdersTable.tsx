"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

interface AdminOrder {
  id: string;
  buyerId: string;
  amountTotal: number;
  currency: string;
  status: string;
  itemCount: number;
  createdAt: string;
}

interface OrderItem {
  id: number;
  promptId: string;
  promptTitle: string;
  sellerId: string | null;
  sellerName: string;
  priceAtPurchase: number;
  commissionRate: number | null;
  sellerPayoutAmount: number | null;
  sellerStripeAccountId: string | null;
}

interface OrderDetail extends AdminOrder {
  stripePaymentIntentId: string | null;
  items: OrderItem[];
}

const PAGE_SIZE = 20;

function formatCurrency(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`;
}

export function AdminOrdersTable() {
  const { t } = useTranslation("dashboard");
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  // Detail dialog
  const [detailId, setDetailId] = useState<string | null>(null);
  const [detail, setDetail] = useState<OrderDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        limit: PAGE_SIZE.toString(),
        offset: (page * PAGE_SIZE).toString(),
      });
      if (statusFilter !== "all") params.set("status", statusFilter);
      if (dateFrom) params.set("dateFrom", dateFrom);
      if (dateTo) params.set("dateTo", dateTo);

      const res = await fetch(`/api/admin/orders?${params}`);
      if (!res.ok) throw new Error();
      const json = await res.json();
      setOrders(json.data ?? []);
      setTotal(json.total ?? 0);
    } catch {
      setOrders([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }, [page, statusFilter, dateFrom, dateTo]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const openDetail = async (orderId: string) => {
    setDetailId(orderId);
    setDetailLoading(true);
    try {
      const res = await fetch(`/api/admin/orders/${orderId}`);
      if (!res.ok) throw new Error();
      const json = await res.json();
      setDetail(json.data);
    } catch {
      setDetail(null);
    } finally {
      setDetailLoading(false);
    }
  };

  const totalPages = Math.ceil(total / PAGE_SIZE);

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold">{t("admin.orders.title")}</h2>
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v); setPage(0); }}>
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder={t("admin.orders.filterStatus")} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t("admin.orders.all")}</SelectItem>
            <SelectItem value="completed">{t("admin.orders.completed")}</SelectItem>
            <SelectItem value="refunded">{t("admin.orders.refunded")}</SelectItem>
          </SelectContent>
        </Select>
        <Input
          type="date"
          value={dateFrom}
          onChange={(e) => { setDateFrom(e.target.value); setPage(0); }}
          placeholder={t("admin.orders.filterDateFrom")}
          className="w-[160px]"
        />
        <Input
          type="date"
          value={dateTo}
          onChange={(e) => { setDateTo(e.target.value); setPage(0); }}
          placeholder={t("admin.orders.filterDateTo")}
          className="w-[160px]"
        />
      </div>

      {/* Content */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-12 w-full" />
          ))}
        </div>
      ) : orders.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <p className="text-muted-foreground">{t("admin.orders.empty")}</p>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Desktop table */}
          <div className="hidden md:block rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t("admin.orders.orderId")}</TableHead>
                  <TableHead>{t("admin.orders.date")}</TableHead>
                  <TableHead>{t("admin.orders.buyer")}</TableHead>
                  <TableHead>{t("admin.orders.total")}</TableHead>
                  <TableHead>{t("admin.orders.items")}</TableHead>
                  <TableHead>{t("admin.orders.status")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {orders.map((order) => (
                  <TableRow
                    key={order.id}
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => openDetail(order.id)}
                  >
                    <TableCell className="font-mono text-xs">
                      {order.id.slice(0, 8)}...
                    </TableCell>
                    <TableCell className="whitespace-nowrap">
                      {new Date(order.createdAt).toLocaleDateString("ar-EG")}
                    </TableCell>
                    <TableCell className="font-mono text-xs">
                      {order.buyerId.slice(0, 12)}...
                    </TableCell>
                    <TableCell>{formatCurrency(order.amountTotal)}</TableCell>
                    <TableCell>{order.itemCount}</TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={
                          order.status === "completed"
                            ? "border-green-500 text-green-700 dark:text-green-400"
                            : "border-red-500 text-red-700 dark:text-red-400"
                        }
                      >
                        {order.status === "completed"
                          ? t("admin.orders.completed")
                          : t("admin.orders.refunded")}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Mobile cards */}
          <div className="md:hidden space-y-3">
            {orders.map((order) => (
              <Card
                key={order.id}
                className="cursor-pointer"
                onClick={() => openDetail(order.id)}
              >
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-mono text-xs">{order.id.slice(0, 8)}...</span>
                    <Badge
                      variant="outline"
                      className={
                        order.status === "completed"
                          ? "border-green-500 text-green-700 dark:text-green-400"
                          : "border-red-500 text-red-700 dark:text-red-400"
                      }
                    >
                      {order.status === "completed"
                        ? t("admin.orders.completed")
                        : t("admin.orders.refunded")}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-muted-foreground">
                    <span>{new Date(order.createdAt).toLocaleDateString("ar-EG")}</span>
                    <span>{formatCurrency(order.amountTotal)}</span>
                    <span>
                      {order.itemCount} {t("admin.orders.items")}
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(page - 1)}
                disabled={page <= 0}
              >
                <ChevronRight className="h-4 w-4 rtl:rotate-180" />
                {t("admin.orders.previous")}
              </Button>
              <span className="text-sm text-muted-foreground">
                {t("admin.orders.page", { current: page + 1, total: totalPages })}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(page + 1)}
                disabled={page >= totalPages - 1}
              >
                {t("admin.orders.next")}
                <ChevronLeft className="h-4 w-4 rtl:rotate-180" />
              </Button>
            </div>
          )}
        </>
      )}

      {/* Order Detail Dialog */}
      <Dialog open={!!detailId} onOpenChange={(open) => !open && setDetailId(null)}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{t("admin.orders.orderDetail")}</DialogTitle>
          </DialogHeader>
          {detailLoading ? (
            <div className="space-y-3">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-20 w-full" />
            </div>
          ) : detail ? (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <span className="text-muted-foreground">{t("admin.orders.orderId")}:</span>
                  <p className="font-mono text-xs break-all">{detail.id}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">{t("admin.orders.date")}:</span>
                  <p>{new Date(detail.createdAt).toLocaleString("ar-EG")}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">{t("admin.orders.buyer")}:</span>
                  <p className="font-mono text-xs break-all">{detail.buyerId}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">{t("admin.orders.total")}:</span>
                  <p className="font-bold">{formatCurrency(detail.amountTotal)}</p>
                </div>
                {detail.stripePaymentIntentId && (
                  <div className="col-span-2">
                    <span className="text-muted-foreground">{t("admin.orders.paymentIntent")}:</span>
                    <p className="font-mono text-xs break-all">{detail.stripePaymentIntentId}</p>
                  </div>
                )}
              </div>

              {/* Items */}
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{t("admin.orders.promptTitle")}</TableHead>
                      <TableHead>{t("admin.orders.sellerName")}</TableHead>
                      <TableHead>{t("admin.orders.priceAtPurchase")}</TableHead>
                      <TableHead>{t("admin.orders.commissionRate")}</TableHead>
                      <TableHead>{t("admin.orders.sellerPayout")}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {detail.items.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell className="max-w-[150px] truncate">{item.promptTitle}</TableCell>
                        <TableCell>{item.sellerName}</TableCell>
                        <TableCell>{formatCurrency(item.priceAtPurchase)}</TableCell>
                        <TableCell>
                          {item.commissionRate != null ? `${Math.round(item.commissionRate * 100)}%` : "-"}
                        </TableCell>
                        <TableCell>
                          {item.sellerPayoutAmount != null ? formatCurrency(item.sellerPayoutAmount) : "-"}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          ) : (
            <p className="text-muted-foreground text-center py-4">{t("common.error")}</p>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
