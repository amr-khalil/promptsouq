"use client";

import { ImageWithFallback } from "@/components/figma/ImageWithFallback";
import { LocaleLink } from "@/components/LocaleLink";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { useCartItemCount } from "@/hooks/use-cart";
import { useCartStore } from "@/stores/cart-store";
import { Bot, ShoppingBag, Trash2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";

export function CartSheet() {
  const { t } = useTranslation("common");
  const cartCount = useCartItemCount();
  const { items, removeItem, totalPrice } = useCartStore();
  const total = totalPrice();

  function handleRemove(promptId: string) {
    removeItem(promptId);
    toast.success(t("cart.removedFromCart"));
  }

  return (
    <Sheet>
      <SheetTrigger asChild>
        <button className="relative flex items-center justify-center w-10 h-10 rounded-full border border-zinc-700 text-zinc-400 hover:text-white hover:border-[#7f0df2] hover:shadow-[0_0_15px_#7f0df2] transition-all">
          <ShoppingBag className="w-5 h-5" />
          {cartCount > 0 && (
            <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-[#7f0df2] text-white text-[10px] font-bold flex items-center justify-center">
              {cartCount}
            </span>
          )}
        </button>
      </SheetTrigger>

      <SheetContent
        side="right"
        showCloseButton={false}
        className="w-full sm:max-w-md bg-[#18181b] border-white/10 p-0 flex flex-col"
      >
        {/* Header */}
        <SheetHeader className="p-6 border-b border-white/10">
          <SheetTitle className="text-xl font-bold text-white flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-[#7f0df2]" />
            {t("cart.title")}
            {cartCount > 0 && (
              <span className="text-sm font-normal text-gray-500 bg-white/5 px-2 py-0.5 rounded-full">
                {cartCount}
              </span>
            )}
          </SheetTitle>
          <SheetDescription className="text-gray-500 text-sm">
            {t("cart.description")}
          </SheetDescription>
        </SheetHeader>

        {/* Items */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {items.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center text-gray-500 py-12">
              <ShoppingBag className="w-16 h-16 mb-4 opacity-20" />
              <p className="font-semibold text-white/60 mb-1">{t("cart.empty")}</p>
              <p className="text-sm">{t("cart.emptyHint")}</p>
            </div>
          ) : (
            items.map((item) => (
              <div
                key={item.promptId}
                className="flex gap-3 group rounded-xl bg-white/5 p-3 border border-white/5"
              >
                <div className="w-16 h-16 rounded-lg overflow-hidden shrink-0 border border-white/10">
                  {item.thumbnail ? (
                    <ImageWithFallback
                      src={item.thumbnail}
                      alt={item.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-emerald-900 flex items-center justify-center">
                      <Bot className="w-5 h-5 text-white/50" />
                    </div>
                  )}
                </div>
                <div className="flex-1 flex flex-col justify-between min-w-0">
                  <h4 className="font-bold text-white text-sm line-clamp-1">
                    {item.title}
                  </h4>
                  <div className="flex items-center justify-between">
                    <span className="text-[#faff00] font-bold text-sm">
                      {t("price.currency", { amount: item.price })}
                    </span>
                    <button
                      onClick={() => handleRemove(item.promptId)}
                      className="text-red-500 hover:text-red-400 transition-colors p-1 rounded-md hover:bg-red-500/10"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <SheetFooter className="p-6 border-t border-white/10 bg-[#1a1a20]">
            <div className="w-full">
              <div className="flex items-center justify-between mb-4">
                <span className="text-gray-400">{t("cart.total")}</span>
                <span className="text-2xl font-bold text-white">
                  {t("price.currency", { amount: total.toFixed(2) })}
                </span>
              </div>
              <Button
                asChild
                className="w-full bg-[#7f0df2] hover:bg-[#9d4dff] text-white font-bold py-3.5 h-auto rounded-lg shadow-[0_0_20px_rgba(127,13,242,0.3)] hover:shadow-[0_0_30px_rgba(127,13,242,0.5)]"
              >
                <LocaleLink href="/checkout">{t("cart.checkout")}</LocaleLink>
              </Button>
              <p className="text-center text-xs text-gray-500 mt-3">
                {t("cart.securePayment")}
              </p>
            </div>
          </SheetFooter>
        )}
      </SheetContent>
    </Sheet>
  );
}
