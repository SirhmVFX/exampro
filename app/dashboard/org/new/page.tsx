"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AlertCircle, ArrowRight } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { createAdditionalInstitution } from "@/lib/db";
import type { Institution } from "@/lib/types";
import { Button } from "@/app/components/ui/button";
import { AuthCard, AuthFrame, darkInput } from "@/app/components/marketing/auth-frame";

const INSTITUTION_TYPES: { value: Institution["type"]; label: string }[] = [
  { value: "k12", label: "Primary / secondary school" },
  { value: "university", label: "University / college" },
  { value: "training", label: "Bootcamp / training centre" },
  { value: "corporate", label: "Corporate / L&D" },
  { value: "tutoring", label: "Tutoring centre" },
  { value: "faith", label: "Faith / community education" },
  { value: "language", label: "Language school" },
  { value: "professional", label: "Professional / exam body" },
  { value: "other", label: "Other" },
];

export default function NewOrgPage() {
  const router = useRouter();
  const { firebaseUser, profile, loading, refresh } = useAuth();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    name: "",
    type: "" as "" | Institution["type"],
    country: "",
    phone: "",
    website: "",
  });

  useEffect(() => {
    if (loading) return;
    if (!firebaseUser || !profile) router.replace("/auth/login?next=/dashboard/org/new");
  }, [loading, firebaseUser, profile, router]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile || !form.type) return;
    setError("");
    setSaving(true);
    try {
      await createAdditionalInstitution({
        admin: profile,
        name: form.name.trim(),
        type: form.type,
        country: form.country.trim() || undefined,
        phone: form.phone.trim() || undefined,
        website: form.website.trim() || undefined,
      });
      await refresh();
      router.replace("/onboarding");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't create that institution.");
      setSaving(false);
    }
  };

  if (loading || !profile) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-white/20 border-t-white rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <AuthFrame>
      <AuthCard>
        <h1 className="text-2xl font-semibold tracking-tight mb-1">
          Add another institution
        </h1>
        <p className="text-white/45 text-sm mb-8">
          You stay signed in as {profile.name}. This workspace is separate — people,
          billing, and content do not mix with your other institutions.
        </p>
        {error && (
          <div className="mb-5 flex items-start gap-2 bg-white/5 border border-white/15 text-white/80 text-sm px-4 py-3">
            <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
            <span>{error}</span>
          </div>
        )}
        <form onSubmit={submit} className="space-y-4">
          <input
            required
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className={darkInput}
            placeholder="Institution name"
          />
          <select
            required
            value={form.type}
            onChange={(e) =>
              setForm({ ...form, type: e.target.value as Institution["type"] })
            }
            className={`${darkInput} bg-zinc-950`}
          >
            <option value="">Institution type</option>
            {INSTITUTION_TYPES.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </select>
          <input
            required
            value={form.country}
            onChange={(e) => setForm({ ...form, country: e.target.value })}
            className={darkInput}
            placeholder="Country"
          />
          <input
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
            className={darkInput}
            placeholder="Phone (optional)"
          />
          <input
            value={form.website}
            onChange={(e) => setForm({ ...form, website: e.target.value })}
            className={darkInput}
            placeholder="Website (optional)"
          />
          <Button type="submit" variant="inverse" fullWidth loading={saving}>
            Create workspace <ArrowRight className="w-4 h-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            className="w-full text-white/60"
            onClick={() => router.back()}
          >
            Cancel
          </Button>
        </form>
      </AuthCard>
    </AuthFrame>
  );
}
