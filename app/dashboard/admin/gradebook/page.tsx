"use client";

import { useEffect, useMemo, useState } from "react";
import DashboardShell from "@/app/components/dashboard/shell";
import { Card, CardBody, CardHeader } from "@/app/components/ui/card";
import { Badge } from "@/app/components/ui/badge";
import { useAuth } from "@/lib/auth-context";
import { listAllAttempts, listTerms, listUsers } from "@/lib/db";
import type { Attempt, Term, UserProfile } from "@/lib/types";
import { currentTerm, subjectMarks } from "@/lib/gradebook";
import { vocab } from "@/lib/vocab";
import { learnerClassNames } from "@/lib/learners";

export default function GradebookPage() {
  const { institution } = useAuth();
  const v = vocab(institution);
  const [attempts, setAttempts] = useState<Attempt[]>([]);
  const [students, setStudents] = useState<UserProfile[]>([]);
  const [terms, setTerms] = useState<Term[]>([]);
  const [termId, setTermId] = useState("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!institution) return;
    Promise.all([
      listAllAttempts(institution.id),
      listUsers(institution.id, "student"),
      listTerms(institution.id),
    ]).then(([a, s, t]) => {
      setAttempts(a);
      setStudents(s);
      setTerms(t);
      const cur = currentTerm(t);
      if (cur) setTermId(cur.id);
      setLoading(false);
    });
  }, [institution]);

  const rows = useMemo(() => {
    return students.map((s) => {
      const mine = attempts.filter((a) => a.studentId === s.uid);
      const marks = subjectMarks(mine);
      const avg = marks.length
        ? Math.round(marks.reduce((n, m) => n + m.percent, 0) / marks.length)
        : null;
      return { student: s, marks, avg };
    });
  }, [students, attempts]);

  const subjects = [...new Set(attempts.map((a) => a.subject).filter(Boolean))];

  return (
    <DashboardShell
      role="admin"
      title="Gradebook"
      subtitle="Best score per subject, rolled up for each learner"
    >
      <div className="space-y-4">
        {terms.length > 0 && (
          <select
            value={termId}
            onChange={(e) => setTermId(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white"
          >
            <option value="all">All terms</option>
            {terms.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name}
              </option>
            ))}
          </select>
        )}
        <Card>
          <CardHeader>
            <h2 className="text-lg font-semibold">{v.students}</h2>
          </CardHeader>
          <CardBody className="p-0 overflow-x-auto">
            {loading ? (
              <div className="h-32 animate-pulse bg-[var(--dash-surface-alt)]" />
            ) : (
              <table className="w-full text-sm">
                <thead className="bg-gray-50 text-left text-xs uppercase text-[var(--dash-text-muted)]">
                  <tr>
                    <th className="px-4 py-3">Name</th>
                    <th className="px-4 py-3">{v.class}</th>
                    {subjects.map((s) => (
                      <th key={s} className="px-4 py-3">
                        {s}
                      </th>
                    ))}
                    <th className="px-4 py-3">Overall</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {rows.map(({ student, marks, avg }) => {
                    const bySubject = Object.fromEntries(marks.map((m) => [m.subject, m]));
                    return (
                      <tr key={student.uid}>
                        <td className="px-4 py-3 font-medium">{student.name}</td>
                        <td className="px-4 py-3 text-[var(--dash-text-muted)]">
                          {learnerClassNames(student).join(", ") || "—"}
                        </td>
                        {subjects.map((s) => (
                          <td key={s} className="px-4 py-3">
                            {bySubject[s] ? (
                              <Badge variant={bySubject[s].passed ? "success" : "warning"}>
                                {bySubject[s].percent}%
                              </Badge>
                            ) : (
                              "—"
                            )}
                          </td>
                        ))}
                        <td className="px-4 py-3 font-semibold">
                          {avg === null ? "—" : `${avg}%`}
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
