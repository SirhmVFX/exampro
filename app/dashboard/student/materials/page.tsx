"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { BookOpen, CheckCircle2, ExternalLink } from "lucide-react";
import DashboardShell from "@/app/components/dashboard/shell";
import { studentNav } from "@/app/components/dashboard/nav";
import { Card, CardBody } from "@/app/components/ui/card";
import { Badge } from "@/app/components/ui/badge";
import { Button } from "@/app/components/ui/button";
import { EmptyState } from "@/app/components/ui/empty";
import { useAuth } from "@/lib/auth-context";
import {
  listMaterialsForLearner,
  listMaterialProgress,
  setMaterialProgress,
} from "@/lib/db";
import type { Material, MaterialProgress } from "@/lib/types";
import { HtmlContent } from "@/app/components/ui/html-content";
import { formatDate } from "@/lib/utils";

export default function StudentMaterialsPage() {
  const { profile, institution } = useAuth();
  const [items, setItems] = useState<Material[]>([]);
  const [progress, setProgress] = useState<MaterialProgress[]>([]);
  const [loading, setLoading] = useState(true);
  const [openId, setOpenId] = useState<string | null>(null);

  const reload = async () => {
    if (!profile || !institution) return;
    const [m, p] = await Promise.all([
      listMaterialsForLearner(institution.id, profile),
      listMaterialProgress(institution.id, profile.uid),
    ]);
    setItems(m);
    setProgress(p);
  };

  useEffect(() => {
    if (!profile || !institution) {
      setLoading(false);
      return;
    }
    reload().finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profile, institution]);

  const isDone = (id: string) =>
    progress.some((p) => p.materialId === id && p.completed);

  const markDone = async (m: Material) => {
    if (!profile || !institution) return;
    await setMaterialProgress({
      id: `${m.id}_${profile.uid}`,
      institutionId: institution.id,
      materialId: m.id,
      studentId: profile.uid,
      completed: true,
      completedAt: Date.now(),
    });
    await reload();
  };

  return (
    <DashboardShell
      role="student"
      navItems={studentNav}
      title="Learning materials"
      subtitle="Go through assigned content before related assessments"
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
              icon={<BookOpen className="w-6 h-6" />}
              title="No materials yet"
              description="Teachers will add notes, files and videos for your class here."
            />
          ) : (
            <div className="divide-y divide-gray-50">
              {items.map((m) => {
                const done = isDone(m.id);
                const expanded = openId === m.id;
                return (
                  <div key={m.id} className="px-6 py-4">
                    <div className="flex items-start gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex gap-2 mb-1">
                          <Badge variant="info">{m.type}</Badge>
                          <Badge variant="outline">{m.subject}</Badge>
                          {done && <Badge variant="success">Completed</Badge>}
                        </div>
                        <p className="font-medium">{m.title}</p>
                        {m.description && (
                          <HtmlContent html={m.description} compact className="mt-0.5" />
                        )}
                        <p className="text-xs text-gray-400 mt-1">
                          {m.teacherName} · {formatDate(m.createdAt)}
                        </p>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setOpenId(expanded ? null : m.id)}
                      >
                        {expanded ? "Hide" : "Open"}
                      </Button>
                    </div>
                    {expanded && (
                      <div className="mt-4 space-y-3">
                        {m.type === "note" && (
                          <div className="bg-gray-50 p-4">
                            <HtmlContent html={m.content} />
                          </div>
                        )}
                        {m.url && m.type !== "note" && (
                          <a
                            href={m.url}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1 text-sm text-[var(--dash-primary)]"
                          >
                            Open resource <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                        )}
                        {m.type === "video" && m.url && (
                          <video src={m.url} controls className="w-full rounded-xl max-h-80" />
                        )}
                        <div className="flex flex-wrap gap-2">
                          {!done && (
                            <Button size="sm" onClick={() => void markDone(m)}>
                              <CheckCircle2 className="w-4 h-4" /> Mark complete
                            </Button>
                          )}
                          {done && m.linkedAssessmentId && (
                            <Link
                              href={`/dashboard/student/assessments/${m.linkedAssessmentId}/take`}
                            >
                              <Button size="sm">Take follow-up assessment</Button>
                            </Link>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </CardBody>
      </Card>
    </DashboardShell>
  );
}
