import { ArrowLeft, LucideIcon } from "lucide-react";
import { CSSProperties } from "react";

interface TechCardProps {
  title: string;
  subTitle: string;
  desc: string;
  sysId: string;
  icon: LucideIcon;
  colorClass: string;
  glowColor: string;
  imageSrc: string;
  delay?: number;
}

// ── Tech Card ──────────────────────────────────────────────────────────

const TechCard = ({
  title,
  subTitle,
  desc,
  sysId,
  colorClass,
  glowColor,
  imageSrc,
}: TechCardProps) => {
  return (
    <div
      className={`group relative h-95 bg-[#1a1a20] clip-tech-card border-t-2 border-l-2 border-white/5 hover:border-${colorClass} transition-all duration-500 flex flex-col overflow-hidden cursor-pointer`}
      style={{ "--glow-color": glowColor } as CSSProperties}
    >
      {/* Decorative Corners */}
      <div
        className={`absolute top-0 right-0 w-16 h-16 border-t-2 border-r-2 border-${colorClass}/50 rounded-tr-lg opacity-30 group-hover:opacity-100 group-hover:w-full group-hover:h-full transition-all duration-700 pointer-events-none`}
      />
      <div
        className={`absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-${colorClass}/50 opacity-30 group-hover:opacity-100 transition-all pointer-events-none`}
      />

      {/* Circuit overlay */}
      <div className="absolute inset-0 bg-circuit opacity-10 group-hover:opacity-20 transition-opacity" />

      {/* Content */}
      <div className="relative z-10 flex-1 flex flex-col items-center justify-center p-6 text-center">
        <div className="w-32 h-32 mb-6 relative">
          <div
            className={`absolute inset-0 bg-${colorClass}/20 blur-2xl rounded-full group-hover:bg-${colorClass}/40 transition-all`}
          />
          <img
            src={imageSrc}
            alt={subTitle}
            className="relative w-full h-full object-contain drop-shadow-lg transform group-hover:scale-110 group-hover:-translate-y-2 transition-transform duration-500"
          />
        </div>

        <h2
          className={`text-3xl font-display font-bold text-white mb-2 group-hover:text-${colorClass} transition-colors drop-shadow-[0_0_8px_rgba(0,0,0,0.8)]`}
        >
          {title}
        </h2>
        <h3
          className={`text-xs font-bold tracking-[0.2em] uppercase mb-3 text-${colorClass} font-display`}
        >
          {subTitle}
        </h3>
        <p className="text-gray-400 text-sm px-2 opacity-80 group-hover:opacity-100 transition-opacity font-arabic">
          {desc}
        </p>
      </div>

      {/* Footer Strip */}
      <div
        className={`bg-black/40 backdrop-blur-sm p-3 border-t border-white/5 flex justify-between items-center group-hover:bg-${colorClass}/10 transition-colors`}
      >
        <span className="text-[10px] text-gray-500 font-mono tracking-wider">
          {sysId}
        </span>
        <ArrowLeft
          className={`w-4 h-4 text-${colorClass} group-hover:-translate-x-1 transition-transform`}
        />
      </div>
    </div>
  );
};

export default TechCard;
