"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { sellerProfileUpdateSchema } from "@/lib/schemas/api";
import { zodResolver } from "@hookform/resolvers/zod";
import { Camera, Loader2 } from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { z } from "zod";

type ProfileFormValues = z.infer<typeof sellerProfileUpdateSchema>;

interface SellerProfile {
  userId: string;
  displayName: string;
  avatar: string;
  bio: string | null;
  country: string | null;
  stripeAccountId: string | null;
  chargesEnabled: boolean;
  payoutsEnabled: boolean;
  detailsSubmitted: boolean;
  totalEarnings: number;
  totalSales: number;
  createdAt: string;
}

export function SellerProfileForm() {
  const { t } = useTranslation("dashboard");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState<SellerProfile | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string>("");
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(sellerProfileUpdateSchema),
    defaultValues: {
      displayName: "",
      bio: "",
      avatar: "",
    },
  });

  const bioValue = form.watch("bio") ?? "";

  const fetchProfile = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/seller/profile");
      if (!res.ok) throw new Error();
      const json = await res.json();
      const p: SellerProfile = json.data;
      setProfile(p);
      setAvatarPreview(p.avatar);
      form.reset({
        displayName: p.displayName,
        bio: p.bio ?? "",
        avatar: p.avatar,
      });
    } catch {
      setProfile(null);
    } finally {
      setLoading(false);
    }
  }, [form]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/upload/image", { method: "POST", body: formData });
      if (!res.ok) throw new Error();
      const json = await res.json();
      const url = json.data?.url ?? json.url;
      if (url) {
        form.setValue("avatar", url);
        setAvatarPreview(url);
      }
    } catch {
      toast.error(t("common.error"));
    } finally {
      setUploading(false);
    }
  };

  const onSubmit = async (values: ProfileFormValues) => {
    setSaving(true);
    try {
      const res = await fetch("/api/seller/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      if (!res.ok) {
        toast.error(t("seller.profile.error"));
        return;
      }
      const json = await res.json();
      setProfile(json.data);
      toast.success(t("seller.profile.saved"));
    } catch {
      toast.error(t("seller.profile.error"));
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Card>
          <CardContent className="p-6 space-y-4">
            <div className="flex items-center gap-4">
              <Skeleton className="h-16 w-16 rounded-full" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-3 w-24" />
              </div>
            </div>
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-24 w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!profile) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <p className="text-muted-foreground">{t("common.error")}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <Card>
            <CardContent className="p-6 space-y-6">
              {/* Avatar */}
              <div className="flex items-center gap-4">
                <div className="relative">
                  <Avatar className="h-16 w-16">
                    <AvatarImage src={avatarPreview} />
                    <AvatarFallback>{profile.displayName.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <button
                    type="button"
                    className="absolute -bottom-1 -end-1 rounded-full bg-primary p-1 text-primary-foreground"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploading}
                  >
                    {uploading ? (
                      <Loader2 className="h-3 w-3 animate-spin" />
                    ) : (
                      <Camera className="h-3 w-3" />
                    )}
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleAvatarUpload}
                  />
                </div>
                <div>
                  <p className="font-medium">{profile.displayName}</p>
                  <p className="text-sm text-muted-foreground">
                    {t("seller.profile.avatarUpload")}
                  </p>
                </div>
              </div>

              {/* Display Name */}
              <FormField
                control={form.control}
                name="displayName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("seller.profile.displayName")}</FormLabel>
                    <FormControl>
                      <Input
                        placeholder={t("seller.profile.displayNamePlaceholder")}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Bio */}
              <FormField
                control={form.control}
                name="bio"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("seller.profile.bio")}</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder={t("seller.profile.bioPlaceholder")}
                        className="min-h-[100px]"
                        {...field}
                        value={field.value ?? ""}
                      />
                    </FormControl>
                    <div className="text-xs text-muted-foreground text-end">
                      {t("seller.profile.bioCount", { count: bioValue.length })}
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button type="submit" disabled={saving}>
                {saving && <Loader2 className="h-4 w-4 animate-spin me-2" />}
                {saving ? t("seller.profile.saving") : t("seller.profile.save")}
              </Button>
            </CardContent>
          </Card>
        </form>
      </Form>

      {/* Read-only info */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">{t("seller.profile.stripeStatus")}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex flex-wrap gap-2">
            <Badge
              variant="outline"
              className={
                profile.chargesEnabled
                  ? "border-green-500 text-green-700 dark:text-green-400"
                  : "border-yellow-500 text-yellow-700 dark:text-yellow-400"
              }
            >
              {t("seller.profile.chargesEnabled")}: {profile.chargesEnabled ? "✓" : "✗"}
            </Badge>
            <Badge
              variant="outline"
              className={
                profile.payoutsEnabled
                  ? "border-green-500 text-green-700 dark:text-green-400"
                  : "border-yellow-500 text-yellow-700 dark:text-yellow-400"
              }
            >
              {t("seller.profile.payoutsEnabled")}: {profile.payoutsEnabled ? "✓" : "✗"}
            </Badge>
          </div>
          {!(profile.chargesEnabled && profile.payoutsEnabled) && (
            <Button variant="outline" size="sm" asChild>
              <Link href="/sell">{t("seller.profile.completeOnboarding")}</Link>
            </Button>
          )}

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 pt-3 border-t">
            {profile.country && (
              <div>
                <p className="text-sm text-muted-foreground">{t("seller.profile.country")}</p>
                <p className="font-medium">{profile.country}</p>
              </div>
            )}
            <div>
              <p className="text-sm text-muted-foreground">{t("seller.profile.totalEarnings")}</p>
              <p className="font-medium">${(profile.totalEarnings / 100).toFixed(2)}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">{t("seller.profile.totalSales")}</p>
              <p className="font-medium">{profile.totalSales}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">{t("seller.profile.memberSince")}</p>
              <p className="font-medium">
                {new Date(profile.createdAt).toLocaleDateString("ar-EG")}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
