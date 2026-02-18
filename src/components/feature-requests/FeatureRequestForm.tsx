"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { z } from "zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Lightbulb } from "lucide-react";
import type { FeatureRequest } from "./FeatureRequestCard";
import { createFeatureRequestBody } from "@/lib/schemas/feature-requests";

type FormData = z.infer<typeof createFeatureRequestBody>;

interface FeatureRequestFormProps {
  onCreated?: (request: FeatureRequest) => void;
}

export function FeatureRequestForm({ onCreated }: FeatureRequestFormProps) {
  const { t } = useTranslation("feature-requests");
  const [open, setOpen] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(createFeatureRequestBody),
    defaultValues: { title: "", description: "" },
  });

  const titleLen = watch("title")?.length ?? 0;
  const descLen = watch("description")?.length ?? 0;

  async function onSubmit(data: FormData) {
    try {
      const res = await fetch("/api/feature-requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        toast.error("حدث خطأ أثناء الإرسال");
        return;
      }

      const created = await res.json();
      toast.success(t("form.success"));
      reset();
      setOpen(false);
      onCreated?.({
        ...created,
        userHasVoted: false,
      });
    } catch {
      toast.error("حدث خطأ أثناء الإرسال");
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-[#7f0df2] hover:bg-[#6a0bcc] text-white gap-2">
          <Lightbulb className="w-4 h-4" />
          {t("submit")}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{t("submit")}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="title">{t("form.title")}</Label>
              <span className="text-xs text-zinc-500">{titleLen}/100</span>
            </div>
            <Input
              id="title"
              placeholder={t("form.titlePlaceholder")}
              {...register("title")}
            />
            {errors.title && (
              <p className="text-sm text-red-400">{errors.title.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="description">{t("form.description")}</Label>
              <span className="text-xs text-zinc-500">{descLen}/1000</span>
            </div>
            <Textarea
              id="description"
              placeholder={t("form.descriptionPlaceholder")}
              rows={5}
              {...register("description")}
            />
            {errors.description && (
              <p className="text-sm text-red-400">{errors.description.message}</p>
            )}
          </div>

          <Button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-[#7f0df2] hover:bg-[#6a0bcc] text-white"
          >
            {isSubmitting ? "..." : t("form.submit")}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
