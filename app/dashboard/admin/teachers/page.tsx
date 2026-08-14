"use client";

import { useEffect, useState } from "react";
import {
  Mail,
  UserPlus,
  Search,
  Ban,
  CheckCircle,
  Link2,
} from "lucide-react";
import DashboardShell from "@/app/components/dashboard/shell";
import { adminNav } from "@/app/components/dashboard/nav";
import { Card, CardBody, CardHeader } from "@/app/components/ui/card";
import { Badge } from "@/app/components/ui/badge";
import { Button } from "@/app/components/ui/button";
import { Modal } from "@/app/components/ui/modal";
import { EmptyState } from "@/app/components/ui/empty";
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
  const [q, setQ] = useState("");
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

  const joinLink = institution
    ? institutionJoinLinks(institution).teacher
    : "";

  const filtered = teachers.filter(
    (t) =>
      t.name.toLowerCase().includes(q.toLowerCase()) ||
      t.email.toLowerCase().includes(q.toLowerCase())
  );

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
    const allowed = planAllows(plan, { teachers: teachers.length + list.length - 1 });
    if (!allowed.teachers) {
      setError(
        `Your ${plan.name} plan allows up to ${plan.maxTeachers} teachers. Upgrade in Billing to invite more.`
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
          })
        )
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

  return (
    <DashboardShell
      role="admin"
      navItems={adminNav}
      title="Teachers"
      subtitle="Invite faculty and manage their access"
    >
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
          <div className="relative flex-1 max-w-sm">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search teachers…"
              className={`${inputClass} pl-9`}
            />
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setInviteOpen(true)}>
              <Mail className="w-4 h-4" /> Invite by email
            </Button>
          </div>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">
                  Teacher invite link
                </h2>
                <p className="text-sm text-gray-500">
                  Share this so teachers can sign up to {institution?.name}
                </p>
              </div>
              <div className="flex items-center gap-2 bg-gray-50 rounded-lg px-3 py-2 min-w-0">
                <Link2 className="w-4 h-4 text-gray-400 shrink-0" />
                <span className="text-xs text-gray-500 truncate">{joinLink}</span>
                <CopyButton text={joinLink} />
              </div>
            </div>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader>
            <h2 className="text-lg font-semibold text-gray-900">
              Faculty ({teachers.length})
            </h2>
          </CardHeader>
          <CardBody className="p-0">
            {loading ? (
              <div className="p-6 space-y-3">
                {[0, 1, 2].map((i) => (
                  <div key={i} className="h-12 bg-gray-50 rounded-lg animate-pulse" />
                ))}
              </div>
            ) : filtered.length === 0 ? (
              <EmptyState
                icon={<UserPlus className="w-6 h-6" />}
                title="No teachers yet"
                description="Invite faculty by email or share the join link."
                action={
                  <Button onClick={() => setInviteOpen(true)}>
                    Invite teachers
                  </Button>
                }
              />
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 text-left text-xs font-semibold text-gray-500 uppercase">
                    <tr>
                      <th className="px-6 py-3">Teacher</th>
                      <th className="px-6 py-3">Subjects</th>
                      <th className="px-6 py-3">Classes</th>
                      <th className="px-6 py-3">Joined</th>
                      <th className="px-6 py-3">Status</th>
                      <th className="px-6 py-3" />
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {filtered.map((t) => (
                      <tr key={t.uid} className="hover:bg-gray-50/60">
                        <td className="px-6 py-3">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-[var(--dash-primary-soft)] text-[var(--dash-primary)] text-xs font-bold flex items-center justify-center">
                              {initials(t.name)}
                            </div>
                            <div>
                              <p className="font-medium text-gray-900">{t.name}</p>
                              <p className="text-xs text-gray-500">{t.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-3 text-gray-600">
                          {t.subjects?.length ? t.subjects.join(", ") : "—"}
                        </td>
                        <td className="px-6 py-3 text-gray-600">
                          {t.classes?.length ? t.classes.join(", ") : "—"}
                        </td>
                        <td className="px-6 py-3 text-gray-500">
                          {formatDate(t.createdAt)}
                        </td>
                        <td className="px-6 py-3">
                          <Badge variant={t.status === "active" ? "success" : "danger"}>
                            {t.status}
                          </Badge>
                        </td>
                        <td className="px-6 py-3 text-right">
                          <button
                            onClick={() => void toggleStatus(t)}
                            className="inline-flex items-center gap-1 text-xs font-medium text-gray-500 hover:text-gray-900"
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
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardBody>
        </Card>

        {invites.filter((i) => i.status === "pending").length > 0 && (
          <Card>
            <CardHeader>
              <h2 className="text-lg font-semibold text-gray-900">
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
                        <p className="text-sm font-medium text-gray-900">
                          {i.email}
                        </p>
                        <p className="text-xs text-gray-400">
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
        {error && (
          <p className="text-sm text-red-600 mb-3">{error}</p>
        )}
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
