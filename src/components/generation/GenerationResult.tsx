"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Coins, Download, Loader2 } from "lucide-react";

interface GenerationResultProps {
  generationType: "text" | "image";
  resultText: string | null;
  resultImageUrl: string | null;
  model: string;
  creditsConsumed: number;
  isLoading?: boolean;
}

const modelNames: Record<string, string> = {
  gemini: "Gemini",
  chatgpt: "ChatGPT",
  claude: "Claude",
};

export function GenerationResult({
  generationType,
  resultText,
  resultImageUrl,
  model,
  creditsConsumed,
  isLoading,
}: GenerationResultProps) {
  if (isLoading) {
    return (
      <Card dir="rtl">
        <CardContent>
          <div className="flex flex-col items-center justify-center gap-3 py-12">
            <Loader2 className="text-primary size-8 animate-spin" />
            <p className="text-muted-foreground text-sm">جارٍ التوليد...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const hasResult =
    (generationType === "text" && resultText) ||
    (generationType === "image" && resultImageUrl);

  if (!hasResult) {
    return null;
  }

  const displayModel = modelNames[model] ?? model;

  return (
    <Card dir="rtl">
      <CardContent>
        <div className="flex flex-col gap-4">
          {/* Header: Model badge and credit indicator */}
          <div className="flex items-center justify-between">
            <Badge variant="secondary">{displayModel}</Badge>
            <div className="text-muted-foreground flex items-center gap-1.5 text-xs">
              <Coins className="size-3.5" />
              <span>
                {creditsConsumed === 1
                  ? "١ رصيد مستخدم"
                  : `${creditsConsumed} رصيد مستخدم`}
              </span>
            </div>
          </div>

          {/* Text result */}
          {generationType === "text" && resultText && (
            <div className="bg-muted rounded-lg p-4">
              <p className="whitespace-pre-wrap text-sm leading-relaxed">
                {resultText}
              </p>
            </div>
          )}

          {/* Image result */}
          {generationType === "image" && resultImageUrl && (
            <div className="flex flex-col gap-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={resultImageUrl}
                alt="نتيجة التوليد"
                className="max-w-full rounded-lg"
              />
              <div className="flex justify-start">
                <Button variant="outline" size="sm" asChild>
                  <a href={resultImageUrl} download target="_blank">
                    <Download className="size-4" />
                    تحميل الصورة
                  </a>
                </Button>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
