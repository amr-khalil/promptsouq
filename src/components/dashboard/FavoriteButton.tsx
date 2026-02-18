"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/use-auth";
import { Heart } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

interface FavoriteButtonProps {
  promptId: string;
  isFavorited: boolean;
  className?: string;
  size?: "sm" | "default" | "icon";
}

export function FavoriteButton({
  promptId,
  isFavorited: initialFavorited,
  className,
  size = "icon",
}: FavoriteButtonProps) {
  const { isSignedIn } = useAuth();
  const router = useRouter();
  const [favorited, setFavorited] = useState(initialFavorited);
  const [loading, setLoading] = useState(false);

  const handleToggle = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isSignedIn) {
      router.push("/sign-in");
      return;
    }

    setLoading(true);
    const prev = favorited;
    setFavorited(!prev); // Optimistic update

    try {
      if (prev) {
        const res = await fetch(`/api/favorites/${promptId}`, {
          method: "DELETE",
        });
        if (!res.ok) {
          setFavorited(prev);
          toast.error("فشل في إزالة المفضلة");
        }
      } else {
        const res = await fetch("/api/favorites", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ promptId }),
        });
        if (!res.ok) {
          setFavorited(prev);
          toast.error("فشل في إضافة المفضلة");
        }
      }
    } catch {
      setFavorited(prev);
      toast.error("حدث خطأ");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      variant="ghost"
      size={size}
      onClick={handleToggle}
      disabled={loading}
      className={cn("shrink-0", className)}
      aria-label={favorited ? "إزالة من المفضلة" : "إضافة للمفضلة"}
    >
      <Heart
        className={cn(
          "h-5 w-5 transition-colors",
          favorited
            ? "fill-red-500 text-red-500"
            : "text-muted-foreground hover:text-red-400",
        )}
      />
    </Button>
  );
}
