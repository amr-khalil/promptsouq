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
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import type { Category, PromptSubmission } from "@/lib/schemas/api";
import { X } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import type { UseFormReturn } from "react-hook-form";
import { useTranslation } from "react-i18next";

const AI_MODEL_SLUGS = new Set(["gpt", "midjourney", "dalle"]);

const generationTypeKeys = ["text", "image", "video", "audio", "3d"] as const;

const textModels = [
  "ChatGPT",
  "Claude",
  "Gemini",
  "Grok",
  "DeepSeek",
  "Llama",
  "Mistral",
  "Perplexity",
];

const imageModels = [
  "Nano Banana",
  "ChatGPT",
  "Midjourney",
  "Grok",
  "FLUX",
  "Meta AI",
  "DALL-E",
  "Hunyuan",
  "Ideogram",
  "Imagen",
  "Leonardo AI",
  "Qwen",
  "Kling",
  "Lexica",
  "Recraft",
  "Seedream",
  "Stable Diffusion",
];

const videoModels = [
  "Veo",
  "Sora",
  "Kling",
  "Pika",
  "PixVerse",
  "Meta AI",
  "Grok",
  "Hailuo AI",
  "Midjourney",
  "Seedance",
  "Wan",
];

const audioModels = ["Suno", "Udio"];

const threeDModels = ["Luma", "Meshy"];

const modelsByType: Record<string, string[]> = {
  text: textModels,
  image: imageModels,
  video: videoModels,
  audio: audioModels,
  "3d": threeDModels,
};

const difficultyKeys = ["beginner", "intermediate", "advanced"] as const;
const difficultyValues: Record<string, string> = {
  beginner: "مبتدئ",
  intermediate: "متوسط",
  advanced: "متقدم",
};

interface PromptDetailsStepProps {
  form: UseFormReturn<PromptSubmission>;
}

export function PromptDetailsStep({ form }: PromptDetailsStepProps) {
  const { t, i18n } = useTranslation("sell");
  const [categories, setCategories] = useState<Category[]>([]);
  const [tagInput, setTagInput] = useState(() => {
    const initial = form.getValues("tags");
    return initial && initial.length > 0 ? initial.join("، ") : "";
  });

  useEffect(() => {
    fetch("/api/categories")
      .then((res) => res.json())
      .then((json) => {
        const all: Category[] = json.data ?? [];
        setCategories(all.filter((c) => !AI_MODEL_SLUGS.has(c.id)));
      })
      .catch(() => {});
  }, []);

  const titleValue = form.watch("title");
  const descValue = form.watch("description");

  const isFree = form.watch("isFree");
  const generationType = form.watch("generationType");

  const currentModels = modelsByType[generationType] ?? textModels;

  const addTagsFromInput = useCallback(() => {
    const currentTags = form.getValues("tags") ?? [];
    const newTags = tagInput
      .split(/[,،]/)
      .map((t) => t.trim())
      .filter((t) => t.length > 0 && !currentTags.includes(t));
    const merged = [...currentTags, ...newTags].slice(0, 5);
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

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 items-start gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <FormField
          control={form.control}
          name="generationType"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("details.contentType")}</FormLabel>
              <Select
                onValueChange={(val) => {
                  field.onChange(val);
                  // Reset AI model when content type changes
                  form.setValue("aiModel", "", { shouldValidate: false });
                }}
                value={field.value}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue
                      placeholder={t("details.contentTypePlaceholder")}
                    />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {generationTypeKeys.map((key) => (
                    <SelectItem key={key} value={key}>
                      {t(`details.generationTypes.${key}`)}
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
              <FormLabel>{t("details.aiModel")}</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue
                      placeholder={t("details.aiModelPlaceholder")}
                    />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {currentModels.map((model) => (
                    <SelectItem
                      key={model}
                      value={model.toLowerCase().replace(/\s+/g, "-")}
                    >
                      {model}
                    </SelectItem>
                  ))}
                  <SelectItem value="other">
                    {t("details.aiModels.other")}
                  </SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="category"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("details.category")}</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue
                      placeholder={t("details.categoryPlaceholder")}
                    />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {categories.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {i18n.language === "ar" ? c.name : c.nameEn}
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
              <FormLabel>{t("details.difficulty")}</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue
                      placeholder={t("details.difficultyPlaceholder")}
                    />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {difficultyKeys.map((key) => (
                    <SelectItem key={key} value={difficultyValues[key]}>
                      {t(`details.difficulties.${key}`)}
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
            <FormLabel>{t("details.promptName")}</FormLabel>
            <FormControl>
              <Input
                placeholder={t("details.promptNamePlaceholder")}
                maxLength={50}
                {...field}
              />
            </FormControl>
            <div className="text-xs text-muted-foreground text-left" dir="ltr">
              {50 - (titleValue?.length ?? 0)} {t("details.charactersLeft")}
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
            <FormLabel>{t("details.description")}</FormLabel>
            <FormControl>
              <Textarea
                placeholder={t("details.descriptionPlaceholder")}
                maxLength={500}
                rows={3}
                {...field}
              />
            </FormControl>
            <div className="text-xs text-muted-foreground text-left" dir="ltr">
              {500 - (descValue?.length ?? 0)} {t("details.charactersLeft")}
            </div>
            <FormMessage />
          </FormItem>
        )}
      />

      <div className="flex items-center gap-3 rounded-lg border p-4">
        <Switch
          id="isFree"
          checked={isFree}
          onCheckedChange={(checked) => {
            form.setValue("isFree", checked, { shouldValidate: true });
            if (checked) {
              form.setValue("price", 0, { shouldValidate: true });
              form.clearErrors("price");
            } else {
              form.setValue("price", 4, { shouldValidate: true });
            }
          }}
        />
        <Label htmlFor="isFree" className="cursor-pointer">
          {t("details.freePrompt")}
        </Label>
      </div>

      {!isFree && (
        <FormField
          control={form.control}
          name="price"
          render={({ field }) => (
            <FormItem className="max-w-2xl">
              <FormLabel>{t("details.price")}</FormLabel>
              <div className="relative mt-8" dir="ltr">
                <span
                  className="absolute -top-7 -translate-x-1/2 text-lg font-bold text-primary"
                  style={{ left: `${(((field.value || 1) - 1) / 14) * 100}%` }}
                >
                  ${field.value || 1}
                </span>
              </div>
              <FormControl>
                <Slider
                  min={1}
                  max={15}
                  step={1}
                  value={[field.value || 1]}
                  onValueChange={([val]) => field.onChange(val)}
                  dir="ltr"
                />
              </FormControl>
              <div
                className="relative h-6 text-xs text-muted-foreground"
                dir="ltr"
              >
                {Array.from({ length: 15 }, (_, i) => (
                  <span
                    key={i + 1}
                    className="absolute -translate-x-1/2"
                    style={{ left: `${(i / 14) * 100}%` }}
                  >
                    {i + 1}
                  </span>
                ))}
              </div>
              <FormMessage />
            </FormItem>
          )}
        />
      )}

      <FormField
        control={form.control}
        name="tags"
        render={() => (
          <FormItem>
            <FormLabel>{t("details.tags")}</FormLabel>
            <div className="space-y-2">
              {(form.getValues("tags") ?? []).length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {(form.getValues("tags") ?? []).map((tag) => (
                    <Badge key={tag} variant="secondary" className="gap-1 pe-1">
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
                  placeholder={t("details.tagsPlaceholder")}
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={handleTagKeyDown}
                  onBlur={addTagsFromInput}
                />
              </FormControl>
            </div>
            <div className="text-xs text-muted-foreground">
              {(form.getValues("tags") ?? []).length}/5 {t("details.tagsHint")}
            </div>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
}
