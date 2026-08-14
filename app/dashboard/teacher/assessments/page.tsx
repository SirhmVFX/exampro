"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { FileText, Plus, Trash2 } from "lucide-react";
import DashboardShell from "@/app/components/dashboard/shell";
import { teacherNav } from "@/app/components/dashboard/nav";
import { Card, CardBody, CardHeader } from "@/app/components/ui/card";
import { Badge } from "@/app/components/ui/badge";
import { Button } from "@/app/components/ui/button";
import { EmptyState } from "@/app/components/ui/empty";
import { useAuth } from "@/lib/auth-context";
import {
  listAssessmentsByTeacher,
  updateAssessment,
  deleteAssessment,
} from "@/lib/db";
import type { Assessment } from "@/lib/types";
import { formatDate, KIND_LABEL } from "@/lib/utils";

const statusVariant: Record<string, "default" | "success" | "warning" | "outline"> = {
  draft: "outline",
  published: "success",
  closed: "warning",
};

export default function TeacherAssessmentsPage() {
  const { profile, institution } = useAuth();
  const [items, setItems] = useState<Assessment[]>([]);
  const [loading, setLoading] = useState(true);

  const reload = async () => {
    if (!institution || !profile) return;
    setItems(await listAssessmentsByTeacher(institution.id, profile.uid));
  };

  useEffect(() => {
    if (!institution || !profile) return;
    reload().finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [institution, profile]);

  return (
    <DashboardShell
      role="teacher"
      navItems={teacherNav}
      title="Assessments"
      subtitle="Quizzes, tests, exams and assignments for your classes"
    >
      <div className="space-y-6">
        <div className="flex justify-end">
          <Link href="/dashboard/teacher/assessments/new">
            <Button>
              <Plus className="w-4 h-4" /> New assessment
            </Button>
          </Link>
        </div>
        <Card>
          <CardHeader>
            <h2 className="text-lg font-semibold">{items.length} assessments</h2>
          </CardHeader>
          <CardBody className="p-0">
            {loading ? (
              <div className="p-6 space-y-3">
                {[0, 1].map((i) => (
                  <div key={i} className="h-12 bg-gray-50 animate-pulse rounded-lg" />
                ))}
              </div>
            ) : items.length === 0 ? (
              <EmptyState
                icon={<FileText className="w-6 h-6" />}
                title="No assessments yet"
                description="Create a quiz, test, exam or assignment from your question library."
                action={
                  <Link href="/dashboard/teacher/assessments/new">
                    <Button>Create assessment</Button>
                  </Link>
                }
              />
            ) : (
              <table className="w-full text-sm">
                <thead className="bg-gray-50 text-left text-xs font-semibold text-gray-500 uppercase">
                  <tr>
                    <th className="px-6 py-3">Title</th>
                    <th className="px-6 py-3">Type</th>
                    <th className="px-6 py-3">Subject</th>
                    <th className="px-6 py-3">{institution?.classLabel ?? "Class"}</th>
                    <th className="px-6 py-3">Questions</th>
                    <th className="px-6 py-3">Status</th>
                    <th className="px-6 py-3">Created</th>
                    <th className="px-6 py-3" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {items.map((a) => (
                    <tr key={a.id}>
                      <td className="px-6 py-3 font-medium">{a.title}</td>
                      <td className="px-6 py-3">{KIND_LABEL[a.kind]}</td>
                      <td className="px-6 py-3">{a.subject}</td>
                      <td className="px-6 py-3">{a.className}</td>
                      <td className="px-6 py-3">{a.questions.length}</td>
                      <td className="px-6 py-3">
                        <Badge variant={statusVariant[a.status]}>{a.status}</Badge>
                      </td>
                      <td className="px-6 py-3 text-gray-500">{formatDate(a.createdAt)}</td>
                      <td className="px-6 py-3 text-right space-x-3">
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
                            className="text-xs text-amber-700"
                            onClick={async () => {
                              await updateAssessment(a.id, { status: "closed" });
                              await reload();
                            }}
                          >
                            Close
                          </button>
                        )}
                        <button
                          className="text-xs text-red-600"
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
