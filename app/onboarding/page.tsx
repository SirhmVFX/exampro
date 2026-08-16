"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Check, ArrowRight, AlertCircle, Upload, Sparkles } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { updateInstitution, createInvite, newId, COL, allocateSlug } from "@/lib/db";
import { uploadToCloudinary } from "@/lib/cloudinary";
import { Button } from "@/app/components/ui/button";
import { TagInput } from "@/app/components/ui/tag-input";
import {
  AuthCard,
  AuthFrame,
  darkInput,
} from "@/app/components/marketing/auth-frame";

const steps = [
  { id: 1, label: "Academic structure" },
  { id: 2, label: "Branding" },
  { id: 3, label: "Invite teachers" },
];

const LABEL_PRESETS: Record<string, string> = {
  k12: "Grade",
  university: "Level",
  training: "Cohort",
  corporate: "Track",
  tutoring: "Group",
  faith: "Class",
  language: "Level",
  professional: "Session",
  other: "Class",
};

const inputClass = darkInput;

export default function OnboardingPage() {
  const { firebaseUser, profile, institution, loading, refresh } = useAuth();
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [uploading, setUploading] = useState(false);
  const [form, setForm] = useState({
    classLabel: "Class",
    classes: [] as string[],
    subjects: [] as string[],
    logoUrl: "",
    primaryColor: "#000000",
    accentColor: "#000000",
    inviteEmails: "",
  });

  useEffect(() => {
    if (loading) return;
    if (!firebaseUser || !profile) {
      router.replace("/auth/login");
      return;
    }
    if (profile.role !== "admin") {
      router.replace("/dashboard/" + profile.role);
      return;
    }
    if (institution?.onboarded) {
      router.replace("/dashboard/admin");
    }
  }, [loading, firebaseUser, profile, institution, router]);

  useEffect(() => {
    if (!institution) return;
    setForm((prev) => ({
      ...prev,
      classLabel:
        institution.classLabel || LABEL_PRESETS[institution.type] || "Class",
      classes: institution.classes ?? [],
      subjects: institution.subjects ?? [],
      logoUrl: institution.logoUrl ?? "",
      primaryColor: institution.primaryColor ?? "#000000",
      accentColor: institution.accentColor ?? "#000000",
    }));
  }, [institution]);

  if (loading || !profile || !institution) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-white/20 border-t-white rounded-full animate-spin" />
      </div>
    );
  }

  const handleLogo = async (file: File) => {
    setUploading(true);
    setError("");
    try {
      const result = await uploadToCloudinary(
        file,
        `exampro/${institution.id}/logo`
      );
      setForm((f) => ({ ...f, logoUrl: result.url }));
    } catch (e) {
      setError(
        e instanceof Error
          ? e.message
          : "Logo upload failed. You can skip this and add it later in Settings."
      );
    } finally {
      setUploading(false);
    }
  };

  const finish = async () => {
    setError("");
    setSaving(true);
    try {
      const slug =
        institution.slug ||
        (await allocateSlug(institution.name, institution.id));
      await updateInstitution(institution.id, {
        classLabel: form.classLabel.trim() || "Class",
        classes: form.classes,
        subjects: form.subjects,
        logoUrl: form.logoUrl || undefined,
        primaryColor: form.primaryColor,
        accentColor: form.accentColor,
        slug,
        onboarded: true,
      });

      const emails = form.inviteEmails
        .split(/[,;\n]+/)
        .map((e) => e.trim().toLowerCase())
        .filter((e) => e.includes("@"));
      await Promise.all(
        emails.map((email) =>
          createInvite({
            id: newId(COL.invites),
            institutionId: institution.id,
            institutionName: institution.name,
            email,
            role: "teacher",
            status: "pending",
            createdAt: Date.now(),
          })
        )
      );

      await refresh();
      router.push("/dashboard/admin");
    } catch {
      setError("Couldn't finish setup. Please try again.");
      setSaving(false);
    }
  };

  return (
    <AuthFrame showBack={false} wide>
      <AuthCard>
        <div className="flex items-center gap-2 mb-2 text-white/40 text-xs font-semibold uppercase tracking-wide">
          <Sparkles className="w-3.5 h-3.5" />
          Workspace setup
        </div>
        <h1 className="text-2xl font-bold text-white mb-1">
          Set up {institution.name}
        </h1>
        <p className="text-sm text-white/45 mb-8">
          Tell us how your institution is organized so teachers and students
          can join the right groups.
        </p>

        <div className="flex items-center gap-2 mb-8">
          {steps.map((s, i) => (
            <div key={s.id} className="flex items-center gap-2 flex-1">
              <div
                className={`w-8 h-8 flex items-center justify-center text-sm font-semibold shrink-0 ${
                  step >= s.id
                    ? "bg-white text-black"
                    : "bg-white/10 text-white/30"
                }`}
              >
                {step > s.id ? <Check className="w-4 h-4" /> : s.id}
              </div>
              <span
                className={`text-xs font-medium hidden sm:block ${
                  step === s.id ? "text-white" : "text-white/30"
                }`}
              >
                {s.label}
              </span>
              {i < steps.length - 1 && (
                <div
                  className={`flex-1 h-0.5 ${
                    step > s.id ? "bg-white" : "bg-white/10"
                  }`}
                />
              )}
            </div>
          ))}
        </div>

        {error && (
          <div className="mb-5 flex items-start gap-2 bg-white/5 border border-white/15 text-white/80 text-sm rounded-lg px-4 py-3">
            <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {step === 1 && (
          <div className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-white/70 mb-1.5">
                What do you call a class group?
              </label>
              <input
                value={form.classLabel}
                onChange={(e) =>
                  setForm({ ...form, classLabel: e.target.value })
                }
                placeholder="Grade, Level, Cohort…"
                className={inputClass}
              />
              <p className="text-xs text-white/35 mt-1">
                Examples: Grade (K-12), Level (university), Cohort (bootcamp)
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-white/70 mb-1.5">
                Add your {form.classLabel.toLowerCase() || "classes"}
              </label>
              <TagInput
                variant="dark"
                values={form.classes}
                onChange={(classes) => setForm({ ...form, classes })}
                placeholder="Type a name and press Enter"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-white/70 mb-1.5">
                Subjects / courses
              </label>
              <TagInput
                variant="dark"
                values={form.subjects}
                onChange={(subjects) => setForm({ ...form, subjects })}
                placeholder="e.g. Mathematics, English, Physics"
              />
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-white/70 mb-1.5">
                Institution logo
              </label>
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-xl border border-white/15 bg-white/5 overflow-hidden flex items-center justify-center">
                  {form.logoUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={form.logoUrl}
                      alt="Logo"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <Upload className="w-5 h-5 text-white/40" />
                  )}
                </div>
                <label className="cursor-pointer">
                  <span className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-white/15 text-sm font-medium text-white/70 hover:bg-white/5">
                    {uploading ? "Uploading…" : "Upload image"}
                  </span>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    disabled={uploading}
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) void handleLogo(file);
                    }}
                  />
                </label>
              </div>
              <p className="text-xs text-white/35 mt-2">
                Optional. Requires Cloudinary env vars. You can skip this.
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-white/70 mb-1.5">
                Sidebar color
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={form.primaryColor}
                  onChange={(e) =>
                    setForm({ ...form, primaryColor: e.target.value })
                  }
                  className="w-12 h-10 border border-white/15 cursor-pointer bg-transparent"
                />
                <input
                  value={form.primaryColor}
                  onChange={(e) =>
                    setForm({ ...form, primaryColor: e.target.value })
                  }
                  className={inputClass}
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-white/70 mb-1.5">
                Accent color
              </label>
              <p className="text-xs text-white/35 mb-2">
                Buttons and links in the workspace. Sidebar stays the color above.
              </p>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={form.accentColor}
                  onChange={(e) =>
                    setForm({ ...form, accentColor: e.target.value })
                  }
                  className="w-12 h-10 border border-white/15 cursor-pointer bg-transparent"
                />
                <input
                  value={form.accentColor}
                  onChange={(e) =>
                    setForm({ ...form, accentColor: e.target.value })
                  }
                  className={inputClass}
                />
              </div>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-white/70 mb-1.5">
                Invite teachers by email
              </label>
              <textarea
                rows={5}
                value={form.inviteEmails}
                onChange={(e) =>
                  setForm({ ...form, inviteEmails: e.target.value })
                }
                placeholder="one@school.edu, two@school.edu"
                className={inputClass}
              />
              <p className="text-xs text-white/35 mt-1">
                Optional. Separate emails with commas. They can join with code{" "}
                <span className="font-mono font-semibold text-white">
                  {institution.code}
                </span>{" "}
                or your school URL.
              </p>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-xl p-4 text-sm text-white/70">
              Students and teachers can also join later with your code{" "}
              <strong className="font-mono tracking-widest text-white">
                {institution.code}
              </strong>
              . You start on the Free plan (30 students, 3 teachers) and can
              upgrade anytime from Billing.
            </div>
          </div>
        )}

        <div className="flex gap-3 pt-8">
          {step > 1 && (
            <Button
              type="button"
              variant="ghost"
              onClick={() => setStep(step - 1)}
              disabled={saving}
              className="flex-1 text-white/70 hover:bg-white/10"
            >
              Back
            </Button>
          )}
          {step < 3 ? (
            <Button
              type="button"
              variant="inverse"
              onClick={() => setStep(step + 1)}
              className="flex-1"
            >
              Continue <ArrowRight className="w-4 h-4" />
            </Button>
          ) : (
            <Button
              type="button"
              variant="inverse"
              loading={saving}
              onClick={() => void finish()}
              className="flex-1"
            >
              Go to dashboard
            </Button>
          )}
        </div>
      </AuthCard>
    </AuthFrame>
  );
}
