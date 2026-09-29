"use client";

import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import DashboardShell from "@/app/components/dashboard/shell";
import { Card, CardBody, CardHeader } from "@/app/components/ui/card";
import { Button } from "@/app/components/ui/button";
import { CopyButton } from "@/app/components/ui/copy-button";
import { useAuth } from "@/lib/auth-context";
import {
  issueCertificate,
  listCertificates,
  listUsers,
  writeAudit,
} from "@/lib/db";
import type { Certificate, UserProfile } from "@/lib/types";
import { inputClass, formatDate } from "@/lib/utils";
import { vocab } from "@/lib/vocab";
import { learnerClassNames } from "@/lib/learners";
import { appOrigin } from "@/lib/domain";

export default function CertificatesAdminPage() {
  const { institution, profile } = useAuth();
  const v = vocab(institution);
  const [certs, setCerts] = useState<Certificate[]>([]);
  const [students, setStudents] = useState<UserProfile[]>([]);
  const [form, setForm] = useState({ userId: "", title: "Certificate of completion", skills: "" });
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const reload = async () => {
    if (!institution) return;
    const [c, s] = await Promise.all([
      listCertificates(institution.id),
      listUsers(institution.id, "student"),
    ]);
    setCerts(c);
    setStudents(s);
  };

  useEffect(() => {
    reload();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [institution]);

  const issue = async () => {
    if (!institution || !profile || !form.userId) return;
    const user = students.find((s) => s.uid === form.userId);
    if (!user) return;
    setSaving(true);
    try {
      const cert = await issueCertificate({
        institution,
        user,
        title: form.title.trim() || "Certificate of completion",
        cohortName: learnerClassNames(user)[0],
        skills: form.skills.split(",").map((x) => x.trim()).filter(Boolean),
      });
      await writeAudit({
        institutionId: institution.id,
        actorId: profile.uid,
        actorName: profile.name,
        action: "certificate.issue",
        entityType: "certificate",
        entityId: cert.id,
        detail: `${user.name} · ${cert.verifyCode}`,
      });
      setForm({ userId: "", title: "Certificate of completion", skills: "" });
      await reload();
      toast.success(`Certificate issued for ${user.name}`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to issue certificate. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const origin = typeof window !== "undefined" ? window.location.origin : appOrigin();

  return (
    <DashboardShell
      role="admin"
      title="Certificates"
      subtitle="Issue a completion certificate with a public verify link"
    >
      <div className="max-w-3xl space-y-6">
        <Card>
          <CardHeader>
            <h2 className="font-semibold">Issue</h2>
          </CardHeader>
          <CardBody className="space-y-3">
            <select
              value={form.userId}
              onChange={(e) => setForm({ ...form, userId: e.target.value })}
              className={inputClass}
            >
              <option value="">Select {v.student.toLowerCase()}…</option>
              {students.map((s) => (
                <option key={s.uid} value={s.uid}>
                  {s.name} · {s.email}
                </option>
              ))}
            </select>
            <input
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              className={inputClass}
              placeholder="Title"
            />
            <input
              value={form.skills}
              onChange={(e) => setForm({ ...form, skills: e.target.value })}
              className={inputClass}
              placeholder="Skills (comma separated)"
            />
            <Button loading={saving} onClick={() => void issue()} disabled={!form.userId}>
              Issue certificate
            </Button>
          </CardBody>
        </Card>

        <Card>
          <CardHeader>
            <h2 className="font-semibold">Issued</h2>
          </CardHeader>
          <CardBody className="p-0">
            {certs.length === 0 ? (
              <p className="px-6 py-8 text-sm text-gray-400">None issued yet.</p>
            ) : (
              <div className="divide-y">
                {certs.map((c) => {
                  const url = `${origin}/verify/${c.verifyCode}`;
                  return (
                    <div key={c.id} className="px-6 py-3 flex items-center gap-3 text-sm">
                      <div className="flex-1 min-w-0">
                        <p className="font-medium">{c.userName}</p>
                        <p className="text-xs text-gray-500 truncate">
                          {c.title} · {formatDate(c.issuedAt)} · {c.verifyCode}
                        </p>
                      </div>
                      <CopyButton text={url} />
                    </div>
                  );
                })}
              </div>
            )}
          </CardBody>
        </Card>
      </div>
    </DashboardShell>
  );
}
