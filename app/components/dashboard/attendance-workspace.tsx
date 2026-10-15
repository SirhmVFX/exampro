"use client";

import { useEffect, useMemo, useState } from "react";
import { CalendarCheck } from "lucide-react";
import DashboardShell from "@/app/components/dashboard/shell";
import { teacherNav, adminNav } from "@/app/components/dashboard/nav";
import { Card, CardBody } from "@/app/components/ui/card";
import { StatCard } from "@/app/components/ui/stat-card";
import {
  DataTable,
  type Column,
  type FilterDef,
} from "@/app/components/ui/data-table";
import { Badge } from "@/app/components/ui/badge";
import { useAuth } from "@/lib/auth-context";
import { listUsers, attendanceByStudent, summarizeAttendance } from "@/lib/db";
import type { UserProfile } from "@/lib/types";
import { initials } from "@/lib/utils";

interface Row {
  student: UserProfile;
  total: number;
  last30: number;
  streak: number;
  lastPresent: string | null;
}

// Shared Attendance report for teachers and admins. Presence is recorded
// automatically each day a student opens their dashboard (see auth-context).
export default function AttendanceWorkspace({
  for: who,
}: {
  for: "teacher" | "admin";
}) {
  const { profile, institution } = useAuth();
  const [students, setStudents] = useState<UserProfile[]>([]);
  const [ledger, setLedger] = useState<Record<string, string[]>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!institution || !profile) return;
    (async () => {
      const [users, att] = await Promise.all([
        listUsers(institution.id, "student"),
        attendanceByStudent(institution.id),
      ]);
      // Teachers only see attendance for the classes they teach.
      const myClasses = who === "teacher" ? (profile.classes ?? []) : [];
      setStudents(
        who === "teacher" && myClasses.length
          ? users.filter((u) => u.className && myClasses.includes(u.className))
          : users,
      );
      setLedger(att);
      setLoading(false);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [institution, profile, who]);

  const rows: Row[] = useMemo(() => {
    return students.map((student) => {
      const days = ledger[student.uid] ?? [];
      const s = summarizeAttendance(days);
      return {
        student,
        total: s.total,
        last30: s.last30,
        streak: s.currentStreak,
        lastPresent: days[0] ?? null,
      };
    });
  }, [students, ledger]);

  const classes = [
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
      cell: (r) => (
        <span className="text-[var(--dash-text-muted)]">
          {r.student.className || "—"}
        </span>
      ),
    },
    {
      key: "total",
      header: "Days attended",
      sortValue: (r) => r.total,
      cell: (r) => <span className="tabular-nums">{r.total}</span>,
    },
    {
      key: "last30",
      header: "Last 30 days",
      sortValue: (r) => r.last30,
      cell: (r) => <span className="tabular-nums">{r.last30}</span>,
    },
    {
      key: "streak",
      header: "Streak",
      sortValue: (r) => r.streak,
      cell: (r) =>
        r.streak > 0 ? (
          <Badge variant="success">{r.streak}d</Badge>
        ) : (
          <span className="text-[var(--dash-text-muted)]">—</span>
        ),
    },
    {
      key: "last",
      header: "Last present",
      sortValue: (r) => r.lastPresent ?? "",
      cell: (r) => (
        <span className="text-[var(--dash-text-muted)]">
          {r.lastPresent ?? "Never"}
        </span>
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
        ...classes.map((c) => ({ value: c, label: c })),
      ],
    },
  ];

  const today = new Date().toISOString().slice(0, 10);
  const presentToday = rows.filter((r) => r.lastPresent === today).length;
  const avg30 =
    rows.length > 0
      ? Math.round(rows.reduce((n, r) => n + r.last30, 0) / rows.length)
      : 0;

  return (
    <DashboardShell
      role={who === "admin" ? "admin" : "teacher"}
      allowRoles={
        who === "admin" && profile?.role === "admin"
          ? ["admin", "teacher", "manager"]
          : who === "admin"
            ? ["admin"]
            : ["teacher"]
      }
      navItems={who === "admin" ? adminNav : teacherNav}
      title="Attendance"
      subtitle={
        who === "admin"
          ? "Daily login-based attendance across your institution"
          : "Daily attendance for the students in your classes"
      }
    >
      <div className="space-y-6">
        <div className="grid md:grid-cols-3 gap-6">
          <StatCard
            label="Students"
            value={String(rows.length)}
            icon={<CalendarCheck className="w-5 h-5" />}
          />
          <StatCard
            label="Present today"
            value={String(presentToday)}
            icon={<CalendarCheck className="w-5 h-5" />}
            color="emerald"
          />
          <StatCard
            label="Avg days / last 30"
            value={String(avg30)}
            icon={<CalendarCheck className="w-5 h-5" />}
            color="cyan"
          />
        </div>

        <Card>
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
                  rows={rows}
                  columns={columns}
                  filters={filters}
                  searchKeys={(r) => `${r.student.name} ${r.student.email}`}
                  searchPlaceholder="Search students…"
                  emptyTitle="No students yet"
                  emptyDescription="Attendance is recorded automatically when students open their dashboard."
                  emptyIcon={<CalendarCheck className="w-6 h-6" />}
                  getRowId={(r) => r.student.uid}
                />
              </div>
            )}
          </CardBody>
        </Card>
      </div>
    </DashboardShell>
  );
}
