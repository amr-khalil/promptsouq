"use client";

import { Heart } from "lucide-react";

export interface GalleryImage {
  id: string;
  imageUrl: string;
  caption: string | null;
  likesCount: number;
  createdAt: string;
  prompt: {
    id: string;
    title: string;
    isFree: boolean;
    category: string;
  };
  seller: {
    id: string;
    name: string;
    avatar: string | null;
  };
}

interface GalleryImageCardProps {
  image: GalleryImage;
  onClick: (id: string) => void;
}

export function GalleryImageCard({ image, onClick }: GalleryImageCardProps) {
  return (
    <div
      className="break-inside-avoid mb-4 group cursor-pointer"
      onClick={() => onClick(image.id)}
    >
      <div className="relative rounded-xl overflow-hidden bg-zinc-900 border border-zinc-800 hover:border-[#7f0df2]/30 transition-all">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={image.imageUrl}
          alt={image.caption ?? image.prompt.title}
          className="w-full object-cover"
          loading="lazy"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.style.display = "none";
            const parent = target.parentElement;
            if (parent) {
              const placeholder = document.createElement("div");
              placeholder.className = "w-full aspect-square bg-zinc-800 flex items-center justify-center";
              placeholder.innerHTML = '<svg class="w-8 h-8 text-zinc-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>';
              parent.insertBefore(placeholder, target);
            }
          }}
        />

        {/* Hover overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <div className="absolute bottom-0 left-0 right-0 p-3">
            <p className="text-white text-sm font-medium truncate">
              {image.seller.name}
            </p>
            <div className="flex items-center gap-1.5 text-zinc-300 text-xs mt-1">
              <Heart className="w-3.5 h-3.5" />
              <span>{image.likesCount}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
