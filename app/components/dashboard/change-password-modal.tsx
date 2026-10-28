"use client";

import { useState } from "react";
import {
  EmailAuthProvider,
  reauthenticateWithCredential,
  updatePassword,
} from "firebase/auth";
import { AlertCircle, KeyRound } from "lucide-react";
import { Modal } from "@/app/components/ui/modal";
import { Button } from "@/app/components/ui/button";
import { inputClass } from "@/lib/utils";
import { auth } from "@/lib/firebase";
import toast from "react-hot-toast";

interface ChangePasswordModalProps {
  open: boolean;
  onClose: () => void;
}

export function ChangePasswordModal({ open, onClose }: ChangePasswordModalProps) {
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const user = auth.currentUser;
  // Detect SSO users (no password provider)
  const hasPassword = user?.providerData.some((p) => p.providerId === "password");

  const reset = () => {
    setCurrent("");
    setNext("");
    setConfirm("");
    setError("");
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const save = async () => {
    setError("");
    if (next.length < 6) {
      setError("New password must be at least 6 characters.");
      return;
    }
    if (next !== confirm) {
      setError("Passwords don't match.");
      return;
    }
    if (!user || !user.email) {
      setError("No user signed in.");
      return;
    }
    setSaving(true);
    try {
      const credential = EmailAuthProvider.credential(user.email, current);
      await reauthenticateWithCredential(user, credential);
      await updatePassword(user, next);
      toast.success("Password updated successfully.");
      handleClose();
    } catch (e: unknown) {
      const code = (e as { code?: string }).code;
      if (code === "auth/wrong-password" || code === "auth/invalid-credential") {
        setError("Current password is incorrect.");
      } else if (code === "auth/requires-recent-login") {
        setError("Please log out and log back in, then try again.");
      } else {
        setError("Failed to update password. Please try again.");
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title="Change password"
      footer={
        hasPassword ? (
          <>
            <Button variant="ghost" onClick={handleClose} disabled={saving}>
              Cancel
            </Button>
            <Button loading={saving} onClick={() => void save()}>
              <KeyRound className="w-4 h-4" /> Update password
            </Button>
          </>
        ) : (
          <Button variant="ghost" onClick={handleClose}>
            Close
          </Button>
        )
      }
    >
      {!hasPassword ? (
        <p className="text-sm text-[var(--dash-text-muted)]">
          Your account uses Google / social login. Password changes are managed through your identity provider.
        </p>
      ) : (
        <div className="space-y-4">
          {error && (
            <div className="flex items-start gap-2 bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3">
              <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
              {error}
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-[var(--dash-text)] mb-1.5">
              Current password
            </label>
            <input
              type="password"
              value={current}
              onChange={(e) => setCurrent(e.target.value)}
              className={inputClass}
              placeholder="••••••••"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-[var(--dash-text)] mb-1.5">
              New password
            </label>
            <input
              type="password"
              value={next}
              onChange={(e) => setNext(e.target.value)}
              className={inputClass}
              placeholder="Min 6 characters"
              minLength={6}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-[var(--dash-text)] mb-1.5">
              Confirm new password
            </label>
            <input
              type="password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              className={inputClass}
              placeholder="••••••••"
            />
          </div>
        </div>
      )}
    </Modal>
  );
}
