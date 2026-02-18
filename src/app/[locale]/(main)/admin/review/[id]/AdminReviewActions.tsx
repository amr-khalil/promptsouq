"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  CheckCircle,
  Loader2,
  Pencil,
  Trash2,
  XCircle,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

interface AdminReviewActionsProps {
  promptId: string;
  currentStatus: string;
  initialData: {
    title: string;
    description: string;
    price: number;
    category: string;
    aiModel: string;
    difficulty: string;
    tags: string[];
  };
}

export function AdminReviewActions({
  promptId,
  currentStatus,
  initialData,
}: AdminReviewActionsProps) {
  const router = useRouter();
  const [showReject, setShowReject] = useState(false);
  const [reason, setReason] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [editData, setEditData] = useState(initialData);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handleReview = async (action: "approve" | "reject") => {
    if (action === "reject" && !reason.trim()) {
      toast.error("يجب تقديم سبب عند رفض البرومبت");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch(`/api/admin/prompts/${promptId}/review`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action,
          ...(action === "reject" ? { reason } : {}),
        }),
      });

      if (!res.ok) {
        const json = await res.json();
        toast.error(json.error?.message ?? "حدث خطأ");
        return;
      }

      toast.success(
        action === "approve"
          ? "تم قبول البرومبت بنجاح"
          : "تم رفض البرومبت",
      );
      router.push("/admin/review");
      router.refresh();
    } catch {
      toast.error("حدث خطأ في الاتصال بالخادم");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    setSubmitting(true);
    try {
      const res = await fetch(`/api/admin/prompts/${promptId}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const json = await res.json();
        toast.error(json.error?.message ?? "حدث خطأ في الحذف");
        return;
      }

      toast.success("تم حذف البرومبت بنجاح");
      router.push("/admin/review");
      router.refresh();
    } catch {
      toast.error("حدث خطأ في الاتصال بالخادم");
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = async () => {
    setSubmitting(true);
    try {
      const res = await fetch(`/api/admin/prompts/${promptId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editData),
      });

      if (!res.ok) {
        const json = await res.json();
        toast.error(json.error?.message ?? "حدث خطأ في التعديل");
        return;
      }

      toast.success("تم تعديل البرومبت بنجاح");
      setShowEdit(false);
      router.refresh();
    } catch {
      toast.error("حدث خطأ في الاتصال بالخادم");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Admin Actions: Edit & Delete */}
      <section className="rounded-lg border p-6 space-y-4">
        <h2 className="text-xl font-semibold">إجراءات الإدارة</h2>

        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={() => { setShowEdit(!showEdit); setShowDeleteConfirm(false); }}
            disabled={submitting}
          >
            <Pencil className="h-4 w-4 me-2" />
            تعديل
          </Button>

          <Button
            variant="destructive"
            onClick={() => { setShowDeleteConfirm(!showDeleteConfirm); setShowEdit(false); }}
            disabled={submitting}
          >
            <Trash2 className="h-4 w-4 me-2" />
            حذف
          </Button>
        </div>

        {/* Delete Confirmation */}
        {showDeleteConfirm && (
          <div className="rounded-md border border-destructive/50 bg-destructive/5 p-4 space-y-3">
            <p className="text-sm font-medium text-destructive">
              هل أنت متأكد من حذف هذا البرومبت؟ لا يمكن التراجع عن هذا الإجراء.
            </p>
            <div className="flex gap-3">
              <Button
                variant="destructive"
                size="sm"
                onClick={handleDelete}
                disabled={submitting}
              >
                {submitting ? (
                  <Loader2 className="h-4 w-4 animate-spin me-2" />
                ) : (
                  <Trash2 className="h-4 w-4 me-2" />
                )}
                تأكيد الحذف
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowDeleteConfirm(false)}
                disabled={submitting}
              >
                إلغاء
              </Button>
            </div>
          </div>
        )}

        {/* Edit Form */}
        {showEdit && (
          <div className="space-y-4 rounded-md border p-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">العنوان</label>
              <Input
                value={editData.title}
                onChange={(e) => setEditData({ ...editData, title: e.target.value })}
                maxLength={60}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">الوصف</label>
              <Textarea
                value={editData.description}
                onChange={(e) => setEditData({ ...editData, description: e.target.value })}
                maxLength={500}
                rows={3}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">السعر ($)</label>
                <Input
                  type="number"
                  min={1.99}
                  max={99.99}
                  step={0.01}
                  value={editData.price}
                  dir="ltr"
                  onChange={(e) => setEditData({ ...editData, price: parseFloat(e.target.value) || 0 })}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">مستوى الصعوبة</label>
                <Input
                  value={editData.difficulty}
                  onChange={(e) => setEditData({ ...editData, difficulty: e.target.value })}
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">الوسوم (افصل بفاصلة)</label>
              <Input
                value={editData.tags.join(", ")}
                onChange={(e) =>
                  setEditData({
                    ...editData,
                    tags: e.target.value.split(/[,،]/).map((t) => t.trim()).filter(Boolean),
                  })
                }
              />
            </div>
            <div className="flex gap-3">
              <Button onClick={handleEdit} disabled={submitting}>
                {submitting ? (
                  <Loader2 className="h-4 w-4 animate-spin me-2" />
                ) : (
                  <CheckCircle className="h-4 w-4 me-2" />
                )}
                حفظ التعديلات
              </Button>
              <Button
                variant="ghost"
                onClick={() => { setShowEdit(false); setEditData(initialData); }}
                disabled={submitting}
              >
                إلغاء
              </Button>
            </div>
          </div>
        )}
      </section>

      {/* Review Actions */}
      {currentStatus === "pending" ? (
        <section className="rounded-lg border p-6 space-y-4">
          <h2 className="text-xl font-semibold">إجراء المراجعة</h2>

          {showReject && (
            <div className="space-y-2">
              <label className="text-sm font-medium">سبب الرفض</label>
              <Textarea
                placeholder="اكتب سبب رفض البرومبت..."
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                rows={3}
                maxLength={500}
              />
              <div className="text-xs text-muted-foreground text-left" dir="ltr">
                {500 - reason.length} characters left
              </div>
            </div>
          )}

          <div className="flex gap-3">
            <Button
              onClick={() => handleReview("approve")}
              disabled={submitting}
              className="bg-green-600 hover:bg-green-700"
            >
              {submitting ? (
                <Loader2 className="h-4 w-4 animate-spin me-2" />
              ) : (
                <CheckCircle className="h-4 w-4 me-2" />
              )}
              قبول
            </Button>

            {showReject ? (
              <Button
                variant="destructive"
                onClick={() => handleReview("reject")}
                disabled={submitting || !reason.trim()}
              >
                {submitting ? (
                  <Loader2 className="h-4 w-4 animate-spin me-2" />
                ) : (
                  <XCircle className="h-4 w-4 me-2" />
                )}
                تأكيد الرفض
              </Button>
            ) : (
              <Button
                variant="outline"
                onClick={() => setShowReject(true)}
                disabled={submitting}
              >
                <XCircle className="h-4 w-4 me-2" />
                رفض
              </Button>
            )}

            {showReject && (
              <Button
                variant="ghost"
                onClick={() => {
                  setShowReject(false);
                  setReason("");
                }}
                disabled={submitting}
              >
                إلغاء
              </Button>
            )}
          </div>
        </section>
      ) : (
        <section className="rounded-lg border p-6 text-center">
          <p className="text-muted-foreground">
            تمت مراجعة هذا البرومبت بالفعل (
            {currentStatus === "approved" ? "مقبول" : "مرفوض"})
          </p>
        </section>
      )}
    </div>
  );
}
