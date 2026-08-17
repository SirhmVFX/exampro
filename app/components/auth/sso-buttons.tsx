"use client";

import { useState } from "react";
import {
  GoogleAuthProvider,
  OAuthProvider,
  signInWithPopup,
  type User,
} from "firebase/auth";
import { auth } from "@/lib/firebase";
import {
  acceptInvite,
  createUserProfile,
  enrollLearner,
  ensureMembership,
  getPendingInviteAnywhere,
  waitForUserProfile,
} from "@/lib/db";
import type { UserProfile } from "@/lib/types";

export async function completeSsoProfile(user: User): Promise<UserProfile | null> {
  const existing = await waitForUserProfile(user.uid, 4, 200);
  if (existing) {
    await ensureMembership(existing);
    return existing;
  }
  const email = user.email?.toLowerCase();
  if (!email) return null;
  const invite = await getPendingInviteAnywhere(email);
  if (!invite) return null;
  const classNames = invite.classNames?.length
    ? invite.classNames
    : invite.className
      ? [invite.className]
      : [];
  const profile: UserProfile = {
    uid: user.uid,
    institutionId: invite.institutionId,
    role: invite.role === "parent" || invite.role === "manager" ? invite.role : invite.role,
    name: invite.name || user.displayName || email.split("@")[0],
    email,
    status: "active",
    className: classNames[0],
    classNames,
    externalId: invite.externalId,
    createdAt: Date.now(),
  };
  await createUserProfile(profile);
  if (profile.role === "student") {
    for (const c of classNames) {
      await enrollLearner({
        institutionId: invite.institutionId,
        user: profile,
        className: c,
      });
    }
  }
  await acceptInvite(invite.id);
  return profile;
}

export function SsoButtons({
  onSuccess,
  onError,
  disabled,
}: {
  onSuccess: (profile: UserProfile, user: User) => void;
  onError: (message: string) => void;
  disabled?: boolean;
}) {
  const [busy, setBusy] = useState<"google" | "microsoft" | null>(null);

  const run = async (which: "google" | "microsoft") => {
    setBusy(which);
    try {
      const provider =
        which === "google"
          ? new GoogleAuthProvider()
          : new OAuthProvider("microsoft.com");
      const cred = await signInWithPopup(auth, provider);
      const profile = await completeSsoProfile(cred.user);
      if (!profile) {
        onError(
          "No ExamPro account for this email. Ask your admin to invite or import you first, then try again."
        );
        return;
      }
      onSuccess(profile, cred.user);
    } catch (e) {
      const code = typeof e === "object" && e && "code" in e ? String((e as { code: string }).code) : "";
      if (code.includes("popup-closed")) {
        onError("Sign-in was cancelled.");
      } else if (code.includes("unauthorized-domain")) {
        onError("This domain is not authorized in Firebase Auth. Add it in the Firebase console.");
      } else {
        onError("Could not sign in with that provider. Enable it in Firebase Authentication.");
      }
    } finally {
      setBusy(null);
    }
  };

  return (
    <div className="space-y-2">
      <button
        type="button"
        disabled={disabled || Boolean(busy)}
        onClick={() => void run("google")}
        className="w-full py-2.5 text-sm font-medium border border-white/15 hover:bg-white/5 disabled:opacity-50"
      >
        {busy === "google" ? "Connecting…" : "Continue with Google"}
      </button>
      <button
        type="button"
        disabled={disabled || Boolean(busy)}
        onClick={() => void run("microsoft")}
        className="w-full py-2.5 text-sm font-medium border border-white/15 hover:bg-white/5 disabled:opacity-50"
      >
        {busy === "microsoft" ? "Connecting…" : "Continue with Microsoft"}
      </button>
    </div>
  );
}
