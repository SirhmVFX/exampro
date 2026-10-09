"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Check, AlertCircle } from "lucide-react";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { FirebaseError } from "firebase/app";
import { auth } from "@/lib/firebase";
import {
  createInstitution,
  createUserProfile,
  newId,
  generateJoinCode,
  COL,
  allocateSlug,
} from "@/lib/db";
import type { Institution } from "@/lib/types";
import { defaultVocabulary } from "@/lib/vocab";
import { Button } from "@/app/components/ui/button";
import {
  AuthCard,
  AuthFrame,
  darkInput,
  PasswordToggle,
} from "@/app/components/marketing/auth-frame";
import { useAuth } from "@/lib/auth-context";

const steps = [
  { id: 1, label: "Your account" },
  { id: 2, label: "Institution" },
  { id: 3, label: "Review" },
];

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

function friendlyAuthError(err: unknown): string {
  if (err instanceof FirebaseError) {
    switch (err.code) {
      case "auth/email-already-in-use":
        return "An account with this email already exists. Try signing in instead.";
      case "auth/invalid-email":
        return "That email address doesn't look right.";
      case "auth/weak-password":
        return "Password is too weak. Use at least 8 characters.";
      case "auth/network-request-failed":
        return "Network error. Check your connection and try again.";
      case "auth/configuration-not-found":
      case "auth/internal-error":
        return "Firebase Authentication isn't fully set up. Go to Firebase Console → Authentication → Sign-in method and enable Email/Password.";
      case "auth/admin-restricted-operation":
        return "Sign-ups are restricted. Enable Email/Password in Firebase Console → Authentication → Sign-in method.";
    }
  }
  if (err instanceof Error) {
    if (err.message.includes("Missing or insufficient permissions")) {
      return "Account created but profile setup failed. Firestore rules may not be deployed yet — run: firebase deploy --only firestore:rules";
    }
    return err.message;
  }
  return "Something went wrong. Please try again or contact support if it persists.";
}

/** Auto-prefix https:// if the user typed a URL without a scheme */
function normaliseUrl(raw: string): string {
  const v = raw.trim();
  if (!v) return v;
  if (/^https?:\/\//i.test(v)) return v;
  return `https://${v}`;
}

export default function InstitutionRegisterPage() {
  const router = useRouter();
  const { refresh, firebaseUser, profile, loading: authLoading } = useAuth();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    institutionName: "",
    institutionType: "" as "" | Institution["type"],
    country: "",
    phone: "",
    website: "",
  });

  useEffect(() => {
    if (authLoading) return;
    if (firebaseUser && profile) router.replace("/dashboard/org/new");
  }, [authLoading, firebaseUser, profile, router]);

  const update = (field: string, value: string) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const typeLabel =
    INSTITUTION_TYPES.find((t) => t.value === form.institutionType)?.label ?? "—";

  const handleCreate = async () => {
    setError("");
    setLoading(true);
    try {
      const cred = await createUserWithEmailAndPassword(
        auth,
        form.email.trim(),
        form.password
      );
      const uid = cred.user.uid;

      // Force the SDK to attach the new auth token before any Firestore write.
      // Without this, the token hasn't propagated yet and rules block the write.
      await cred.user.getIdToken(true);

      const instId = newId(COL.institutions);
      const slug = await allocateSlug(form.institutionName.trim());
      await createInstitution({
        id: instId,
        name: form.institutionName.trim(),
        code: generateJoinCode(),
        slug,
        type: form.institutionType as Institution["type"],
        email: form.email.trim(),
        phone: form.phone.trim() || undefined,
        country: form.country.trim() || undefined,
        website: normaliseUrl(form.website) || undefined,
        classLabel: defaultVocabulary(form.institutionType as Institution["type"]).class,
        classes: [],
        subjects: [],
        vocabulary: defaultVocabulary(form.institutionType as Institution["type"]),
        joinMode: "code",
        adminId: uid,
        adminIds: [uid],
        onboarded: false,
        plan: "free",
        planStatus: "active",
        primaryColor: "#000000",
        accentColor: "#000000",
        aiGenerationsUsed: 0,
        trialEndsAt: Date.now() + 30 * 24 * 60 * 60 * 1000,
        createdAt: Date.now(),
      });
      await createUserProfile({
        uid,
        institutionId: instId,
        role: "admin",
        name: form.name.trim(),
        email: form.email.trim(),
        status: "active",
        createdAt: Date.now(),
      });
      await refresh();
      router.replace("/onboarding");
    } catch (err) {
      setError(friendlyAuthError(err));
      setLoading(false);
    }
  };

  const handleNext = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (step === 1) {
      if (form.password.length < 8) { setError("Password must be at least 8 characters."); return; }
      if (form.password !== form.confirmPassword) { setError("Passwords do not match."); return; }
      setStep(2);
    } else if (step === 2) {
      setStep(3);
    } else {
      void handleCreate();
    }
  };

  return (
    <AuthFrame>
      <AuthCard>
        <h1 className="text-2xl font-semibold tracking-tight mb-1">
          Register your institution
        </h1>
        <p className="text-white/45 text-sm mb-8">
          Set up your ExamPro workspace in 3 steps
        </p>

        {/* Step indicator */}
        <div className="flex items-center gap-2 mb-8">
          {steps.map((s, i) => (
            <div key={s.id} className="flex items-center gap-2 flex-1">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold shrink-0 transition-colors ${step >= s.id ? "bg-white text-black" : "bg-white/10 text-white/30"
                  }`}
              >
                {step > s.id ? <Check className="w-4 h-4" /> : s.id}
              </div>
              <span className={`text-xs font-medium ${step === s.id ? "text-white" : "text-white/30"}`}>
                {s.label}
              </span>
              {i < steps.length - 1 && (
                <div className={`flex-1 h-0.5 ${step > s.id ? "bg-white" : "bg-white/10"}`} />
              )}
            </div>
          ))}
        </div>

        {error && (
          <div className="mb-5 flex items-start gap-2 bg-red-500/10 border border-red-500/20 text-red-300 text-sm rounded-xl px-4 py-3">
            <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleNext} className="space-y-5">

          {/* ── Step 1: Account ─────────────────────────────────────────── */}
          {step === 1 && (
            <>
              <div>
                <label className="block text-sm font-medium text-white/70 mb-1.5">Full name</label>
                <input type="text" required value={form.name}
                  onChange={(e) => update("name", e.target.value)}
                  placeholder="John Doe" className={darkInput} />
              </div>
              <div>
                <label className="block text-sm font-medium text-white/70 mb-1.5">Work email</label>
                <input type="email" required value={form.email}
                  onChange={(e) => update("email", e.target.value)}
                  placeholder="admin@institution.com" className={darkInput} />
              </div>
              <div>
                <label className="block text-sm font-medium text-white/70 mb-1.5">Password</label>
                <PasswordToggle
                  value={form.password}
                  onChange={(v) => update("password", v)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-white/70 mb-1.5">Confirm password</label>
                <PasswordToggle
                  value={form.confirmPassword}
                  onChange={(v) => update("confirmPassword", v)}
                  placeholder="Re-enter your password"
                />
              </div>
            </>
          )}

          {/* ── Step 2: Institution ──────────────────────────────────────── */}
          {step === 2 && (
            <>
              <div>
                <label className="block text-sm font-medium text-white/70 mb-1.5">Institution name</label>
                <input type="text" required value={form.institutionName}
                  onChange={(e) => update("institutionName", e.target.value)}
                  placeholder="TechBridge Academy" className={darkInput} />
              </div>
              <div>
                <label className="block text-sm font-medium text-white/70 mb-1.5">Institution type</label>
                <select required value={form.institutionType}
                  onChange={(e) => update("institutionType", e.target.value)}
                  className={`${darkInput} bg-zinc-950`}>
                  <option value="">Select type</option>
                  {INSTITUTION_TYPES.map((t) => (
                    <option key={t.value} value={t.value}>{t.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-white/70 mb-1.5">Country</label>
                <input type="text" required value={form.country}
                  onChange={(e) => update("country", e.target.value)}
                  placeholder="Nigeria" className={darkInput} />
              </div>
              <div>
                <label className="block text-sm font-medium text-white/70 mb-1.5">
                  Phone <span className="text-white/30 font-normal">(optional)</span>
                </label>
                <input type="tel" value={form.phone}
                  onChange={(e) => update("phone", e.target.value)}
                  placeholder="+234 800 000 0000" className={darkInput} />
              </div>
              <div>
                <label className="block text-sm font-medium text-white/70 mb-1.5">
                  Website <span className="text-white/30 font-normal">(optional)</span>
                </label>
                {/* type="text" so bare domains like "myschool.com" are accepted */}
                <input type="text" value={form.website}
                  onChange={(e) => update("website", e.target.value)}
                  placeholder="myschool.com" className={darkInput} />
              </div>
            </>
          )}

          {/* ── Step 3: Review ───────────────────────────────────────────── */}
          {step === 3 && (
            <>
              <div className="bg-white/5 rounded-xl p-5 space-y-3">
                <h2 className="text-sm font-semibold text-white">Your account</h2>
                <dl className="space-y-1.5 text-sm">
                  <div className="flex justify-between gap-4">
                    <dt className="text-white/45">Admin name</dt>
                    <dd className="text-white font-medium text-right">{form.name}</dd>
                  </div>
                  <div className="flex justify-between gap-4">
                    <dt className="text-white/45">Email</dt>
                    <dd className="text-white font-medium text-right">{form.email}</dd>
                  </div>
                </dl>
                <div className="border-t border-white/10 pt-3">
                  <h2 className="text-sm font-semibold text-white mb-1.5">Institution</h2>
                  <dl className="space-y-1.5 text-sm">
                    <div className="flex justify-between gap-4">
                      <dt className="text-white/45">Name</dt>
                      <dd className="text-white font-medium text-right">{form.institutionName}</dd>
                    </div>
                    <div className="flex justify-between gap-4">
                      <dt className="text-white/45">Type</dt>
                      <dd className="text-white font-medium text-right">{typeLabel}</dd>
                    </div>
                    <div className="flex justify-between gap-4">
                      <dt className="text-white/45">Country</dt>
                      <dd className="text-white font-medium text-right">{form.country}</dd>
                    </div>
                    {form.phone && (
                      <div className="flex justify-between gap-4">
                        <dt className="text-white/45">Phone</dt>
                        <dd className="text-white font-medium text-right">{form.phone}</dd>
                      </div>
                    )}
                    {form.website && (
                      <div className="flex justify-between gap-4">
                        <dt className="text-white/45">Website</dt>
                        <dd className="text-white font-medium text-right truncate max-w-[200px]">
                          {normaliseUrl(form.website)}
                        </dd>
                      </div>
                    )}
                  </dl>
                </div>
              </div>
              <div className="bg-white/5 rounded-xl p-4 text-sm text-white/50">
                After creating your workspace you&apos;ll be guided through a quick setup
                to add your classes, subjects, and invite your teachers and students.
              </div>
            </>
          )}

          <div className="flex gap-3 pt-2">
            {step > 1 && (
              <Button type="button" variant="ghost"
                className="flex-1 text-white/70 hover:bg-white/10 rounded-xl"
                onClick={() => setStep(step - 1)} disabled={loading}>
                Back
              </Button>
            )}
            <Button type="submit" variant="inverse" loading={loading} className="flex-1 rounded-xl">
              {step < 3 ? <><span>Continue</span> <ArrowRight className="w-4 h-4" /></> : "Create Workspace"}
            </Button>
          </div>
        </form>

        <p className="mt-6 text-center text-sm text-white/40">
          Already have an account?{" "}
          <Link href="/auth/login" className="text-white font-medium hover:underline">
            Sign in
          </Link>
        </p>
      </AuthCard>
    </AuthFrame>
  );
}
