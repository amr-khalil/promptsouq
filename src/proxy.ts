import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse, type NextRequest } from "next/server";
import { cookieName, defaultLocale, type Locale } from "@/i18n/settings";

const isPublicRoute = createRouteMatcher([
  // English (no prefix)
  "/sign-in(.*)",
  "/sign-up(.*)",
  "/",
  "/market(.*)",
  "/search(.*)",
  "/prompt(.*)",
  "/subscription(.*)",
  "/ranking(.*)",
  "/seller(.*)",
  "/gallery(.*)",
  "/feature-requests(.*)",
  "/api(.*)",
  // Arabic (/ar prefix) — same routes
  "/ar",
  "/ar/sign-in(.*)",
  "/ar/sign-up(.*)",
  "/ar/market(.*)",
  "/ar/search(.*)",
  "/ar/prompt(.*)",
  "/ar/subscription(.*)",
  "/ar/ranking(.*)",
  "/ar/seller(.*)",
  "/ar/gallery(.*)",
  "/ar/feature-requests(.*)",
  // Internal locale segment (after rewrite)
  "/en(.*)",
]);

function getLocaleFromAcceptLanguage(req: NextRequest): Locale {
  const header = req.headers.get("accept-language") ?? "";
  // Check if any Arabic variant is preferred
  const languages = header.split(",").map((l) => l.split(";")[0].trim().toLowerCase());
  for (const lang of languages) {
    if (lang === "ar" || lang.startsWith("ar-")) {
      return "ar";
    }
  }
  return defaultLocale;
}

export default clerkMiddleware(async (auth, req) => {
  const { pathname } = req.nextUrl;

  // Skip locale logic for API routes and static files
  if (pathname.startsWith("/api") || pathname.startsWith("/_next") || pathname.includes(".")) {
    if (!isPublicRoute(req)) {
      await auth.protect();
    }
    return;
  }

  // Already has /ar prefix — Arabic locale, pass through to [locale] segment
  if (pathname.startsWith("/ar")) {
    if (!isPublicRoute(req)) {
      await auth.protect();
    }
    return;
  }

  // Explicit /en prefix — redirect to canonical URL without /en
  if (pathname.startsWith("/en")) {
    const cleanPath = pathname.replace(/^\/en/, "") || "/";
    const url = req.nextUrl.clone();
    url.pathname = cleanPath;
    return NextResponse.redirect(url, 308);
  }

  // No locale prefix — determine locale
  const savedLocale = req.cookies.get(cookieName)?.value as Locale | undefined;
  const detectedLocale = savedLocale ?? getLocaleFromAcceptLanguage(req);

  if (detectedLocale === "ar") {
    // Redirect Arabic users to /ar/...
    const url = req.nextUrl.clone();
    url.pathname = `/ar${pathname === "/" ? "" : pathname}`;
    return NextResponse.redirect(url, 307);
  }

  // English — rewrite to /en/... internally (URL unchanged for user)
  const url = req.nextUrl.clone();
  url.pathname = `/en${pathname}`;
  const response = NextResponse.rewrite(url);

  if (!isPublicRoute(req)) {
    await auth.protect();
  }

  return response;
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
};
