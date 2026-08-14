"use client";

import { useEffect, useState } from "react";
import { FileText, Search } from "lucide-react";
import DashboardShell from "@/app/components/dashboard/shell";
import { adminNav } from "@/app/components/dashboard/nav";
import { Card, CardBody, CardHeader } from "@/app/components/ui/card";
import { Badge } from "@/app/components/ui/badge";
import { EmptyState } from "@/app/components/ui/empty";
import { useAuth } from "@/lib/auth-context";
import { listAllAssessments, updateAssessment } from "@/lib/db";
import type { Assessment } from "@/lib/types";
import { formatDate, inputClass, KIND_LABEL } from "@/lib/utils";

const statusVariant: Record<string, "default" | "success" | "warning" | "outline"> = {
  draft: "outline",
  published: "success",
  closed: "warning",
};

export default function AdminAssessmentsPage() {
  const { institution } = useAuth();
  const [items, setItems] = useState<Assessment[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [kind, setKind] = useState("all");

  const reload = async () => {
    if (!institution) return;
    setItems(await listAllAssessments(institution.id));
  };

  useEffect(() => {
    if (!institution) return;
    reload().finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [institution]);

  const filtered = items.filter((a) => {
    const matchQ = a.title.toLowerCase().includes(q.toLowerCase()) ||
      a.teacherName.toLowerCase().includes(q.toLowerCase());
    const matchK = kind === "all" || a.kind === kind;
    return matchQ && matchK;
  });

  return (
    <DashboardShell
      role="admin"
      navItems={adminNav}
      title="Assessments"
      subtitle="All quizzes, tests, exams and assignments across your institution"
    >
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1 max-w-sm">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search by title or teacher…"
              className={`${inputClass} pl-9`}
            />
          </div>
          <select
            value={kind}
            onChange={(e) => setKind(e.target.value)}
            className={`${inputClass} w-auto`}
          >
            <option value="all">All types</option>
            <option value="quiz">Quiz</option>
            <option value="test">Test</option>
            <option value="exam">Exam</option>
            <option value="assignment">Assignment</option>
          </select>
        </div>

        <Card>
          <CardHeader>
            <h2 className="text-lg font-semibold text-gray-900">
              {filtered.length} assessment{filtered.length === 1 ? "" : "s"}
            </h2>
          </CardHeader>
          <CardBody className="p-0">
            {loading ? (
              <div className="p-6 space-y-3">
                {[0, 1].map((i) => (
                  <div key={i} className="h-12 bg-gray-50 rounded-lg animate-pulse" />
                ))}
              </div>
            ) : filtered.length === 0 ? (
              <EmptyState
                icon={<FileText className="w-6 h-6" />}
                title="No assessments yet"
                description="Teachers create quizzes, tests, exams and assignments from their dashboard."
              />
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 text-left text-xs font-semibold text-gray-500 uppercase">
                    <tr>
                      <th className="px-6 py-3">Title</th>
                      <th className="px-6 py-3">Type</th>
                      <th className="px-6 py-3">Subject</th>
                      <th className="px-6 py-3">{institution?.classLabel ?? "Class"}</th>
                      <th className="px-6 py-3">Teacher</th>
                      <th className="px-6 py-3">Status</th>
                      <th className="px-6 py-3">Created</th>
                      <th className="px-6 py-3" />
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {filtered.map((a) => (
                      <tr key={a.id}>
                        <td className="px-6 py-3 font-medium text-gray-900">{a.title}</td>
                        <td className="px-6 py-3">{KIND_LABEL[a.kind]}</td>
                        <td className="px-6 py-3 text-gray-600">{a.subject}</td>
                        <td className="px-6 py-3 text-gray-600">{a.className}</td>
                        <td className="px-6 py-3 text-gray-600">{a.teacherName}</td>
                        <td className="px-6 py-3">
                          <Badge variant={statusVariant[a.status]}>{a.status}</Badge>
                        </td>
                        <td className="px-6 py-3 text-gray-500">{formatDate(a.createdAt)}</td>
                        <td className="px-6 py-3 text-right">
                          {a.status === "published" && (
                            <button
                              onClick={async () => {
                                await updateAssessment(a.id, { status: "closed" });
                                await reload();
                              }}
                              className="text-xs text-amber-700 hover:underline"
                            >
                              Close
                            </button>
                          )}
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
