"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { Prompt } from "@/lib/schemas/api";
import {
  Bell,
  Download,
  Heart,
  Settings,
  ShoppingBag,
  Star,
  User,
  Wallet,
} from "lucide-react";
import { useEffect, useState } from "react";

export default function Profile() {
  const [allPrompts, setAllPrompts] = useState<Prompt[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch("/api/prompts");
        if (!res.ok) throw new Error("فشل في تحميل البيانات");

        const data = await res.json();
        setAllPrompts(data.data);
      } catch {
        setError("حدث خطأ أثناء تحميل البيانات");
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  const userPurchases = allPrompts.slice(0, 4);
  const savedPrompts = allPrompts.slice(4, 7);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-1">
            <Card>
              <CardContent className="p-6 text-center">
                <Skeleton className="w-24 h-24 mx-auto mb-4 rounded-full" />
                <Skeleton className="h-5 w-24 mx-auto mb-1" />
                <Skeleton className="h-3 w-32 mx-auto mb-2" />
                <Skeleton className="h-5 w-16 mx-auto" />
              </CardContent>
            </Card>
          </div>
          <div className="lg:col-span-3">
            <Skeleton className="h-10 w-64 mb-6" />
            <Card>
              <CardContent className="p-6 space-y-4">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="flex items-center gap-4 p-4 border rounded-lg">
                    <Skeleton className="w-20 h-20 rounded" />
                    <div className="flex-1">
                      <Skeleton className="h-4 w-3/4 mb-2" />
                      <Skeleton className="h-3 w-32" />
                    </div>
                    <Skeleton className="h-8 w-20" />
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <p className="text-destructive text-lg mb-4">{error}</p>
        <Button onClick={() => window.location.reload()}>
          إعادة المحاولة
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar */}
        <div className="lg:col-span-1">
          <Card>
            <CardContent className="p-6">
              <div className="text-center mb-6">
                <Avatar className="w-24 h-24 mx-auto mb-4">
                  <AvatarImage src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200" />
                  <AvatarFallback>أم</AvatarFallback>
                </Avatar>
                <h2 className="font-bold text-xl mb-1">أحمد محمود</h2>
                <p className="text-sm text-muted-foreground">
                  ahmed@example.com
                </p>
                <Badge className="mt-2">عضو نشط</Badge>
              </div>

              <Separator className="my-4" />

              <div className="space-y-2">
                <Button variant="ghost" className="w-full justify-start">
                  <User className="ml-2 h-4 w-4" />
                  الملف الشخصي
                </Button>
                <Button variant="ghost" className="w-full justify-start">
                  <ShoppingBag className="ml-2 h-4 w-4" />
                  مشترياتي
                </Button>
                <Button variant="ghost" className="w-full justify-start">
                  <Heart className="ml-2 h-4 w-4" />
                  المفضلة
                </Button>
                <Button variant="ghost" className="w-full justify-start">
                  <Wallet className="ml-2 h-4 w-4" />
                  المحفظة
                </Button>
                <Button variant="ghost" className="w-full justify-start">
                  <Bell className="ml-2 h-4 w-4" />
                  الإشعارات
                </Button>
                <Button variant="ghost" className="w-full justify-start">
                  <Settings className="ml-2 h-4 w-4" />
                  الإعدادات
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-3">
          <Tabs defaultValue="purchases" className="w-full">
            <TabsList className="w-full justify-start mb-6">
              <TabsTrigger value="purchases">
                <ShoppingBag className="ml-2 h-4 w-4" />
                المشتريات
              </TabsTrigger>
              <TabsTrigger value="saved">
                <Heart className="ml-2 h-4 w-4" />
                المفضلة
              </TabsTrigger>
              <TabsTrigger value="wallet">
                <Wallet className="ml-2 h-4 w-4" />
                المحفظة
              </TabsTrigger>
            </TabsList>

            <TabsContent value="purchases">
              <Card>
                <CardHeader>
                  <CardTitle>سجل المشتريات</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {userPurchases.map((prompt) => (
                      <div
                        key={prompt.id}
                        className="flex items-center gap-4 p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                      >
                        <img
                          src={prompt.thumbnail}
                          alt={prompt.title}
                          className="w-20 h-20 rounded object-cover"
                        />
                        <div className="flex-1">
                          <h3 className="font-bold mb-1">{prompt.title}</h3>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Badge variant="secondary" className="text-xs">
                              {prompt.aiModel}
                            </Badge>
                            <span>تم الشراء في 2026-02-10</span>
                          </div>
                        </div>
                        <div className="text-left">
                          <div className="font-bold mb-2">${prompt.price}</div>
                          <Button size="sm" variant="outline">
                            <Download className="ml-2 h-4 w-4" />
                            تحميل
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="saved">
              <Card>
                <CardHeader>
                  <CardTitle>البرومبتات المفضلة</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {savedPrompts.map((prompt) => (
                      <div
                        key={prompt.id}
                        className="flex items-center gap-4 p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                      >
                        <img
                          src={prompt.thumbnail}
                          alt={prompt.title}
                          className="w-20 h-20 rounded object-cover"
                        />
                        <div className="flex-1">
                          <h3 className="font-bold mb-1">{prompt.title}</h3>
                          <div className="flex items-center gap-2 text-sm">
                            <Badge variant="secondary" className="text-xs">
                              {prompt.aiModel}
                            </Badge>
                            <div className="flex items-center gap-1">
                              <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                              <span>{prompt.rating}</span>
                            </div>
                          </div>
                        </div>
                        <div className="text-left">
                          <div className="font-bold mb-2">${prompt.price}</div>
                          <Button size="sm">شراء الآن</Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="wallet">
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>رصيد المحفظة</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center py-8">
                      <div className="text-5xl font-bold mb-2">$125.50</div>
                      <p className="text-muted-foreground mb-6">
                        الرصيد المتاح
                      </p>
                      <div className="flex gap-3 justify-center">
                        <Button>إضافة رصيد</Button>
                        <Button variant="outline">سحب الرصيد</Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>سجل المعاملات</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {[
                        {
                          id: 1,
                          type: "شراء",
                          description: "برومبت كتابة محتوى تسويقي",
                          amount: -29.99,
                          date: "2026-02-10",
                        },
                        {
                          id: 2,
                          type: "إضافة رصيد",
                          description: "إضافة رصيد عبر بطاقة ائتمان",
                          amount: +100.0,
                          date: "2026-02-08",
                        },
                        {
                          id: 3,
                          type: "شراء",
                          description: "مولد صور فنية بأسلوب عربي",
                          amount: -39.99,
                          date: "2026-02-05",
                        },
                        {
                          id: 4,
                          type: "بيع",
                          description: "عمولة من بيع برومبت",
                          amount: +45.48,
                          date: "2026-02-03",
                        },
                      ].map((transaction) => (
                        <div
                          key={transaction.id}
                          className="flex items-center justify-between p-3 border rounded"
                        >
                          <div>
                            <div className="font-bold mb-1">
                              {transaction.type}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {transaction.description}
                            </div>
                            <div className="text-xs text-muted-foreground mt-1">
                              {transaction.date}
                            </div>
                          </div>
                          <div
                            className={`font-bold text-lg ${
                              transaction.amount > 0
                                ? "text-green-600"
                                : "text-red-600"
                            }`}
                          >
                            {transaction.amount > 0 ? "+" : ""}$
                            {Math.abs(transaction.amount).toFixed(2)}
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
