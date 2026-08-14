"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Award } from "lucide-react";
import DashboardShell from "@/app/components/dashboard/shell";
import { studentNav } from "@/app/components/dashboard/nav";
import { Card, CardBody } from "@/app/components/ui/card";
import { Badge } from "@/app/components/ui/badge";
import { EmptyState } from "@/app/components/ui/empty";
import { useAuth } from "@/lib/auth-context";
import { listAttemptsByStudent } from "@/lib/db";
import type { Attempt } from "@/lib/types";
import { formatDateTime, KIND_LABEL } from "@/lib/utils";

export default function StudentResultsPage() {
  const { profile, institution } = useAuth();
  const [items, setItems] = useState<Attempt[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!profile || !institution) return;
    listAttemptsByStudent(institution.id, profile.uid).then((a) => {
      setItems(a.filter((x) => x.status !== "in_progress"));
      setLoading(false);
    });
  }, [profile, institution]);

  return (
    <DashboardShell
      role="student"
      navItems={studentNav}
      title="Results"
      subtitle="Scores from quizzes, tests, exams and assignments"
    >
      <Card>
        <CardBody className="p-0">
          {loading ? (
            <div className="p-6 space-y-3">
              {[0, 1].map((i) => (
                <div key={i} className="h-12 bg-gray-50 animate-pulse rounded-lg" />
              ))}
            </div>
          ) : items.length === 0 ? (
            <EmptyState
              icon={<Award className="w-6 h-6" />}
              title="No results yet"
              description="Submit an assessment to see your score here."
            />
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-left text-xs font-semibold text-gray-500 uppercase">
                <tr>
                  <th className="px-6 py-3">Assessment</th>
                  <th className="px-6 py-3">Type</th>
                  <th className="px-6 py-3">Attempt</th>
                  <th className="px-6 py-3">Score</th>
                  <th className="px-6 py-3">Result</th>
                  <th className="px-6 py-3">Date</th>
                  <th className="px-6 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {items.map((a) => (
                  <tr key={a.id}>
                    <td className="px-6 py-3 font-medium">{a.assessmentTitle}</td>
                    <td className="px-6 py-3">{KIND_LABEL[a.assessmentKind]}</td>
                    <td className="px-6 py-3">#{a.attemptNumber}</td>
                    <td className="px-6 py-3">
                      {Math.round(a.score)}/{a.maxScore} ({Math.round(a.percent)}%)
                    </td>
                    <td className="px-6 py-3">
                      {a.needsManualGrading && a.status !== "graded" ? (
                        <Badge variant="warning">Pending teacher</Badge>
                      ) : (
                        <Badge variant={a.passed ? "success" : "danger"}>
                          {a.passed ? "Pass" : "Fail"}
                        </Badge>
                      )}
                    </td>
                    <td className="px-6 py-3 text-gray-500">
                      {formatDateTime(a.submittedAt)}
                    </td>
                    <td className="px-6 py-3 text-right">
                      <Link
                        href={`/dashboard/student/results/${a.id}`}
                        className="text-xs text-[var(--dash-primary)] font-medium"
                      >
                        Details
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </CardBody>
      </Card>
    </DashboardShell>
  );
}
