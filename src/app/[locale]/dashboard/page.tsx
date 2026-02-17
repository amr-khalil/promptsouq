"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useUser } from "@clerk/nextjs";
import { Calendar, Heart, ShoppingBag } from "lucide-react";
import { useEffect, useState } from "react";

export default function DashboardProfile() {
  const { user } = useUser();
  const [purchaseCount, setPurchaseCount] = useState<number | null>(null);
  const [favoriteCount, setFavoriteCount] = useState<number | null>(null);

  useEffect(() => {
    fetch("/api/user/purchases")
      .then((res) => res.json())
      .then((json) => setPurchaseCount(json.data?.length ?? 0))
      .catch(() => setPurchaseCount(0));

    fetch("/api/favorites")
      .then((res) => res.json())
      .then((json) => setFavoriteCount(json.data?.length ?? 0))
      .catch(() => setFavoriteCount(0));
  }, []);

  const joinDate = user?.createdAt
    ? new Date(user.createdAt).toLocaleDateString("ar-SA", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "";

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center gap-4">
            <Avatar className="w-16 h-16">
              <AvatarImage src={user?.imageUrl} />
              <AvatarFallback>
                {user?.firstName?.charAt(0) ?? "م"}
              </AvatarFallback>
            </Avatar>
            <div>
              <h2 className="text-xl font-bold">
                {user?.fullName ?? "مستخدم"}
              </h2>
              <p className="text-sm text-muted-foreground">
                {user?.primaryEmailAddress?.emailAddress}
              </p>
              <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
                <Calendar className="h-3 w-3" />
                <span>انضم في {joinDate}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <ShoppingBag className="h-4 w-4" />
              المشتريات
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">
              {purchaseCount ?? "-"}
            </p>
            <p className="text-sm text-muted-foreground">إجمالي المشتريات</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <Heart className="h-4 w-4" />
              المفضلة
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">
              {favoriteCount ?? "-"}
            </p>
            <p className="text-sm text-muted-foreground">البرومبتات المفضلة</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
