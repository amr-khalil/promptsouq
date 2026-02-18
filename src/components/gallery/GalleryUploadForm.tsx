"use client";

import { useEffect, useState, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Upload, X } from "lucide-react";
import { galleryUploadBody } from "@/lib/schemas/gallery";

type FormData = z.infer<typeof galleryUploadBody>;

interface SellerPrompt {
  id: string;
  title: string;
}

interface GalleryUploadFormProps {
  onUploaded?: () => void;
}

export function GalleryUploadForm({ onUploaded }: GalleryUploadFormProps) {
  const { t } = useTranslation("gallery");
  const [prompts, setPrompts] = useState<SellerPrompt[]>([]);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(galleryUploadBody),
    defaultValues: { imageUrl: "", promptId: "", caption: null },
  });

  const selectedPromptId = watch("promptId");

  useEffect(() => {
    async function fetchPrompts() {
      try {
        const res = await fetch("/api/seller/prompts?status=approved");
        if (!res.ok) return;
        const data = await res.json();
        setPrompts(
          (data.prompts ?? data.data ?? []).map((p: { id: string; title: string }) => ({
            id: p.id,
            title: p.title,
          })),
        );
      } catch {
        // Ignore
      }
    }
    fetchPrompts();
  }, []);

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error("حجم الصورة يجب ألا يتجاوز 5 ميغابايت");
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/upload/image", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        toast.error("فشل رفع الصورة");
        return;
      }

      const data = await res.json();
      setValue("imageUrl", data.url);
      setImagePreview(data.url);
    } catch {
      toast.error("فشل رفع الصورة");
    } finally {
      setUploading(false);
    }
  }

  function removeImage() {
    setValue("imageUrl", "");
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  async function onSubmit(data: FormData) {
    try {
      const res = await fetch("/api/gallery", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const err = await res.json();
        toast.error(err.error?.message ?? "حدث خطأ");
        return;
      }

      toast.success(t("upload.success"));
      reset();
      setImagePreview(null);
      onUploaded?.();
    } catch {
      toast.error("حدث خطأ أثناء الإرسال");
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 p-4 rounded-xl border border-zinc-800 bg-zinc-900/50">
      <h2 className="text-lg font-semibold text-white">{t("upload.title")}</h2>

      {/* Image Upload */}
      <div className="space-y-2">
        <Label>{t("upload.image")}</Label>
        {imagePreview ? (
          <div className="relative inline-block">
            <img
              src={imagePreview}
              alt="Preview"
              className="h-40 rounded-lg border border-zinc-700 object-cover"
            />
            <button
              type="button"
              onClick={removeImage}
              className="absolute -top-2 -left-2 bg-red-500 text-white rounded-full p-0.5"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        ) : (
          <div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
              id="gallery-image"
            />
            <label
              htmlFor="gallery-image"
              className="flex items-center gap-2 px-4 py-6 rounded-lg border border-dashed border-zinc-700 text-zinc-400 text-sm cursor-pointer hover:border-zinc-500 hover:text-zinc-300 transition-colors justify-center"
            >
              <Upload className="w-5 h-5" />
              {uploading ? "جاري الرفع..." : t("upload.selectImage")}
            </label>
          </div>
        )}
        {errors.imageUrl && (
          <p className="text-sm text-red-400">{errors.imageUrl.message}</p>
        )}
      </div>

      {/* Prompt Selector */}
      <div className="space-y-2">
        <Label>{t("upload.selectPrompt")}</Label>
        <Select value={selectedPromptId} onValueChange={(v) => setValue("promptId", v)}>
          <SelectTrigger>
            <SelectValue placeholder={t("upload.selectPromptPlaceholder")} />
          </SelectTrigger>
          <SelectContent>
            {prompts.map((p) => (
              <SelectItem key={p.id} value={p.id}>
                {p.title}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.promptId && (
          <p className="text-sm text-red-400">{errors.promptId.message}</p>
        )}
      </div>

      {/* Caption */}
      <div className="space-y-2">
        <Label>{t("upload.caption")}</Label>
        <Textarea
          placeholder={t("upload.captionPlaceholder")}
          rows={2}
          onChange={(e) => setValue("caption", e.target.value || null)}
        />
        {errors.caption && (
          <p className="text-sm text-red-400">{errors.caption.message}</p>
        )}
      </div>

      <Button
        type="submit"
        disabled={isSubmitting || uploading}
        className="bg-[#7f0df2] hover:bg-[#6a0bcc] text-white"
      >
        {isSubmitting ? "..." : t("upload.submit")}
      </Button>
    </form>
  );
}
