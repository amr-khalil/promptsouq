"use client";

import type { CSSProperties, ReactNode } from "react";

export interface BrandItemProps {
  name: string;
  color: string;
  logo: ReactNode;
}

const BrandItem = ({ name, color, logo }: BrandItemProps) => (
  <div
    className="flex items-center gap-3 text-zinc-500 hover:text-white transition-colors duration-300 cursor-pointer group shrink-0"
    style={{ "--brand-color": color } as CSSProperties}
  >
    <span className="w-7 h-7 transition-colors duration-300 group-hover:text-(--brand-color)">
      {logo}
    </span>
    <span className="font-display font-bold text-lg tracking-wide transition-colors duration-300 group-hover:text-(--brand-color)">
      {name}
    </span>
  </div>
);

export default BrandItem;
