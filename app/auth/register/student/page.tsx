"use client";

import Link from "next/link";
import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Check,
  ChevronRight,
  AlertCircle,
  Building2,
} from "lucide-react";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { FirebaseError } from "firebase/app";
import { auth } from "@/lib/firebase";
import { getInstitutionByCode, getInstitutionBySlug, createUserProfile, listUsers, getPendingInviteByEmail, acceptInvite, enrollLearner, updateUserProfile, getMembership, joinInstitution } from "@/lib/db";
import { getPlan, planAllows } from "@/lib/plans";
import type { Institution } from "@/lib/types";
import { Button } from "@/app/components/ui/button";
import { AuthCard, AuthFrame, darkInput, PasswordToggle } from "@/app/components/marketing/auth-frame";
import { useAuth } from "@/lib/auth-context";
import { canSelfJoin, joinRequiresCode } from "@/lib/join-policy";
import { vocab } from "@/lib/vocab";

function friendlyAuthError(err: unknown): string {
  if (err instanceof FirebaseError) {
    switch (err.code) {
      case "auth/email-already-in-use":
        return "An account with this email already exists. Sign in, then join this school from the sidebar.";
      case "auth/invalid-email":
        return "That email address doesn't look right.";
      case "auth/weak-password":
        return "Password is too weak. Use at least 8 characters.";
      case "auth/network-request-failed":
        return "Network error. Check your connection and try again.";
    }
  }
  return "Something went wrong creating your account. Please try again.";
}

const inputClass = darkInput;

function StudentRegisterForm() {
  const router = useRouter();
  const { refresh, firebaseUser, profile, switchOrg } = useAuth();
  const searchParams = useSearchParams();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [code, setCode] = useState(
    (searchParams.get("code") ?? "").toUpperCase().slice(0, 6)
  );
  const [institution, setInstitution] = useState<Institution | null>(null);
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    className: "",
    classNames: [] as string[],
  });

  useEffect(() => {
    const school = searchParams.get("school");
    if (!school) return;
    let cancelled = false;
    (async () => {
      const inst = await getInstitutionBySlug(school);
      if (cancelled || !inst) return;
      setInstitution(inst);
      setCode(inst.code);
      if (!joinRequiresCode(inst) || inst.joinMode === "open") {
        setStep(2);
      } else {
        setStep(2);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [searchParams]);

  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const inst = await getInstitutionByCode(code);
      if (!inst) {
        setError(
          "No institution found with that code. Double-check it with your school."
        );
        return;
      }
      setInstitution(inst);
      setStep(2);
    } catch {
      setError("Couldn't verify the code. Check your connection and try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!institution) return;
    setError("");
    setLoading(true);
    try {
      const email = (profile?.email || form.email).trim().toLowerCase();
      if (profile && firebaseUser) {
        const already = await getMembership(profile.uid, institution.id);
        if (already) {
          await switchOrg(institution.id);
          router.replace("/dashboard/student");
          return;
        }
      }
      const invite = await getPendingInviteByEmail(institution.id, email);
      const gate = canSelfJoin(institution, {
        email,
        hasInvite: Boolean(invite),
      });
      if (!gate.ok) {
        setError(gate.reason ?? "You cannot join this institution.");
        setLoading(false);
        return;
      }
      const classNames =
        form.classNames.length > 0
          ? form.classNames
          : form.className
            ? [form.className]
            : invite?.classNames?.length
              ? invite.classNames
              : invite?.className
                ? [invite.className]
                : [];
      const students = await listUsers(institution.id, "student");
      const allowed = planAllows(getPlan(institution.plan), {
        students: students.length,
      });
      if (!allowed.students) {
        setError(
          "This institution has reached its student limit on the current plan. Ask your admin to upgrade."
        );
        setLoading(false);
        return;
      }
      const uid = firebaseUser
        ? firebaseUser.uid
        : await (async () => {
          const cred = await createUserWithEmailAndPassword(
            auth,
            form.email.trim(),
            form.password
          );
          // Force token propagation before Firestore writes
          await cred.user.getIdToken(true);
          return cred.user.uid;
        })();
      if (profile && firebaseUser) {
        await joinInstitution({
          user: profile,
          institution,
          role: "student",
          classNames,
        });
      } else {
        await createUserProfile({
          uid,
          institutionId: institution.id,
          role: "student",
          name: form.name.trim(),
          email: form.email.trim(),
          className: classNames[0],
          classNames,
          status: "active",
          createdAt: Date.now(),
        });
      }
      const enrolledNames: string[] = [];
      for (const c of classNames) {
        const en = await enrollLearner({
          institutionId: institution.id,
          user: { uid, name: (profile?.name || form.name).trim() },
          className: c,
        });
        if (en.status === "active") enrolledNames.push(c);
      }
      if (enrolledNames.length && enrolledNames.join() !== classNames.join()) {
        await updateUserProfile(uid, {
          classNames: enrolledNames,
          className: enrolledNames[0],
        });
      }
      if (invite) await acceptInvite(invite.id);
      await refresh();
      router.replace("/dashboard/student");
    } catch (err) {
      setError(
        err instanceof FirebaseError
          ? friendlyAuthError(err)
          : err instanceof Error
            ? err.message
            : friendlyAuthError(err)
      );
      setLoading(false);
    }
  };

  return (
    <AuthCard>
      {/* Step indicator */}
      <div className="flex items-center gap-3 mb-6">
        {[
          { id: 1, label: "Join code" },
          { id: 2, label: "Your details" },
        ].map((s, i) => (
          <div key={s.id} className="flex items-center gap-2 flex-1">
            <div
              className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold shrink-0 ${step > s.id
                ? "bg-white text-black"
                : step === s.id
                  ? "bg-white text-black"
                  : "bg-white/10 text-white/30"
                }`}
            >
              {step > s.id ? <Check className="w-3.5 h-3.5" /> : s.id}
            </div>
            <span
              className={`text-xs font-medium ${step === s.id ? "text-white" : "text-white/30"
                }`}
            >
              {s.label}
            </span>
            {i === 0 && (
              <div
                className={`flex-1 h-0.5 ${step > 1 ? "bg-white" : "bg-white/10"
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
        <form onSubmit={handleVerifyCode} className="space-y-5">
          <div>
            <h1 className="text-xl font-bold text-white mb-1">
              Join your institution
            </h1>
            <p className="text-sm text-white/45 mb-5">
              Enter the 6-character join code your school gave you.
            </p>
            <label className="block text-sm font-medium text-white/70 mb-1.5">
              Institution join code
            </label>
            <input
              type="text"
              required
              minLength={6}
              maxLength={6}
              value={code}
              onChange={(e) =>
                setCode(
                  e.target.value
                    .toUpperCase()
                    .replace(/[^A-Z0-9]/g, "")
                    .slice(0, 6)
                )
              }
              placeholder="ABC123"
              className={`${inputClass} font-mono tracking-[0.3em] text-center text-lg uppercase`}
            />
          </div>
          <Button
            type="submit"
            fullWidth
            size="lg"
            variant="inverse"
            loading={loading}
            disabled={code.length !== 6}
          >
            Verify code <ChevronRight className="w-4 h-4" />
          </Button>
        </form>
      )}

      {step === 2 && institution && (
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-xl px-4 py-3">
            <div className="w-9 h-9 border border-white/20 rounded-lg flex items-center justify-center shrink-0">
              <Building2 className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-sm font-semibold text-white">
                {institution.name}
              </p>
              <p className="text-xs text-white/45">
                You&apos;re joining as a student
              </p>
            </div>
          </div>

          <h1 className="text-xl font-bold text-white">
            {firebaseUser ? "Join as a student" : "Create your student account"}
          </h1>

          {!firebaseUser && (
            <>
              <div>
                <label className="block text-sm font-medium text-white/70 mb-1.5">
                  Full name
                </label>
                <input
                  type="text"
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="Jane Smith"
                  className={inputClass}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-white/70 mb-1.5">
                  Email address
                </label>
                <input
                  type="email"
                  required
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder="jane@example.com"
                  className={inputClass}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-white/70 mb-1.5">
                  Password
                </label>
                <PasswordToggle
                  value={form.password}
                  onChange={(v) => setForm({ ...form, password: v })}
                />
              </div>
            </>
          )}

          <div>
            <label className="block text-sm font-medium text-white/70 mb-1.5">
              {institution.classLabel || vocab(institution).class}
              {" "}(you can join more than one)
            </label>
            {institution.classes.length > 0 ? (
              <div className="space-y-2 max-h-40 overflow-y-auto border border-white/10 p-3">
                {institution.classes.map((c) => (
                  <label key={c} className="flex items-center gap-2 text-sm text-white/80">
                    <input
                      type="checkbox"
                      checked={form.classNames.includes(c)}
                      onChange={() =>
                        setForm((prev) => ({
                          ...prev,
                          classNames: prev.classNames.includes(c)
                            ? prev.classNames.filter((x) => x !== c)
                            : [...prev.classNames, c],
                          className: prev.classNames.includes(c)
                            ? prev.classNames.filter((x) => x !== c)[0] ?? ""
                            : prev.className || c,
                        }))
                      }
                    />
                    {c}
                  </label>
                ))}
              </div>
            ) : (
              <input
                type="text"
                required
                value={form.className}
                onChange={(e) =>
                  setForm({
                    ...form,
                    className: e.target.value,
                    classNames: e.target.value ? [e.target.value] : [],
                  })
                }
                placeholder={`e.g. ${institution.classLabel || "Class"} 1`}
                className={inputClass}
              />
            )}
          </div>

          <div className="flex gap-3">
            <Button
              type="button"
              variant="ghost"
              className="flex-1 text-white/70 hover:bg-white/10"
              onClick={() => {
                setStep(1);
                setError("");
              }}
              disabled={loading}
            >
              Back
            </Button>
            <Button type="submit" variant="inverse" loading={loading} className="flex-1">
              {firebaseUser ? "Join institution" : "Create Account"}
            </Button>
          </div>
        </form>
      )}

      <p className="mt-6 text-center text-sm text-white/40">
        Already have an account?{" "}
        <Link
          href={`/auth/login?next=${encodeURIComponent(`/auth/join?role=student&code=${code}`)}`}
          className="text-white font-medium hover:underline"
        >
          Sign in to join another school
        </Link>
      </p>
    </AuthCard>
  );
}

export default function StudentRegisterPage() {
  return (
    <AuthFrame>
      <Suspense
        fallback={
          <div className="w-10 h-10 border-4 border-white/20 border-t-white rounded-full animate-spin" />
        }
      >
        <StudentRegisterForm />
      </Suspense>
    </AuthFrame>
  );
}
