"use client";

// Shared authenticated dashboard chrome: role guard + sidebar + topbar.
// Redirects to login when signed out, to the correct dashboard when the role
// doesn't match, and to onboarding when an admin hasn't finished setup.

import { ReactNode, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth, dashboardPathForRole } from "@/lib/auth-context";
import { institutionThemeVars } from "@/lib/theme";
import DashboardSidebar, { NavItem } from "./sidebar";
import DashboardTopbar from "./topbar";
import { navFor } from "./nav";
import type { Role } from "@/lib/types";

export default function DashboardShell({
  role,
  title,
  subtitle,
  children,
}: {
  role: Role;
  navItems?: NavItem[];
  title: string;
  subtitle?: string;
  children: ReactNode;
}) {
  const { firebaseUser, profile, institution, loading } = useAuth();
  const router = useRouter();
  const items = navFor(role, institution);

  useEffect(() => {
    if (loading) return;
    if (!firebaseUser || !profile) {
      router.replace("/auth/login");
      return;
    }
    if (profile.role !== role) {
      router.replace(dashboardPathForRole(profile.role));
      return;
    }
    if (profile.role === "admin" && institution && !institution.onboarded) {
      router.replace("/onboarding");
      return;
    }
    if (profile.status === "suspended") {
      router.replace("/auth/suspended");
    }
  }, [loading, firebaseUser, profile, institution, role, router]);

  if (loading || !profile || profile.role !== role) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-black/15 border-t-black rounded-full animate-spin" />
          <p className="text-sm text-gray-500">Loading your workspace…</p>
        </div>
      </div>
    );
  }

  return (
    <div
      className="dash flex min-h-screen bg-white text-gray-900"
      style={institutionThemeVars(
        institution?.primaryColor,
        institution?.accentColor
      )}
    >
      <DashboardSidebar
        navItems={items}
        role={role}
        institutionName={institution?.name ?? "ExamPro"}
        logoUrl={institution?.logoUrl}
        userName={profile.name}
      />
      <div className="flex-1 flex flex-col min-w-0 bg-white">
        <DashboardTopbar title={title} subtitle={subtitle} />
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  );
}
