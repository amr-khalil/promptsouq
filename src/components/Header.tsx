"use client";

import { useCartItemCount } from "@/hooks/use-cart";
import { useUser } from "@clerk/nextjs";
import { Menu, Plus, Search, Zap } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

function useAdminPendingCount(isAdmin: boolean) {
  const [count, setCount] = useState(0);
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (!isAdmin) return;
    let cancelled = false;

    const fetchCount = async () => {
      try {
        const res = await fetch(
          "/api/admin/prompts?status=pending&countOnly=true",
        );
        if (res.ok && !cancelled) {
          const json = await res.json();
          setCount(json.data?.count ?? 0);
        }
      } catch {
        // Ignore
      }
    };

    fetchCount();
    // Poll every 5 minutes
    const interval = setInterval(fetchCount, 300_000);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [isAdmin]);

  return count;
}

export function Header() {
  const cartCount = useCartItemCount();
  const { user } = useUser();
  const isAdmin =
    (user?.publicMetadata as { role?: string } | undefined)?.role === "admin";
  const pendingCount = useAdminPendingCount(isAdmin);

  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav
      className={`fixed top-0 w-full z-50 transition-all duration-300 ${scrolled ? "bg-[#0f0f0f]/90 backdrop-blur-md border-b border-[#7f0df2]/20" : "bg-transparent"}`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        {/* Logo & Links */}
        <div className="flex items-center gap-8">
          <a href="#" className="flex items-center gap-2 group">
            <div className="relative">
              <div className="absolute inset-0 bg-[#7f0df2] blur-lg opacity-50 group-hover:opacity-100 transition-opacity"></div>
              <Zap
                className="relative z-10 w-8 h-8 text-[#7f0df2]"
                fill="currentColor"
              />
            </div>
            <span className="text-2xl font-bold font-display tracking-tight text-white z-10">
              سوق<span className="text-[#7f0df2]">برومبت</span>
            </span>
          </a>

          <div className="hidden md:flex items-center gap-8 mr-4">
            <Link href="#">تصفح</Link>
            <Link href="#">المجتمع</Link>
            <Link href="#">المدونة</Link>
          </div>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-4">
          <button className="hidden lg:flex items-center justify-center w-10 h-10 rounded-full border border-zinc-700 text-zinc-400 hover:text-white hover:border-[#7f0df2] hover:shadow-[0_0_15px_#7f0df2] transition-all">
            <Search className="w-5 h-5" />
          </button>

          <div className="h-6 w-px bg-zinc-800 mx-2 hidden sm:block"></div>

          <a
            href="#"
            className="text-sm font-bold text-gray-300 hover:text-white hidden sm:block"
          >
            تسجيل دخول
          </a>

          <a
            href="#"
            className="bg-[#7f0df2]/10 border border-[#7f0df2] text-[#7f0df2] px-5 py-2 rounded-full text-sm font-bold hover:bg-[#7f0df2] hover:text-white hover:shadow-[0_0_20px_#7f0df2] transition-all duration-300 flex items-center gap-2 group"
          >
            <Plus className="w-4 h-4" />
            <span>بيع برومبت</span>
          </a>

          <button className="hidden sm:flex items-center gap-1 text-[10px] font-bold bg-zinc-900 px-3 py-1.5 rounded-lg border border-zinc-800 text-zinc-400 hover:border-zinc-600 transition-colors">
            <span className="text-white">AR</span>
            <span className="text-zinc-700">|</span>
            <span>EN</span>
          </button>

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden text-white"
          >
            {mobileMenuOpen ? <X /> : <Menu />}
          </button>
        </div>
      </div>
    </nav>
  );
}
