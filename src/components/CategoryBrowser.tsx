import { Badge } from "@/components/ui/badge";
import { PenTool, Palette, Cpu, Target, CheckCircle2 } from "lucide-react";

const categories = [
  {
    id: 1,
    label: "كتابة إبداعية",
    icon: PenTool,
  },
  {
    id: 2,
    label: "تصميم جرافيك",
    icon: Palette,
  },
  {
    id: 3,
    label: "تطوير برمجيات",
    icon: Cpu,
  },
  {
    id: 4,
    label: "تسويق رقمي",
    icon: Target,
  },
  {
    id: 5,
    label: "إنتاجية",
    icon: CheckCircle2,
  },
];

export default function CategoryBrowser() {
  return (
    <div className="w-full bg-[#050511] p-8 text-right font-sans" dir="rtl">
      <h2 className="mb-6 text-2xl font-bold text-white">
        تصفح حسب الفئة
      </h2>

      <div className="flex flex-wrap gap-3">
        {categories.map((category) => (
          <Badge
            key={category.id}
            variant="secondary"
            className="
              flex cursor-pointer items-center gap-2 rounded-full border border-white/5
              bg-[#151520] px-4 py-2 text-sm font-medium text-gray-300
              transition-all duration-300 hover:border-purple-500/50 hover:bg-[#252535] hover:text-white
            "
          >
            <span>{category.label}</span>
            <category.icon className="h-4 w-4 text-purple-500" />
          </Badge>
        ))}
      </div>
    </div>
  );
}
