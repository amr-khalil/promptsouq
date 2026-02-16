/* eslint-disable @next/next/no-img-element */
import {
  ArrowLeft,
  BadgeCheck,
  Bot,
  Building2,
  Code,
  FileText,
  ImageIcon,
  Languages,
  Paintbrush,
  Search,
  Sparkles,
  Star,
} from "lucide-react";
import { IBM_Plex_Sans_Arabic, Space_Grotesk } from "next/font/google";

const ibmPlex = IBM_Plex_Sans_Arabic({
  variable: "--font-ibm-plex",
  subsets: ["latin", "arabic"],
  weight: ["300", "400", "500", "700"],
});

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
  weight: ["300", "400", "500", "700"],
});

/* ─── data ─── */

const heroCards = [
  {
    title: "استكشف",
    subtitle: "Explore",
    description: "اكتشف أحدث الأعمال الفنية والأوامر المميزة.",
    sysId: "SYS.ID_01",
    img: "https://lh3.googleusercontent.com/aida-public/AB6AXuCy17PrQe4vyCG7lHq60OaemI8yRZi1lOecYZ84l46PxkExfsA-wZnnDxPzjebem1djf09-QoZYCZ7JIZTUT4uLMcx_uzuDGuSgL2QfK8UoTcfP2vF0oGqIFGRlZQpjbwXKsr-CF1K0sxb8q1uHD2HBzD_hwcGNh8BPih908U6VV-KwezY51zJeVKTzdSLG35eXvqMiIRFmbqc40pBlJa2u63P_Y6iK2PX9QL1xy8pzqJmlPxwx6Nmj4X0MIJbs_1Exx6pD-qWqT-QW",
    imgAlt: "Glowing 3D chest icon",
    glowColor: "bg-[#7f0df2]/30",
    glowHover: "group-hover:bg-[#7f0df2]/50",
    dropShadow: "drop-shadow-[0_0_15px_rgba(127,13,242,0.6)]",
    titleHover: "group-hover:text-[#faff00]",
    subtitleColor: "text-[#7f0df2]",
    hoverBorder: "hover:border-[#7f0df2]",
    hoverShadow: "hover:shadow-[0_0_10px_#7f0df2,0_0_20px_#7f0df2]",
    cornerBorderColor: "border-[#faff00]/50",
    bottomCornerColor: "border-[#7f0df2]/50",
    footerHoverBg: "group-hover:bg-[#7f0df2]/10",
    arrowColor: "text-[#faff00]",
  },
  {
    title: "بع الآن",
    subtitle: "Sell Prompts",
    description: "حول إبداعك إلى دخل مادي حقيقي.",
    sysId: "SYS.ID_02",
    img: "https://lh3.googleusercontent.com/aida-public/AB6AXuAMxq8iOPcqjH_pqTboYQ6bFOI-aGnsrLfa8_cTD-ua-f0jrWVw_lzv--dS-921gJI5pwU8RcmeNc9a4r19KACU2Ixe-RN24tIsGPO3NWGJnxKzrQN7Dglx-ATlHPDNjRVIEsja5hv7CyMxTs0gJ4fLs27PBOPy6pEDadVZlPJbljFGjX_Wtsj7HLCKitQZ-dDY8blrRc7Bd8hYxP4q1LEzizB_mjVsXDeipOOh2zKB8Cew4SLVhr7p9C-tFiWKhWe94sMypJ6fpRl4",
    imgAlt: "3D digital coin icon",
    glowColor: "bg-[#faff00]/20",
    glowHover: "group-hover:bg-[#faff00]/40",
    dropShadow: "drop-shadow-[0_0_15px_rgba(250,255,0,0.4)]",
    titleHover: "group-hover:text-[#7f0df2]",
    subtitleColor: "text-[#faff00]",
    hoverBorder: "hover:border-[#faff00]",
    hoverShadow: "hover:shadow-[0_0_5px_#faff00,0_0_10px_#faff00]",
    cornerBorderColor: "border-[#7f0df2]/50",
    bottomCornerColor: "border-[#faff00]/50",
    footerHoverBg: "group-hover:bg-[#faff00]/10",
    arrowColor: "text-white",
  },
  {
    title: "توليد",
    subtitle: "Generate",
    description: "أنشئ صوراً مذهلة باستخدام أدواتنا المدمجة.",
    sysId: "SYS.ID_03",
    img: "https://lh3.googleusercontent.com/aida-public/AB6AXuB8Blopr5HwsBM5k0LoPaLn0azDRw6nnwyMkfhtg7MoU5VUv89WLirWjkY8AxooFk46kIilnXhCxqW3IiOxrza7ElZ16BR8iHpZZCMKI5-Vo6lfLX0WTyzlCXR81BxCwSbMaECa10a-bJlXNI7WWrBotUv-uBtO3GNCFnKMUXXX4RCqWB-8ggv7VH6C37EiKZS6Ah9sdE8axs0T9QAPVhzb3U8xa5k-XvkeZiPG3g1UuqEQ6d0aClepvkVQ6kKVdZdqOhPaPsKjy3Pp",
    imgAlt: "3D processor chip icon",
    glowColor: "bg-purple-500/20",
    glowHover: "group-hover:bg-purple-500/40",
    dropShadow: "drop-shadow-[0_0_15px_rgba(168,85,247,0.5)]",
    titleHover: "group-hover:text-[#faff00]",
    subtitleColor: "text-[#7f0df2]",
    hoverBorder: "hover:border-[#7f0df2]",
    hoverShadow: "hover:shadow-[0_0_10px_#7f0df2,0_0_20px_#7f0df2]",
    cornerBorderColor: "border-[#faff00]/50",
    bottomCornerColor: "border-[#7f0df2]/50",
    footerHoverBg: "group-hover:bg-[#7f0df2]/10",
    arrowColor: "text-[#faff00]",
  },
  {
    title: "المجتمع",
    subtitle: "Community",
    description: "تواصل مع آلاف المصممين والمطورين.",
    sysId: "SYS.ID_04",
    img: "https://lh3.googleusercontent.com/aida-public/AB6AXuCMIynAy0wLsmQA3RDTk1HdGPTwsNAeJ_aJnElzkV397kZqsZTs4Udxp9vHLsk4QmtQlTQc5UPKBcWBhEF4zWgu0UGaVs9lEBD2v8vr1oI1PJp13Fc92JkHwcOq7AGdWlKSSxIY4bWiTCg-vzNQhUWTTzdGXnan_VGSLxXg5zAmRMP1XX4p8UafqJAhx_ns-pC8wYKbmfIk2ekJxWjDaaaZaL5BjLrZHAF3H2KkJs4hJgaNdmdnX4lZTVRXWJJPcgJ9dOv47ur_qiOG",
    imgAlt: "3D globe network icon",
    glowColor: "bg-blue-500/20",
    glowHover: "group-hover:bg-blue-500/40",
    dropShadow: "drop-shadow-[0_0_15px_rgba(59,130,246,0.5)]",
    titleHover: "group-hover:text-[#7f0df2]",
    subtitleColor: "text-[#faff00]",
    hoverBorder: "hover:border-[#faff00]",
    hoverShadow: "hover:shadow-[0_0_5px_#faff00,0_0_10px_#faff00]",
    cornerBorderColor: "border-[#7f0df2]/50",
    bottomCornerColor: "border-[#faff00]/50",
    footerHoverBg: "group-hover:bg-[#faff00]/10",
    arrowColor: "text-white",
  },
];

const bestSellingCards = [
  {
    img: "https://lh3.googleusercontent.com/aida-public/AB6AXuCy17PrQe4vyCG7lHq60OaemI8yRZi1lOecYZ84l46PxkExfsA-wZnnDxPzjebem1djf09-QoZYCZ7JIZTUT4uLMcx_uzuDGuSgL2QfK8UoTcfP2vF0oGqIFGRlZQpjbwXKsr-CF1K0sxb8q1uHD2HBzD_hwcGNh8BPih908U6VV-KwezY51zJeVKTzdSLG35eXvqMiIRFmbqc40pBlJa2u63P_Y6iK2PX9QL1xy8pzqJmlPxwx6Nmj4X0MIJbs_1Exx6pD-qWqT-QW",
    imgAlt: "Cyberpunk neon city street at night with rain",
    badge: { icon: "image" as const, label: "MJ v6" },
    price: "$4.99",
    title: "Cyberpunk Neon City",
    description:
      "Prompt for generating ultra-realistic rainy cyberpunk streets with neon lights.",
    seller: "أحمد.art",
    sellerGradient: "from-blue-400 to-purple-500",
    rating: "4.9",
  },
  {
    img: "https://lh3.googleusercontent.com/aida-public/AB6AXuDecabxkWZi4kNXew-ysqHRxRBJvH3Z-fe1bsip17a84DHI5dxkleY29qjypeT3BvHAFMENqQvbAeu_wLx0dYXD1fcGjVpHdryZsGeEeRp7TZjwcmj1n-sEBNBshevp87u8EJgGRbwuTIjmlAiWO2-iyNUXEBnsFrO5Hl4jQPBtLSCLCE0YEYRQyytPsCAQJZXHfzr12oK1R50f9QVtPYhR0JsjfpvJ1AtllWAfZpFVgJwRf3yiqrWy7FyBSEDd66euged7Amn4OtJ_",
    imgAlt: "Abstract 3D colorful fluid shapes rendering",
    badge: { icon: "image" as const, label: "MJ v5.2" },
    price: "$2.50",
    title: "3D Abstract Fluids",
    description:
      "Create stunning 3D liquid abstract wallpapers with high detail.",
    seller: "PixelMaster",
    sellerGradient: "from-green-400 to-teal-500",
    rating: "5.0",
  },
  {
    img: null,
    imgAlt: "SEO Blog Writer Pro placeholder",
    badge: { icon: "bot" as const, label: "GPT-4" },
    price: "$9.99",
    title: "SEO Blog Writer Pro",
    description:
      "Complete prompt chain to write SEO optimized blog posts with human touch.",
    seller: "سارة_كاتبة",
    sellerGradient: "from-orange-400 to-red-500",
    rating: "4.8",
    placeholder: {
      gradient: "from-emerald-900 to-emerald-600",
    },
  },
  {
    img: "https://lh3.googleusercontent.com/aida-public/AB6AXuAMxq8iOPcqjH_pqTboYQ6bFOI-aGnsrLfa8_cTD-ua-f0jrWVw_lzv--dS-921gJI5pwU8RcmeNc9a4r19KACU2Ixe-RN24tIsGPO3NWGJnxKzrQN7Dglx-ATlHPDNjRVIEsja5hv7CyMxTs0gJ4fLs27PBOPy6pEDadVZlPJbljFGjX_Wtsj7HLCKitQZ-dDY8blrRc7Bd8hYxP4q1LEzizB_mjVsXDeipOOh2zKB8Cew4SLVhr7p9C-tFiWKhWe94sMypJ6fpRl4",
    imgAlt: "Futuristic character portrait with glowing eyes",
    badge: { icon: "image" as const, label: "SD XL" },
    price: "$3.00",
    title: "Fantasy Character Portraits",
    description:
      "Consistent style portraits for RPG games and storyboards.",
    seller: "GameDev_X",
    sellerGradient: null,
    rating: "4.5",
  },
];

const newArrivals = [
  {
    img: "https://lh3.googleusercontent.com/aida-public/AB6AXuB8Blopr5HwsBM5k0LoPaLn0azDRw6nnwyMkfhtg7MoU5VUv89WLirWjkY8AxooFk46kIilnXhCxqW3IiOxrza7ElZ16BR8iHpZZCMKI5-Vo6lfLX0WTyzlCXR81BxCwSbMaECa10a-bJlXNI7WWrBotUv-uBtO3GNCFnKMUXXX4RCqWB-8ggv7VH6C37EiKZS6Ah9sdE8axs0T9QAPVhzb3U8xa5k-XvkeZiPG3g1UuqEQ6d0aClepvkVQ6kKVdZdqOhPaPsKjy3Pp",
    imgAlt: "Minimalist product photography background",
    title: "Minimalist Product",
    price: "$2.00",
    tag: "Midjourney",
    category: "Photography",
  },
  {
    img: null,
    imgAlt: "Expert Translator placeholder",
    title: "Expert Translator",
    price: "$5.00",
    tag: "GPT-4",
    category: "Productivity",
    placeholder: { gradient: "from-purple-900 to-indigo-900" },
  },
  {
    img: "https://lh3.googleusercontent.com/aida-public/AB6AXuCMIynAy0wLsmQA3RDTk1HdGPTwsNAeJ_aJnElzkV397kZqsZTs4Udxp9vHLsk4QmtQlTQc5UPKBcWBhEF4zWgu0UGaVs9lEBD2v8vr1oI1PJp13Fc92JkHwcOq7AGdWlKSSxIY4bWiTCg-vzNQhUWTTzdGXnan_VGSLxXg5zAmRMP1XX4p8UafqJAhx_ns-pC8wYKbmfIk2ekJxWjDaaaZaL5BjLrZHAF3H2KkJs4hJgaNdmdnX4lZTVRXWJJPcgJ9dOv47ur_qiOG",
    imgAlt: "Retro vaporwave 80s landscape",
    title: "Vaporwave 80s",
    price: "$3.50",
    tag: "DALL-E 3",
    category: "Art",
  },
  {
    img: "https://lh3.googleusercontent.com/aida-public/AB6AXuAnC2taH4sDtle_0H1DPBcGB23k6VP6oM5NwFthACo8w7uPUAEExcQg-c_iyGFkEL3pRV2KFR1w9DP6qvayf9GlX5scwGmreoY8P75ZM3oPaQDp_49-Lplqjvw4HoRNgNByVI4l5GXfph7vV35XJBhyqBVx98WEXJTh6gi1p8t-ZHhbHQ5XDquTzOIOgJ4ZZ5eE5xA1KZflCWp3rMK7Iqbgqt6J_n7Bwqgvxnxan7n0ZrdDQXSbzqEpL3pPrsBx3Fpgkv0Vub3zWaan",
    imgAlt: "Isometric 3D room design",
    title: "Isometric Rooms",
    price: "$4.25",
    tag: "Midjourney",
    category: "3D Design",
  },
];

/* ─── page ─── */

export default function LandingPage() {
  return (
    <div
      className={`${ibmPlex.variable} ${spaceGrotesk.variable} bg-[#0f0f0f] text-white -mt-20 pt-20 overflow-x-hidden`}
      style={{
        fontFamily:
          "var(--font-ibm-plex), var(--font-space-grotesk), sans-serif",
      }}
    >
      {/* ═══ HERO ═══ */}
      <header className="relative pt-12 pb-12 lg:pt-16 lg:pb-20 overflow-hidden min-h-[85vh] flex flex-col justify-center">
        {/* bg layers */}
        <div className="absolute inset-0 z-0 pointer-events-none">
          <div className="absolute top-[-10%] left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-[#7f0df2]/10 rounded-full blur-[120px] mix-blend-screen" />
          <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20" />
          <div
            className="absolute inset-0 opacity-30"
            style={{
              backgroundImage:
                "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%237f0df2' fill-opacity='0.05'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")",
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#0f0f0f]/80 to-[#0f0f0f]" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          {/* search bar */}
          <div className="relative max-w-2xl mx-auto mb-16 z-20">
            <div className="flex items-center gap-4 relative">
              {/* yellow accent left (RTL: right side visually) */}
              <div className="absolute -right-6 top-1/2 -translate-y-1/2 hidden md:block">
                <div
                  className="w-2 h-8 bg-[#faff00]/80"
                  style={{
                    clipPath: "polygon(0 0, 100% 20%, 100% 80%, 0 100%)",
                  }}
                />
              </div>

              <div className="flex-1 bg-[#1a1a20]/90 backdrop-blur-xl border border-[#7f0df2]/30 tech-clip-both flex items-center p-1.5 focus-within:border-[#faff00] focus-within:shadow-[0_0_5px_#faff00,0_0_10px_#faff00] transition-all duration-300 shadow-[0_0_20px_rgba(127,13,242,0.15),inset_0_0_10px_rgba(0,0,0,0.5)]">
                <div className="pl-4 pr-4 text-[#7f0df2]">
                  <Search className="h-6 w-6" />
                </div>
                <input
                  className="w-full bg-transparent border-none text-white text-base placeholder-gray-500 focus:ring-0 focus:outline-none px-2 tracking-wide"
                  style={{
                    fontFamily:
                      "var(--font-space-grotesk), var(--font-ibm-plex), sans-serif",
                  }}
                  placeholder="Search prompts... ابحث عن أوامر..."
                  type="text"
                  readOnly
                />
                <button
                  className="bg-[#7f0df2] hover:bg-[#9d4dff] text-white px-8 py-2.5 rounded-sm font-bold text-sm tracking-wider uppercase transition-colors shadow-[0_0_15px_rgba(127,13,242,0.4)]"
                  style={{
                    clipPath:
                      "polygon(10% 0, 100% 0, 100% 100%, 0 100%, 0 20%)",
                  }}
                >
                  START
                </button>
              </div>

              {/* yellow accent right (RTL: left side visually) */}
              <div className="absolute -left-6 top-1/2 -translate-y-1/2 hidden md:block">
                <div
                  className="w-2 h-8 bg-[#faff00]/80"
                  style={{
                    clipPath:
                      "polygon(100% 0, 0 20%, 0 80%, 100% 100%)",
                  }}
                />
              </div>
            </div>
          </div>

          {/* hero category cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
            {heroCards.map((card) => (
              <div
                key={card.sysId}
                className={`group relative bg-[#1a1a20] tech-clip-br border-t-2 border-l-2 border-white/10 ${card.hoverBorder} transition-all duration-500 h-[380px] flex flex-col overflow-hidden ${card.hoverShadow}`}
              >
                {/* corner animations */}
                <div
                  className={`absolute top-0 right-0 w-16 h-16 border-t-2 border-r-2 ${card.cornerBorderColor} rounded-tr-lg opacity-50 group-hover:opacity-100 group-hover:w-full group-hover:h-full transition-all duration-700 pointer-events-none`}
                />
                <div
                  className={`absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 ${card.bottomCornerColor} opacity-50 group-hover:opacity-100 transition-all pointer-events-none`}
                />
                <div className="absolute inset-0 circuit-lines opacity-10 group-hover:opacity-20 transition-opacity" />

                {/* card content */}
                <div className="relative z-10 flex-1 flex flex-col items-center justify-center p-6 text-center">
                  <div className="w-32 h-32 mb-6 relative">
                    <div
                      className={`absolute inset-0 ${card.glowColor} blur-2xl rounded-full ${card.glowHover} transition-all`}
                    />
                    <img
                      alt={card.imgAlt}
                      className={`relative w-full h-full object-contain ${card.dropShadow} transform group-hover:scale-110 group-hover:-translate-y-2 transition-transform duration-500`}
                      src={card.img}
                    />
                  </div>
                  <h2
                    className={`text-3xl font-bold text-white mb-2 glow-text-outline ${card.titleHover} transition-colors`}
                    style={{
                      fontFamily:
                        "var(--font-space-grotesk), var(--font-ibm-plex), sans-serif",
                    }}
                  >
                    {card.title}
                  </h2>
                  <h3
                    className={`text-sm font-bold ${card.subtitleColor} tracking-[0.2em] uppercase mb-3`}
                  >
                    {card.subtitle}
                  </h3>
                  <p className="text-gray-400 text-sm px-2 opacity-80 group-hover:opacity-100 transition-opacity">
                    {card.description}
                  </p>
                </div>

                {/* footer */}
                <div
                  className={`bg-black/40 backdrop-blur-sm p-3 border-t border-white/5 flex justify-between items-center ${card.footerHoverBg} transition-colors`}
                >
                  <span className="text-[10px] text-gray-500 font-mono">
                    {card.sysId}
                  </span>
                  <ArrowLeft
                    className={`${card.arrowColor} h-5 w-5 group-hover:-translate-x-1 transition-transform`}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </header>

      {/* ═══ BRANDS BAR ═══ */}
      <div className="w-full border-y border-white/5 bg-white/[0.02] backdrop-blur-sm mb-16">
        <div className="max-w-7xl mx-auto px-4 py-8 flex justify-center gap-8 md:gap-16 flex-wrap opacity-50 grayscale hover:grayscale-0 transition-all duration-500">
          <div className="flex items-center gap-2 hover:text-white transition-colors cursor-pointer group">
            <Bot className="h-8 w-8 group-hover:text-[#10a37f] transition-colors" />
            <span
              className="font-bold text-xl"
              style={{
                fontFamily:
                  "var(--font-space-grotesk), var(--font-ibm-plex), sans-serif",
              }}
            >
              ChatGPT
            </span>
          </div>
          <div className="flex items-center gap-2 hover:text-white transition-colors cursor-pointer group">
            <ImageIcon className="h-8 w-8 group-hover:text-white transition-colors" />
            <span
              className="font-bold text-xl"
              style={{
                fontFamily:
                  "var(--font-space-grotesk), var(--font-ibm-plex), sans-serif",
              }}
            >
              Midjourney
            </span>
          </div>
          <div className="flex items-center gap-2 hover:text-white transition-colors cursor-pointer group">
            <Paintbrush className="h-8 w-8 group-hover:text-[#ff9900] transition-colors" />
            <span
              className="font-bold text-xl"
              style={{
                fontFamily:
                  "var(--font-space-grotesk), var(--font-ibm-plex), sans-serif",
              }}
            >
              DALL·E
            </span>
          </div>
          <div className="flex items-center gap-2 hover:text-white transition-colors cursor-pointer group">
            <Sparkles className="h-8 w-8 group-hover:text-[#5865F2] transition-colors" />
            <span
              className="font-bold text-xl"
              style={{
                fontFamily:
                  "var(--font-space-grotesk), var(--font-ibm-plex), sans-serif",
              }}
            >
              Stable Diffusion
            </span>
          </div>
        </div>
      </div>

      {/* ═══ BEST SELLING ═══ */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        <div className="mb-16">
          <div className="flex items-end justify-between mb-8">
            <div>
              <h2 className="text-3xl font-bold text-white mb-2 flex items-center gap-2">
                <span className="w-2 h-8 bg-[#faff00] rounded-full block" />
                الأكثر مبيعاً هذا الأسبوع
              </h2>
              <p className="text-gray-400 text-sm">
                أوامر مختارة بعناية تحقق أفضل النتائج
              </p>
            </div>
            <a
              className="text-[#7f0df2] hover:text-white font-bold text-sm flex items-center gap-1 group"
              href="#"
            >
              عرض الكل
              <ArrowLeft className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </a>
          </div>

          <div className="flex overflow-x-auto gap-6 pb-8 hide-scroll snap-x">
            {bestSellingCards.map((card) => (
              <div
                key={card.title}
                className="group relative min-w-[280px] w-[280px] bg-[#18181b] rounded-2xl overflow-hidden border border-white/10 hover:border-[#7f0df2] transition-all duration-300 hover:shadow-[0_0_10px_#7f0df2,0_0_20px_#7f0df2] cursor-pointer snap-start"
              >
                <div className="relative aspect-[4/5] overflow-hidden">
                  {card.img ? (
                    <img
                      className="object-cover w-full h-full group-hover:scale-110 transition-transform duration-700"
                      alt={card.imgAlt}
                      src={card.img}
                    />
                  ) : (
                    <div
                      className={`w-full h-full bg-gradient-to-br ${card.placeholder?.gradient} flex items-center justify-center p-6 group-hover:scale-110 transition-transform duration-700`}
                    >
                      <FileText className="h-16 w-16 text-white opacity-50" />
                    </div>
                  )}
                  <div className="absolute top-3 right-3 bg-black/60 backdrop-blur-md text-white text-xs font-bold px-2 py-1 rounded flex items-center gap-1">
                    {card.badge.icon === "image" ? (
                      <ImageIcon className="h-3.5 w-3.5" />
                    ) : (
                      <Bot className="h-3.5 w-3.5" />
                    )}
                    {card.badge.label}
                  </div>
                </div>
                <div className="p-4 relative">
                  <div className="absolute -top-4 left-4 bg-[#faff00] text-black font-bold px-3 py-1 rounded shadow-lg">
                    {card.price}
                  </div>
                  <h3 className="text-white font-bold text-lg mb-1 line-clamp-1 group-hover:text-[#7f0df2] transition-colors">
                    {card.title}
                  </h3>
                  <p className="text-gray-400 text-xs mb-3 line-clamp-2">
                    {card.description}
                  </p>
                  <div className="flex items-center justify-between border-t border-white/5 pt-3">
                    <div className="flex items-center gap-2">
                      <div
                        className={`w-6 h-6 rounded-full ${card.sellerGradient ? `bg-gradient-to-tr ${card.sellerGradient}` : "bg-gray-500"}`}
                      />
                      <span className="text-xs text-gray-300">
                        {card.seller}
                      </span>
                    </div>
                    <div className="flex items-center text-[#faff00] text-xs font-bold gap-0.5">
                      <Star className="h-3.5 w-3.5" />
                      {card.rating}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ═══ FEATURED COLLECTION ═══ */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 mb-16">
          {/* large hero image */}
          <div className="col-span-1 md:col-span-8 relative rounded-3xl overflow-hidden min-h-[300px] group cursor-pointer">
            <img
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              alt="Abstract colorful oil painting texture"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuAQ2SPrppPt9IPvO3uBHOks-u8_B_AU6d3rLY1qFDYk_0LqHOYPVEULFQOIhpSPzrEz9vz9pZZUem6EFc-wDBjkXNr7OGwR2A4UhLQwBQR_0FNpdCKSEe84vGhdKi-TTIRnh_N_Q_RTImS-GGrUWdAtCdXb336MHDF5DzwcjS8xsgQwUBk4H2JSYavnK9pRsbiqjew4tJ2lj-XC3sJloB_7NjAyEfFu542YCZyljwvirnNZ9PTWfAjcnt_4hLF0J04usWFqRbedG0-J"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/40 to-transparent" />
            <div className="absolute bottom-0 right-0 p-8 max-w-lg">
              <span className="bg-[#7f0df2] text-white text-xs font-bold px-2 py-1 rounded mb-3 inline-block">
                مجموعة حصرية
              </span>
              <h3 className="text-3xl font-bold text-white mb-2">
                حزمة الفن الزيتي الرقمي
              </h3>
              <p className="text-gray-300 mb-4 line-clamp-2">
                مجموعة كاملة من 50 أمر نصي لتوليد لوحات زيتية رقمية بأسلوب
                كلاسيكي وحديث.
              </p>
              <button className="bg-white text-black font-bold px-6 py-2 rounded-lg hover:bg-[#faff00] transition-colors">
                استكشف المجموعة
              </button>
            </div>
          </div>

          {/* category cards */}
          <div className="col-span-1 md:col-span-4 flex flex-col gap-6">
            <div className="flex-1 bg-[#18181b] rounded-3xl p-6 border border-white/5 hover:border-[#7f0df2]/50 transition-colors group cursor-pointer relative overflow-hidden">
              <div className="absolute right-0 top-0 w-32 h-32 bg-[#7f0df2]/10 rounded-full blur-2xl -mr-10 -mt-10 group-hover:bg-[#7f0df2]/20 transition-all" />
              <div className="relative z-10">
                <div className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center mb-4 group-hover:bg-[#7f0df2] group-hover:text-white transition-colors">
                  <Building2 className="h-5 w-5" />
                </div>
                <h4 className="text-xl font-bold text-white">
                  الهندسة المعمارية
                </h4>
                <p className="text-gray-400 text-sm mt-1">
                  تصاميم داخلية وخارجية
                </p>
              </div>
            </div>
            <div className="flex-1 bg-[#18181b] rounded-3xl p-6 border border-white/5 hover:border-[#7f0df2]/50 transition-colors group cursor-pointer relative overflow-hidden">
              <div className="absolute right-0 top-0 w-32 h-32 bg-[#faff00]/10 rounded-full blur-2xl -mr-10 -mt-10 group-hover:bg-[#faff00]/20 transition-all" />
              <div className="relative z-10">
                <div className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center mb-4 group-hover:bg-[#faff00] group-hover:text-black transition-colors">
                  <Code className="h-5 w-5" />
                </div>
                <h4 className="text-xl font-bold text-white">
                  مساعدي البرمجة
                </h4>
                <p className="text-gray-400 text-sm mt-1">
                  تصحيح، كتابة، وتحسين الكود
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* ═══ NEW ARRIVALS ═══ */}
        <div>
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-bold text-white flex items-center gap-2">
              <BadgeCheck className="h-8 w-8 text-[#7f0df2] animate-bounce" />
              وصل حديثاً
            </h2>
            <div className="hidden md:flex bg-gray-800/50 p-1 rounded-lg border border-white/5">
              <button className="px-4 py-1.5 rounded-md text-sm font-medium bg-[#7f0df2] text-white shadow-lg">
                الكل
              </button>
              <button className="px-4 py-1.5 rounded-md text-sm font-medium text-gray-400 hover:text-white transition-colors">
                صور
              </button>
              <button className="px-4 py-1.5 rounded-md text-sm font-medium text-gray-400 hover:text-white transition-colors">
                نصوص
              </button>
              <button className="px-4 py-1.5 rounded-md text-sm font-medium text-gray-400 hover:text-white transition-colors">
                صوت
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {newArrivals.map((card) => (
              <div
                key={card.title}
                className="group bg-[#18181b] rounded-xl overflow-hidden border border-white/5 hover:border-[#7f0df2]/50 transition-all hover:-translate-y-1 cursor-pointer"
              >
                <div className="h-48 overflow-hidden relative">
                  {card.img ? (
                    <img
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      alt={card.imgAlt}
                      src={card.img}
                    />
                  ) : (
                    <div
                      className={`w-full h-full bg-gradient-to-bl ${card.placeholder?.gradient} flex items-center justify-center`}
                    >
                      <Languages className="h-12 w-12 text-white/30 group-hover:text-white/60 transition-colors" />
                    </div>
                  )}
                </div>
                <div className="p-4">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-white font-bold line-clamp-1">
                      {card.title}
                    </h3>
                    <span className="text-[#faff00] font-bold text-sm">
                      {card.price}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-gray-400 mb-3">
                    <span className="bg-gray-800 px-1.5 py-0.5 rounded">
                      {card.tag}
                    </span>
                    <span>{card.category}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
