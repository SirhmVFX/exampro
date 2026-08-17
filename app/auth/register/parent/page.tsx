"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/lib/firebase";
import {
  acceptInvite,
  createUserProfile,
  getInstitutionByCode,
  getPendingInviteByEmail,
  getMembership,
  joinInstitution,
} from "@/lib/db";
import { Button } from "@/app/components/ui/button";
import { AuthCard, AuthFrame, darkInput } from "@/app/components/marketing/auth-frame";
import { useAuth } from "@/lib/auth-context";
import { SsoButtons } from "@/app/components/auth/sso-buttons";

function ParentRegisterForm() {
  const router = useRouter();
  const { refresh, firebaseUser, profile, switchOrg } = useAuth();
  const params = useSearchParams();
  const [code, setCode] = useState((params.get("code") ?? "").toUpperCase());
  const [form, setForm] = useState({ name: "", email: "", password: "", childEmail: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const inst = await getInstitutionByCode(code);
      if (!inst) {
        setError("No institution found with that code.");
        setLoading(false);
        return;
      }
      if (firebaseUser && profile) {
        const already = await getMembership(profile.uid, inst.id);
        if (already) {
          await switchOrg(inst.id);
          router.replace("/dashboard/parent");
          return;
        }
        await joinInstitution({
          user: profile,
          institution: inst,
          role: "parent",
        });
      } else {
        const cred = await createUserWithEmailAndPassword(
          auth,
          form.email.trim(),
          form.password
        );
        await createUserProfile({
          uid: cred.user.uid,
          institutionId: inst.id,
          role: "parent",
          name: form.name.trim(),
          email: form.email.trim(),
          status: "active",
          linkedStudentIds: [],
          createdAt: Date.now(),
        });
      }
      const invite = await getPendingInviteByEmail(inst.id, (profile?.email || form.email).trim());
      if (invite) await acceptInvite(invite.id);
      await refresh();
      router.replace("/dashboard/parent");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Couldn't join that institution. Try a different email."
      );
      setLoading(false);
    }
  };

  return (
    <AuthCard>
      <h1 className="text-2xl font-semibold mb-1">Parent / guardian</h1>
      <p className="text-sm text-white/45 mb-6">
        Read-only results and upcoming exams. Use the school join code.
      </p>
      {error && <p className="text-sm text-red-400 mb-4">{error}</p>}
      <form onSubmit={submit} className="space-y-4">
        <input
          required
          value={code}
          onChange={(e) => setCode(e.target.value.toUpperCase().slice(0, 6))}
          className={`${darkInput} font-mono tracking-[0.3em] text-center`}
          placeholder="JOIN CODE"
        />
        {!firebaseUser && (
          <>
        <input
          required
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          className={darkInput}
          placeholder="Your name"
        />
        <input
          required
          type="email"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          className={darkInput}
          placeholder="Email"
        />
        <input
          required
          type="password"
          minLength={8}
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
          className={darkInput}
          placeholder="Password"
        />
          </>
        )}
        <Button type="submit" variant="inverse" fullWidth loading={loading}>
          {firebaseUser ? "Join institution" : "Create account"}
        </Button>
      </form>
      <div className="my-5 h-px bg-white/10" />
      <SsoButtons
        onError={setError}
        onSuccess={async () => {
          await refresh();
          router.replace("/dashboard/parent");
        }}
      />
      <p className="mt-6 text-center text-sm text-white/40">
        <Link href={`/auth/login?next=${encodeURIComponent(`/auth/join?role=parent&code=${code}`)}`} className="text-white underline">
          Sign in
        </Link>
      </p>
    </AuthCard>
  );
}

export default function ParentRegisterPage() {
  return (
    <AuthFrame>
      <Suspense>
        <ParentRegisterForm />
      </Suspense>
    </AuthFrame>
  );
}
