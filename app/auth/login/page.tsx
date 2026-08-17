"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, AlertCircle } from "lucide-react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { FirebaseError } from "firebase/app";
import { auth } from "@/lib/firebase";
import { getInstitution, waitForUserProfile } from "@/lib/db";
import { postAuthPath, useAuth } from "@/lib/auth-context";
import { Button } from "@/app/components/ui/button";
import { AuthCard, AuthFrame, darkInput } from "@/app/components/marketing/auth-frame";
import { SsoButtons } from "@/app/components/auth/sso-buttons";

function friendlyAuthError(err: unknown): string {
  if (err instanceof FirebaseError) {
    switch (err.code) {
      case "auth/wrong-password":
      case "auth/invalid-credential":
      case "auth/invalid-login-credentials":
        return "Incorrect email or password. Please try again.";
      case "auth/user-not-found":
        return "No account found with that email address.";
      case "auth/too-many-requests":
        return "Too many failed attempts. Please wait a moment and try again.";
      case "auth/invalid-email":
        return "That email address doesn't look right.";
      case "auth/user-disabled":
        return "This account has been disabled. Contact your administrator.";
      case "auth/network-request-failed":
        return "Network error. Check your connection and try again.";
    }
  }
  return "Something went wrong signing you in. Please try again.";
}

function safeNext(raw: string | null): string | null {
  if (!raw || !raw.startsWith("/") || raw.startsWith("//")) return null;
  return raw;
}

export default function LoginPage() {
  const router = useRouter();
  const { refresh } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({ email: "", password: "", remember: false });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const cred = await signInWithEmailAndPassword(
        auth,
        form.email.trim(),
        form.password
      );
      const profile = await waitForUserProfile(cred.user.uid);
      if (!profile) {
        setError(
          "Your account exists but has no profile. Contact your administrator."
        );
        setLoading(false);
        return;
      }
      const institution =
        profile.role === "admin"
          ? await getInstitution(profile.institutionId)
          : null;
      await refresh();
      const next = safeNext(
        typeof window !== "undefined"
          ? new URLSearchParams(window.location.search).get("next")
          : null
      );
      router.replace(next ?? postAuthPath(profile, institution));
    } catch (err) {
      setError(friendlyAuthError(err));
      setLoading(false);
    }
  };

  return (
    <AuthFrame>
      <AuthCard>
          <h1 className="text-2xl font-semibold tracking-tight mb-1">
            Welcome back
          </h1>
          <p className="text-white/45 text-sm mb-8">
            Sign in to your institution workspace
          </p>

          {error && (
            <div className="mb-5 flex items-start gap-2 bg-white/5 border border-white/15 text-white/80 text-sm rounded-lg px-4 py-3">
              <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-white/70 mb-1.5">
                Email address
              </label>
              <input
                type="email"
                required
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="you@institution.com"
                className={darkInput}
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-sm font-medium text-white/70">
                  Password
                </label>
                <Link
                  href="/auth/forgot-password"
                  className="text-xs text-white/40 hover:text-white"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={form.password}
                  onChange={(e) =>
                    setForm({ ...form, password: e.target.value })
                  }
                  placeholder="••••••••"
                  className={`${darkInput} pr-10`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="remember"
                checked={form.remember}
                onChange={(e) =>
                  setForm({ ...form, remember: e.target.checked })
                }
                className="w-4 h-4 rounded border-white/20 bg-white/5"
              />
              <label htmlFor="remember" className="text-sm text-white/45">
                Remember me for 30 days
              </label>
            </div>

            <Button type="submit" variant="inverse" fullWidth loading={loading} size="lg">
              Sign in
            </Button>
          </form>

          <div className="my-6 flex items-center gap-3 text-xs text-white/30">
            <div className="flex-1 h-px bg-white/10" />
            or
            <div className="flex-1 h-px bg-white/10" />
          </div>
          <SsoButtons
            disabled={loading}
            onError={setError}
            onSuccess={async (profile) => {
              const institution =
                profile.role === "admin"
                  ? await getInstitution(profile.institutionId)
                  : null;
              await refresh();
              const next = safeNext(
                typeof window !== "undefined"
                  ? new URLSearchParams(window.location.search).get("next")
                  : null
              );
              router.replace(next ?? postAuthPath(profile, institution));
            }}
          />

          <div className="mt-6 space-y-3 text-center text-sm text-white/40">
            <p>
              Don&apos;t have an account?{" "}
              <Link href="/auth/register/institution" className="text-white hover:underline">
                Register your institution
              </Link>
            </p>
            <p>
              Already on ExamPro?{" "}
              <Link href="/auth/join" className="text-white hover:underline">
                Join another institution
              </Link>
            </p>
            <p>
              <Link href="/auth/register/student" className="text-white hover:underline">
                Sign up
              </Link>
              {" · "}
              Teacher?{" "}
              <Link href="/auth/register/teacher" className="text-white hover:underline">
                Sign up
              </Link>
              {" · "}
              Parent?{" "}
              <Link href="/auth/register/parent" className="text-white hover:underline">
                Sign up
              </Link>
            </p>
          </div>
      </AuthCard>
    </AuthFrame>
  );
}
