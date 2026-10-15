"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ClipboardCheck } from "lucide-react";
import DashboardShell from "@/app/components/dashboard/shell";
import { teacherNav, adminNav } from "@/app/components/dashboard/nav";
import { Card, CardBody, CardHeader } from "@/app/components/ui/card";
import { Badge } from "@/app/components/ui/badge";
import {
  DataTable,
  type Column,
  type FilterDef,
} from "@/app/components/ui/data-table";
import { useAuth } from "@/lib/auth-context";
import { listAttemptsByTeacher, listAllAttempts } from "@/lib/db";
import type { Attempt } from "@/lib/types";
import { formatDateTime, KIND_LABEL } from "@/lib/utils";

// Shared by the teacher and admin routes — review and grade submissions.
export default function SubmissionsWorkspace({
  for: who,
}: {
  for: "teacher" | "admin";
}) {
  const base = who === "admin" ? "/dashboard/admin" : "/dashboard/teacher";
  const { profile, institution } = useAuth();
  const [items, setItems] = useState<Attempt[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!institution || !profile) return;
    (who === "admin"
      ? listAllAttempts(institution.id)
      : listAttemptsByTeacher(institution.id, profile.uid)
    ).then((a) => {
      setItems(a.filter((x) => x.status !== "in_progress"));
      setLoading(false);
    });
  }, [institution, profile, who]);

  const statusOf = (a: Attempt) =>
    a.needsManualGrading && a.status !== "graded" ? "pending" : "graded";

  const columns: Column<Attempt>[] = [
    {
      key: "student",
      header: "Student",
      sortValue: (a) => a.studentName.toLowerCase(),
      cell: (a) => <span className="font-medium">{a.studentName}</span>,
    },
    {
      key: "assessment",
      header: "Assessment",
      sortValue: (a) => a.assessmentTitle.toLowerCase(),
      cell: (a) => a.assessmentTitle,
    },
    { key: "type", header: "Type", cell: (a) => KIND_LABEL[a.assessmentKind] },
    {
      key: "score",
      header: "Score",
      sortValue: (a) => a.percent,
      cell: (a) => (
        <span className="tabular-nums">
          {Math.round(a.score)}/{a.maxScore} ({Math.round(a.percent)}%)
        </span>
      ),
    },
    {
      key: "status",
      header: "Status",
      sortValue: (a) => statusOf(a),
      cell: (a) =>
        statusOf(a) === "pending" ? (
          <Badge variant="warning">Needs grading</Badge>
        ) : (
          <Badge variant={a.passed ? "success" : "danger"}>
            {a.passed ? "Pass" : "Fail"}
          </Badge>
        ),
    },
    {
      key: "submitted",
      header: "Submitted",
      sortValue: (a) => a.submittedAt ?? 0,
      cell: (a) => (
        <span className="text-[var(--dash-text-muted)]">
          {a.submittedAt ? formatDateTime(a.submittedAt) : "—"}
        </span>
      ),
    },
    {
      key: "action",
      header: "",
      className: "text-right",
      cell: (a) => (
        <Link
          href={`${base}/submissions/${a.id}`}
          className="text-xs text-[var(--dash-primary)] font-medium"
        >
          Open
        </Link>
      ),
    },
  ];

  const filters: FilterDef<Attempt>[] = [
    {
      key: "status",
      label: "Status",
      getValue: (a) => statusOf(a),
      options: [
        { value: "", label: "All submissions" },
        { value: "pending", label: "Needs grading" },
        { value: "graded", label: "Graded" },
      ],
    },
  ];

  return (
    <DashboardShell
      role="teacher"
      allowRoles={profile?.role === "admin" && who === "admin" ? ["teacher", "admin"] : ["teacher"]}
      navItems={profile?.role === "admin" ? adminNav : teacherNav}
      title="Submissions"
      subtitle="Review auto-graded work and mark essays / coding by hand"
    >
      <Card>
        <CardHeader>
          <h2 className="font-semibold">{items.length} submissions</h2>
        </CardHeader>
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
                rows={items}
                columns={columns}
                filters={filters}
                searchKeys={(a) => `${a.studentName} ${a.assessmentTitle}`}
                searchPlaceholder="Search submissions…"
                emptyTitle="No submissions yet"
                emptyDescription="Student attempts will show up here after they submit."
                emptyIcon={<ClipboardCheck className="w-6 h-6" />}
                getRowId={(a) => a.id}
              />
            </div>
          )}
        </CardBody>
      </Card>
    </DashboardShell>
  );
}
