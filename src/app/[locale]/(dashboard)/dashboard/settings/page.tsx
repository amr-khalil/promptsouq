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
import { useUser } from "@clerk/nextjs";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Camera,
  Copy,
  Check,
  Loader2,
  Mail,
  Shield,
  Calendar,
  Clock,
  User,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { z } from "zod";

const profileSchema = z.object({
  firstName: z.string().min(1).max(50),
  lastName: z.string().min(1).max(50),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

export default function SettingsPage() {
  const { t } = useTranslation("dashboard");
  const { user, isLoaded } = useUser();
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState("");
  const [copied, setCopied] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
    },
  });

  useEffect(() => {
    if (isLoaded && user) {
      form.reset({
        firstName: user.firstName ?? "",
        lastName: user.lastName ?? "",
      });
      setAvatarPreview(user.imageUrl);
    }
  }, [isLoaded, user, form]);

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    setUploading(true);
    try {
      await user.setProfileImage({ file });
      setAvatarPreview(user.imageUrl);
      toast.success(t("userSettings.saved"));
    } catch {
      toast.error(t("userSettings.error"));
    } finally {
      setUploading(false);
    }
  };

  const onSubmit = async (values: ProfileFormValues) => {
    if (!user) return;
    setSaving(true);
    try {
      await user.update({
        firstName: values.firstName,
        lastName: values.lastName,
      });
      toast.success(t("userSettings.saved"));
    } catch {
      toast.error(t("userSettings.error"));
    } finally {
      setSaving(false);
    }
  };

  const copyUserId = () => {
    if (!user) return;
    navigator.clipboard.writeText(user.id);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!isLoaded) {
    return (
      <div className="space-y-6">
        <Card>
          <CardContent className="p-6 space-y-4">
            <div className="flex items-center gap-4">
              <Skeleton className="h-20 w-20 rounded-full" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-3 w-24" />
              </div>
            </div>
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 space-y-4">
            <Skeleton className="h-4 w-40" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!user) return null;

  const primaryEmail = user.primaryEmailAddress?.emailAddress;
  const connectedAccounts = user.externalAccounts ?? [];
  const hasTwoFactor = (user.twoFactorEnabled) ?? false;

  return (
    <div className="space-y-6">
      {/* Card 1: Edit Profile */}
      <Card>
        <CardHeader>
          <CardTitle>{t("userSettings.editProfile")}</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* Avatar */}
              <div className="flex items-center gap-4">
                <div className="relative">
                  <Avatar className="h-20 w-20">
                    <AvatarImage src={avatarPreview} />
                    <AvatarFallback>
                      {(user.firstName?.charAt(0) ?? "") +
                        (user.lastName?.charAt(0) ?? "")}
                    </AvatarFallback>
                  </Avatar>
                  <button
                    type="button"
                    className="absolute -bottom-1 -end-1 rounded-full bg-primary p-1.5 text-primary-foreground shadow-sm"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploading}
                  >
                    {uploading ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <Camera className="h-3.5 w-3.5" />
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
                  <p className="font-medium">
                    {user.firstName} {user.lastName}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {t("userSettings.changeAvatar")}
                  </p>
                </div>
              </div>

              {/* First Name */}
              <FormField
                control={form.control}
                name="firstName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("userSettings.firstName")}</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Last Name */}
              <FormField
                control={form.control}
                name="lastName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("userSettings.lastName")}</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button type="submit" disabled={saving}>
                {saving && <Loader2 className="h-4 w-4 animate-spin me-2" />}
                {saving
                  ? t("userSettings.saving")
                  : t("userSettings.save")}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      {/* Card 2: Account Information (read-only) */}
      <Card>
        <CardHeader>
          <CardTitle>{t("userSettings.accountInfo")}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Email */}
          <div className="flex items-center gap-3">
            <Mail className="h-4 w-4 text-muted-foreground shrink-0" />
            <div className="min-w-0">
              <p className="text-sm text-muted-foreground">
                {t("userSettings.email")}
              </p>
              <div className="flex items-center gap-2">
                <p className="font-medium truncate">{primaryEmail}</p>
                <Badge variant="secondary" className="text-xs shrink-0">
                  Primary
                </Badge>
              </div>
            </div>
          </div>

          {/* Join Date */}
          <div className="flex items-center gap-3">
            <Calendar className="h-4 w-4 text-muted-foreground shrink-0" />
            <div>
              <p className="text-sm text-muted-foreground">
                {t("userSettings.joinDate")}
              </p>
              <p className="font-medium">
                {user.createdAt
                  ? new Date(user.createdAt).toLocaleDateString("ar-EG", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })
                  : "—"}
              </p>
            </div>
          </div>

          {/* Last Sign In */}
          <div className="flex items-center gap-3">
            <Clock className="h-4 w-4 text-muted-foreground shrink-0" />
            <div>
              <p className="text-sm text-muted-foreground">
                {t("userSettings.lastSignIn")}
              </p>
              <p className="font-medium">
                {user.lastSignInAt
                  ? new Date(user.lastSignInAt).toLocaleDateString("ar-EG", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })
                  : "—"}
              </p>
            </div>
          </div>

          {/* User ID */}
          <div className="flex items-center gap-3">
            <User className="h-4 w-4 text-muted-foreground shrink-0" />
            <div className="min-w-0 flex-1">
              <p className="text-sm text-muted-foreground">
                {t("userSettings.userId")}
              </p>
              <div className="flex items-center gap-2">
                <code className="text-sm font-mono bg-muted px-2 py-0.5 rounded truncate">
                  {user.id}
                </code>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 shrink-0"
                  onClick={copyUserId}
                >
                  {copied ? (
                    <Check className="h-3 w-3 text-green-500" />
                  ) : (
                    <Copy className="h-3 w-3" />
                  )}
                </Button>
              </div>
            </div>
          </div>

          {/* Connected Accounts */}
          {connectedAccounts.length > 0 && (
            <div className="flex items-start gap-3 pt-2 border-t">
              <Shield className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
              <div>
                <p className="text-sm text-muted-foreground">
                  {t("userSettings.connectedAccounts")}
                </p>
                <div className="space-y-1 mt-1">
                  {connectedAccounts.map((account) => (
                    <div
                      key={account.id}
                      className="flex items-center gap-2"
                    >
                      <Badge variant="outline" className="text-xs capitalize">
                        {account.provider}
                      </Badge>
                      <span className="text-sm truncate">
                        {account.emailAddress}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* 2FA Status */}
          <div className="flex items-center gap-3 pt-2 border-t">
            <Shield className="h-4 w-4 text-muted-foreground shrink-0" />
            <div>
              <p className="text-sm text-muted-foreground">
                {t("userSettings.twoFactor")}
              </p>
              <Badge
                variant={hasTwoFactor ? "default" : "secondary"}
                className={
                  hasTwoFactor
                    ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                    : ""
                }
              >
                {hasTwoFactor
                  ? t("userSettings.twoFactorEnabled")
                  : t("userSettings.twoFactorDisabled")}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
