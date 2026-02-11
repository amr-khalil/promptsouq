"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { categories, prompts } from "@/data/mockData";
import {
  DollarSign,
  Edit,
  Eye,
  Plus,
  ShoppingBag,
  Trash2,
  TrendingUp,
  Upload,
} from "lucide-react";
import { useState } from "react";

export default function SellerDashboard() {
  const [isUploading, setIsUploading] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "",
    aiModel: "",
    price: "",
    tags: "",
    difficulty: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsUploading(true);
    // Mock upload
    setTimeout(() => {
      setIsUploading(false);
      alert("تم نشر البرومبت بنجاح!");
      setFormData({
        title: "",
        description: "",
        category: "",
        aiModel: "",
        price: "",
        tags: "",
        difficulty: "",
      });
    }, 2000);
  };

  const myListings = prompts.slice(0, 3);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">لوحة تحكم البائع</h1>
        <p className="text-muted-foreground">قم بإدارة منتجاتك وتتبع مبيعاتك</p>
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="overview">نظرة عامة</TabsTrigger>
          <TabsTrigger value="upload">رفع برومبت جديد</TabsTrigger>
          <TabsTrigger value="listings">منتجاتي</TabsTrigger>
          <TabsTrigger value="earnings">الأرباح</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <DollarSign className="h-8 w-8 text-green-600" />
                  <TrendingUp className="h-4 w-4 text-green-600" />
                </div>
                <div className="text-2xl font-bold mb-1">$2,456.80</div>
                <p className="text-sm text-muted-foreground">إجمالي الأرباح</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <ShoppingBag className="h-8 w-8 text-blue-600" />
                  <TrendingUp className="h-4 w-4 text-blue-600" />
                </div>
                <div className="text-2xl font-bold mb-1">127</div>
                <p className="text-sm text-muted-foreground">إجمالي المبيعات</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <Eye className="h-8 w-8 text-purple-600" />
                  <TrendingUp className="h-4 w-4 text-purple-600" />
                </div>
                <div className="text-2xl font-bold mb-1">3,456</div>
                <p className="text-sm text-muted-foreground">مرات المشاهدة</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <Upload className="h-8 w-8 text-orange-600" />
                </div>
                <div className="text-2xl font-bold mb-1">8</div>
                <p className="text-sm text-muted-foreground">المنتجات النشطة</p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>أداء المنتجات الأخير</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {myListings.map((prompt) => (
                  <div
                    key={prompt.id}
                    className="flex items-center gap-4 p-4 border rounded-lg"
                  >
                    <img
                      src={prompt.thumbnail}
                      alt={prompt.title}
                      className="w-16 h-16 rounded object-cover"
                    />
                    <div className="flex-1">
                      <h3 className="font-bold mb-1">{prompt.title}</h3>
                      <div className="flex items-center gap-3 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Eye className="h-3 w-3" />
                          {prompt.sales * 5} مشاهدة
                        </span>
                        <span className="flex items-center gap-1">
                          <ShoppingBag className="h-3 w-3" />
                          {prompt.sales} مبيعة
                        </span>
                      </div>
                    </div>
                    <div className="text-left">
                      <div className="font-bold text-green-600">
                        ${(prompt.price * prompt.sales * 0.85).toFixed(2)}
                      </div>
                      <div className="text-xs text-muted-foreground">أرباح</div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="upload">
          <Card>
            <CardHeader>
              <CardTitle>رفع برومبت جديد</CardTitle>
              <CardDescription>
                قم بملء المعلومات أدناه لإضافة برومبت جديد إلى السوق
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <Label htmlFor="title">عنوان البرومبت *</Label>
                  <Input
                    id="title"
                    placeholder="أدخل عنواً واضحاً وجذاباً"
                    value={formData.title}
                    onChange={(e) =>
                      setFormData({ ...formData, title: e.target.value })
                    }
                    required
                    className="mt-1.5"
                  />
                </div>

                <div>
                  <Label htmlFor="description">الوصف *</Label>
                  <Textarea
                    id="description"
                    placeholder="اشرح ماذا يفعل البرومبت وكيفية استخدامه..."
                    rows={5}
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    required
                    className="mt-1.5"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="category">الفئة *</Label>
                    <Select
                      value={formData.category}
                      onValueChange={(value) =>
                        setFormData({ ...formData, category: value })
                      }
                    >
                      <SelectTrigger className="mt-1.5">
                        <SelectValue placeholder="اختر فئة" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((cat) => (
                          <SelectItem key={cat.id} value={cat.id}>
                            {cat.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="aiModel">نموذج الذكاء الاصطناعي *</Label>
                    <Select
                      value={formData.aiModel}
                      onValueChange={(value) =>
                        setFormData({ ...formData, aiModel: value })
                      }
                    >
                      <SelectTrigger className="mt-1.5">
                        <SelectValue placeholder="اختر النموذج" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="chatgpt">ChatGPT</SelectItem>
                        <SelectItem value="midjourney">Midjourney</SelectItem>
                        <SelectItem value="dalle">DALL·E</SelectItem>
                        <SelectItem value="claude">Claude</SelectItem>
                        <SelectItem value="gemini">Gemini</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="price">السعر ($) *</Label>
                    <Input
                      id="price"
                      type="number"
                      step="0.01"
                      min="0"
                      placeholder="9.99"
                      value={formData.price}
                      onChange={(e) =>
                        setFormData({ ...formData, price: e.target.value })
                      }
                      required
                      className="mt-1.5"
                    />
                  </div>

                  <div>
                    <Label htmlFor="difficulty">مستوى الصعوبة *</Label>
                    <Select
                      value={formData.difficulty}
                      onValueChange={(value) =>
                        setFormData({ ...formData, difficulty: value })
                      }
                    >
                      <SelectTrigger className="mt-1.5">
                        <SelectValue placeholder="اختر المستوى" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="beginner">مبتدئ</SelectItem>
                        <SelectItem value="advanced">متقدم</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label htmlFor="tags">الوسوم (افصل بفاصلة)</Label>
                  <Input
                    id="tags"
                    placeholder="تسويق، محتوى، إعلانات"
                    value={formData.tags}
                    onChange={(e) =>
                      setFormData({ ...formData, tags: e.target.value })
                    }
                    className="mt-1.5"
                  />
                </div>

                <div>
                  <Label htmlFor="file">ملف البرومبت *</Label>
                  <div className="mt-1.5">
                    <div className="border-2 border-dashed rounded-lg p-8 text-center hover:border-primary transition-colors cursor-pointer">
                      <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                      <p className="text-sm text-muted-foreground mb-2">
                        اسحب وأفلت الملف هنا أو انقر للتحميل
                      </p>
                      <p className="text-xs text-muted-foreground">
                        PDF, TXT, DOCX (الحد الأقصى: 5MB)
                      </p>
                      <Input
                        id="file"
                        type="file"
                        accept=".pdf,.txt,.docx"
                        className="hidden"
                      />
                    </div>
                  </div>
                </div>

                <Button
                  type="submit"
                  size="lg"
                  className="w-full"
                  disabled={isUploading}
                >
                  {isUploading ? (
                    "جاري النشر..."
                  ) : (
                    <>
                      <Plus className="ml-2 h-5 w-5" />
                      نشر البرومبت
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="listings">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>منتجاتي</CardTitle>
                <Button>
                  <Plus className="ml-2 h-4 w-4" />
                  إضافة جديد
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {myListings.map((prompt) => (
                  <div
                    key={prompt.id}
                    className="flex items-center gap-4 p-4 border rounded-lg"
                  >
                    <img
                      src={prompt.thumbnail}
                      alt={prompt.title}
                      className="w-20 h-20 rounded object-cover"
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-bold">{prompt.title}</h3>
                        <Badge variant="secondary">نشط</Badge>
                      </div>
                      <div className="flex items-center gap-3 text-sm text-muted-foreground">
                        <span>{prompt.category}</span>
                        <span>•</span>
                        <span>${prompt.price}</span>
                        <span>•</span>
                        <span>{prompt.sales} مبيعات</span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="outline">
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="earnings">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>ملخص الأرباح</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <div className="text-sm text-muted-foreground mb-1">
                      الرصيد المتاح
                    </div>
                    <div className="text-3xl font-bold text-green-600">
                      $1,234.56
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground mb-1">
                      قيد المعالجة
                    </div>
                    <div className="text-3xl font-bold">$567.89</div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground mb-1">
                      تم السحب
                    </div>
                    <div className="text-3xl font-bold">$654.35</div>
                  </div>
                </div>
                <Button className="mt-6">
                  <DollarSign className="ml-2 h-4 w-4" />
                  سحب الأرباح
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>سجل الأرباح</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[
                    {
                      id: 1,
                      product: "برومبت كتابة محتوى تسويقي",
                      amount: 25.49,
                      commission: 15,
                      date: "2026-02-10",
                    },
                    {
                      id: 2,
                      product: "مولد صور فنية بأسلوب عربي",
                      amount: 33.99,
                      commission: 15,
                      date: "2026-02-09",
                    },
                    {
                      id: 3,
                      product: "مساعد كتابة الأبحاث الأكاديمية",
                      amount: 21.24,
                      commission: 15,
                      date: "2026-02-08",
                    },
                  ].map((earning) => (
                    <div
                      key={earning.id}
                      className="flex items-center justify-between p-4 border rounded-lg"
                    >
                      <div>
                        <div className="font-bold mb-1">{earning.product}</div>
                        <div className="text-sm text-muted-foreground">
                          {earning.date} • عمولة {earning.commission}%
                        </div>
                      </div>
                      <div className="font-bold text-green-600 text-lg">
                        +${earning.amount}
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
  );
}
