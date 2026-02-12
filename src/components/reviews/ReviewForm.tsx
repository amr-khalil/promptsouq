"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import type { Review } from "@/lib/schemas/api";
import { reviewSubmitSchema } from "@/lib/schemas/api";
import { zodResolver } from "@hookform/resolvers/zod";
import { Edit2, Star } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import type { z } from "zod";

type ReviewFormData = z.infer<typeof reviewSubmitSchema>;

interface ReviewFormProps {
  promptId: string;
  existingReview: Review | null;
  onReviewSaved: (review: Review) => void;
}

export function ReviewForm({
  promptId,
  existingReview,
  onReviewSaved,
}: ReviewFormProps) {
  const [isEditing, setIsEditing] = useState(!existingReview);
  const [hoveredStar, setHoveredStar] = useState(0);

  const form = useForm<ReviewFormData>({
    resolver: zodResolver(reviewSubmitSchema),
    defaultValues: {
      rating: existingReview?.rating ?? 0,
      comment: existingReview?.comment ?? "",
    },
  });

  const watchedRating = form.watch("rating");

  const onSubmit = async (data: ReviewFormData) => {
    try {
      const method = existingReview ? "PUT" : "POST";
      const res = await fetch(`/api/prompts/${promptId}/reviews`, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const json = await res.json();
        toast.error(json.error?.message ?? json.error ?? "حدث خطأ");
        return;
      }

      const json = await res.json();
      toast.success(
        existingReview ? "تم تحديث التقييم بنجاح!" : "تم إضافة التقييم بنجاح!",
      );
      setIsEditing(false);
      onReviewSaved(json.data);
    } catch {
      toast.error("حدث خطأ أثناء حفظ التقييم");
    }
  };

  // Read-only display of existing review
  if (existingReview && !isEditing) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">تقييمك</CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsEditing(true)}
            >
              <Edit2 className="ml-1 h-4 w-4" />
              تعديل
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-1 mb-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star
                key={i}
                className={`h-5 w-5 ${
                  i < existingReview.rating
                    ? "fill-yellow-400 text-yellow-400"
                    : "text-muted-foreground"
                }`}
              />
            ))}
          </div>
          {existingReview.comment && (
            <p className="text-sm text-muted-foreground">
              {existingReview.comment}
            </p>
          )}
        </CardContent>
      </Card>
    );
  }

  // Review form
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">
          {existingReview ? "تعديل التقييم" : "قيّم هذا البرومبت"}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          {/* Star Rating */}
          <div>
            <div className="flex items-center gap-1">
              {Array.from({ length: 5 }).map((_, i) => {
                const starValue = i + 1;
                const isFilled =
                  starValue <= (hoveredStar || watchedRating);
                return (
                  <button
                    key={i}
                    type="button"
                    onMouseEnter={() => setHoveredStar(starValue)}
                    onMouseLeave={() => setHoveredStar(0)}
                    onClick={() => form.setValue("rating", starValue, { shouldValidate: true })}
                    className="cursor-pointer"
                  >
                    <Star
                      className={`h-7 w-7 transition-colors ${
                        isFilled
                          ? "fill-yellow-400 text-yellow-400"
                          : "text-muted-foreground hover:text-yellow-300"
                      }`}
                    />
                  </button>
                );
              })}
            </div>
            {form.formState.errors.rating && (
              <p className="text-sm text-destructive mt-1">
                {form.formState.errors.rating.message}
              </p>
            )}
          </div>

          {/* Comment */}
          <div>
            <Textarea
              placeholder="اكتب تعليقك (اختياري)..."
              {...form.register("comment")}
              rows={3}
            />
            {form.formState.errors.comment && (
              <p className="text-sm text-destructive mt-1">
                {form.formState.errors.comment.message}
              </p>
            )}
          </div>

          <div className="flex gap-2">
            <Button
              type="submit"
              disabled={form.formState.isSubmitting}
            >
              {form.formState.isSubmitting
                ? "جارٍ الحفظ..."
                : existingReview
                  ? "تحديث التقييم"
                  : "إرسال التقييم"}
            </Button>
            {existingReview && (
              <Button
                type="button"
                variant="ghost"
                onClick={() => {
                  setIsEditing(false);
                  form.reset({
                    rating: existingReview.rating,
                    comment: existingReview.comment,
                  });
                }}
              >
                إلغاء
              </Button>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
