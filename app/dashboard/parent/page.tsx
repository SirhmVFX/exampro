"use client";

import { useEffect, useState } from "react";
import DashboardShell from "@/app/components/dashboard/shell";
import { Card, CardBody, CardHeader } from "@/app/components/ui/card";
import { Badge } from "@/app/components/ui/badge";
import { useAuth } from "@/lib/auth-context";
import {
  listAllAssessments,
  listAttemptsByStudent,
  listChildren,
} from "@/lib/db";
import type { Assessment, Attempt, UserProfile } from "@/lib/types";
import { formatDateTime, KIND_LABEL } from "@/lib/utils";
import { vocab } from "@/lib/vocab";

export default function ParentDashboardPage() {
  const { profile, institution } = useAuth();
  const v = vocab(institution);
  const [children, setChildren] = useState<UserProfile[]>([]);
  const [active, setActive] = useState<string>("");
  const [attempts, setAttempts] = useState<Attempt[]>([]);
  const [upcoming, setUpcoming] = useState<Assessment[]>([]);

  useEffect(() => {
    if (!profile) return;
    listChildren(profile).then((kids) => {
      setChildren(kids);
      if (kids[0]) setActive(kids[0].uid);
    });
  }, [profile]);

  useEffect(() => {
    if (!institution || !active) return;
    const child = children.find((c) => c.uid === active);
    Promise.all([
      listAttemptsByStudent(institution.id, active),
      listAllAssessments(institution.id),
    ]).then(([atts, as]) => {
      setAttempts(atts.filter((a) => a.status !== "in_progress"));
      const names = child?.classNames ?? (child?.className ? [child.className] : []);
      const now = Date.now();
      setUpcoming(
        as.filter(
          (a) =>
            a.status === "published" &&
            (!a.endAt || a.endAt > now) &&
            (names.length === 0 || names.includes(a.className))
        )
      );
    });
  }, [institution, active, children]);

  return (
    <DashboardShell
      role="parent"
      title="Family"
      subtitle="Read-only results and upcoming assessments"
    >
      <div className="space-y-6 max-w-3xl">
        {children.length === 0 ? (
          <p className="text-sm text-gray-500">
            No {v.students.toLowerCase()} linked yet. Ask the admin to add your
            email as a parent on the roster.
          </p>
        ) : (
          <div className="flex gap-2 flex-wrap">
            {children.map((c) => (
              <button
                key={c.uid}
                type="button"
                onClick={() => setActive(c.uid)}
                className={`px-3 py-1.5 text-sm border ${
                  active === c.uid ? "bg-black text-white border-black" : "border-gray-200"
                }`}
              >
                {c.name}
              </button>
            ))}
          </div>
        )}
        <Card>
          <CardHeader>
            <h2 className="font-semibold">Upcoming</h2>
          </CardHeader>
          <CardBody className="p-0">
            {upcoming.length === 0 ? (
              <p className="px-6 py-8 text-sm text-gray-400">Nothing scheduled.</p>
            ) : (
              upcoming.map((a) => (
                <div key={a.id} className="px-6 py-3 flex justify-between text-sm border-t border-gray-50">
                  <span>
                    {a.title}{" "}
                    <span className="text-gray-400">· {KIND_LABEL[a.kind]}</span>
                  </span>
                  <span className="text-gray-400">
                    {a.startAt ? formatDateTime(a.startAt) : "Open"}
                  </span>
                </div>
              ))
            )}
          </CardBody>
        </Card>
        <Card>
          <CardHeader>
            <h2 className="font-semibold">Results</h2>
          </CardHeader>
          <CardBody className="p-0">
            {attempts.map((a) => (
              <div key={a.id} className="px-6 py-3 flex justify-between text-sm border-t border-gray-50">
                <span>{a.assessmentTitle}</span>
                <Badge variant={a.passed ? "success" : "warning"}>{Math.round(a.percent)}%</Badge>
              </div>
            ))}
            {attempts.length === 0 && (
              <p className="px-6 py-8 text-sm text-gray-400">No results yet.</p>
            )}
          </CardBody>
        </Card>
      </div>
    </DashboardShell>
  );
}
