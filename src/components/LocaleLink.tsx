"use client";

import { type Locale } from "@/i18n/settings";
import Link, { type LinkProps } from "next/link";
import { useParams } from "next/navigation";

interface LocaleLinkProps
  extends Omit<LinkProps, "href"> {
  href: string;
  locale?: Locale;
  children?: React.ReactNode;
  className?: string;
  [key: string]: unknown;
}

export function LocaleLink({
  href,
  locale: localeProp,
  ...props
}: LocaleLinkProps) {
  const params = useParams();
  const currentLocale = (localeProp ?? params?.locale ?? "en") as Locale;

  const localizedHref =
    currentLocale === "ar"
      ? href.startsWith("/ar") ? href : `/ar${href}`
      : href.startsWith("/ar") ? href.replace(/^\/ar/, "") || "/" : href;

  return <Link href={localizedHref} {...props} />;
}
