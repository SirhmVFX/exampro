"use client";

import Link from "next/link";
import { ShieldOff } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/app/components/ui/button";
import { AuthCard, AuthFrame } from "@/app/components/marketing/auth-frame";

export default function SuspendedPage() {
  const { logout } = useAuth();

  return (
    <AuthFrame>
      <AuthCard>
        <div className="text-center">
          <div className="w-14 h-14 border border-white/20 flex items-center justify-center mx-auto mb-4">
            <ShieldOff className="w-7 h-7" />
          </div>
          <h1 className="text-xl font-semibold mb-2">Account suspended</h1>
          <p className="text-sm text-white/45 mb-6">
            Your access has been paused by your institution administrator.
            Contact them if you believe this is a mistake.
          </p>
          <div className="flex flex-col gap-2">
            <Button
              variant="inverse"
              onClick={async () => {
                await logout();
              }}
            >
              Sign out
            </Button>
            <Link href="/auth/login" className="text-sm text-white/40 hover:text-white">
              Back to sign in
            </Link>
          </div>
        </div>
      </AuthCard>
    </AuthFrame>
  );
}
