"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getStorageClient } from "@/lib/supabase-storage";
import { Camera, CreditCard, Loader2, Search, ShoppingBag } from "lucide-react";
import { useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";

interface OnboardingWizardProps {
  userId: string;
  firstName?: string | null;
  lastName?: string | null;
  avatarUrl?: string | null;
  onComplete: () => void;
}

export function OnboardingWizard({
  userId,
  firstName: initialFirst,
  lastName: initialLast,
  avatarUrl: initialAvatar,
  onComplete,
}: OnboardingWizardProps) {
  const { t } = useTranslation("dashboard");
  const [step, setStep] = useState(1);
  const [firstName, setFirstName] = useState(initialFirst ?? "");
  const [lastName, setLastName] = useState(initialLast ?? "");
  const [avatarPreview, setAvatarPreview] = useState(initialAvatar ?? "");
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const storageClient = getStorageClient();
      const ext = file.name.split(".").pop();
      const filePath = `avatars/${userId}.${ext}`;

      const { error: uploadError } = await storageClient.storage
        .from("prompt-images")
        .upload(filePath, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data } = storageClient.storage
        .from("prompt-images")
        .getPublicUrl(filePath);

      setAvatarPreview(data.publicUrl);
    } catch {
      toast.error(t("onboarding.uploadError"));
    } finally {
      setUploading(false);
    }
  };

  const completeOnboarding = async (skipped: boolean) => {
    setSaving(true);
    try {
      const body: Record<string, unknown> = { onboardingCompleted: true };
      if (!skipped) {
        if (firstName) body.firstName = firstName;
        if (lastName) body.lastName = lastName;
        if (firstName || lastName) {
          body.displayName = [firstName, lastName].filter(Boolean).join(" ");
        }
        if (avatarPreview) body.avatarUrl = avatarPreview;
      }

      const res = await fetch("/api/user/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) throw new Error("Failed to update profile");
      onComplete();
    } catch {
      toast.error(t("onboarding.error"));
    } finally {
      setSaving(false);
    }
  };

  const features = [
    {
      icon: Search,
      title: t("onboarding.featureBrowse"),
      desc: t("onboarding.featureBrowseDesc"),
    },
    {
      icon: ShoppingBag,
      title: t("onboarding.featureSell"),
      desc: t("onboarding.featureSellDesc"),
    },
    {
      icon: CreditCard,
      title: t("onboarding.featureCredits"),
      desc: t("onboarding.featureCreditsDesc"),
    },
  ];

  return (
    <Card className="max-w-lg mx-auto">
      <CardHeader className="text-center">
        <CardTitle>{t("onboarding.title")}</CardTitle>
        <div className="flex justify-center gap-2 mt-3">
          {[1, 2].map((s) => (
            <div
              key={s}
              className={`h-2 w-12 rounded-full transition-colors ${
                s <= step ? "bg-primary" : "bg-muted"
              }`}
            />
          ))}
        </div>
        <p className="text-sm text-muted-foreground mt-1">
          {t("onboarding.step", { current: step, total: 2 })}
        </p>
      </CardHeader>

      <CardContent className="space-y-6">
        {step === 1 && (
          <>
            <div className="flex justify-center">
              <div className="relative">
                <Avatar className="h-20 w-20">
                  <AvatarImage src={avatarPreview} />
                  <AvatarFallback>
                    {firstName?.charAt(0) ?? "U"}
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
            </div>

            <div className="space-y-4">
              <div>
                <Label>{t("onboarding.firstName")}</Label>
                <Input
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="mt-1.5"
                />
              </div>
              <div>
                <Label>{t("onboarding.lastName")}</Label>
                <Input
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="mt-1.5"
                />
              </div>
            </div>

            <div className="flex gap-3">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => completeOnboarding(true)}
                disabled={saving}
              >
                {t("onboarding.skip")}
              </Button>
              <Button
                className="flex-1"
                onClick={() => setStep(2)}
              >
                {t("onboarding.next")}
              </Button>
            </div>
          </>
        )}

        {step === 2 && (
          <>
            <div className="space-y-4">
              {features.map((feat) => (
                <div
                  key={feat.title}
                  className="flex items-start gap-3 rounded-lg border p-4"
                >
                  <div className="rounded-md bg-primary/10 p-2">
                    <feat.icon className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium">{feat.title}</p>
                    <p className="text-sm text-muted-foreground">
                      {feat.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex gap-3">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setStep(1)}
              >
                {t("onboarding.back")}
              </Button>
              <Button
                className="flex-1"
                onClick={() => completeOnboarding(false)}
                disabled={saving}
              >
                {saving && <Loader2 className="h-4 w-4 animate-spin me-2" />}
                {t("onboarding.complete")}
              </Button>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
