"use client";

import { useRouter } from "next/navigation";
import { Building2, Check, ChevronsUpDown, Plus } from "lucide-react";
import { useState } from "react";
import { dashboardPathForRole, useAuth } from "@/lib/auth-context";
import { roleTitle } from "@/lib/vocab";

export function InstitutionSwitcher({ collapsed }: { collapsed?: boolean }) {
  const { orgs, institution, profile, switchOrg, switching } = useAuth();
  const router = useRouter();
  const [open, setOpen] = useState(false);

  if (!profile) return null;
  const showList = orgs.length > 0;

  const go = async (institutionId: string) => {
    if (institutionId === institution?.id) {
      setOpen(false);
      return;
    }
    const next = await switchOrg(institutionId);
    setOpen(false);
    router.replace(dashboardPathForRole(next.role));
  };

  return (
    <div className="relative px-2 pb-2">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        title={collapsed ? institution?.name ?? "Workspace" : undefined}
        className="w-full flex items-center gap-2 px-2 py-2 rounded-lg text-left text-sm transition-colors"
        style={{ color: "var(--dash-sidebar-fg)" }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = "var(--dash-sidebar-hover)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = "transparent";
        }}
      >
        <Building2 className="w-4 h-4 shrink-0" />
        {!collapsed && (
          <>
            <span className="flex-1 truncate text-xs">
              {switching ? "Switching…" : institution?.name ?? "Workspace"}
            </span>
            <ChevronsUpDown className="w-3.5 h-3.5 opacity-60 shrink-0" />
          </>
        )}
      </button>
      {open && (
        <>
          <button
            type="button"
            className="fixed inset-0 z-40"
            aria-label="Close"
            onClick={() => setOpen(false)}
          />
          <div
            className="absolute left-2 right-2 z-50 mt-1 border rounded-xl py-1 max-h-80 overflow-y-auto shadow-lg"
            style={{
              background: "var(--dash-sidebar)",
              borderColor: "var(--dash-sidebar-border)",
              minWidth: collapsed ? "220px" : undefined,
            }}
          >
            {showList &&
              orgs.map((o) => {
                const active = o.membership.institutionId === institution?.id;
                const name = o.institution?.name ?? o.membership.institutionName ?? "Institution";
                return (
                  <button
                    key={o.membership.id}
                    type="button"
                    disabled={switching}
                    onClick={() => void go(o.membership.institutionId)}
                    className="w-full flex items-start gap-2 px-3 py-2 text-left text-xs"
                    style={{
                      color: active
                        ? "var(--dash-sidebar-fg)"
                        : "var(--dash-sidebar-muted)",
                      background: active ? "var(--dash-sidebar-hover)" : "transparent",
                    }}
                  >
                    <Check
                      className={`w-3.5 h-3.5 mt-0.5 shrink-0 ${active ? "opacity-100" : "opacity-0"}`}
                    />
                    <span className="min-w-0">
                      <span className="block truncate font-medium">{name}</span>
                      <span className="opacity-70">
                        {roleTitle(o.membership.role, o.institution)}
                      </span>
                    </span>
                  </button>
                );
              })}
            <div
              className="my-1"
              style={{ borderTop: "1px solid var(--dash-sidebar-border)" }}
            />
            <button
              type="button"
              onClick={() => {
                setOpen(false);
                router.push("/auth/join");
              }}
              className="w-full flex items-center gap-2 px-3 py-2 text-left text-xs"
              style={{ color: "var(--dash-sidebar-muted)" }}
            >
              <Building2 className="w-3.5 h-3.5" />
              Join another institution
            </button>
            <button
              type="button"
              onClick={() => {
                setOpen(false);
                router.push("/dashboard/org/new");
              }}
              className="w-full flex items-center gap-2 px-3 py-2 text-left text-xs"
              style={{ color: "var(--dash-sidebar-muted)" }}
            >
              <Plus className="w-3.5 h-3.5" />
              Create an institution
            </button>
          </div>
        </>
      )}
    </div>
  );
}
