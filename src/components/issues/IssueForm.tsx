"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Upload, X } from "lucide-react";
import { useState, useRef } from "react";
import { createIssueBody } from "@/lib/schemas/issues";

type FormData = z.infer<typeof createIssueBody>;

interface IssueFormProps {
  onCreated?: () => void;
}

export function IssueForm({ onCreated }: IssueFormProps) {
  const { t } = useTranslation("issues");
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(createIssueBody),
    defaultValues: { title: "", description: "", imageUrl: null },
  });

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
    setValue("imageUrl", null);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }

  async function onSubmit(data: FormData) {
    try {
      const res = await fetch("/api/issues", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        toast.error("حدث خطأ أثناء الإرسال");
        return;
      }

      toast.success(t("form.success"));
      reset();
      setImagePreview(null);
      onCreated?.();
    } catch {
      toast.error("حدث خطأ أثناء الإرسال");
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 p-4 rounded-xl border border-zinc-800 bg-zinc-900/50">
      <h2 className="text-lg font-semibold text-white">{t("submit")}</h2>

      <div className="space-y-2">
        <Label htmlFor="issue-title">{t("form.title")}</Label>
        <Input
          id="issue-title"
          placeholder={t("form.titlePlaceholder")}
          {...register("title")}
        />
        {errors.title && (
          <p className="text-sm text-red-400">{errors.title.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="issue-description">{t("form.description")}</Label>
        <Textarea
          id="issue-description"
          placeholder={t("form.descriptionPlaceholder")}
          rows={4}
          {...register("description")}
        />
        {errors.description && (
          <p className="text-sm text-red-400">{errors.description.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label>{t("form.image")}</Label>
        {imagePreview ? (
          <div className="relative inline-block">
            <img
              src={imagePreview}
              alt="Preview"
              className="h-32 rounded-lg border border-zinc-700 object-cover"
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
              id="issue-image"
            />
            <label
              htmlFor="issue-image"
              className="flex items-center gap-2 px-4 py-2 rounded-lg border border-dashed border-zinc-700 text-zinc-400 text-sm cursor-pointer hover:border-zinc-500 hover:text-zinc-300 transition-colors w-fit"
            >
              <Upload className="w-4 h-4" />
              {uploading ? "جاري الرفع..." : t("form.image")}
            </label>
          </div>
        )}
      </div>

      <Button
        type="submit"
        disabled={isSubmitting || uploading}
        className="bg-[#7f0df2] hover:bg-[#6a0bcc] text-white"
      >
        {isSubmitting ? "..." : t("form.submit")}
      </Button>
    </form>
  );
}
