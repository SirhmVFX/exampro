"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { ClipboardCheck, FileText, Plus, Trash2 } from "lucide-react";
import DashboardShell from "@/app/components/dashboard/shell";
import { teacherNav, adminNav } from "@/app/components/dashboard/nav";
import { Card, CardBody } from "@/app/components/ui/card";
import { Badge } from "@/app/components/ui/badge";
import { Button } from "@/app/components/ui/button";
import {
  DataTable,
  type Column,
  type FilterDef,
} from "@/app/components/ui/data-table";
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

  const subjects = useMemo(
    () => [...new Set(items.map((a) => a.subject).filter(Boolean))].sort(),
    [items],
  );

  const columns: Column<Assessment>[] = [
    {
      key: "title",
      header: "Title",
      sortValue: (a) => a.title.toLowerCase(),
      cell: (a) => <span className="font-medium">{a.title}</span>,
    },
    {
      key: "type",
      header: "Type",
      sortValue: (a) => a.kind,
      cell: (a) => KIND_LABEL[a.kind],
    },
    {
      key: "subject",
      header: "Subject",
      sortValue: (a) => a.subject.toLowerCase(),
      cell: (a) => a.subject,
    },
    {
      key: "class",
      header: institution?.classLabel ?? "Class",
      sortValue: (a) => a.className ?? "",
      cell: (a) => a.className,
    },
    {
      key: "questions",
      header: "Questions",
      sortValue: (a) => a.questions.length,
      cell: (a) => <span className="tabular-nums">{a.questions.length}</span>,
    },
    {
      key: "status",
      header: "Status",
      sortValue: (a) => a.status,
      cell: (a) => <Badge variant={statusVariant[a.status]}>{a.status}</Badge>,
    },
    ...(who === "admin"
      ? [
          {
            key: "creator",
            header: "Creator",
            sortValue: (a: Assessment) => a.teacherName.toLowerCase(),
            cell: (a: Assessment) => (
              <span className="text-[var(--dash-text-muted)]">{a.teacherName}</span>
            ),
          },
        ]
      : []),
    {
      key: "created",
      header: "Created",
      sortValue: (a) => a.createdAt,
      cell: (a) => (
        <span className="text-[var(--dash-text-muted)]">
          {formatDate(a.createdAt)}
        </span>
      ),
    },
    {
      key: "action",
      header: "",
      className: "text-right",
      cell: (a) => (
        <span className="space-x-3">
          <Link href={`${base}/assessments/new?edit=${a.id}`}>
            <button className="text-xs text-[var(--dash-primary)]">Edit</button>
          </Link>
          {a.status === "draft" && (
            <button
              className="text-xs text-[var(--dash-primary)]"
              onClick={async () => {
                await updateAssessment(a.id, { status: "published" });
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
                await updateAssessment(a.id, { status: "closed" });
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
        </span>
      ),
    },
  ];

  const filters: FilterDef<Assessment>[] = [
    {
      key: "status",
      label: "Status",
      getValue: (a) => a.status,
      options: [
        { value: "", label: "All statuses" },
        { value: "draft", label: "Draft" },
        { value: "published", label: "Published" },
        { value: "closed", label: "Closed" },
      ],
    },
    {
      key: "subject",
      label: "Subject",
      getValue: (a) => a.subject,
      options: [
        { value: "", label: "All subjects" },
        ...subjects.map((s) => ({ value: s, label: s })),
      ],
    },
  ];

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
            ) : (
              <div className="px-6 pb-6 pt-4">
                <DataTable
                  rows={filtered}
                  columns={columns}
                  filters={filters}
                  searchKeys={(a) => `${a.title} ${a.subject} ${a.className ?? ""}`}
                  searchPlaceholder="Search assessments…"
                  emptyTitle={
                    kind === "all"
                      ? "No assessments yet"
                      : `No ${KIND_LABEL[kind].toLowerCase()}s yet`
                  }
                  emptyDescription="Create a quiz, test, exam or assignment from your question library."
                  emptyIcon={<FileText className="w-6 h-6" />}
                  getRowId={(a) => a.id}
                />
              </div>
            )}
          </CardBody>
        </Card>
      </div>
    </DashboardShell>
  );
}
