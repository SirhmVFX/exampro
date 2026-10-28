"use client";

import { useState } from "react";
import { Save, KeyRound } from "lucide-react";
import DashboardShell from "@/app/components/dashboard/shell";
import { Card, CardBody, CardHeader } from "@/app/components/ui/card";
import { Button } from "@/app/components/ui/button";
import { Badge } from "@/app/components/ui/badge";
import { useAuth } from "@/lib/auth-context";
import { updateUserProfile } from "@/lib/db";
import { inputClass } from "@/lib/utils";
import { ChangePasswordModal } from "@/app/components/dashboard/change-password-modal";
import toast from "react-hot-toast";

export default function TeacherProfilePage() {
  const { profile, institution, refresh } = useAuth();
  const [name, setName] = useState(profile?.name ?? "");
  const [phone, setPhone] = useState(profile?.phone ?? "");
  const [hydrated, setHydrated] = useState(false);
  if (profile && !hydrated) {
    setName(profile.name);
    setPhone(profile.phone ?? "");
    setHydrated(true);
  }
  const [saving, setSaving] = useState(false);
  const [pwOpen, setPwOpen] = useState(false);

  const save = async () => {
    if (!profile) return;
    setSaving(true);
    try {
      await updateUserProfile(profile.uid, {
        name: name.trim(),
        phone: phone.trim() || undefined,
      });
      await refresh();
      toast.success("Profile saved");
    } catch {
      toast.error("Could not save profile.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <DashboardShell
      role="teacher"
      title="Profile"
      subtitle="Your teacher account"
    >
      <div className="max-w-lg space-y-6">
        <Card>
          <CardHeader>
            <h2 className="font-semibold">Your details</h2>
          </CardHeader>
          <CardBody className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1.5">Full name</label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                className={inputClass}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">Email</label>
              <input value={profile?.email ?? ""} disabled className={`${inputClass} opacity-60`} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">Phone</label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className={inputClass}
                placeholder="+234 800 000 0000"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">Role</label>
              <div className="flex items-center gap-2">
                <Badge variant="info">Teacher</Badge>
                <span className="text-sm text-[var(--dash-text-muted)]">{institution?.name}</span>
              </div>
            </div>
            <div className="flex items-center gap-3 pt-2">
              <Button loading={saving} onClick={() => void save()}>
                <Save className="w-4 h-4" /> Save
              </Button>
              <Button variant="outline" onClick={() => setPwOpen(true)}>
                <KeyRound className="w-4 h-4" /> Change password
              </Button>
            </div>
          </CardBody>
        </Card>
      </div>
      <ChangePasswordModal open={pwOpen} onClose={() => setPwOpen(false)} />
    </DashboardShell>
  );
}
