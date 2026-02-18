"use client";

import { SellerEarningsOverview } from "@/components/dashboard/SellerEarningsOverview";
import { SellerSalesHistory } from "@/components/dashboard/SellerSalesHistory";
import { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

const PAGE_SIZE = 20;

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

interface EarningsSummary {
  totalSales: number;
  grossRevenue: number;
  totalCommission: number;
  netEarnings: number;
  payoutsEnabled: boolean;
}

export default function SellerEarningsPage() {
  const { t } = useTranslation("dashboard");
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState<EarningsSummary | null>(null);
  const [sales, setSales] = useState<SaleEntry[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);

  const fetchEarnings = useCallback(async (pageNum: number) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        limit: PAGE_SIZE.toString(),
        offset: (pageNum * PAGE_SIZE).toString(),
      });
      const res = await fetch(`/api/seller/earnings?${params}`);
      if (!res.ok) throw new Error();
      const json = await res.json();
      setSummary(json.data.summary);
      setSales(json.data.sales);
      setTotal(json.data.total);
    } catch {
      setSummary(null);
      setSales([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchEarnings(page);
  }, [fetchEarnings, page]);

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold">{t("seller.earnings.title")}</h2>
      <SellerEarningsOverview summary={summary} loading={loading} />
      <SellerSalesHistory
        sales={sales}
        total={total}
        loading={loading}
        page={page}
        pageSize={PAGE_SIZE}
        onPageChange={handlePageChange}
      />
    </div>
  );
}
