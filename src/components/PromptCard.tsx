import type { Prompt } from "@/lib/schemas/api";
import { ShoppingCart, Star } from "lucide-react";
import Link from "next/link";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Card, CardContent } from "./ui/card";

interface PromptCardProps {
  prompt: Prompt;
}

export function PromptCard({ prompt }: PromptCardProps) {
  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow group">
      <Link href={`/prompt/${prompt.id}`}>
        <div className="aspect-video overflow-hidden bg-muted">
          <ImageWithFallback
            src={prompt.thumbnail}
            alt={prompt.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        </div>
      </Link>

      <CardContent className="p-4">
        <Link href={`/prompt/${prompt.id}`}>
          <div className="mb-2">
            <Badge variant="secondary" className="mb-2">
              {prompt.aiModel}
            </Badge>
            <h3 className="font-bold line-clamp-2 hover:text-primary transition-colors">
              {prompt.title}
            </h3>
          </div>
        </Link>

        <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
          {prompt.description}
        </p>

        <div className="flex items-center gap-1 mb-3">
          <div className="flex items-center">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={`h-3 w-3 ${
                  i < Math.floor(prompt.rating)
                    ? "fill-yellow-400 text-yellow-400"
                    : "text-muted-foreground/30"
                }`}
              />
            ))}
          </div>
          <span className="text-xs text-muted-foreground mr-1">
            ({prompt.reviews})
          </span>
        </div>

        <div className="flex items-center justify-between">
          <div>
            <div className="font-bold text-lg">${prompt.price}</div>
            <div className="text-xs text-muted-foreground">
              {prompt.sales} مبيعات
            </div>
          </div>

          <Button size="sm" variant="default">
            <ShoppingCart className="h-4 w-4 ml-2" />
            شراء
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
