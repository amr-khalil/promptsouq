"use client";

import { CartSheet } from "@/components/CartSheet";
import { LanguageToggle } from "@/components/LanguageToggle";
import { LocaleLink } from "@/components/LocaleLink";
import { NotificationBell } from "@/components/notifications/NotificationBell";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useClerk, useUser } from "@clerk/nextjs";
import {
  BarChart3,
  ChevronDown,
  FileText,
  LayoutDashboard,
  LogOut,
  Menu,
  Plus,
  Search,
  Settings,
  Shield,
  ShoppingBag,
  User,
  Wallet,
  X,
  Zap,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

function useAdminPendingCount(isAdmin: boolean) {
  const [count, setCount] = useState(0);

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
    const interval = setInterval(fetchCount, 300_000);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [isAdmin]);

  return count;
}

function useIsSeller() {
  const { user } = useUser();
  const [isSeller, setIsSeller] = useState(false);

  useEffect(() => {
    if (!user) return;
    let cancelled = false;

    async function check() {
      try {
        const res = await fetch("/api/seller/profile");
        if (res.ok && !cancelled) {
          setIsSeller(true);
        }
      } catch {
        // Not a seller
      }
    }

    check();
    return () => {
      cancelled = true;
    };
  }, [user]);

  return isSeller;
}

export function Header() {
  const { t } = useTranslation("common");
  const { user, isSignedIn } = useUser();
  const { signOut } = useClerk();
  const isAdmin =
    (user?.publicMetadata as { role?: string } | undefined)?.role === "admin";
  const pendingCount = useAdminPendingCount(isAdmin);
  const isSeller = useIsSeller();

  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const initials = user
    ? (user.firstName?.[0] ?? "") + (user.lastName?.[0] ?? "")
    : "";

  return (
    <nav
      className={`fixed top-0 w-full z-50 transition-all duration-300 ${scrolled ? "bg-[#0f0f0f]/90 backdrop-blur-md border-b border-[#7f0df2]/20" : "bg-transparent"}`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        {/* Logo & Links */}
        <div className="flex items-center gap-8">
          <LocaleLink href="/" className="flex items-center gap-2 group">
            <div className="relative">
              <div className="absolute inset-0 bg-[#7f0df2] blur-lg opacity-50 group-hover:opacity-100 transition-opacity"></div>
              <Zap
                className="relative z-10 w-8 h-8 text-[#7f0df2]"
                fill="currentColor"
              />
            </div>
            <span className="text-2xl font-bold font-display tracking-tight text-white z-10">
              {t("header.logo")}
            </span>
          </LocaleLink>

          <div className="hidden md:flex items-center gap-8 mr-4">
            <LocaleLink href="/market">{t("header.nav.browse")}</LocaleLink>
            <LocaleLink href="/gallery">{t("nav.gallery")}</LocaleLink>
            <LocaleLink href="/feature-requests">{t("nav.featureRequests")}</LocaleLink>
          </div>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-4">
          <button className="hidden lg:flex items-center justify-center w-10 h-10 rounded-full border border-zinc-700 text-zinc-400 hover:text-white hover:border-[#7f0df2] hover:shadow-[0_0_15px_#7f0df2] transition-all">
            <Search className="w-5 h-5" />
          </button>

          <CartSheet />

          {isSignedIn && <NotificationBell />}

          <div className="h-6 w-px bg-zinc-800 mx-2 hidden sm:block"></div>

          {isSignedIn ? (
            <ProfileDropdown
              user={user}
              initials={initials}
              isAdmin={isAdmin}
              isSeller={isSeller}
              pendingCount={pendingCount}
              onSignOut={() => signOut({ redirectUrl: "/" })}
            />
          ) : (
            <LocaleLink
              href="/sign-in"
              className="text-sm font-bold text-gray-300 hover:text-white hidden sm:block"
            >
              {t("header.auth.signIn")}
            </LocaleLink>
          )}

          <LocaleLink
            href="/sell"
            className="bg-[#7f0df2]/10 border border-[#7f0df2] text-[#7f0df2] px-5 py-2 rounded-full text-sm font-bold hover:bg-[#7f0df2] hover:text-white hover:shadow-[0_0_20px_#7f0df2] transition-all duration-300 flex items-center gap-2 group"
          >
            <Plus className="w-4 h-4" />
            <span>{t("header.auth.sellPrompt")}</span>
          </LocaleLink>

          <LanguageToggle />

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden text-white"
          >
            {mobileMenuOpen ? <X /> : <Menu />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-[#0f0f0f]/95 backdrop-blur-md border-t border-zinc-800 px-4 py-4 space-y-3">
          <LocaleLink href="/market" className="block text-white text-sm py-2">{t("header.nav.browse")}</LocaleLink>
          <LocaleLink href="/gallery" className="block text-white text-sm py-2">{t("nav.gallery")}</LocaleLink>
          <LocaleLink href="/feature-requests" className="block text-white text-sm py-2">{t("nav.featureRequests")}</LocaleLink>

          {isSignedIn ? (
            <>
              <div className="pt-2 border-t border-zinc-800 space-y-1">
                <p className="text-xs text-zinc-500 px-1 pb-1">{user?.fullName ?? user?.primaryEmailAddress?.emailAddress}</p>
                <LocaleLink href="/dashboard" className="flex items-center gap-2 text-white text-sm py-2">
                  <LayoutDashboard className="w-4 h-4" />
                  {t("header.profile.dashboard")}
                </LocaleLink>
                <LocaleLink href="/dashboard/purchases" className="flex items-center gap-2 text-white text-sm py-2">
                  <ShoppingBag className="w-4 h-4" />
                  {t("header.profile.myPurchases")}
                </LocaleLink>
                {isSeller && (
                  <>
                    <LocaleLink href="/dashboard/seller/prompts" className="flex items-center gap-2 text-white text-sm py-2">
                      <FileText className="w-4 h-4" />
                      {t("header.profile.myPrompts")}
                    </LocaleLink>
                    <LocaleLink href="/dashboard/seller/earnings" className="flex items-center gap-2 text-white text-sm py-2">
                      <Wallet className="w-4 h-4" />
                      {t("header.profile.earnings")}
                    </LocaleLink>
                    <LocaleLink href="/dashboard/seller/profile" className="flex items-center gap-2 text-white text-sm py-2">
                      <User className="w-4 h-4" />
                      {t("header.profile.sellerProfile")}
                    </LocaleLink>
                  </>
                )}
                {isAdmin && (
                  <>
                    <div className="pt-1 border-t border-zinc-800/50 mt-1">
                      <p className="text-xs text-[#7f0df2] px-1 py-1">{t("header.profile.adminPanel")}</p>
                    </div>
                    <LocaleLink href="/dashboard/admin/moderation" className="flex items-center gap-2 text-white text-sm py-2">
                      <Shield className="w-4 h-4" />
                      {t("header.profile.moderation")}
                      {pendingCount > 0 && (
                        <span className="bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                          {pendingCount}
                        </span>
                      )}
                    </LocaleLink>
                    <LocaleLink href="/dashboard/admin/orders" className="flex items-center gap-2 text-white text-sm py-2">
                      <ShoppingBag className="w-4 h-4" />
                      {t("header.profile.orders")}
                    </LocaleLink>
                    <LocaleLink href="/dashboard/admin/analytics" className="flex items-center gap-2 text-white text-sm py-2">
                      <BarChart3 className="w-4 h-4" />
                      {t("header.profile.analytics")}
                    </LocaleLink>
                    <LocaleLink href="/dashboard/admin/settings" className="flex items-center gap-2 text-white text-sm py-2">
                      <Settings className="w-4 h-4" />
                      {t("header.profile.settings")}
                    </LocaleLink>
                  </>
                )}
              </div>
              <div className="pt-2 border-t border-zinc-800 flex items-center justify-between">
                <button
                  onClick={() => signOut({ redirectUrl: "/" })}
                  className="text-sm font-bold text-red-400 flex items-center gap-2"
                >
                  <LogOut className="w-4 h-4" />
                  {t("header.auth.signOut")}
                </button>
                <LanguageToggle />
              </div>
            </>
          ) : (
            <div className="pt-2 border-t border-zinc-800 flex items-center justify-between">
              <LocaleLink href="/sign-in" className="text-sm font-bold text-gray-300">{t("header.auth.signIn")}</LocaleLink>
              <LanguageToggle />
            </div>
          )}
        </div>
      )}
    </nav>
  );
}

function ProfileDropdown({
  user,
  initials,
  isAdmin,
  isSeller,
  pendingCount,
  onSignOut,
}: {
  user: NonNullable<ReturnType<typeof useUser>["user"]>;
  initials: string;
  isAdmin: boolean;
  isSeller: boolean;
  pendingCount: number;
  onSignOut: () => void;
}) {
  const { t } = useTranslation("common");
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="hidden sm:flex items-center gap-2 rounded-full border border-zinc-700 pe-3 ps-1 py-1 text-sm text-gray-300 hover:text-white hover:border-[#7f0df2]/50 transition-all focus:outline-none">
          <Avatar className="h-7 w-7">
            <AvatarImage src={user.imageUrl} alt={user.fullName ?? ""} />
            <AvatarFallback className="bg-[#7f0df2]/20 text-[#7f0df2] text-xs">
              {initials || "U"}
            </AvatarFallback>
          </Avatar>
          <ChevronDown className="w-3.5 h-3.5 text-zinc-500" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">{user.fullName}</p>
            <p className="text-xs text-muted-foreground leading-none">
              {user.primaryEmailAddress?.emailAddress}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem asChild>
            <LocaleLink href="/dashboard" className="flex items-center gap-2 cursor-pointer">
              <LayoutDashboard className="w-4 h-4" />
              {t("header.profile.dashboard")}
            </LocaleLink>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <LocaleLink href="/dashboard/purchases" className="flex items-center gap-2 cursor-pointer">
              <ShoppingBag className="w-4 h-4" />
              {t("header.profile.myPurchases")}
            </LocaleLink>
          </DropdownMenuItem>
        </DropdownMenuGroup>

        {isSeller && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem asChild>
                <LocaleLink href="/dashboard/seller/prompts" className="flex items-center gap-2 cursor-pointer">
                  <FileText className="w-4 h-4" />
                  {t("header.profile.myPrompts")}
                </LocaleLink>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <LocaleLink href="/dashboard/seller/earnings" className="flex items-center gap-2 cursor-pointer">
                  <Wallet className="w-4 h-4" />
                  {t("header.profile.earnings")}
                </LocaleLink>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <LocaleLink href="/dashboard/seller/profile" className="flex items-center gap-2 cursor-pointer">
                  <User className="w-4 h-4" />
                  {t("header.profile.sellerProfile")}
                </LocaleLink>
              </DropdownMenuItem>
            </DropdownMenuGroup>
          </>
        )}

        {isAdmin && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuLabel className="text-xs text-[#7f0df2]">
              {t("header.profile.adminPanel")}
            </DropdownMenuLabel>
            <DropdownMenuGroup>
              <DropdownMenuItem asChild>
                <LocaleLink href="/dashboard/admin/moderation" className="flex items-center gap-2 cursor-pointer">
                  <Shield className="w-4 h-4" />
                  {t("header.profile.moderation")}
                  {pendingCount > 0 && (
                    <span className="ms-auto bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                      {pendingCount}
                    </span>
                  )}
                </LocaleLink>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <LocaleLink href="/dashboard/admin/orders" className="flex items-center gap-2 cursor-pointer">
                  <ShoppingBag className="w-4 h-4" />
                  {t("header.profile.orders")}
                </LocaleLink>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <LocaleLink href="/dashboard/admin/analytics" className="flex items-center gap-2 cursor-pointer">
                  <BarChart3 className="w-4 h-4" />
                  {t("header.profile.analytics")}
                </LocaleLink>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <LocaleLink href="/dashboard/admin/settings" className="flex items-center gap-2 cursor-pointer">
                  <Settings className="w-4 h-4" />
                  {t("header.profile.settings")}
                </LocaleLink>
              </DropdownMenuItem>
            </DropdownMenuGroup>
          </>
        )}

        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={onSignOut}
          className="text-red-400 focus:text-red-400 cursor-pointer"
        >
          <LogOut className="w-4 h-4 me-2" />
          {t("header.auth.signOut")}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
