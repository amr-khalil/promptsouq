"use client";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import type { z } from "zod";
import type { purchaseListItemSchema } from "@/lib/schemas/api";
import { Calendar } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

type PurchaseItem = z.infer<typeof purchaseListItemSchema>;

export function PurchaseCard({ item }: { item: PurchaseItem }) {
  const purchaseDate = new Date(item.purchasedAt).toLocaleDateString("ar-SA", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

  return (
    <Link href={`/purchase/${item.id}`}>
      <Card className="hover:bg-muted/50 transition-colors">
        <CardContent className="p-4">
          <div className="flex items-center gap-4">
            <div className="relative w-20 h-20 rounded-lg overflow-hidden shrink-0">
              <Image
                src={item.thumbnail}
                alt={item.title}
                fill
                className="object-cover"
                sizes="80px"
              />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-bold truncate">{item.title}</h3>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant="secondary" className="text-xs">
                  {item.aiModel}
                </Badge>
                <Badge variant="outline" className="text-xs">
                  {item.category}
                </Badge>
              </div>
              <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
                <Calendar className="h-3 w-3" />
                <span>{purchaseDate}</span>
              </div>
            </div>
            <div className="text-left shrink-0">
              <div className="font-bold">${item.priceAtPurchase.toFixed(2)}</div>
              <p className="text-xs text-muted-foreground">{item.seller.name}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
