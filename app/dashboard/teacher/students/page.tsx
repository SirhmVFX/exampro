"use client";

import { useEffect, useState } from "react";
import { GraduationCap } from "lucide-react";
import DashboardShell from "@/app/components/dashboard/shell";
import { teacherNav } from "@/app/components/dashboard/nav";
import { Card, CardBody, CardHeader } from "@/app/components/ui/card";
import { Badge } from "@/app/components/ui/badge";
import { EmptyState } from "@/app/components/ui/empty";
import { useAuth } from "@/lib/auth-context";
import { listAttemptsByTeacher, listUsers } from "@/lib/db";
import type { Attempt, UserProfile } from "@/lib/types";
import { averagePercent, initials, inputClass } from "@/lib/utils";

export default function TeacherStudentsPage() {
  const { profile, institution } = useAuth();
  const [students, setStudents] = useState<UserProfile[]>([]);
  const [attempts, setAttempts] = useState<Attempt[]>([]);
  const [loading, setLoading] = useState(true);
  const [classFilter, setClassFilter] = useState("all");

  useEffect(() => {
    if (!institution || !profile) return;
    (async () => {
      const [users, atts] = await Promise.all([
        listUsers(institution.id, "student"),
        listAttemptsByTeacher(institution.id, profile.uid),
      ]);
      const myClasses = profile.classes ?? [];
      setStudents(
        myClasses.length
          ? users.filter((u) => u.className && myClasses.includes(u.className))
          : users
      );
      setAttempts(atts);
      setLoading(false);
    })();
  }, [institution, profile]);

  const filtered =
    classFilter === "all"
      ? students
      : students.filter((s) => s.className === classFilter);

  return (
    <DashboardShell
      role="teacher"
      navItems={teacherNav}
      title="Students"
      subtitle="Students in the classes you teach"
    >
      <div className="space-y-6">
        <select
          value={classFilter}
          onChange={(e) => setClassFilter(e.target.value)}
          className={`${inputClass} w-auto`}
        >
          <option value="all">All {institution?.classLabel ?? "classes"}</option>
          {[...new Set(students.map((s) => s.className).filter(Boolean))].map((c) => (
            <option key={c}>{c}</option>
          ))}
        </select>
        <Card>
          <CardHeader>
            <h2 className="font-semibold">{filtered.length} students</h2>
          </CardHeader>
          <CardBody className="p-0">
            {loading ? (
              <div className="p-6 space-y-3">
                {[0, 1].map((i) => (
                  <div key={i} className="h-12 bg-gray-50 animate-pulse rounded-lg" />
                ))}
              </div>
            ) : filtered.length === 0 ? (
              <EmptyState
                icon={<GraduationCap className="w-6 h-6" />}
                title="No students in your classes yet"
              />
            ) : (
              <table className="w-full text-sm">
                <thead className="bg-gray-50 text-left text-xs font-semibold text-gray-500 uppercase">
                  <tr>
                    <th className="px-6 py-3">Student</th>
                    <th className="px-6 py-3">{institution?.classLabel ?? "Class"}</th>
                    <th className="px-6 py-3">Attempts</th>
                    <th className="px-6 py-3">Avg score</th>
                    <th className="px-6 py-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {filtered.map((s) => {
                    const mine = attempts.filter(
                      (a) => a.studentId === s.uid && a.status !== "in_progress"
                    );
                    const avg = averagePercent(mine);
                    return (
                      <tr key={s.uid}>
                        <td className="px-6 py-3">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-emerald-100 text-emerald-700 text-xs font-bold flex items-center justify-center">
                              {initials(s.name)}
                            </div>
                            <div>
                              <p className="font-medium">{s.name}</p>
                              <p className="text-xs text-gray-500">{s.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-3">{s.className || "—"}</td>
                        <td className="px-6 py-3">{mine.length}</td>
                        <td className="px-6 py-3">{avg === null ? "—" : `${avg}%`}</td>
                        <td className="px-6 py-3">
                          <Badge variant={s.status === "active" ? "success" : "danger"}>
                            {s.status}
                          </Badge>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </CardBody>
        </Card>
      </div>
    </DashboardShell>
  );
}
