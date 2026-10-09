"use client";

import { useState } from "react";
import { AlertCircle, CheckCircle } from "lucide-react";
import { sendPasswordResetEmail } from "firebase/auth";
import { FirebaseError } from "firebase/app";
import { auth } from "@/lib/firebase";
import { Button } from "@/app/components/ui/button";
import { AuthCard, AuthFrame, darkInput } from "@/app/components/marketing/auth-frame";
import Link from "next/link";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await sendPasswordResetEmail(auth, email.trim());
      setSent(true);
    } catch (err) {
      if (err instanceof FirebaseError && err.code === "auth/user-not-found") {
        setSent(true);
      } else if (err instanceof FirebaseError && err.code === "auth/invalid-email") {
        setError("That email address doesn't look right.");
      } else {
        setError("Couldn't send the reset email. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthFrame>
      <AuthCard>
        {sent ? (
          <div className="text-center py-4">
            <div className="w-12 h-12 rounded-2xl border border-white/20 flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-6 h-6" />
            </div>
            <h1 className="text-xl font-semibold mb-2">Check your inbox</h1>
            <p className="text-sm text-white/45">
              If an account exists for {email}, we sent a reset link.
            </p>
            <Link href="/auth/login" className="inline-block mt-6 text-sm text-white/50 hover:text-white">
              Back to sign in
            </Link>
          </div>
        ) : (
          <>
            <h1 className="text-2xl font-semibold tracking-tight mb-1">
              Reset your password
            </h1>
            <p className="text-white/45 text-sm mb-8">
              Enter the email you use to sign in.
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
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@institution.com"
                  className={darkInput}
                />
              </div>
              <Button type="submit" variant="inverse" fullWidth size="lg" loading={loading}>
                Send reset link
              </Button>
            </form>
          </>
        )}
      </AuthCard>
    </AuthFrame>
  );
}
