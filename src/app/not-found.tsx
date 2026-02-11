import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function NotFound() {
  return (
    <div className="container mx-auto px-4 py-20">
      <div className="max-w-md mx-auto text-center">
        <h1 className="text-8xl font-bold text-muted-foreground/30 mb-4">
          404
        </h1>
        <h2 className="text-2xl font-bold mb-2">الصفحة غير موجودة</h2>
        <p className="text-muted-foreground mb-8">
          عذراً، لم نتمكن من العثور على الصفحة التي تبحث عنها. ربما تم نقلها أو
          حذفها.
        </p>
        <Button asChild size="lg">
          <Link href="/">العودة للرئيسية</Link>
        </Button>
      </div>
    </div>
  );
}
