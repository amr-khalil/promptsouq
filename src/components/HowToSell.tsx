"use client";

import { cn } from "@/lib/utils";
import {
  ChevronLeft,
  DollarSign,
  Pen,
  Play,
  Rocket,
  Send,
  Sparkles,
  Trophy,
  Upload,
  Users,
  X,
} from "lucide-react";
import { useState } from "react";

function CornerAccent({
  position,
}: {
  position: "top-right" | "top-left" | "bottom-right" | "bottom-left";
}) {
  const borders: Record<string, string> = {
    "top-right": "border-t-2 border-r-2 top-0 right-0",
    "top-left": "border-t-2 border-l-2 top-0 left-0",
    "bottom-right": "border-b-2 border-r-2 bottom-0 right-0",
    "bottom-left": "border-b-2 border-l-2 bottom-0 left-0",
  };

  return (
    <div className={cn("absolute w-6 h-6 border-amber-400", borders[position])} />
  );
}

function SectionHeader({
  title,
  subtitle,
}: {
  title: string;
  subtitle?: string;
}) {
  return (
    <div className="mb-4">
      <h3 className="flex items-center text-lg font-bold text-slate-100 hover:text-amber-400 transition-colors cursor-pointer group">
        {title}
        <ChevronLeft className="mr-1 h-4 w-4 text-amber-500 group-hover:-translate-x-1 transition-transform" />
      </h3>
      {subtitle && <p className="text-xs text-slate-400">{subtitle}</p>}
    </div>
  );
}

export default function HowToSell() {
  const [isPlaying, setIsPlaying] = useState(false);

  return (
    <section className="bg-[#0f1016] py-16 text-white">
      <div className="container mx-auto px-4 max-w-6xl space-y-6">
        {/* Top Header */}
        <div className="flex items-center justify-between px-2">
          <h2 className="text-2xl md:text-3xl font-bold flex items-center gap-2">
            كيف تبيع ؟ <span className="text-amber-400">«</span>
          </h2>
          <div className="h-[1px] flex-1 bg-slate-800 mr-6 hidden sm:block" />
        </div>

        {/* Video/Grid Container Frame */}
        <div className="relative group/main rounded-xl border border-slate-800 bg-[#0f1016] p-1 overflow-hidden">
          {/* Corner Accents */}
          <CornerAccent position="top-right" />
          <CornerAccent position="top-left" />
          <CornerAccent position="bottom-right" />
          <CornerAccent position="bottom-left" />

          {/* Content Wrapper */}
          <div className="relative z-10 p-6 md:p-8 min-h-[500px] flex flex-col">
            {isPlaying ? (
              /* VIDEO PLAYER STATE */
              <div className="absolute inset-0 z-50 bg-black animate-in fade-in duration-500">
                <iframe
                  className="w-full h-full"
                  src="https://www.youtube.com/embed/dQw4w9WgXcQ?autoplay=1"
                  title="كيف تبيع على برومبت سوق"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
                <button
                  onClick={() => setIsPlaying(false)}
                  className="absolute top-4 left-4 bg-slate-900/80 text-white p-2 rounded-full hover:bg-slate-800 transition-all"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            ) : (
              /* BENTO GRID STATE */
              <div className="grid grid-cols-1 md:grid-cols-12 gap-6 h-full">
                {/* COLUMN 1: HERO - Create Prompt (4 cols) */}
                <div className="md:col-span-4 flex flex-col">
                  <SectionHeader
                    title="اكتب البرومبت"
                    subtitle="الخطوة الأولى في رحلتك."
                  />
                  <div className="flex-1 relative overflow-hidden rounded-xl border border-slate-800 bg-slate-900/50 cursor-pointer group/card min-h-[300px]">
                    <img
                      src="https://images.unsplash.com/photo-1677442136019-21780ecad995?q=80&w=2670&auto=format&fit=crop"
                      alt="اكتب البرومبت"
                      className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover/card:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                    <div className="absolute bottom-4 right-4 left-4">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-8 h-8 rounded-full bg-amber-400 flex items-center justify-center">
                          <Pen className="h-4 w-4 text-amber-950" />
                        </div>
                        <span className="text-xs font-bold text-amber-400">
                          الخطوة ١
                        </span>
                      </div>
                      <h4 className="text-xl font-bold mb-1">
                        صمم برومبت احترافي
                      </h4>
                      <p className="text-xs text-slate-300 line-clamp-2">
                        اكتب أوامر ذكية تحقق نتائج مبهرة مع أدوات الذكاء
                        الاصطناعي.
                      </p>

                      {/* Carousel Indicators */}
                      <div className="flex gap-1 mt-4">
                        <div className="h-1 w-6 bg-amber-400 rounded-full" />
                        <div className="h-1 w-2 bg-slate-600 rounded-full" />
                        <div className="h-1 w-2 bg-slate-600 rounded-full" />
                      </div>
                    </div>
                  </div>
                </div>

                {/* COLUMN 2: SERVICES (4 cols) */}
                <div className="md:col-span-4 flex flex-col h-full">
                  <SectionHeader
                    title="سعّر وانشر"
                    subtitle="حدد سعرك وابدأ البيع."
                  />
                  <div className="flex flex-col gap-4 flex-1">
                    {/* Top Service Card (Purple) - Pricing */}
                    <div className="flex-1 rounded-xl bg-gradient-to-br from-violet-600 to-indigo-900 overflow-hidden relative cursor-pointer group/card min-h-[160px]">
                      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.05),transparent)]" />
                      <div className="h-full flex flex-col justify-center relative z-10 p-6">
                        <div className="flex items-center gap-2 mb-3">
                          <div className="w-8 h-8 rounded-full bg-amber-400 flex items-center justify-center">
                            <DollarSign className="h-4 w-4 text-amber-950" />
                          </div>
                          <span className="text-xs font-bold text-amber-300">
                            الخطوة ٢
                          </span>
                        </div>
                        <h4 className="text-xl font-extrabold leading-tight mb-2">
                          <span className="text-amber-300">حدد</span> سعرك
                          المناسب
                          <br />
                          <span className="text-white bg-violet-500 px-1">
                            وابدأ الربح !!
                          </span>
                        </h4>
                        <div className="mt-auto flex -space-x-3 -space-x-reverse pt-4">
                          {["سارة", "محمد", "خالد"].map((name) => (
                            <div
                              key={name}
                              className="w-8 h-8 rounded-full border-2 border-violet-700 overflow-hidden"
                            >
                              <img
                                src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${name}&backgroundColor=ffdfbf`}
                                alt={name}
                              />
                            </div>
                          ))}
                          <div className="w-8 h-8 rounded-full border-2 border-violet-700 bg-slate-800 flex items-center justify-center text-[10px] font-bold">
                            +99
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Bottom Card (Gold) - Publish */}
                    <div className="flex-1 rounded-xl bg-gradient-to-br from-amber-500 to-yellow-600 relative overflow-hidden cursor-pointer min-h-[160px]">
                      <div className="absolute top-0 left-0 w-32 h-32 bg-yellow-300 rounded-full blur-3xl opacity-20 -translate-x-10 -translate-y-10" />
                      <div className="h-full flex flex-col items-center justify-center text-center relative z-10 p-6">
                        <span className="inline-flex items-center rounded-full bg-black/20 text-yellow-950 px-2.5 py-0.5 text-xs font-semibold mb-2">
                          الخطوة ٣
                        </span>
                        <h4 className="text-xl font-bold text-yellow-950 mb-4">
                          انشر واجذب المشترين
                        </h4>
                        <div className="flex gap-4">
                          <button className="inline-flex items-center justify-center bg-black/10 hover:bg-black/20 text-yellow-950 rounded-xl h-12 w-12 transition-colors">
                            <Upload className="h-6 w-6" />
                          </button>
                          <button className="inline-flex items-center justify-center bg-black/10 hover:bg-black/20 text-yellow-950 rounded-xl h-12 w-12 transition-colors">
                            <Send className="h-6 w-6" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* COLUMN 3: FEATURES (4 cols) */}
                <div className="md:col-span-4 flex flex-col">
                  <SectionHeader
                    title="لماذا برومبت سوق؟"
                    subtitle="مميزات تجعلك تبيع أكثر."
                  />
                  <div className="grid grid-cols-2 gap-3 flex-1">
                    {[
                      {
                        icon: Users,
                        title: "آلاف المشترين",
                        color: "from-violet-600/40 to-indigo-900/60",
                      },
                      {
                        icon: DollarSign,
                        title: "أرباح فورية",
                        color: "from-emerald-600/40 to-green-900/60",
                      },
                      {
                        icon: Sparkles,
                        title: "ذكاء اصطناعي",
                        color: "from-amber-600/40 to-orange-900/60",
                      },
                      {
                        icon: Rocket,
                        title: "انطلق الآن",
                        color: "from-rose-600/40 to-pink-900/60",
                      },
                    ].map((feature) => (
                      <div
                        key={feature.title}
                        className="rounded-xl border border-slate-800 bg-slate-900/50 overflow-hidden relative cursor-pointer group/card min-h-[140px] flex flex-col items-center justify-center text-center p-4"
                      >
                        <div
                          className={cn(
                            "absolute inset-0 bg-gradient-to-br opacity-0 group-hover/card:opacity-100 transition-opacity duration-500",
                            feature.color
                          )}
                        />
                        <div className="relative z-10">
                          <div className="w-12 h-12 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center mx-auto mb-3 group-hover/card:border-amber-400/50 transition-colors">
                            <feature.icon className="h-5 w-5 text-amber-400" />
                          </div>
                          <p className="text-sm font-bold text-slate-200">
                            {feature.title}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Play Button Overlay (Centered Absolute) */}
          {!isPlaying && (
            <div className="absolute inset-0 flex items-center justify-center z-20 pointer-events-none">
              <button
                onClick={() => setIsPlaying(true)}
                className="pointer-events-auto h-20 w-20 md:h-24 md:w-24 rounded-full bg-amber-400 text-amber-950 hover:bg-amber-500 shadow-[0_0_20px_rgba(251,191,36,0.5)] border-4 border-slate-900 hover:scale-110 transition-transform duration-300 animate-pulse inline-flex items-center justify-center"
              >
                <Play className="h-10 w-10 md:h-12 md:w-12 mr-1" fill="currentColor" />
              </button>
            </div>
          )}

          {/* Footer Bar */}
          <div className="absolute bottom-0 left-0 right-0 h-12 border-t border-slate-800 bg-slate-900/90 flex items-center justify-between px-6 z-30">
            {/* Steps Progress */}
            <div className="flex items-center gap-3 text-xs text-slate-400">
              <span className="text-amber-400 font-bold">٣ خطوات</span>
              <div className="w-24 h-1 bg-slate-700 rounded-full overflow-hidden">
                <div className="h-full w-full bg-amber-400 rounded-full" />
              </div>
              <span>لبدء البيع</span>
            </div>

            {/* Stat Badges */}
            <div className="flex gap-4 text-slate-400 text-xs">
              <span className="hidden sm:inline-flex items-center gap-1">
                <Users className="h-3 w-3" /> +١٠٠٠ بائع
              </span>
              <span className="hidden sm:inline-flex items-center gap-1">
                <DollarSign className="h-3 w-3" /> +٥٠ ألف ر.س
              </span>
            </div>
          </div>
        </div>

        {/* Bottom Tagline */}
        <div className="text-center text-slate-500 text-sm flex items-center justify-center gap-2">
          <Trophy className="h-4 w-4 text-amber-500" />
          <span>أكثر من ١٠٠٠ بائع يثقون بمنصتنا</span>
        </div>
      </div>
    </section>
  );
}
