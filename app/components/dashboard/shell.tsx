"use client";

import { ReactNode, Suspense, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth, dashboardPathForRole } from "@/lib/auth-context";
import { institutionThemeVars } from "@/lib/theme";
import DashboardSidebar from "./sidebar";
import DashboardTopbar from "./topbar";
import { navFor } from "./nav";
import type { NavItem } from "./sidebar";
import type { Role } from "@/lib/types";
import { DashThemeProvider, useDashTheme } from "@/lib/dash-theme-context";

function ShellInner({
  role,
  allowed,
  title,
  subtitle,
  children,
}: {
  role: Role;
  allowed: Role[];
  title: string;
  subtitle?: string;
  children: ReactNode;
}) {
  const { firebaseUser, profile, institution, loading } = useAuth();
  const router = useRouter();
  // Sidebar always reflects the signed-in user's own role, so shared
  // workspaces (question bank, assessments) show admin nav for admins.
  const items = navFor(profile?.role ?? role, institution);
  const { theme } = useDashTheme();
  const isDark = theme === "dark";

  useEffect(() => {
    if (loading) return;
    if (!firebaseUser || !profile) {
      router.replace("/auth/login");
      return;
    }
    if (!allowed.includes(profile.role)) {
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
  }, [loading, firebaseUser, profile, institution, allowed, router]);

  if (loading || !profile || !allowed.includes(profile.role)) {
    return (
      <div
        className={`min-h-screen flex items-center justify-center ${isDark ? "bg-black" : "bg-zinc-50"}`}
      >
        <div className="flex flex-col items-center gap-3">
          <div
            className={`w-10 h-10 border-4 rounded-full animate-spin ${isDark ? "border-white/20 border-t-white" : "border-black/15 border-t-black"}`}
          />
          <p
            className={`text-sm ${isDark ? "text-white/50" : "text-zinc-500"}`}
          >
            Loading your workspace…
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`dash flex min-h-screen ${isDark ? "dash-dark bg-[var(--dash-bg)] text-[var(--dash-text)]" : "bg-[var(--dash-bg)] text-[var(--dash-text)]"}`}
      style={institutionThemeVars(
        institution?.primaryColor,
        institution?.accentColor,
      )}
    >
      <DashboardSidebar
        navItems={items}
        role={role}
        institutionName={institution?.name ?? "ExamPro"}
        logoUrl={institution?.logoUrl}
        userName={profile.name}
      />
      <div className="flex-1 flex flex-col min-w-0">
        <DashboardTopbar title={title} subtitle={subtitle} />
        <main className="flex-1 p-6 bg-[var(--dash-bg)]">{children}</main>
      </div>
    </div>
  );
}

export default function DashboardShell({
  role,
  allowRoles,
  title,
  subtitle,
  children,
}: {
  role: Role;
  /** Roles allowed on this page; defaults to just `role`. */
  allowRoles?: Role[];
  navItems?: NavItem[];
  title: string;
  subtitle?: string;
  children: ReactNode;
}) {
  const allowed = allowRoles ?? [role];
  return (
    <DashThemeProvider>
      {/* Suspense: the sidebar reads useSearchParams for query-string nav
          items (Quizzes / Tests / Exams tabs), which needs a boundary. */}
      <Suspense fallback={null}>
        <ShellInner
          role={role}
          allowed={allowed}
          title={title}
          subtitle={subtitle}
        >
          {children}
        </ShellInner>
      </Suspense>
    </DashThemeProvider>
  );
}
