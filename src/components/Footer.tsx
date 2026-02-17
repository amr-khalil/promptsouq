"use client";

import { useTranslation } from "react-i18next";
import { LocaleLink } from "@/components/LocaleLink";
import { AtSign, Share2, Zap } from "lucide-react";
import { type FormEvent, useState } from "react";
import { toast } from "sonner";

export function Footer() {
  const { t } = useTranslation("common");
  const [email, setEmail] = useState("");

  function handleSubscribe(e: FormEvent) {
    e.preventDefault();
    if (!email) return;
    toast.success(t("footer.newsletter.success"));
    setEmail("");
  }

  return (
    <footer className="border-t border-white/5 bg-black py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          {/* Brand / About */}
          <div className="col-span-1">
            <LocaleLink href="/" className="flex items-center gap-2 mb-6">
              <Zap className="w-7 h-7 text-[#7f0df2]" fill="currentColor" />
              <span className="text-2xl font-bold font-display text-white">
                {t("brand.part1")}<span className="text-[#7f0df2]">{t("brand.part2")}</span>
              </span>
            </LocaleLink>
            <p className="text-gray-500 text-sm mb-6">
              {t("footer.tagline")}
            </p>
            <div className="flex gap-4">
              <a
                href="#"
                className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center text-gray-400 hover:bg-[#7f0df2] hover:text-white transition-colors"
              >
                <AtSign className="w-4 h-4" />
              </a>
              <a
                href="#"
                className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center text-gray-400 hover:bg-[#7f0df2] hover:text-white transition-colors"
              >
                <Share2 className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Discover */}
          <div>
            <h4 className="text-white font-bold mb-6">{t("footer.sections.discover")}</h4>
            <ul className="space-y-3 text-sm text-gray-500">
              <li>
                <LocaleLink href="/market" className="hover:text-[#7f0df2] transition-colors">
                  {t("footer.links.blog")}
                </LocaleLink>
              </li>
              <li>
                <LocaleLink href="/market?sortBy=bestselling" className="hover:text-[#7f0df2] transition-colors">
                  {t("footer.links.bestSellers")}
                </LocaleLink>
              </li>
              <li>
                <LocaleLink href="/market?sortBy=newest" className="hover:text-[#7f0df2] transition-colors">
                  {t("footer.links.newArrivals")}
                </LocaleLink>
              </li>
              <li>
                <LocaleLink href="/market?priceType=free" className="hover:text-[#7f0df2] transition-colors">
                  {t("footer.links.freeCollections")}
                </LocaleLink>
              </li>
            </ul>
          </div>

          {/* For Sellers */}
          <div>
            <h4 className="text-white font-bold mb-6">{t("footer.sections.forSellers")}</h4>
            <ul className="space-y-3 text-sm text-gray-500">
              <li>
                <LocaleLink href="/seller" className="hover:text-[#7f0df2] transition-colors">
                  {t("footer.links.howToSell")}
                </LocaleLink>
              </li>
              <li>
                <LocaleLink href="/dashboard" className="hover:text-[#7f0df2] transition-colors">
                  {t("footer.links.dashboard")}
                </LocaleLink>
              </li>
              <li>
                <a href="#" className="hover:text-[#7f0df2] transition-colors">
                  {t("footer.links.guidelines")}
                </a>
              </li>
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h4 className="text-white font-bold mb-6">{t("footer.newsletter.title")}</h4>
            <form onSubmit={handleSubscribe} className="space-y-3">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={t("footer.newsletter.placeholder")}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-4 py-2 text-white placeholder-zinc-600 focus:border-[#7f0df2] focus:ring-0 focus:outline-none text-sm"
              />
              <button
                type="submit"
                className="w-full bg-[#7f0df2] text-white font-bold py-2 rounded-lg hover:bg-[#9d4dff] transition-colors text-sm"
              >
                {t("footer.newsletter.button")}
              </button>
            </form>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-white/5 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-gray-600 text-sm text-center md:text-right">
            {t("footer.legal.copyright")}
          </p>
          <div className="flex gap-6 text-sm text-gray-600">
            <a href="#" className="hover:text-white transition-colors">
              {t("footer.legal.privacy")}
            </a>
            <a href="#" className="hover:text-white transition-colors">
              {t("footer.legal.terms")}
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
