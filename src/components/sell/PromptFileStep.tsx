"use client";

import { PaymentBadge } from "@/components/sell/PaymentBadge";
import { Button } from "@/components/ui/button";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import type { PromptSubmission } from "@/lib/schemas/api";
import { uploadImage } from "@/lib/upload-image";
import { ImagePlus, Loader2, Plus, RotateCw, Sparkles, Trash2, X } from "lucide-react";
import Image from "next/image";
import { useCallback, useEffect, useMemo, useState } from "react";
import type { UseFormReturn } from "react-hook-form";
import { useTranslation } from "react-i18next";

interface PromptFileStepProps {
  form: UseFormReturn<PromptSubmission>;
  paymentActivated?: boolean;
  paymentLoading?: boolean;
  onGoToPaymentSetup?: () => void;
}

type TFn = (key: string, options?: Record<string, string>) => string;

function extractVariables(template: string): string[] {
  const matches = template.match(/\[([^\]]+)\]/g);
  if (!matches) return [];
  return [...new Set(matches.map((m) => m.slice(1, -1)))];
}

type TemplateSegment =
  | { type: "text"; value: string }
  | { type: "variable"; name: string };

function parseTemplate(template: string): TemplateSegment[] {
  const result: TemplateSegment[] = [];
  const regex = /\[([^\]]+)\]/g;
  let lastIndex = 0;
  let match;

  while ((match = regex.exec(template)) !== null) {
    if (match.index > lastIndex) {
      result.push({ type: "text", value: template.slice(lastIndex, match.index) });
    }
    result.push({ type: "variable", name: match[1] });
    lastIndex = match.index + match[0].length;
  }

  if (lastIndex < template.length) {
    result.push({ type: "text", value: template.slice(lastIndex) });
  }

  return result;
}

// ─── Text / Generic Layout ──────────────────────────────────────
function TextFileLayout({
  form,
  t,
  variables,
  charCount,
  templateSegments,
}: {
  form: UseFormReturn<PromptSubmission>;
  t: TFn;
  variables: string[];
  charCount: number;
  templateSegments: TemplateSegment[];
}) {
  return (
    <>
      <PromptTemplateField form={form} t={t} variables={variables} charCount={charCount} />

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
        <FormField
          control={form.control}
          name="modelVersion"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("file.modelVersion")}</FormLabel>
              <FormControl>
                <Input
                  placeholder={t("file.modelVersionPlaceholder")}
                  dir="ltr"
                  {...field}
                  value={field.value ?? ""}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="maxTokens"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("file.maxTokens")}</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  min={1}
                  max={128000}
                  placeholder="4096"
                  dir="ltr"
                  {...field}
                  value={field.value ?? ""}
                  onChange={(e) => {
                    const val = e.target.value;
                    field.onChange(val ? parseInt(val, 10) : null);
                  }}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="temperature"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("file.temperature")}</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  min={0}
                  max={2}
                  step={0.1}
                  placeholder="0"
                  dir="ltr"
                  {...field}
                  value={field.value ?? ""}
                  onChange={(e) => {
                    const val = e.target.value;
                    field.onChange(val ? parseFloat(val) : null);
                  }}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <div className="space-y-4">
        <FormLabel className="text-base">{t("file.outputExamples")}</FormLabel>
        {[0, 1, 2, 3].map((index) => (
          <FormField
            key={index}
            control={form.control}
            name={`exampleOutputs.${index}`}
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm text-muted-foreground">
                  {t("file.example")} {index + 1}
                </FormLabel>
                <FormControl>
                  <Textarea
                    placeholder={t("file.outputPlaceholder")}
                    rows={3}
                    dir="ltr"
                    {...field}
                    value={field.value ?? ""}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        ))}
      </div>

      <PromptExamplesSection form={form} t={t} variables={variables} templateSegments={templateSegments} />

      <InstructionsField form={form} t={t} />
    </>
  );
}

// ─── Image Layout ───────────────────────────────────────────────
function ImageFileLayout({
  form,
  t,
  variables,
  charCount,
  templateSegments,
}: {
  form: UseFormReturn<PromptSubmission>;
  t: TFn;
  variables: string[];
  charCount: number;
  templateSegments: TemplateSegment[];
}) {
  return (
    <>
      <PromptTemplateField form={form} t={t} variables={variables} charCount={charCount} />

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <FormField
          control={form.control}
          name="modelVersion"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("file.imageVersion")}</FormLabel>
              <p className="text-xs text-muted-foreground">{t("file.imageVersionHint")}</p>
              <FormControl>
                <Input
                  placeholder={t("file.imageVersionPlaceholder")}
                  dir="ltr"
                  {...field}
                  value={field.value ?? ""}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="imageGenerationType"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("file.imageGenerationType")}</FormLabel>
              <p className="text-xs text-muted-foreground">{t("file.imageGenerationTypeHint")}</p>
              <Select onValueChange={field.onChange} value={field.value ?? ""}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder={t("file.imageGenerationType")} />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="text-to-image">{t("file.textToImage")}</SelectItem>
                  <SelectItem value="image-to-image">{t("file.imageToImage")}</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <PromptExamplesSection form={form} t={t} variables={variables} templateSegments={templateSegments} isImage />

      <InstructionsField form={form} t={t} />
    </>
  );
}

// ─── Shared Fields ──────────────────────────────────────────────
function PromptTemplateField({
  form,
  t,
  variables,
  charCount,
}: {
  form: UseFormReturn<PromptSubmission>;
  t: TFn;
  variables: string[];
  charCount: number;
}) {
  const fillTemplate = useCallback(() => {
    const current = form.getValues("fullContent");
    if (current && current.trim().length > 0) return;
    form.setValue("fullContent", t("file.templateGuideContent"), {
      shouldValidate: true,
    });
  }, [form, t]);

  return (
    <FormField
      control={form.control}
      name="fullContent"
      render={({ field }) => (
        <FormItem>
          <div className="flex items-center justify-between">
            <FormLabel>{t("file.template")}</FormLabel>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-7 gap-1 text-xs"
              onClick={fillTemplate}
            >
              <Sparkles className="h-3 w-3" />
              {t("file.fillTemplateGuide")}
            </Button>
          </div>
          <FormControl>
            <Textarea
              placeholder={t("file.templatePlaceholder")}
              rows={8}
              dir="ltr"
              {...field}
              value={field.value ?? ""}
            />
          </FormControl>
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>{t("file.templateHint")}</span>
            <span dir="ltr">
              {charCount.toLocaleString()}/20,000 {t("file.characters")}
            </span>
          </div>
          {variables.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-1">
              {variables.map((v) => (
                <span
                  key={v}
                  className="rounded-md bg-primary/10 px-2 py-0.5 text-xs text-primary"
                >
                  [{v}]
                </span>
              ))}
            </div>
          )}
          <FormMessage />
        </FormItem>
      )}
    />
  );
}

function InstructionsField({
  form,
  t,
}: {
  form: UseFormReturn<PromptSubmission>;
  t: TFn;
}) {
  const fillInstructions = useCallback(() => {
    const current = form.getValues("instructions");
    if (current && current.trim().length > 0) return;
    form.setValue("instructions", t("file.instructionsGuideContent"), {
      shouldValidate: true,
    });
  }, [form, t]);

  return (
    <FormField
      control={form.control}
      name="instructions"
      render={({ field }) => (
        <FormItem>
          <div className="flex items-center justify-between">
            <FormLabel>{t("file.instructions")}</FormLabel>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-7 gap-1 text-xs"
              onClick={fillInstructions}
            >
              <Sparkles className="h-3 w-3" />
              {t("file.fillInstructionsGuide")}
            </Button>
          </div>
          <FormControl>
            <Textarea
              placeholder={t("file.instructionsPlaceholder")}
              rows={4}
              {...field}
              value={field.value ?? ""}
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}

// ─── Inline Template Row (renders template with variable chips) ─
function InlineTemplateRow({
  segments,
  exIndex,
  form,
}: {
  segments: TemplateSegment[];
  exIndex: number;
  form: UseFormReturn<PromptSubmission>;
}) {
  return (
    <div className="flex flex-wrap items-center gap-y-1 rounded-lg bg-muted/50 p-3 text-sm leading-relaxed" dir="ltr">
      {segments.map((seg, i) =>
        seg.type === "text" ? (
          <span key={i} className="whitespace-pre-wrap text-muted-foreground">
            {seg.value}
          </span>
        ) : (
          <FormField
            key={`${exIndex}-${seg.name}-${i}`}
            control={form.control}
            name={`examplePrompts.${exIndex}.variables.${seg.name}`}
            render={({ field }) => (
              <input
                className="mx-0.5 inline-block w-auto min-w-15 max-w-45 rounded-md border border-primary/30 bg-primary/10 px-2 py-0.5 text-sm font-medium text-primary outline-none placeholder:text-primary/40 focus:border-primary focus:ring-1 focus:ring-primary/30"
                placeholder={seg.name}
                dir="ltr"
                style={{ width: `${Math.max(60, ((field.value as string)?.length || seg.name.length) * 9 + 20)}px` }}
                {...field}
                value={(field.value as string) ?? ""}
              />
            )}
          />
        ),
      )}
    </div>
  );
}

// ─── Dynamic Prompt Examples (shared across all types) ──────────
function PromptExamplesSection({
  form,
  t,
  variables,
  templateSegments,
  isImage = false,
}: {
  form: UseFormReturn<PromptSubmission>;
  t: TFn;
  variables: string[];
  templateSegments: TemplateSegment[];
  isImage?: boolean;
}) {
  const examplePrompts = form.watch("examplePrompts") ?? [];
  const [uploadProgress, setUploadProgress] = useState<Record<number, number>>({});
  const [uploadError, setUploadError] = useState<Record<number, string | null>>({});

  const addExample = useCallback(() => {
    const current = form.getValues("examplePrompts") ?? [];
    const newEntry: { image?: string; variables: Record<string, string> } = { variables: {} };
    for (const v of variables) {
      newEntry.variables[v] = "";
    }
    form.setValue("examplePrompts", [...current, newEntry], {
      shouldValidate: true,
    });
  }, [form, variables]);

  const removeExample = useCallback(
    (index: number) => {
      const current = form.getValues("examplePrompts") ?? [];
      form.setValue(
        "examplePrompts",
        current.filter((_, i) => i !== index),
        { shouldValidate: true },
      );
    },
    [form],
  );

  const handleExampleImage = useCallback(
    async (exIndex: number, e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      e.target.value = "";

      setUploadError((prev) => ({ ...prev, [exIndex]: null }));
      setUploadProgress((prev) => ({ ...prev, [exIndex]: 0 }));

      try {
        const url = await uploadImage(file, (percent) => {
          setUploadProgress((prev) => ({ ...prev, [exIndex]: percent }));
        });
        form.setValue(`examplePrompts.${exIndex}.image`, url, { shouldValidate: true });
      } catch (err) {
        const code = err instanceof Error ? err.message : "Upload failed";
        let msg = code;
        if (code === "FILE_TOO_LARGE") msg = t("upload.sizeError");
        else if (code === "INVALID_TYPE") msg = t("upload.typeError");
        else if (code === "NETWORK_ERROR") msg = t("upload.networkError");
        setUploadError((prev) => ({ ...prev, [exIndex]: msg }));
      } finally {
        setUploadProgress((prev) => {
          const next = { ...prev };
          delete next[exIndex];
          return next;
        });
      }
    },
    [form, t],
  );

  const removeExampleImage = useCallback(
    (exIndex: number) => {
      form.setValue(`examplePrompts.${exIndex}.image`, undefined, { shouldValidate: true });
    },
    [form],
  );

  // Initialize variable keys for existing examples when variables change
  useEffect(() => {
    if (variables.length === 0) return;
    const current = form.getValues("examplePrompts") ?? [];
    for (let i = 0; i < current.length; i++) {
      for (const varName of variables) {
        if (current[i]?.variables?.[varName] === undefined) {
          form.setValue(`examplePrompts.${i}.variables.${varName}`, "");
        }
      }
    }
  }, [variables, form]);

  const hasTemplate = templateSegments.some((s) => s.type === "variable");

  return (
    <div className="space-y-4">
      <div>
        <div className="flex items-center justify-between">
          <FormLabel className="text-base">
            {t("file.promptExamples")}
          </FormLabel>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-7 gap-1 text-xs"
            onClick={addExample}
          >
            <Plus className="h-3 w-3" />
            {t("file.addExample")}
          </Button>
        </div>
        {hasTemplate && (
          <p className="text-sm text-muted-foreground mt-1">
            {t("file.examplePromptsDesc")}
          </p>
        )}
      </div>

      {examplePrompts.map((example, exIndex) => (
        <div
          key={exIndex}
          className="rounded-lg border p-4 space-y-3"
        >
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-muted-foreground">
              {t("file.example")} {exIndex + 1}
            </p>
            {examplePrompts.length > 1 && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-7 gap-1 text-xs text-destructive hover:text-destructive"
                onClick={() => removeExample(exIndex)}
              >
                <Trash2 className="h-3 w-3" />
                {t("file.removeExample")}
              </Button>
            )}
          </div>

          {/* Input Prompt */}
          {isImage && (
            <p className="text-xs font-medium text-muted-foreground">{t("file.inputPrompt")}</p>
          )}
          {hasTemplate ? (
            <InlineTemplateRow segments={templateSegments} exIndex={exIndex} form={form} />
          ) : (
            <p className="rounded-lg bg-muted/50 p-3 text-xs text-muted-foreground">
              {t("file.addVariablesFirst")}
            </p>
          )}

          {/* Output Image (image type only) */}
          {isImage && (
            <div className="space-y-1.5">
              <p className="text-xs font-medium text-muted-foreground">{t("file.outputImage")}</p>
              {uploadProgress[exIndex] !== undefined ? (
                <div className="flex h-32 w-32 flex-col items-center justify-center gap-2 rounded-lg border bg-muted/50">
                  <Loader2 className="h-6 w-6 animate-spin text-primary" />
                  <span className="text-xs text-muted-foreground">{uploadProgress[exIndex]}%</span>
                </div>
              ) : uploadError[exIndex] ? (
                <div className="flex h-32 w-32 flex-col items-center justify-center gap-2 rounded-lg border border-destructive/30 bg-destructive/5 p-2 text-center">
                  <p className="text-xs text-destructive">{uploadError[exIndex]}</p>
                  <label className="cursor-pointer">
                    <span className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline">
                      <RotateCw className="h-3 w-3" />
                      {t("upload.retry")}
                    </span>
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/gif,image/webp"
                      className="hidden"
                      onChange={(e) => handleExampleImage(exIndex, e)}
                    />
                  </label>
                </div>
              ) : example?.image ? (
                <div className="relative h-32 w-32 overflow-hidden rounded-lg border">
                  <Image
                    src={example.image}
                    alt={`${t("file.example")} ${exIndex + 1}`}
                    fill
                    className="object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => removeExampleImage(exIndex)}
                    className="absolute top-1 right-1 rounded-full bg-destructive p-1 text-destructive-foreground shadow-sm hover:bg-destructive/90"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ) : (
                <label className="flex h-32 w-32 cursor-pointer flex-col items-center justify-center gap-1 rounded-lg border-2 border-dashed border-muted-foreground/25 text-muted-foreground transition-colors hover:border-primary/50 hover:text-primary">
                  <ImagePlus className="h-6 w-6" />
                  <span className="text-xs">{t("file.attachImage")}</span>
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/gif,image/webp"
                    className="hidden"
                    onChange={(e) => handleExampleImage(exIndex, e)}
                  />
                </label>
              )}
            </div>
          )}
        </div>
      ))}

      {examplePrompts.length < 1 && (
        <p className="text-xs text-destructive">
          {t("file.minExamples")}
        </p>
      )}
    </div>
  );
}

// ─── Main Component ─────────────────────────────────────────────
export function PromptFileStep({ form, paymentActivated, paymentLoading, onGoToPaymentSetup }: PromptFileStepProps) {
  const { t } = useTranslation("sell");
  const fullContent = form.watch("fullContent");
  const generationType = form.watch("generationType");
  const variables = useMemo(() => extractVariables(fullContent ?? ""), [fullContent]);
  const templateSegments = useMemo(() => parseTemplate(fullContent ?? ""), [fullContent]);
  const charCount = (fullContent ?? "").length;
  const isImage = generationType === "image";
  const showPaymentBadge = paymentActivated !== undefined;

  const tCast = t as TFn;

  return (
    <div className="space-y-6">
      {showPaymentBadge && (
        <PaymentBadge
          isActivated={paymentActivated}
          isLoading={paymentLoading ?? false}
          onGoToSetup={onGoToPaymentSetup}
        />
      )}
      <div className="space-y-1">
        <p className="text-sm text-muted-foreground">
          {t("file.fileIntro")}
        </p>
      </div>

      {isImage ? (
        <ImageFileLayout form={form} t={tCast} variables={variables} charCount={charCount} templateSegments={templateSegments} />
      ) : (
        <TextFileLayout form={form} t={tCast} variables={variables} charCount={charCount} templateSegments={templateSegments} />
      )}
    </div>
  );
}
