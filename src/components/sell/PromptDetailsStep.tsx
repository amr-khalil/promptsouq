"use client";

import { Badge } from "@/components/ui/badge";
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
import type { Category } from "@/lib/schemas/api";
import { Upload, X } from "lucide-react";
import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import type { UseFormReturn } from "react-hook-form";

const generationTypes = [
  { value: "text", label: "نص" },
  { value: "image", label: "صورة" },
  { value: "code", label: "كود" },
  { value: "marketing", label: "تسويق" },
  { value: "design", label: "تصميم" },
];

const aiModels = [
  { value: "chatgpt", label: "ChatGPT" },
  { value: "claude", label: "Claude" },
  { value: "midjourney", label: "Midjourney" },
  { value: "dall-e", label: "DALL-E" },
  { value: "stable-diffusion", label: "Stable Diffusion" },
  { value: "gemini", label: "Gemini" },
  { value: "copilot", label: "Copilot" },
];

const difficulties = [
  { value: "مبتدئ", label: "مبتدئ" },
  { value: "متقدم", label: "متقدم" },
];

interface PromptDetailsStepProps {
  form: UseFormReturn<PromptSubmission>;
}

export function PromptDetailsStep({ form }: PromptDetailsStepProps) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [tagInput, setTagInput] = useState(() => {
    const initial = form.getValues("tags");
    return initial && initial.length > 0 ? initial.join("، ") : "";
  });
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetch("/api/categories")
      .then((res) => res.json())
      .then((json) => setCategories(json.data ?? []))
      .catch(() => {});
  }, []);

  const titleValue = form.watch("title");
  const descValue = form.watch("description");
  const thumbnailValue = form.watch("thumbnail");

  const addTagsFromInput = useCallback(() => {
    const currentTags = form.getValues("tags") ?? [];
    const newTags = tagInput
      .split(/[,،]/)
      .map((t) => t.trim())
      .filter((t) => t.length > 0 && !currentTags.includes(t));
    const merged = [...currentTags, ...newTags].slice(0, 10);
    form.setValue("tags", merged, { shouldValidate: true });
    setTagInput("");
  }, [tagInput, form]);

  const removeTag = useCallback(
    (tag: string) => {
      const currentTags = form.getValues("tags") ?? [];
      form.setValue(
        "tags",
        currentTags.filter((t) => t !== tag),
        { shouldValidate: true },
      );
    },
    [form],
  );

  const handleTagKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter" || e.key === ",") {
        e.preventDefault();
        addTagsFromInput();
      }
      // Remove last tag on backspace if input empty
      if (e.key === "Backspace" && tagInput === "") {
        const currentTags = form.getValues("tags") ?? [];
        if (currentTags.length > 0) {
          form.setValue("tags", currentTags.slice(0, -1), {
            shouldValidate: true,
          });
        }
      }
    },
    [addTagsFromInput, tagInput, form],
  );

  const handleThumbnailUpload = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      // For now, create a local object URL as preview and store it
      const url = URL.createObjectURL(file);
      form.setValue("thumbnail", url, { shouldValidate: true });
    },
    [form],
  );

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <FormField
          control={form.control}
          name="generationType"
          render={({ field }) => (
            <FormItem>
              <FormLabel>نوع المحتوى</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="اختر نوع المحتوى" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {generationTypes.map((t) => (
                    <SelectItem key={t.value} value={t.value}>
                      {t.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="aiModel"
          render={({ field }) => (
            <FormItem>
              <FormLabel>نموذج الذكاء الاصطناعي</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="اختر النموذج" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {aiModels.map((m) => (
                    <SelectItem key={m.value} value={m.value}>
                      {m.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <FormField
        control={form.control}
        name="title"
        render={({ field }) => (
          <FormItem>
            <FormLabel>اسم البرومبت</FormLabel>
            <FormControl>
              <Input
                placeholder="مثال: شعارات ناشئة نابضة"
                maxLength={60}
                {...field}
              />
            </FormControl>
            <div className="text-xs text-muted-foreground text-left" dir="ltr">
              {60 - (titleValue?.length ?? 0)} characters left
            </div>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="description"
        render={({ field }) => (
          <FormItem>
            <FormLabel>الوصف</FormLabel>
            <FormControl>
              <Textarea
                placeholder="صف ما يفعله البرومبت للمشتري المحتمل..."
                maxLength={500}
                rows={3}
                {...field}
              />
            </FormControl>
            <div className="text-xs text-muted-foreground text-left" dir="ltr">
              {500 - (descValue?.length ?? 0)} characters left
            </div>
            <FormMessage />
          </FormItem>
        )}
      />

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
        <FormField
          control={form.control}
          name="price"
          render={({ field }) => (
            <FormItem>
              <FormLabel>السعر ($)</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  min={1.99}
                  max={99.99}
                  step={0.01}
                  placeholder="6.99"
                  dir="ltr"
                  {...field}
                  onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="category"
          render={({ field }) => (
            <FormItem>
              <FormLabel>التصنيف</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="اختر التصنيف" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {categories.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="difficulty"
          render={({ field }) => (
            <FormItem>
              <FormLabel>مستوى الصعوبة</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="اختر المستوى" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {difficulties.map((d) => (
                    <SelectItem key={d.value} value={d.value}>
                      {d.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <FormField
        control={form.control}
        name="tags"
        render={() => (
          <FormItem>
            <FormLabel>الوسوم</FormLabel>
            <div className="space-y-2">
              {(form.getValues("tags") ?? []).length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {(form.getValues("tags") ?? []).map((tag) => (
                    <Badge
                      key={tag}
                      variant="secondary"
                      className="gap-1 pe-1"
                    >
                      {tag}
                      <button
                        type="button"
                        onClick={() => removeTag(tag)}
                        className="rounded-full p-0.5 hover:bg-muted-foreground/20"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              )}
              <FormControl>
                <Input
                  placeholder="اكتب وسم ثم اضغط Enter أو فاصلة..."
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={handleTagKeyDown}
                  onBlur={addTagsFromInput}
                />
              </FormControl>
            </div>
            <div className="text-xs text-muted-foreground">
              {(form.getValues("tags") ?? []).length}/10 وسوم — افصل بين الوسوم
              بفاصلة أو اضغط Enter
            </div>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="thumbnail"
        render={() => (
          <FormItem>
            <FormLabel>الصورة المصغرة</FormLabel>
            <FormControl>
              <div className="space-y-3">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleThumbnailUpload}
                />
                {thumbnailValue ? (
                  <div className="relative w-full max-w-xs">
                    <div className="relative aspect-video w-full overflow-hidden rounded-lg border">
                      <Image
                        src={thumbnailValue}
                        alt="صورة مصغرة"
                        fill
                        className="object-cover"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        form.setValue("thumbnail", "", {
                          shouldValidate: true,
                        });
                        if (fileInputRef.current)
                          fileInputRef.current.value = "";
                      }}
                      className="absolute -top-2 -left-2 rounded-full bg-destructive p-1 text-destructive-foreground shadow-sm hover:bg-destructive/90"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="flex w-full max-w-xs flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-muted-foreground/25 p-8 text-muted-foreground transition-colors hover:border-primary/50 hover:text-primary"
                  >
                    <Upload className="h-8 w-8" />
                    <span className="text-sm">اضغط لرفع صورة</span>
                    <span className="text-xs">PNG, JPG, WebP</span>
                  </button>
                )}
              </div>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
}
