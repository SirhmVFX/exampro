"use client";

import { useEffect, useState } from "react";
import DashboardShell from "@/app/components/dashboard/shell";
import { Card, CardBody, CardHeader } from "@/app/components/ui/card";
import { Badge } from "@/app/components/ui/badge";
import { useAuth } from "@/lib/auth-context";
import { listAllAttempts, listUsersByDepartment } from "@/lib/db";
import type { Attempt, UserProfile } from "@/lib/types";
import { vocab } from "@/lib/vocab";
import { learnerClassNames } from "@/lib/learners";

export default function ManagerDashboardPage() {
  const { profile, institution } = useAuth();
  const v = vocab(institution);
  const [people, setPeople] = useState<UserProfile[]>([]);
  const [attempts, setAttempts] = useState<Attempt[]>([]);

  useEffect(() => {
    if (!institution || !profile?.departmentId) return;
    Promise.all([
      listUsersByDepartment(institution.id, profile.departmentId),
      listAllAttempts(institution.id),
    ]).then(([u, a]) => {
      setPeople(u.filter((x) => x.role === "student"));
      setAttempts(a);
    });
  }, [institution, profile]);

  return (
    <DashboardShell
      role="manager"
      title="Department"
      subtitle={profile?.departmentName || "Assigned training"}
    >
      <Card>
        <CardHeader>
          <h2 className="font-semibold">Incomplete / complete</h2>
        </CardHeader>
        <CardBody className="p-0">
          {!profile?.departmentId ? (
            <p className="px-6 py-8 text-sm text-[var(--dash-text-faint)]">
              Your admin has not assigned you a department yet.
            </p>
          ) : people.length === 0 ? (
            <p className="px-6 py-8 text-sm text-[var(--dash-text-faint)]">No people in this department.</p>
          ) : (
            people.map((p) => {
              const mine = attempts.filter(
                (a) => a.studentId === p.uid && a.status !== "in_progress"
              );
              const incomplete = mine.length === 0;
              return (
                <div
                  key={p.uid}
                  className="px-6 py-3 flex items-center justify-between text-sm border-t border-gray-50"
                >
                  <div>
                    <p className="font-medium">{p.name}</p>
                    <p className="text-xs text-[var(--dash-text-faint)]">
                      {learnerClassNames(p).join(", ") || "—"} · {mine.length} attempts
                    </p>
                  </div>
                  <Badge variant={incomplete ? "warning" : "success"}>
                    {incomplete ? "Incomplete" : "Has results"}
                  </Badge>
                </div>
              );
            })
          )}
        </CardBody>
      </Card>
    </DashboardShell>
  );
}
