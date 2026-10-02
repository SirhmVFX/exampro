"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { ClipboardCheck, FileText, Plus, Trash2 } from "lucide-react";
import DashboardShell from "@/app/components/dashboard/shell";
import { teacherNav, adminNav } from "@/app/components/dashboard/nav";
import { Card, CardBody } from "@/app/components/ui/card";
import { Badge } from "@/app/components/ui/badge";
import { Button } from "@/app/components/ui/button";
import { EmptyState } from "@/app/components/ui/empty";
import { useAuth } from "@/lib/auth-context";
import {
  listAssessmentsByTeacher,
  listAllAssessments,
  updateAssessment,
  deleteAssessment,
} from "@/lib/db";
import type { Assessment } from "@/lib/types";
import { formatDate, KIND_LABEL } from "@/lib/utils";

const statusVariant: Record<
  string,
  "default" | "success" | "warning" | "outline"
> = {
  draft: "outline",
  published: "success",
  closed: "warning",
};

// Kinds the sidebar can filter on via ?kind=… (Test / Exam / Quiz /
// Assignment / Project / Practice entries). The list itself shows every kind.
const KIND_TABS = [
  "all",
  "quiz",
  "test",
  "exam",
  "assignment",
  "project",
  "practice",
] as const;

// Shared by the teacher and admin routes — list, publish, close, edit, delete.
// Suspense wrapper: the inner view reads useSearchParams for the ?kind= tab.
export default function AssessmentsWorkspace({
  for: who,
}: {
  for: "teacher" | "admin";
}) {
  return (
    <Suspense fallback={null}>
      <AssessmentsList for={who} />
    </Suspense>
  );
}

function AssessmentsList({ for: who }: { for: "teacher" | "admin" }) {
  const base = who === "admin" ? "/dashboard/admin" : "/dashboard/teacher";
  const { profile, institution } = useAuth();
  const [items, setItems] = useState<Assessment[]>([]);
  const [loading, setLoading] = useState(true);
  // The active filter lives in the URL (?kind=…) and is driven entirely by
  // the sidebar Quizzes / Tests / Exams / Assignments / Projects / Practice
  // entries — there are no in-page tabs.
  const searchParams = useSearchParams();
  const kindParam = searchParams.get("kind");
  const kind: (typeof KIND_TABS)[number] =
    kindParam && (KIND_TABS as readonly string[]).includes(kindParam)
      ? (kindParam as (typeof KIND_TABS)[number])
      : "all";

  const reload = async () => {
    if (!institution || !profile) return;
    setItems(
      who === "admin"
        ? await listAllAssessments(institution.id)
        : await listAssessmentsByTeacher(institution.id, profile.uid),
    );
  };

  useEffect(() => {
    if (!institution || !profile) return;
    reload().finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [institution, profile, who]);

  const filtered =
    kind === "all" ? items : items.filter((a) => a.kind === kind);

  return (
    <DashboardShell
      role="teacher"
      allowRoles={
        profile?.role === "admin" && who === "admin"
          ? ["teacher", "admin"]
          : ["teacher"]
      }
      navItems={profile?.role === "admin" ? adminNav : teacherNav}
      title="Assessments"
      subtitle={
        who === "admin"
          ? "Create and manage quizzes, tests, exams and assignments across your institution"
          : "Quizzes, tests, exams and assignments for your classes"
      }
    >
      <div className="space-y-6">
        <div className="flex flex-wrap justify-end gap-3">
          {who === "admin" && (
            <Link href="/dashboard/admin/submissions">
              <Button variant="outline">
                <ClipboardCheck className="w-4 h-4" /> Results & grading
              </Button>
            </Link>
          )}
          <Link href={`${base}/assessments/new`}>
            <Button>
              <Plus className="w-4 h-4" /> New assessment
            </Button>
          </Link>
        </div>
        <Card>
          <CardBody className="p-0">
            {loading ? (
              <div className="p-6 space-y-3">
                {[0, 1].map((i) => (
                  <div
                    key={i}
                    className="h-12 bg-[var(--dash-surface-alt)] animate-pulse rounded-lg"
                  />
                ))}
              </div>
            ) : filtered.length === 0 ? (
              <EmptyState
                icon={<FileText className="w-6 h-6" />}
                title={
                  kind === "all"
                    ? "No assessments yet"
                    : `No ${KIND_LABEL[kind].toLowerCase()}s yet`
                }
                description="Create a quiz, test, exam or assignment from your question library."
                action={
                  <Link href={`${base}/assessments/new`}>
                    <Button>Create assessment</Button>
                  </Link>
                }
              />
            ) : (
              <table className="w-full text-sm">
                <thead className="bg-[var(--dash-surface-alt)] text-left text-xs font-semibold text-[var(--dash-text-muted)] uppercase">
                  <tr>
                    <th className="px-6 py-3">Title</th>
                    <th className="px-6 py-3">Type</th>
                    <th className="px-6 py-3">Subject</th>
                    <th className="px-6 py-3">
                      {institution?.classLabel ?? "Class"}
                    </th>
                    <th className="px-6 py-3">Questions</th>
                    <th className="px-6 py-3">Status</th>
                    {who === "admin" && <th className="px-6 py-3">Creator</th>}
                    <th className="px-6 py-3">Created</th>
                    <th className="px-6 py-3" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--dash-border)] text-[var(--dash-text)]">
                  {filtered.map((a) => (
                    <tr key={a.id}>
                      <td className="px-6 py-3 font-medium">{a.title}</td>
                      <td className="px-6 py-3">{KIND_LABEL[a.kind]}</td>
                      <td className="px-6 py-3">{a.subject}</td>
                      <td className="px-6 py-3">{a.className}</td>
                      <td className="px-6 py-3">{a.questions.length}</td>
                      <td className="px-6 py-3">
                        <Badge variant={statusVariant[a.status]}>
                          {a.status}
                        </Badge>
                      </td>
                      {who === "admin" && (
                        <td className="px-6 py-3 text-[var(--dash-text-muted)]">
                          {a.teacherName}
                        </td>
                      )}
                      <td className="px-6 py-3 text-[var(--dash-text-muted)]">
                        {formatDate(a.createdAt)}
                      </td>
                      <td className="px-6 py-3 text-right space-x-3">
                        <Link href={`${base}/assessments/new?edit=${a.id}`}>
                          <button className="text-xs text-[var(--dash-primary)]">
                            Edit
                          </button>
                        </Link>
                        {a.status === "draft" && (
                          <button
                            className="text-xs text-[var(--dash-primary)]"
                            onClick={async () => {
                              await updateAssessment(a.id, {
                                status: "published",
                              });
                              await reload();
                            }}
                          >
                            Publish
                          </button>
                        )}
                        {a.status === "published" && (
                          <button
                            className="text-xs text-amber-500"
                            onClick={async () => {
                              await updateAssessment(a.id, {
                                status: "closed",
                              });
                              await reload();
                            }}
                          >
                            Close
                          </button>
                        )}
                        <button
                          className="text-xs text-red-500"
                          onClick={async () => {
                            if (!confirm("Delete this assessment?")) return;
                            await deleteAssessment(a.id);
                            await reload();
                          }}
                        >
                          <Trash2 className="w-3.5 h-3.5 inline" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </CardBody>
        </Card>
      </div>
    </DashboardShell>
  );
}
