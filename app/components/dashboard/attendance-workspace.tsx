"use client";

import { useEffect, useMemo, useState } from "react";
import { CalendarCheck } from "lucide-react";
import DashboardShell from "@/app/components/dashboard/shell";
import { teacherNav, adminNav } from "@/app/components/dashboard/nav";
import { Card, CardBody } from "@/app/components/ui/card";
import { StatCard } from "@/app/components/ui/stat-card";
import { EmptyState } from "@/app/components/ui/empty";
import { Badge } from "@/app/components/ui/badge";
import { useAuth } from "@/lib/auth-context";
import { listUsers, attendanceByStudent, summarizeAttendance } from "@/lib/db";
import type { UserProfile } from "@/lib/types";
import { initials, inputClass } from "@/lib/utils";

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
  const [classFilter, setClassFilter] = useState("all");

  useEffect(() => {
    if (!institution || !profile) return;
    (async () => {
      const [users, att] = await Promise.all([
        listUsers(institution.id, "student"),
        attendanceByStudent(institution.id),
      ]);
      // Teachers only see attendance for the classes they teach.
      const myClasses = who === "teacher" ? profile.classes ?? [] : [];
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

  const classes = [...new Set(students.map((s) => s.className).filter(Boolean))] as string[];
  const filtered =
    classFilter === "all"
      ? rows
      : rows.filter((r) => r.student.className === classFilter);

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

        {classes.length > 0 && (
          <select
            value={classFilter}
            onChange={(e) => setClassFilter(e.target.value)}
            className={`${inputClass} w-auto`}
          >
            <option value="all">
              All {institution?.classLabel ?? "classes"}
            </option>
            {classes.map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>
        )}

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
            ) : filtered.length === 0 ? (
              <EmptyState
                icon={<CalendarCheck className="w-6 h-6" />}
                title="No students yet"
                description="Attendance is recorded automatically when students open their dashboard."
              />
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-[var(--dash-surface-alt)] text-left text-xs font-semibold text-[var(--dash-text-muted)] uppercase">
                    <tr>
                      <th className="px-6 py-3">Student</th>
                      <th className="px-6 py-3">{institution?.classLabel ?? "Class"}</th>
                      <th className="px-6 py-3">Days attended</th>
                      <th className="px-6 py-3">Last 30 days</th>
                      <th className="px-6 py-3">Streak</th>
                      <th className="px-6 py-3">Last present</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--dash-border)] text-[var(--dash-text)]">
                    {filtered.map((r) => (
                      <tr key={r.student.uid}>
                        <td className="px-6 py-3">
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
                        </td>
                        <td className="px-6 py-3 text-[var(--dash-text-muted)]">
                          {r.student.className || "—"}
                        </td>
                        <td className="px-6 py-3">{r.total}</td>
                        <td className="px-6 py-3">{r.last30}</td>
                        <td className="px-6 py-3">
                          {r.streak > 0 ? (
                            <Badge variant="success">{r.streak}d</Badge>
                          ) : (
                            <span className="text-[var(--dash-text-muted)]">—</span>
                          )}
                        </td>
                        <td className="px-6 py-3 text-[var(--dash-text-muted)]">
                          {r.lastPresent ?? "Never"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardBody>
        </Card>
      </div>
    </DashboardShell>
  );
}
