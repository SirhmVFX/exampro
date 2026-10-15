"use client";

import { useEffect, useState } from "react";
import { Mail, UserPlus, Ban, CheckCircle, Link2 } from "lucide-react";
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
  newId,
  COL,
} from "@/lib/db";
import { getPlan, planAllows } from "@/lib/plans";
import type { Invite, UserProfile } from "@/lib/types";
import { formatDate, initials, inputClass } from "@/lib/utils";
import { institutionJoinLinks } from "@/lib/domain";

export default function AdminTeachersPage() {
  const { institution } = useAuth();
  const [teachers, setTeachers] = useState<UserProfile[]>([]);
  const [invites, setInvites] = useState<Invite[]>([]);
  const [loading, setLoading] = useState(true);
  const [inviteOpen, setInviteOpen] = useState(false);
  const [emails, setEmails] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const reload = async () => {
    if (!institution) return;
    const [users, inv] = await Promise.all([
      listUsers(institution.id, "teacher"),
      listInvites(institution.id),
    ]);
    setTeachers(users);
    setInvites(inv.filter((i) => i.role === "teacher"));
  };

  useEffect(() => {
    if (!institution) return;
    reload().finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [institution]);

  const joinLink = institution ? institutionJoinLinks(institution).teacher : "";

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
      teachers: teachers.length + list.length - 1,
    });
    if (!allowed.teachers) {
      setError(
        `Your ${plan.name} plan allows up to ${plan.maxTeachers} teachers. Upgrade in Billing to invite more.`,
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
            role: "teacher",
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

  const toggleStatus = async (u: UserProfile) => {
    await updateUserProfile(u.uid, {
      status: u.status === "active" ? "suspended" : "active",
    });
    await reload();
  };

  const columns: Column<UserProfile>[] = [
    {
      key: "teacher",
      header: "Teacher",
      sortValue: (t) => t.name.toLowerCase(),
      cell: (t) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-[var(--dash-primary-soft)] text-[var(--dash-primary)] text-xs font-bold flex items-center justify-center">
            {initials(t.name)}
          </div>
          <div>
            <p className="font-medium text-[var(--dash-text)]">{t.name}</p>
            <p className="text-xs text-[var(--dash-text-muted)]">{t.email}</p>
          </div>
        </div>
      ),
    },
    {
      key: "subjects",
      header: "Subjects",
      cell: (t) => (
        <span className="text-[var(--dash-text-muted)]">
          {t.subjects?.length ? t.subjects.join(", ") : "—"}
        </span>
      ),
    },
    {
      key: "classes",
      header: "Classes",
      cell: (t) => (
        <span className="text-[var(--dash-text-muted)]">
          {t.classes?.length ? t.classes.join(", ") : "—"}
        </span>
      ),
    },
    {
      key: "joined",
      header: "Joined",
      sortValue: (t) => t.createdAt,
      cell: (t) => (
        <span className="text-[var(--dash-text-muted)]">
          {formatDate(t.createdAt)}
        </span>
      ),
    },
    {
      key: "status",
      header: "Status",
      sortValue: (t) => t.status,
      cell: (t) => (
        <Badge variant={t.status === "active" ? "success" : "danger"}>
          {t.status}
        </Badge>
      ),
    },
    {
      key: "action",
      header: "",
      className: "text-right",
      cell: (t) => (
        <button
          onClick={() => void toggleStatus(t)}
          className="inline-flex items-center gap-1 text-xs font-medium text-[var(--dash-text-muted)] hover:text-[var(--dash-text)]"
        >
          {t.status === "active" ? (
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
      key: "status",
      label: "Status",
      getValue: (t) => t.status,
      options: [
        { value: "", label: "All statuses" },
        { value: "active", label: "Active" },
        { value: "suspended", label: "Suspended" },
      ],
    },
  ];

  return (
    <DashboardShell
      role="admin"
      navItems={adminNav}
      title="Teachers"
      subtitle="Invite faculty and manage their access"
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
                  Teacher invite link
                </h2>
                <p className="text-sm text-[var(--dash-text-muted)]">
                  Share this so teachers can sign up to {institution?.name}
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
              Faculty ({teachers.length})
            </h2>
          </CardHeader>
          <CardBody className="p-0">
            {loading ? (
              <div className="p-6 space-y-3">
                {[0, 1, 2].map((i) => (
                  <div
                    key={i}
                    className="h-12 bg-[var(--dash-surface-alt)] rounded-lg animate-pulse"
                  />
                ))}
              </div>
            ) : (
              <div className="px-6 pb-6 pt-4">
                <DataTable
                  rows={teachers}
                  columns={columns}
                  filters={filters}
                  searchKeys={(t) => `${t.name} ${t.email}`}
                  searchPlaceholder="Search teachers…"
                  emptyTitle="No teachers yet"
                  emptyDescription="Invite faculty by email or share the join link."
                  emptyIcon={<UserPlus className="w-6 h-6" />}
                  getRowId={(t) => t.uid}
                />
              </div>
            )}
          </CardBody>
        </Card>

        {invites.filter((i) => i.status === "pending").length > 0 && (
          <Card>
            <CardHeader>
              <h2 className="text-lg font-semibold text-[var(--dash-text)]">
                Pending invites
              </h2>
            </CardHeader>
            <CardBody className="p-0">
              <div className="divide-y divide-gray-50">
                {invites
                  .filter((i) => i.status === "pending")
                  .map((i) => (
                    <div
                      key={i.id}
                      className="flex items-center justify-between px-6 py-3"
                    >
                      <div>
                        <p className="text-sm font-medium text-[var(--dash-text)]">
                          {i.email}
                        </p>
                        <p className="text-xs text-[var(--dash-text-faint)]">
                          Invited {formatDate(i.createdAt)}
                        </p>
                      </div>
                      <button
                        onClick={async () => {
                          await deleteInvite(i.id);
                          await reload();
                        }}
                        className="text-xs text-red-600 hover:text-red-700"
                      >
                        Revoke
                      </button>
                    </div>
                  ))}
              </div>
            </CardBody>
          </Card>
        )}
      </div>

      <Modal
        open={inviteOpen}
        onClose={() => setInviteOpen(false)}
        title="Invite teachers"
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
        <p className="text-sm text-gray-500 mb-3">
          We&apos;ll record the emails. Share the join link so they can create
          their accounts.
        </p>
        {error && <p className="text-sm text-red-600 mb-3">{error}</p>}
        <textarea
          rows={5}
          value={emails}
          onChange={(e) => setEmails(e.target.value)}
          placeholder="teacher@school.edu"
          className={inputClass}
        />
      </Modal>
    </DashboardShell>
  );
}
