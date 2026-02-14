"use client";

import { Button } from "@/components/ui/button";
import { PartyPopper, LayoutDashboard, Plus } from "lucide-react";
import Link from "next/link";

interface ConfirmationStepProps {
  onReset: () => void;
}

export function ConfirmationStep({ onReset }: ConfirmationStepProps) {
  return (
    <div className="flex flex-col items-center gap-6 py-12 text-center">
      <div className="rounded-full bg-green-100 p-6 dark:bg-green-900/30">
        <PartyPopper className="h-12 w-12 text-green-600 dark:text-green-400" />
      </div>

      <div className="space-y-2">
        <h2 className="text-2xl font-bold">تم رفع البرومبت بنجاح!</h2>
        <p className="text-muted-foreground max-w-md">
          نحن الآن نراجع البرومبت الخاص بك. عادةً ما تستغرق المراجعة من 15
          دقيقة إلى 36 ساعة. ستتلقى إشعاراً بمجرد اكتمال المراجعة.
        </p>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row">
        <Button asChild>
          <Link href="/seller">
            <LayoutDashboard className="h-4 w-4 me-2" />
            عرض البرومبتات الخاصة بي
          </Link>
        </Button>
        <Button variant="outline" onClick={onReset}>
          <Plus className="h-4 w-4 me-2" />
          رفع برومبت آخر
        </Button>
      </div>
    </div>
  );
}
