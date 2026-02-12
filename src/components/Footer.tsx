"use client";

import { Facebook, Instagram, Linkedin, Twitter } from "lucide-react";
import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t bg-muted/50 mt-12">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* About */}
          <div>
            <h3 className="font-bold mb-4">عن PromptSouq</h3>
            <p className="text-sm text-muted-foreground mb-4">
              أول سوق عربي متخصص لبيع وشراء برومبتات الذكاء الاصطناعي. نوفر منصة
              آمنة وسهلة للمبدعين والمستخدمين.
            </p>
            <div className="flex gap-2">
              <a
                href="#"
                className="w-8 h-8 rounded-full bg-primary/10 hover:bg-primary/20 flex items-center justify-center transition-colors"
              >
                <Facebook className="h-4 w-4" />
              </a>
              <a
                href="#"
                className="w-8 h-8 rounded-full bg-primary/10 hover:bg-primary/20 flex items-center justify-center transition-colors"
              >
                <Twitter className="h-4 w-4" />
              </a>
              <a
                href="#"
                className="w-8 h-8 rounded-full bg-primary/10 hover:bg-primary/20 flex items-center justify-center transition-colors"
              >
                <Instagram className="h-4 w-4" />
              </a>
              <a
                href="#"
                className="w-8 h-8 rounded-full bg-primary/10 hover:bg-primary/20 flex items-center justify-center transition-colors"
              >
                <Linkedin className="h-4 w-4" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-bold mb-4">روابط سريعة</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  href="/market"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  تصفح السوق
                </Link>
              </li>
              <li>
                <Link
                  href="/seller"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  ابدأ البيع
                </Link>
              </li>
              <li>
                <Link
                  href="/search"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  البحث المتقدم
                </Link>
              </li>
              <li>
                <Link
                  href="/dashboard"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  حسابي
                </Link>
              </li>
            </ul>
          </div>

          {/* Categories */}
          <div>
            <h3 className="font-bold mb-4">الفئات الشائعة</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  href="/market?category=gpt"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  ChatGPT
                </Link>
              </li>
              <li>
                <Link
                  href="/market?category=midjourney"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  Midjourney
                </Link>
              </li>
              <li>
                <Link
                  href="/market?category=business"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  الأعمال
                </Link>
              </li>
              <li>
                <Link
                  href="/market?category=marketing"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  التسويق
                </Link>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="font-bold mb-4">الدعم والمساعدة</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <a
                  href="#"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  مركز المساعدة
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  الشروط والأحكام
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  سياسة الخصوصية
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  اتصل بنا
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t mt-8 pt-8 text-center text-sm text-muted-foreground">
          <p>© 2026 PromptSouq. جميع الحقوق محفوظة.</p>
        </div>
      </div>
    </footer>
  );
}
