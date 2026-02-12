"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useUser } from "@clerk/nextjs";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export default function SettingsPage() {
  const { user } = useUser();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (user) {
      setFirstName(user.firstName ?? "");
      setLastName(user.lastName ?? "");
    }
  }, [user]);

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    try {
      await user.update({ firstName, lastName });
      toast.success("تم حفظ التغييرات بنجاح!");
    } catch {
      toast.error("فشل في حفظ التغييرات");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold">الإعدادات</h2>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">الاسم المعروض</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="firstName">الاسم الأول</Label>
              <Input
                id="firstName"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="الاسم الأول"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName">اسم العائلة</Label>
              <Input
                id="lastName"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder="اسم العائلة"
              />
            </div>
          </div>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? "جارٍ الحفظ..." : "حفظ التغييرات"}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">معلومات الحساب</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">البريد الإلكتروني</span>
            <span>{user?.primaryEmailAddress?.emailAddress}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">معرّف المستخدم</span>
            <span className="font-mono text-xs">{user?.id}</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
