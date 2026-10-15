"use client";

import { useEffect, useState } from "react";
import {
  GraduationCap,
  Ban,
  CheckCircle,
  Link2,
  Mail,
} from "lucide-react";
import DashboardShell from "@/app/components/dashboard/shell";
import { adminNav } from "@/app/components/dashboard/nav";
import { Card, CardBody, CardHeader } from "@/app/components/ui/card";
import { Badge } from "@/app/components/ui/badge";
import { Button } from "@/app/components/ui/button";
import { Modal } from "@/app/components/ui/modal";
import {
  DataTable,
  type Column,
  type FilterDef,
} from "@/app/components/ui/data-table";
import { CopyButton } from "@/app/components/ui/copy-button";
import { useAuth } from "@/lib/auth-context";
import {
  listUsers,
  listInvites,
  createInvite,
  deleteInvite,
  updateUserProfile,
  attendanceCountsByStudent,
  newId,
  COL,
} from "@/lib/db";
import { getPlan, planAllows } from "@/lib/plans";
import type { Invite, UserProfile } from "@/lib/types";
import { formatDate, initials, inputClass } from "@/lib/utils";
import { institutionJoinLinks } from "@/lib/domain";

export default function AdminStudentsPage() {
  const { institution } = useAuth();
  const [students, setStudents] = useState<UserProfile[]>([]);
  const [invites, setInvites] = useState<Invite[]>([]);
  const [attendance, setAttendance] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [inviteOpen, setInviteOpen] = useState(false);
  const [emails, setEmails] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const reload = async () => {
    if (!institution) return;
    const [users, inv, attCounts] = await Promise.all([
      listUsers(institution.id, "student"),
      listInvites(institution.id),
      attendanceCountsByStudent(institution.id, 30),
    ]);
    setStudents(users);
    setInvites(inv.filter((i) => i.role === "student"));
    setAttendance(attCounts);
  };

  useEffect(() => {
    if (!institution) return;
    reload().finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [institution]);

  const joinLink = institution ? institutionJoinLinks(institution).student : "";

  const toggleStatus = async (s: UserProfile) => {
    await updateUserProfile(s.uid, {
      status: s.status === "active" ? "suspended" : "active",
    });
    await reload();
  };

  const columns: Column<UserProfile>[] = [
    {
      key: "student",
      header: "Student",
      sortValue: (s) => s.name.toLowerCase(),
      cell: (s) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-[var(--dash-primary-soft)] text-[var(--dash-primary)] text-xs font-bold flex items-center justify-center rounded">
            {initials(s.name)}
          </div>
          <div>
            <p className="font-medium text-[var(--dash-text)]">{s.name}</p>
            <p className="text-xs text-[var(--dash-text-muted)]">{s.email}</p>
          </div>
        </div>
      ),
    },
    {
      key: "class",
      header: institution?.classLabel ?? "Class",
      sortValue: (s) => s.className ?? "",
      cell: (s) => (
        <span className="text-[var(--dash-text-muted)]">{s.className || "—"}</span>
      ),
    },
    {
      key: "joined",
      header: "Joined",
      sortValue: (s) => s.createdAt,
      cell: (s) => <span className="text-[var(--dash-text-muted)]">{formatDate(s.createdAt)}</span>,
    },
    {
      key: "attendance",
      header: "Attendance (30d)",
      sortValue: (s) => attendance[s.uid] ?? 0,
      cell: (s) => (
        <span className="text-[var(--dash-text-muted)]">{attendance[s.uid] ?? 0} days</span>
      ),
    },
    {
      key: "status",
      header: "Status",
      sortValue: (s) => s.status,
      cell: (s) => (
        <Badge variant={s.status === "active" ? "success" : "danger"}>{s.status}</Badge>
      ),
    },
    {
      key: "action",
      header: "",
      className: "text-right",
      cell: (s) => (
        <button
          onClick={() => void toggleStatus(s)}
          className="inline-flex items-center gap-1 text-xs font-medium text-[var(--dash-text-muted)] hover:text-[var(--dash-text)]"
        >
          {s.status === "active" ? (
            <>
              <Ban className="w-3.5 h-3.5" /> Suspend
            </>
          ) : (
            <>
              <CheckCircle className="w-3.5 h-3.5" /> Activate
            </>
          )}
        </button>
      ),
    },
  ];

  const filters: FilterDef<UserProfile>[] = [
    {
      key: "class",
      label: "Class",
      getValue: (s) => s.className ?? "",
      options: [
        { value: "", label: `All ${institution?.classLabel ?? "classes"}` },
        ...(institution?.classes ?? []).map((c) => ({ value: c, label: c })),
      ],
    },
    {
      key: "status",
      label: "Status",
      getValue: (s) => s.status,
      options: [
        { value: "", label: "All statuses" },
        { value: "active", label: "Active" },
        { value: "suspended", label: "Suspended" },
      ],
    },
  ];

  const sendInvites = async () => {
    if (!institution) return;
    setError("");
    const list = emails
      .split(/[,;\n]+/)
      .map((e) => e.trim().toLowerCase())
      .filter((e) => e.includes("@"));
    if (!list.length) {
      setError("Enter at least one valid email.");
      return;
    }
    const plan = getPlan(institution.plan);
    const allowed = planAllows(plan, {
      students: students.length + list.length - 1,
    });
    if (!allowed.students) {
      setError(
        `Your ${plan.name} plan allows up to ${plan.maxStudents} students. Upgrade in Billing.`,
      );
      return;
    }
    setSaving(true);
    try {
      await Promise.all(
        list.map((email) =>
          createInvite({
            id: newId(COL.invites),
            institutionId: institution.id,
            institutionName: institution.name,
            email,
            role: "student",
            status: "pending",
            createdAt: Date.now(),
          }),
        ),
      );
      setEmails("");
      setInviteOpen(false);
      await reload();
    } catch {
      setError("Couldn't save invites. Try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <DashboardShell
      role="admin"
      navItems={adminNav}
      title="Students"
      subtitle="See who has joined and manage access"
    >
      <div className="space-y-6">
        <div className="flex justify-end">
          <Button variant="outline" onClick={() => setInviteOpen(true)}>
            <Mail className="w-4 h-4" /> Invite by email
          </Button>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-semibold text-[var(--dash-text)]">
                  Student invite link
                </h2>
                <p className="text-sm text-[var(--dash-text-muted)]">
                  Join code:{" "}
                  <span className="font-mono font-semibold tracking-widest text-[var(--dash-primary)]">
                    {institution?.code}
                  </span>
                </p>
              </div>
              <div className="flex items-center gap-2 bg-[var(--dash-surface-alt)] border border-[var(--dash-border)] rounded-lg px-3 py-2 min-w-0">
                <Link2 className="w-4 h-4 text-[var(--dash-text-muted)] shrink-0" />
                <span className="text-xs text-[var(--dash-text-muted)] truncate">
                  {joinLink}
                </span>
                <CopyButton text={joinLink} />
              </div>
            </div>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader>
            <h2 className="text-lg font-semibold text-[var(--dash-text)]">
              Enrolled students ({students.length})
            </h2>
          </CardHeader>
          <CardBody className="p-0">
            <div className="px-6 pb-6 pt-4">
              {loading ? (
                <div className="space-y-3">
                  {[0, 1, 2].map((i) => (
                    <div
                      key={i}
                      className="h-12 bg-[var(--dash-surface-alt)] rounded-lg animate-pulse"
                    />
                  ))}
                </div>
              ) : (
                <DataTable
                  rows={students}
                  columns={columns}
                  filters={filters}
                  searchKeys={(s) => `${s.name} ${s.email}`}
                  searchPlaceholder="Search students…"
                  emptyTitle="No students yet"
                  emptyDescription="Share the join code or invite link so students can sign up."
                  emptyIcon={<GraduationCap className="w-6 h-6" />}
                  getRowId={(s) => s.uid}
                />
              )}
            </div>
          </CardBody>
        </Card>

        {invites.filter((i) => i.status === "pending").length > 0 && (
          <Card>
            <CardHeader>
              <h2 className="text-lg font-semibold text-[var(--dash-text)]">
                Pending invites
              </h2>
            </CardHeader>
            <CardBody className="divide-y divide-[var(--dash-border)] p-0">
              {invites
                .filter((i) => i.status === "pending")
                .map((i) => (
                  <div
                    key={i.id}
                    className="flex items-center justify-between px-6 py-3"
                  >
                    <div>
                      <p className="text-sm font-medium">{i.email}</p>
                      <p className="text-xs text-[var(--dash-text-faint)]">
                        Invited {formatDate(i.createdAt)}
                      </p>
                    </div>
                    <button
                      onClick={async () => {
                        await deleteInvite(i.id);
                        await reload();
                      }}
                      className="text-xs text-red-500"
                    >
                      Revoke
                    </button>
                  </div>
                ))}
            </CardBody>
          </Card>
        )}
      </div>

      <Modal
        open={inviteOpen}
        onClose={() => setInviteOpen(false)}
        title="Invite students"
        footer={
          <>
            <Button variant="ghost" onClick={() => setInviteOpen(false)}>
              Cancel
            </Button>
            <Button loading={saving} onClick={() => void sendInvites()}>
              Save invites
            </Button>
          </>
        }
      >
        {error && <p className="text-sm text-red-500 mb-3">{error}</p>}
        <textarea
          rows={5}
          value={emails}
          onChange={(e) => setEmails(e.target.value)}
          placeholder="student@school.edu"
          className={inputClass}
        />
      </Modal>
    </DashboardShell>
  );
}
