"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useCartItemCount } from "@/hooks/use-cart";
import { Search, ShoppingBag, Zap } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

function Hero() {
  const [searchQuery, setSearchQuery] = useState("");
  const router = useRouter();
  const cartCount = useCartItemCount();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery)}`);
    }
  };
  return (
    <section className="bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-950/20 dark:to-blue-950/20 py-20">
      {/* CTA */}
      <div className="container mx-auto px-4">
        <div className="flex flex-row items-center text-center gap-8 max-w-3xl mx-auto">
          <div className="mx-auto text-right">
            <h1 className="text-3xl md:text-3xl font-extrabold leading-tight tracking-tight">
              أطلق العنان لقوة <br />
              <span className="bg-gradient-to-l from-purple-400 to-indigo-500 bg-clip-text text-transparent drop-shadow-sm">
                الذكاء الاصطناعي
              </span>{" "}
              <span>مع</span>{" "}
              <span className="bg-gradient-to-l from-purple-400 to-indigo-500 bg-clip-text text-transparent drop-shadow-sm">
                أوامر احترافية
              </span>{" "}
            </h1>
            <p
              className="text-xl md:text-
            xl text-muted-foreground my-8"
            >
              اشترِ وبيع برومبتات قوية للذكاء الاصطناعي بسهولة
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-start">
              <Button
                variant={"gradient"}
                size="lg"
                asChild
                className="text-lg"
              >
                <Link href="/market">
                  <ShoppingBag className="ml-2 h-5 w-5" />
                  تسوق الآن
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild className="text-lg">
                <Link href="/seller">
                  <Zap className="ml-2 h-5 w-5" />
                  ابدأ البيع
                </Link>
              </Button>
            </div>
          </div>
          <div>
            <img
              src="/hero.png"
              alt="Hero Image"
              className="w-full max-w-md mx-auto rounded-lg shadow-lg"
            />
          </div>
        </div>
      </div>
      {/* Search Bar - Desktop */}
      <div className="w-full">
        <form
          onSubmit={handleSearch}
          className=" w-full mt-10 mx-auto max-w-2xl"
        >
          <div className="relative w-full">
            <Input
              type="search"
              placeholder="ابحث عن برومبت..."
              className="w-full pr-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <Button
              variant="gradient"
              type="submit"
              className="absolute left-0 top-1/2 -translate-y-1/2 rounded-sm cursor-pointer"
            >
              <Search className="h-4 w-4" />
            </Button>
          </div>
        </form>
      </div>
    </section>
  );
}

export default Hero;
