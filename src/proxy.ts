import { cookieName, defaultLocale, type Locale } from "@/i18n/settings";
import { updateSession } from "@/lib/supabase/middleware";
import { type NextRequest, NextResponse } from "next/server";

const publicPaths = new Set([
  "/sign-in",
  "/sign-up",
  "/forgot-password",
  "/reset-password",
  "/market",
  "/search",
  "/subscription",
  "/ranking",
  "/gallery",
  "/feature-requests",
]);

function isPublicRoute(pathWithoutLocale: string): boolean {
  if (pathWithoutLocale === "/") return true;
  // Check exact and prefix matches for public paths
  for (const p of publicPaths) {
    if (pathWithoutLocale === p || pathWithoutLocale.startsWith(`${p}/`)) {
      return true;
    }
  }
  // Prompt detail pages and seller pages are public
  if (pathWithoutLocale.startsWith("/prompt")) return true;
  if (pathWithoutLocale.startsWith("/seller")) return true;
  return false;
}

function getLocaleFromAcceptLanguage(req: NextRequest): Locale {
  const header = req.headers.get("accept-language") ?? "";
  const languages = header.split(",").map((l) => l.split(";")[0].trim().toLowerCase());
  for (const lang of languages) {
    if (lang === "ar" || lang.startsWith("ar-")) {
      return "ar";
    }
  }
  return defaultLocale;
}

// Routes that authenticated users should be redirected away from
function isAuthRedirectRoute(pathWithoutLocale: string): boolean {
  return (
    pathWithoutLocale === "/" ||
    pathWithoutLocale.startsWith("/sign-in") ||
    pathWithoutLocale.startsWith("/sign-up")
  );
}

export default async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Skip locale logic for API routes, auth callback routes, and static files
  if (
    pathname.startsWith("/api") ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/auth/") ||
    pathname.includes(".")
  ) {
    const { supabaseResponse } = await updateSession(req);
    return supabaseResponse;
  }

  // Refresh session and get user
  const { supabaseResponse, user } = await updateSession(req);
  const userId = user?.id ?? null;

  // Helper to create a redirect that preserves Supabase cookies
  function redirectWithCookies(url: URL) {
    const redirect = NextResponse.redirect(url);
    supabaseResponse.cookies.getAll().forEach((cookie) => {
      redirect.cookies.set(cookie.name, cookie.value);
    });
    return redirect;
  }

  // Helper to create a rewrite that preserves Supabase cookies
  function rewriteWithCookies(url: URL) {
    const rewrite = NextResponse.rewrite(url);
    supabaseResponse.cookies.getAll().forEach((cookie) => {
      rewrite.cookies.set(cookie.name, cookie.value);
    });
    return rewrite;
  }

  // Already has /ar prefix — Arabic locale
  if (pathname.startsWith("/ar")) {
    const pathWithoutLocale = pathname.replace(/^\/ar/, "") || "/";

    // Redirect authenticated users away from home/auth pages to dashboard
    if (userId && isAuthRedirectRoute(pathWithoutLocale)) {
      const url = req.nextUrl.clone();
      url.pathname = "/ar/dashboard";
      return redirectWithCookies(url);
    }

    // Protect non-public routes
    if (!isPublicRoute(pathWithoutLocale) && !userId) {
      const url = req.nextUrl.clone();
      url.pathname = "/ar/sign-in";
      return redirectWithCookies(url);
    }

    return supabaseResponse;
  }

  // Explicit /en prefix — redirect to canonical URL without /en
  if (pathname.startsWith("/en")) {
    const cleanPath = pathname.replace(/^\/en/, "") || "/";
    const url = req.nextUrl.clone();
    url.pathname = cleanPath;
    return redirectWithCookies(url);
  }

  // No locale prefix — determine locale
  const savedLocale = req.cookies.get(cookieName)?.value as Locale | undefined;
  const detectedLocale = savedLocale ?? getLocaleFromAcceptLanguage(req);

  if (detectedLocale === "ar") {
    // Redirect Arabic users to /ar/...
    const url = req.nextUrl.clone();
    const target =
      userId && isAuthRedirectRoute(pathname)
        ? "/dashboard"
        : pathname === "/"
          ? ""
          : pathname;
    url.pathname = `/ar${target}`;
    return redirectWithCookies(url);
  }

  // English — rewrite to /en/... internally (URL unchanged for user)
  // Redirect authenticated users away from home/auth pages to dashboard
  if (userId && isAuthRedirectRoute(pathname)) {
    const url = req.nextUrl.clone();
    url.pathname = "/dashboard";
    return redirectWithCookies(url);
  }

  // Protect non-public routes for English
  if (!isPublicRoute(pathname) && !userId) {
    const url = req.nextUrl.clone();
    url.pathname = "/sign-in";
    return redirectWithCookies(url);
  }

  const url = req.nextUrl.clone();
  url.pathname = `/en${pathname}`;
  return rewriteWithCookies(url);
}

export const config = {
  matcher: [
    // Skip Next.js internals and all static files
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
};
