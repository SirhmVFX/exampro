"use client";

import { useState } from "react";
import DashboardShell from "@/app/components/dashboard/shell";
import { Card, CardBody, CardHeader } from "@/app/components/ui/card";
import { Button } from "@/app/components/ui/button";
import { useAuth } from "@/lib/auth-context";
import {
  listAllAssessments,
  listAllAttempts,
  listQuestions,
  listUsers,
  writeAudit,
} from "@/lib/db";
import { downloadCsv, toCsv } from "@/lib/csv";

export default function ExportPage() {
  const { institution, profile } = useAuth();
  const [busy, setBusy] = useState("");

  const run = async (kind: "results" | "questions" | "roster") => {
    if (!institution || !profile) return;
    setBusy(kind);
    try {
      if (kind === "results") {
        const attempts = await listAllAttempts(institution.id);
        downloadCsv(
          "exampro-results.csv",
          toCsv(
            ["student", "assessment", "kind", "subject", "class", "percent", "passed", "status", "submitted"],
            attempts.map((a) => [
              a.studentName,
              a.assessmentTitle,
              a.assessmentKind,
              a.subject,
              a.className,
              a.percent,
              a.passed ? "yes" : "no",
              a.status,
              a.submittedAt ? new Date(a.submittedAt).toISOString() : "",
            ])
          )
        );
      } else if (kind === "questions") {
        const qs = await listQuestions(institution.id);
        downloadCsv(
          "exampro-questions.csv",
          toCsv(
            ["type", "subject", "class", "points", "skill", "shared", "text"],
            qs.map((q) => [
              q.type,
              q.subject,
              q.className,
              q.points,
              q.skill,
              q.shared ? "yes" : "no",
              q.text,
            ])
          )
        );
      } else {
        const users = await listUsers(institution.id);
        downloadCsv(
          "exampro-roster.csv",
          toCsv(
            ["name", "email", "role", "class", "status", "id"],
            users.map((u) => [
              u.name,
              u.email,
              u.role,
              (u.classNames ?? (u.className ? [u.className] : [])).join("; "),
              u.status,
              u.externalId,
            ])
          )
        );
      }
      await listAllAssessments(institution.id);
      await writeAudit({
        institutionId: institution.id,
        actorId: profile.uid,
        actorName: profile.name,
        action: "data.export",
        entityType: kind,
        detail: kind,
      });
    } finally {
      setBusy("");
    }
  };

  return (
    <DashboardShell
      role="admin"
      title="Export"
      subtitle="Download results, questions, and roster for records or disputes"
    >
      <div className="grid md:grid-cols-3 gap-4 max-w-4xl">
        {[
          { id: "results" as const, title: "Results", body: "Every attempt: scores, pass/fail, timestamps." },
          { id: "questions" as const, title: "Question bank", body: "Library items including shared department questions." },
          { id: "roster" as const, title: "Roster", body: "People, roles, groups, and external IDs." },
        ].map((c) => (
          <Card key={c.id}>
            <CardHeader>
              <h2 className="font-semibold">{c.title}</h2>
            </CardHeader>
            <CardBody className="space-y-4">
              <p className="text-sm text-gray-500">{c.body}</p>
              <Button
                variant="outline"
                loading={busy === c.id}
                onClick={() => void run(c.id)}
              >
                Download CSV
              </Button>
            </CardBody>
          </Card>
        ))}
      </div>
    </DashboardShell>
  );
}
