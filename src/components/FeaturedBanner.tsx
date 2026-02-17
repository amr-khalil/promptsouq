"use client";

import { Code, Landmark } from "lucide-react";
import Link from "next/link";

interface CategoryCardProps {
  icon: React.ElementType;
  title: string;
  subtitle: string;
  glowColor: string;
  hoverBg: string;
  hoverText: string;
  href: string;
}

function CategoryCard({
  icon: Icon,
  title,
  subtitle,
  glowColor,
  hoverBg,
  hoverText,
  href,
}: CategoryCardProps) {
  return (
    <Link
      href={href}
      className="flex-1 bg-[#18181b] rounded-3xl p-6 border border-white/5 hover:border-[#7f0df2]/50 transition-colors group cursor-pointer relative overflow-hidden"
    >
      <div
        className="absolute right-0 top-0 w-32 h-32 rounded-full blur-2xl -mr-10 -mt-10 transition-all"
        style={{ backgroundColor: `${glowColor}15` }}
      />
      <div className="relative z-10">
        <div
          className={`w-10 h-10 bg-zinc-800 rounded-lg flex items-center justify-center mb-4 transition-colors ${hoverBg} ${hoverText}`}
        >
          <Icon className="w-5 h-5" />
        </div>
        <h4 className="text-xl font-bold text-white">{title}</h4>
        <p className="text-gray-400 text-sm mt-1">{subtitle}</p>
      </div>
    </Link>
  );
}

export function FeaturedBanner() {
  return (
    <section className="py-16 bg-[#0f0f0f]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          {/* Large Banner */}
          <div className="col-span-1 md:col-span-8 relative rounded-3xl overflow-hidden min-h-[300px] group cursor-pointer">
            <img
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuAQ2SPrppPt9IPvO3uBHOks-u8_B_AU6d3rLY1qFDYk_0LqHOYPVEULFQOIhpSPzrEz9vz9pZZUem6EFc-wDBjkXNr7OGwR2A4UhLQwBQR_0FNpdCKSEe84vGhdKi-TTIRnh_N_Q_RTImS-GGrUWdAtCdXb336MHDF5DzwcjS8xsgQwUBk4H2JSYavnK9pRsbiqjew4tJ2lj-XC3sJloB_7NjAyEfFu542YCZyljwvirnNZ9PTWfAjcnt_4hLF0J04usWFqRbedG0-J"
              alt="مجموعة الفن الزيتي الرقمي"
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/40 to-transparent" />
            <div className="absolute bottom-0 right-0 p-8 max-w-lg">
              <span className="bg-[#7f0df2] text-white text-xs font-bold px-2 py-1 rounded mb-3 inline-block">
                مجموعة حصرية
              </span>
              <h3 className="text-3xl font-bold text-white mb-2">
                حزمة الفن الزيتي الرقمي
              </h3>
              <p className="text-gray-300 mb-4 line-clamp-2">
                مجموعة كاملة من 50 أمر نصي لتوليد لوحات زيتية رقمية بأسلوب
                كلاسيكي وحديث.
              </p>
              <Link
                href="/market"
                className="inline-block bg-white text-black font-bold px-6 py-2 rounded-lg hover:bg-[#faff00] transition-colors"
              >
                استكشف المجموعة
              </Link>
            </div>
          </div>

          {/* Category Cards Column */}
          <div className="col-span-1 md:col-span-4 flex flex-col gap-6">
            <CategoryCard
              icon={Landmark}
              title="الهندسة المعمارية"
              subtitle="تصاميم داخلية وخارجية"
              glowColor="#7f0df2"
              hoverBg="group-hover:bg-[#7f0df2]"
              hoverText="group-hover:text-white"
              href="/market?category=architecture"
            />
            <CategoryCard
              icon={Code}
              title="مساعدي البرمجة"
              subtitle="تصحيح، كتابة، وتحسين الكود"
              glowColor="#faff00"
              hoverBg="group-hover:bg-[#faff00]"
              hoverText="group-hover:text-black"
              href="/market?category=coding"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
