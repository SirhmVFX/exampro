"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LogOut, ChevronLeft, ChevronRight } from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { roleTitle } from "@/lib/vocab";
import type { Role } from "@/lib/types";
import { InstitutionSwitcher } from "./institution-switcher";

export type NavItem = {
  label: string;
  href: string;
  icon: React.ReactNode;
  badge?: string | number;
};

interface SidebarProps {
  navItems: NavItem[];
  role: Role;
  institutionName?: string;
  userName?: string;
  userAvatar?: string;
  logoUrl?: string;
}

export default function DashboardSidebar({
  navItems,
  role,
  institutionName = "ExamPro",
  userName = "User",
  logoUrl,
}: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { logout, institution } = useAuth();
  const [collapsed, setCollapsed] = useState(false);

  const handleSignOut = async () => {
    await logout();
    router.push("/auth/login");
  };

  return (
    <aside
      className={`relative flex flex-col transition-all duration-300 ${collapsed ? "w-16" : "w-64"
        } min-h-screen shrink-0`}
      style={{
        background: "var(--dash-sidebar)",
        color: "var(--dash-sidebar-fg)",
        borderRight: "1px solid var(--dash-sidebar-border)",
      }}
    >
      <div
        className="flex items-center gap-3 px-4 py-5"
        style={{ borderBottom: "1px solid var(--dash-sidebar-border)" }}
      >
        {logoUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={logoUrl}
            alt=""
            className="w-8 h-8 rounded-lg object-cover shrink-0"
            style={{ border: "1px solid var(--dash-sidebar-border)" }}
          />
        ) : (
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 text-[11px] font-bold tracking-tight"
            style={{ border: "1px solid var(--dash-sidebar-fg)" }}
          >
            EP
          </div>
        )}
        {!collapsed && (
          <div className="overflow-hidden">
            <p className="text-sm font-semibold truncate">{institutionName}</p>
            <p className="text-xs" style={{ color: "var(--dash-sidebar-muted)" }}>
              {roleTitle(role, institution)}
            </p>
          </div>
        )}
      </div>

      <InstitutionSwitcher collapsed={collapsed} />

      <nav className="flex-1 px-2 py-2 space-y-0.5 overflow-y-auto">
        {navItems.map((item) => {
          const isOverview = item.href === `/dashboard/${role}`;
          const isActive = isOverview
            ? pathname === item.href
            : pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link
              key={item.href}
              href={item.href}
              title={collapsed ? item.label : undefined}
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors"
              style={
                isActive
                  ? {
                    background: "var(--dash-nav-active)",
                    color: "var(--dash-nav-active-fg)",
                  }
                  : { color: "var(--dash-sidebar-muted)" }
              }
              onMouseEnter={(e) => {
                if (isActive) return;
                e.currentTarget.style.background = "var(--dash-sidebar-hover)";
                e.currentTarget.style.color = "var(--dash-sidebar-fg)";
              }}
              onMouseLeave={(e) => {
                if (isActive) return;
                e.currentTarget.style.background = "transparent";
                e.currentTarget.style.color = "var(--dash-sidebar-muted)";
              }}
            >
              <span className="shrink-0">{item.icon}</span>
              {!collapsed && (
                <>
                  <span className="flex-1 truncate">{item.label}</span>
                  {item.badge !== undefined && (
                    <span
                      className="text-xs px-1.5 py-0.5 rounded-md"
                      style={
                        isActive
                          ? {
                            background: "var(--dash-nav-active-fg)",
                            color: "var(--dash-nav-active)",
                          }
                          : {
                            background: "var(--dash-sidebar-hover)",
                            color: "var(--dash-sidebar-fg)",
                          }
                      }
                    >
                      {item.badge}
                    </span>
                  )}
                </>
              )}
            </Link>
          );
        })}
      </nav>

      <div
        className="px-2 py-3 space-y-1"
        style={{ borderTop: "1px solid var(--dash-sidebar-border)" }}
      >
        {!collapsed && (
          <div className="px-3 py-2">
            <p className="text-sm font-medium truncate">{userName}</p>
            <p
              className="text-xs capitalize"
              style={{ color: "var(--dash-sidebar-muted)" }}
            >
              {roleTitle(role, institution)}
            </p>
          </div>
        )}
        <button
          onClick={handleSignOut}
          title={collapsed ? "Sign out" : undefined}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors"
          style={{ color: "var(--dash-sidebar-muted)" }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "var(--dash-sidebar-hover)";
            e.currentTarget.style.color = "var(--dash-sidebar-fg)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "transparent";
            e.currentTarget.style.color = "var(--dash-sidebar-muted)";
          }}
        >
          <LogOut className="w-4 h-4 shrink-0" />
          {!collapsed && <span>Sign out</span>}
        </button>
      </div>

      <button
        onClick={() => setCollapsed(!collapsed)}
        className="absolute -right-3 top-20 w-6 h-6 rounded-full flex items-center justify-center transition"
        style={{
          background: "var(--dash-sidebar)",
          color: "var(--dash-sidebar-fg)",
          border: "1px solid var(--dash-sidebar-border)",
        }}
        aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
      >
        {collapsed ? (
          <ChevronRight className="w-3 h-3" />
        ) : (
          <ChevronLeft className="w-3 h-3" />
        )}
      </button>
    </aside>
  );
}
