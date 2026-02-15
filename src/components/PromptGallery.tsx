"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { ImageWithFallback } from "@/components/figma/ImageWithFallback";

interface PromptGalleryProps {
  images: { url: string; alt: string }[];
}

export function PromptGallery({ images }: PromptGalleryProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const thumbnailsRef = useRef<(HTMLButtonElement | null)[]>([]);

  const handleNext = useCallback(
    () => setActiveIndex((prev) => (prev + 1) % images.length),
    [images.length],
  );
  const handlePrev = useCallback(
    () => setActiveIndex((prev) => (prev - 1 + images.length) % images.length),
    [images.length],
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      // RTL: ArrowRight = prev, ArrowLeft = next
      if (e.key === "ArrowRight") handlePrev();
      if (e.key === "ArrowLeft") handleNext();
    },
    [handleNext, handlePrev],
  );

  useEffect(() => {
    thumbnailsRef.current[activeIndex]?.scrollIntoView({
      behavior: "smooth",
      block: "nearest",
    });
  }, [activeIndex]);

  if (images.length === 0) return null;

  return (
    <div
      className="flex flex-col-reverse md:flex-row gap-4"
      onKeyDown={handleKeyDown}
      tabIndex={0}
    >
      {/* Thumbnails — right side in RTL, below on mobile */}
      <div className="relative flex flex-row md:flex-col gap-3 w-full md:w-20 shrink-0">
        {/* Active indicator track (desktop only) */}
        <div className="hidden md:block absolute end-[-14px] top-0 bottom-0 w-1 rounded-full bg-muted overflow-hidden">
          <div
            className="absolute w-full bg-primary transition-all duration-300 ease-out shadow-[0_0_10px_rgba(96,61,234,0.5)]"
            style={{
              height: `${100 / images.length}%`,
              top: `${(activeIndex / images.length) * 100}%`,
            }}
          />
        </div>

        <div className="flex md:flex-col gap-3 overflow-x-auto md:overflow-y-auto no-scrollbar h-full py-1 pe-1">
          {images.map((img, index) => (
            <Button
              key={index}
              ref={(el) => {
                thumbnailsRef.current[index] = el;
              }}
              onClick={() => setActiveIndex(index)}
              variant="ghost"
              className={cn(
                "relative p-0 w-16 h-16 md:w-20 md:h-20 rounded-lg overflow-hidden shrink-0 transition-all duration-200",
                "hover:scale-105 hover:bg-transparent",
                activeIndex === index
                  ? "ring-2 ring-primary ring-offset-2 ring-offset-background opacity-100 scale-105"
                  : "opacity-60 hover:opacity-100 ring-1 ring-border",
              )}
            >
              <ImageWithFallback
                src={img.url}
                alt={img.alt}
                className="w-full h-full object-cover"
              />
            </Button>
          ))}
        </div>
      </div>

      {/* Main viewer */}
      <div className="flex-1 flex flex-col gap-3 min-w-0">
        <Card className="relative aspect-video overflow-hidden bg-muted border-border shadow-xl group">
          {/* Main image */}
          <ImageWithFallback
            key={activeIndex}
            src={images[activeIndex].url}
            alt={images[activeIndex].alt}
            className="w-full h-full object-cover animate-in fade-in zoom-in-105 duration-500"
          />

          {/* Gradient overlay */}
          <div className="absolute top-0 left-0 right-0 h-24 bg-gradient-to-b from-black/40 to-transparent pointer-events-none" />

          {/* Navigation controls */}
          <div className="absolute inset-0 pointer-events-none flex items-center justify-between px-4">
            {/* RTL: right arrow goes prev (visually forward), left arrow goes next */}
            <Button
              variant="secondary"
              size="icon"
              className="pointer-events-auto h-11 w-11 rounded-full bg-black/20 backdrop-blur-md border border-white/10 text-white hover:bg-black/40 hover:scale-110 transition-all opacity-0 group-hover:opacity-100"
              onClick={(e) => {
                e.stopPropagation();
                handleNext();
              }}
            >
              <ChevronLeft className="h-5 w-5" />
            </Button>

            <Button
              variant="secondary"
              size="icon"
              className="pointer-events-auto h-11 w-11 rounded-full bg-black/20 backdrop-blur-md border border-white/10 text-white hover:bg-black/40 hover:scale-110 transition-all opacity-0 group-hover:opacity-100"
              onClick={(e) => {
                e.stopPropagation();
                handlePrev();
              }}
            >
              <ChevronRight className="h-5 w-5" />
            </Button>
          </div>
        </Card>

        <div className="flex items-center justify-between px-1">
          <p className="text-muted-foreground text-sm font-medium">
            صور معاينة ناتجة عن هذا البرومبت
          </p>
          <div className="text-xs text-muted-foreground/60 font-mono tabular-nums">
            {activeIndex + 1} / {images.length}
          </div>
        </div>
      </div>

      <style>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
}
