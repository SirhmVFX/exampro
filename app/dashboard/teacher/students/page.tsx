"use client";

import { useEffect, useMemo, useState } from "react";
import { GraduationCap } from "lucide-react";
import DashboardShell from "@/app/components/dashboard/shell";
import { teacherNav } from "@/app/components/dashboard/nav";
import { Card, CardBody, CardHeader } from "@/app/components/ui/card";
import { Badge } from "@/app/components/ui/badge";
import {
  DataTable,
  type Column,
  type FilterDef,
} from "@/app/components/ui/data-table";
import { useAuth } from "@/lib/auth-context";
import {
  listAttemptsByTeacher,
  listUsers,
  attendanceCountsByStudent,
} from "@/lib/db";
import type { Attempt, UserProfile } from "@/lib/types";
import { averagePercent, initials } from "@/lib/utils";

interface Row {
  student: UserProfile;
  count: number;
  avg: number | null;
  att: number;
}

export default function TeacherStudentsPage() {
  const { profile, institution } = useAuth();
  const [students, setStudents] = useState<UserProfile[]>([]);
  const [attempts, setAttempts] = useState<Attempt[]>([]);
  const [attendance, setAttendance] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!institution || !profile) return;
    (async () => {
      const [users, atts, attCounts] = await Promise.all([
        listUsers(institution.id, "student"),
        listAttemptsByTeacher(institution.id, profile.uid),
        attendanceCountsByStudent(institution.id, 30),
      ]);
      const myClasses = profile.classes ?? [];
      setStudents(
        myClasses.length
          ? users.filter((u) => u.className && myClasses.includes(u.className))
          : users,
      );
      setAttempts(atts);
      setAttendance(attCounts);
      setLoading(false);
    })();
  }, [institution, profile]);

  const rows: Row[] = useMemo(
    () =>
      students.map((s) => {
        const mine = attempts.filter(
          (a) => a.studentId === s.uid && a.status !== "in_progress",
        );
        return {
          student: s,
          count: mine.length,
          avg: averagePercent(mine),
          att: attendance[s.uid] ?? 0,
        };
      }),
    [students, attempts, attendance],
  );

  const classOptions = [
    ...new Set(students.map((s) => s.className).filter(Boolean)),
  ] as string[];

  const columns: Column<Row>[] = [
    {
      key: "student",
      header: "Student",
      sortValue: (r) => r.student.name.toLowerCase(),
      cell: (r) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-[var(--dash-primary-soft)] text-[var(--dash-primary)] text-xs font-bold flex items-center justify-center">
            {initials(r.student.name)}
          </div>
          <div>
            <p className="font-medium">{r.student.name}</p>
            <p className="text-xs text-[var(--dash-text-muted)]">
              {r.student.email}
            </p>
          </div>
        </div>
      ),
    },
    {
      key: "class",
      header: institution?.classLabel ?? "Class",
      sortValue: (r) => r.student.className ?? "",
      cell: (r) => r.student.className || "—",
    },
    {
      key: "attempts",
      header: "Attempts",
      sortValue: (r) => r.count,
      cell: (r) => <span className="tabular-nums">{r.count}</span>,
    },
    {
      key: "avg",
      header: "Avg score",
      sortValue: (r) => r.avg ?? -1,
      cell: (r) => (
        <span className="tabular-nums">{r.avg === null ? "—" : `${r.avg}%`}</span>
      ),
    },
    {
      key: "attendance",
      header: "Attendance (30d)",
      sortValue: (r) => r.att,
      cell: (r) => <span className="tabular-nums">{r.att} days</span>,
    },
    {
      key: "status",
      header: "Status",
      sortValue: (r) => r.student.status,
      cell: (r) => (
        <Badge variant={r.student.status === "active" ? "success" : "danger"}>
          {r.student.status}
        </Badge>
      ),
    },
  ];

  const filters: FilterDef<Row>[] = [
    {
      key: "class",
      label: institution?.classLabel ?? "Class",
      getValue: (r) => r.student.className ?? "",
      options: [
        { value: "", label: `All ${institution?.classLabel ?? "classes"}` },
        ...classOptions.map((c) => ({ value: c, label: c })),
      ],
    },
    {
      key: "status",
      label: "Status",
      getValue: (r) => r.student.status,
      options: [
        { value: "", label: "All statuses" },
        { value: "active", label: "Active" },
        { value: "suspended", label: "Suspended" },
      ],
    },
  ];

  return (
    <DashboardShell
      role="teacher"
      navItems={teacherNav}
      title="Students"
      subtitle="Students in the classes you teach"
    >
      <Card>
        <CardHeader>
          <h2 className="font-semibold">{rows.length} students</h2>
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
                rows={rows}
                columns={columns}
                filters={filters}
                searchKeys={(r) => `${r.student.name} ${r.student.email}`}
                searchPlaceholder="Search students…"
                emptyTitle="No students in your classes yet"
                emptyDescription="Students who join your classes appear here."
                emptyIcon={<GraduationCap className="w-6 h-6" />}
                getRowId={(r) => r.student.uid}
              />
            </div>
          )}
        </CardBody>
      </Card>
    </DashboardShell>
  );
}
