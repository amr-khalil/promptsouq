"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
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
import Link from "next/link";
import { useTranslation } from "react-i18next";

interface SaleEntry {
  orderId: string;
  promptId: string;
  promptTitle: string;
  saleDate: string;
  priceAtPurchase: number;
  commissionRate: number;
  commissionAmount: number;
  netAmount: number;
  payoutStatus: string;
}

interface SellerSalesHistoryProps {
  sales: SaleEntry[];
  total: number;
  loading: boolean;
  page: number;
  pageSize: number;
  onPageChange: (page: number) => void;
}

function formatCurrency(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`;
}

export function SellerSalesHistory({
  sales,
  total,
  loading,
  page,
  pageSize,
  onPageChange,
}: SellerSalesHistoryProps) {
  const { t } = useTranslation("dashboard");
  const totalPages = Math.ceil(total / pageSize);

  if (loading) {
    return (
      <div className="space-y-3">
        <Skeleton className="h-5 w-32" />
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-12 w-full" />
        ))}
      </div>
    );
  }

  if (sales.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <p className="text-muted-foreground">{t("seller.earnings.empty")}</p>
          <p className="text-sm text-muted-foreground mt-1">
            {t("seller.earnings.emptyDescription")}
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">{t("seller.earnings.salesHistory")}</h3>

      {/* Desktop table */}
      <div className="hidden md:block rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t("seller.earnings.date")}</TableHead>
              <TableHead>{t("seller.earnings.prompt")}</TableHead>
              <TableHead>{t("seller.earnings.price")}</TableHead>
              <TableHead>{t("seller.earnings.commissionRate")}</TableHead>
              <TableHead>{t("seller.earnings.commissionAmount")}</TableHead>
              <TableHead>{t("seller.earnings.netAmount")}</TableHead>
              <TableHead>{t("seller.earnings.payoutStatus")}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sales.map((sale) => (
              <TableRow key={`${sale.orderId}-${sale.promptId}`}>
                <TableCell className="whitespace-nowrap">
                  {new Date(sale.saleDate).toLocaleDateString("ar-EG")}
                </TableCell>
                <TableCell>
                  <Link
                    href={`/prompt/${sale.promptId}`}
                    className="text-primary hover:underline truncate max-w-[200px] block"
                  >
                    {sale.promptTitle}
                  </Link>
                </TableCell>
                <TableCell>{formatCurrency(sale.priceAtPurchase)}</TableCell>
                <TableCell>{Math.round(sale.commissionRate * 100)}%</TableCell>
                <TableCell>{formatCurrency(sale.commissionAmount)}</TableCell>
                <TableCell className="font-medium">{formatCurrency(sale.netAmount)}</TableCell>
                <TableCell>
                  <Badge
                    variant="outline"
                    className={
                      sale.payoutStatus === "paid"
                        ? "border-green-500 text-green-700 dark:text-green-400"
                        : "border-yellow-500 text-yellow-700 dark:text-yellow-400"
                    }
                  >
                    {sale.payoutStatus === "paid"
                      ? t("seller.earnings.paid")
                      : t("seller.earnings.pendingPayout")}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Mobile cards */}
      <div className="md:hidden space-y-3">
        {sales.map((sale) => (
          <Card key={`${sale.orderId}-${sale.promptId}`}>
            <CardContent className="p-4 space-y-2">
              <div className="flex items-center justify-between">
                <Link
                  href={`/prompt/${sale.promptId}`}
                  className="text-primary hover:underline font-medium truncate max-w-[60%]"
                >
                  {sale.promptTitle}
                </Link>
                <Badge
                  variant="outline"
                  className={
                    sale.payoutStatus === "paid"
                      ? "border-green-500 text-green-700 dark:text-green-400"
                      : "border-yellow-500 text-yellow-700 dark:text-yellow-400"
                  }
                >
                  {sale.payoutStatus === "paid"
                    ? t("seller.earnings.paid")
                    : t("seller.earnings.pendingPayout")}
                </Badge>
              </div>
              <div className="flex items-center gap-3 text-sm text-muted-foreground">
                <span>{new Date(sale.saleDate).toLocaleDateString("ar-EG")}</span>
                <span>{formatCurrency(sale.priceAtPurchase)}</span>
                <span>{Math.round(sale.commissionRate * 100)}%</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">
                  {t("seller.earnings.netAmount")}: <span className="font-medium text-foreground">{formatCurrency(sale.netAmount)}</span>
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
            onClick={() => onPageChange(page - 1)}
            disabled={page <= 0}
          >
            <ChevronRight className="h-4 w-4 rtl:rotate-180" />
          </Button>
          <span className="text-sm text-muted-foreground">
            {page + 1} / {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(page + 1)}
            disabled={page >= totalPages - 1}
          >
            <ChevronLeft className="h-4 w-4 rtl:rotate-180" />
          </Button>
        </div>
      )}
    </div>
  );
}
