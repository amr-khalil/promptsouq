"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { z } from "zod";

const settingsFormSchema = z.object({
  commissionPercent: z
    .number({ message: "يرجى إدخال رقم صالح" })
    .min(1, "الحد الأدنى للعمولة 1%")
    .max(50, "الحد الأقصى للعمولة 50%"),
});

type SettingsFormValues = z.infer<typeof settingsFormSchema>;

interface SettingsData {
  commissionRate: number;
  updatedAt: string;
  updatedBy: string | null;
}

export function AdminSettingsForm() {
  const { t } = useTranslation("dashboard");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState<SettingsData | null>(null);

  const form = useForm<SettingsFormValues>({
    resolver: zodResolver(settingsFormSchema),
    defaultValues: { commissionPercent: 20 },
  });

  const fetchSettings = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/settings");
      if (!res.ok) throw new Error();
      const json = await res.json();
      const data: SettingsData = json.data;
      setSettings(data);
      form.reset({ commissionPercent: Math.round(data.commissionRate * 100) });
    } catch {
      setSettings(null);
    } finally {
      setLoading(false);
    }
  }, [form]);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  const onSubmit = async (values: SettingsFormValues) => {
    setSaving(true);
    try {
      const res = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ commissionRate: values.commissionPercent / 100 }),
      });
      if (!res.ok) {
        toast.error(t("admin.settings.error"));
        return;
      }
      const json = await res.json();
      setSettings(json.data);
      toast.success(t("admin.settings.saved"));
    } catch {
      toast.error(t("admin.settings.error"));
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-7 w-40" />
        <Card>
        <CardContent className="p-6 space-y-4">
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-10 w-48" />
          <Skeleton className="h-10 w-32" />
        </CardContent>
      </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold">{t("admin.settings.title")}</h2>
    <Card>
      <CardHeader>
        <CardTitle className="text-base">{t("admin.settings.commissionRate")}</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="commissionPercent"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("admin.settings.currentRate")}</FormLabel>
                  <FormControl>
                    <div className="flex items-center gap-2 max-w-[200px]">
                      <Input
                        type="number"
                        min={1}
                        max={50}
                        step={1}
                        {...field}
                        onChange={(e) => field.onChange(Number(e.target.value))}
                      />
                      <span className="text-sm font-medium">%</span>
                    </div>
                  </FormControl>
                  <FormDescription>
                    {t("admin.settings.commissionDescription")}
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {settings && (
              <div className="text-sm text-muted-foreground space-y-1">
                <p>
                  {t("admin.settings.lastUpdated")}:{" "}
                  {new Date(settings.updatedAt).toLocaleString("ar-EG")}
                </p>
                {settings.updatedBy && (
                  <p>
                    {t("admin.settings.updatedBy")}: {settings.updatedBy}
                  </p>
                )}
              </div>
            )}

            <Button type="submit" disabled={saving}>
              {saving && <Loader2 className="h-4 w-4 animate-spin me-2" />}
              {saving ? t("admin.settings.saving") : t("admin.settings.save")}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
    </div>
  );
}
