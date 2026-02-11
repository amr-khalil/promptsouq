"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Facebook, Mail } from "lucide-react";
import Link from "next/link";
import { useState } from "react";


export default function ååSignUp() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    acceptTerms: false,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Mock sign up
    console.log("Sign up:", formData);
  };

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-md mx-auto">
        <Card>
          <CardHeader className="text-center">
            <div className="w-16 h-16 bg-gradient-to-br from-purple-600 to-blue-500 rounded-lg flex items-center justify-center mx-auto mb-4">
              <span className="text-white font-bold text-2xl">PS</span>
            </div>
            <CardTitle className="text-2xl">إنشاء حساب جديد</CardTitle>
            <CardDescription>
              انضم إلى مجتمع PromptSouq وابدأ رحلتك
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="name">الاسم الكامل</Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="محمد أحمد"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  required
                  className="mt-1.5"
                />
              </div>

              <div>
                <Label htmlFor="email">البريد الإلكتروني</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="example@email.com"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  required
                  className="mt-1.5"
                />
              </div>

              <div>
                <Label htmlFor="password">كلمة المرور</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                  required
                  className="mt-1.5"
                />
              </div>

              <div>
                <Label htmlFor="confirmPassword">تأكيد كلمة المرور</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="••••••••"
                  value={formData.confirmPassword}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      confirmPassword: e.target.value,
                    })
                  }
                  required
                  className="mt-1.5"
                />
              </div>

              <div className="flex items-start gap-2">
                <Checkbox
                  id="terms"
                  checked={formData.acceptTerms}
                  onCheckedChange={(checked) =>
                    setFormData({
                      ...formData,
                      acceptTerms: checked as boolean,
                    })
                  }
                  required
                />
                <Label
                  htmlFor="terms"
                  className="text-sm leading-relaxed cursor-pointer"
                >
                  أوافق على{" "}
                  <a href="#" className="text-primary hover:underline">
                    الشروط والأحكام
                  </a>{" "}
                  و
                  <a href="#" className="text-primary hover:underline">
                    {" "}
                    سياسة الخصوصية
                  </a>
                </Label>
              </div>

              <Button type="submit" className="w-full">
                إنشاء حساب
              </Button>
            </form>

            <div className="mt-6">
              <div className="relative">
                <Separator />
                <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-card px-2 text-sm text-muted-foreground">
                  أو
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 mt-6">
                <Button variant="outline" className="w-full">
                  <Mail className="ml-2 h-4 w-4" />
                  Google
                </Button>
                <Button variant="outline" className="w-full">
                  <Facebook className="ml-2 h-4 w-4" />
                  Facebook
                </Button>
              </div>
            </div>

            <div className="mt-6 text-center text-sm">
              <span className="text-muted-foreground">لديك حساب بالفعل؟ </span>
              <Link
                href="/signin"
                className="text-primary hover:underline font-bold"
              >
                تسجيل الدخول
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
