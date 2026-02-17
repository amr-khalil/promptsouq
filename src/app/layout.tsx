import { ThemeProvider } from "@/components/ThemeProvider";
import { Toaster } from "@/components/ui/sonner";
import { defaultLocale, getDirection, type Locale, locales } from "@/i18n/settings";
import { ClerkProvider } from "@clerk/nextjs";
import type { Metadata } from "next";
import { Cairo } from "next/font/google";
import { cookies } from "next/headers";
import "./globals.css";

// add cairo arabic font from google fonts
export const mainFont = Cairo({
  variable: "--font-main",
  subsets: ["latin", "arabic"],
  weight: ["400", "500", "600", "700"],
  style: ["normal"],
});

export const metadata: Metadata = {
  title: "SouqPrompt",
  description: "The first Arabic platform for buying and selling AI prompts",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookieStore = await cookies();
  const localeCookie = cookieStore.get("NEXT_LOCALE")?.value;
  const locale: Locale = localeCookie && (locales as readonly string[]).includes(localeCookie)
    ? (localeCookie as Locale)
    : defaultLocale;
  const dir = getDirection(locale);

  return (
    <ClerkProvider>
      <html lang={locale} dir={dir}>
        <body className={`${mainFont.variable} antialiased`}>
          <ThemeProvider>
            {children}
            <Toaster position="top-center" dir={dir} />
          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
