"use client";

import { GenerationResult } from "@/components/generation/GenerationResult";
import { PromptEditor } from "@/components/generation/PromptEditor";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { useCredits } from "@/hooks/use-credits";
import {
  Coins,
  FileText,
  ImageIcon,
  Loader2,
  Sparkles,
} from "lucide-react";
import Link from "next/link";
import { useCallback, useState } from "react";
import { toast } from "sonner";

interface GenerationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  promptId: string;
  promptContent: string;
}

interface GenerationData {
  generationType: "text" | "image";
  model: string;
  resultText: string | null;
  resultImageUrl: string | null;
  creditsConsumed: number;
}

export function GenerationDialog({
  open,
  onOpenChange,
  promptId,
  promptContent,
}: GenerationDialogProps) {
  const { total, subscription, topup, refresh } = useCredits();
  const [generationType, setGenerationType] = useState<"text" | "image">("text");
  const [model, setModel] = useState("gemini");
  const [inputPrompt, setInputPrompt] = useState(promptContent);
  const [isGenerating, setIsGenerating] = useState(false);
  const [result, setResult] = useState<GenerationData | null>(null);

  const handleGenerate = useCallback(async () => {
    if (!inputPrompt.trim()) {
      toast.error("يرجى إدخال نص البرومبت");
      return;
    }

    setIsGenerating(true);
    setResult(null);

    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          promptId,
          generationType,
          model,
          inputPrompt,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        if (res.status === 402) {
          toast.error("رصيد الكريدت غير كافٍ");
        } else if (res.status === 403) {
          toast.error("لا تملك هذا البرومبت");
        } else {
          toast.error(data.error || "حدث خطأ أثناء التوليد");
        }
        return;
      }

      setResult({
        generationType: data.generation.generationType,
        model: data.generation.model,
        resultText: data.generation.resultText,
        resultImageUrl: data.generation.resultImageUrl,
        creditsConsumed: data.generation.creditsConsumed,
      });

      toast.success("تم التوليد بنجاح");
      await refresh();
    } catch {
      toast.error("حدث خطأ في الاتصال");
    } finally {
      setIsGenerating(false);
    }
  }, [inputPrompt, promptId, generationType, model, refresh]);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="bottom"
        className="h-[90vh] overflow-y-auto sm:h-[85vh] sm:max-w-2xl sm:mx-auto sm:rounded-t-lg"
      >
        <SheetHeader>
          <SheetTitle className="text-right">توليد المحتوى</SheetTitle>
        </SheetHeader>

        <div dir="rtl" className="flex flex-col gap-6 py-4">
          {/* Credit balance display */}
          <div className="flex items-center justify-between rounded-lg border p-3">
            <div className="flex items-center gap-2">
              <Coins className="text-primary size-5" />
              <span className="text-sm font-medium">رصيدك</span>
            </div>
            <div className="flex items-center gap-3">
              <Badge variant="outline" className="text-xs">
                اشتراك: {subscription}
              </Badge>
              <Badge variant="outline" className="text-xs">
                إضافي: {topup}
              </Badge>
              <Badge className="text-xs">المجموع: {total}</Badge>
            </div>
          </div>

          {/* No credits message */}
          {total === 0 && (
            <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-center dark:border-amber-800 dark:bg-amber-950">
              <p className="mb-3 text-sm text-amber-800 dark:text-amber-200">
                لا يوجد لديك رصيد كافٍ للتوليد
              </p>
              <div className="flex justify-center gap-3">
                <Button size="sm" asChild>
                  <Link href="/subscription">اشتراك</Link>
                </Button>
                <Button size="sm" variant="outline" asChild>
                  <Link href="/subscription#topup">شراء رصيد</Link>
                </Button>
              </div>
            </div>
          )}

          {/* Generation type toggle */}
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium">نوع التوليد</label>
            <ToggleGroup
              type="single"
              value={generationType}
              onValueChange={(v) => {
                if (v) setGenerationType(v as "text" | "image");
              }}
              className="justify-start"
            >
              <ToggleGroupItem value="text" aria-label="توليد نص">
                <FileText className="ml-1 size-4" />
                نص
              </ToggleGroupItem>
              <ToggleGroupItem value="image" aria-label="توليد صورة">
                <ImageIcon className="ml-1 size-4" />
                صورة
              </ToggleGroupItem>
            </ToggleGroup>
          </div>

          {/* Model selector */}
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium">النموذج</label>
            <ToggleGroup
              type="single"
              value={model}
              onValueChange={(v) => {
                if (v) setModel(v);
              }}
              className="justify-start"
            >
              <ToggleGroupItem value="gemini" aria-label="Gemini">
                Gemini
              </ToggleGroupItem>
              <ToggleGroupItem value="chatgpt" aria-label="ChatGPT">
                ChatGPT
              </ToggleGroupItem>
              <ToggleGroupItem value="claude" aria-label="Claude">
                Claude
              </ToggleGroupItem>
            </ToggleGroup>
          </div>

          {/* Prompt editor */}
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium">البرومبت</label>
            <PromptEditor
              initialPrompt={promptContent}
              onChange={setInputPrompt}
            />
          </div>

          {/* Generate button */}
          <Button
            onClick={handleGenerate}
            disabled={isGenerating || total === 0 || !inputPrompt.trim()}
            size="lg"
            className="w-full"
          >
            {isGenerating ? (
              <>
                <Loader2 className="ml-2 size-5 animate-spin" />
                جارٍ التوليد...
              </>
            ) : (
              <>
                <Sparkles className="ml-2 size-5" />
                توليد (١ رصيد)
              </>
            )}
          </Button>

          {/* Result area */}
          {(isGenerating || result) && (
            <GenerationResult
              generationType={result?.generationType ?? generationType}
              resultText={result?.resultText ?? null}
              resultImageUrl={result?.resultImageUrl ?? null}
              model={result?.model ?? model}
              creditsConsumed={result?.creditsConsumed ?? 0}
              isLoading={isGenerating}
            />
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
