"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Users,
  GraduationCap,
  FileText,
  TrendingUp,
  Copy,
  Check,
  Megaphone,
  Clock,
  UserPlus,
  Link2,
  Inbox,
} from "lucide-react";
import DashboardShell from "@/app/components/dashboard/shell";
import { adminNav } from "@/app/components/dashboard/nav";
import { StatCard } from "@/app/components/ui/stat-card";
import { Card, CardHeader, CardBody } from "@/app/components/ui/card";
import { Badge } from "@/app/components/ui/badge";
import { useAuth } from "@/lib/auth-context";
import {
  listUsers,
  listAllAssessments,
  listAllAttempts,
  listNotificationsSent,
} from "@/lib/db";
import { htmlToPlain } from "@/app/components/ui/html-content";
import { institutionJoinLinks } from "@/lib/domain";
import type { Attempt, Notification, UserProfile } from "@/lib/types";

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      onClick={async () => {
        await navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }}
      className="p-1.5 rounded-lg hover:bg-[var(--dash-primary-soft)] text-[var(--dash-primary)] transition shrink-0"
      title="Copy to clipboard"
    >
      {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
    </button>
  );
}

export default function AdminOverviewPage() {
  const { institution } = useAuth();
  const [loading, setLoading] = useState(true);
  const [students, setStudents] = useState<UserProfile[]>([]);
  const [teachers, setTeachers] = useState<UserProfile[]>([]);
  const [assessmentCount, setAssessmentCount] = useState(0);
  const [attempts, setAttempts] = useState<Attempt[]>([]);
  const [announcements, setAnnouncements] = useState<Notification[]>([]);

  useEffect(() => {
    if (!institution) return;
    let cancelled = false;
    (async () => {
      try {
        const [users, assessments, allAttempts, sent] = await Promise.all([
          listUsers(institution.id),
          listAllAssessments(institution.id),
          listAllAttempts(institution.id),
          listNotificationsSent(institution.id),
        ]);
        if (cancelled) return;
        setStudents(users.filter((u) => u.role === "student"));
        setTeachers(users.filter((u) => u.role === "teacher"));
        setAssessmentCount(assessments.length);
        setAttempts(allAttempts);
        setAnnouncements(sent.slice(0, 4));
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [institution]);

  const submitted = attempts.filter((a) => a.status !== "in_progress");
  const passRate =
    submitted.length > 0
      ? Math.round((submitted.filter((a) => a.passed).length / submitted.length) * 100)
      : null;
  const recentAttempts = [...attempts]
    .sort((a, b) => (b.submittedAt ?? b.startedAt) - (a.submittedAt ?? a.startedAt))
    .slice(0, 8);

  const links = institution ? institutionJoinLinks(institution) : { student: "", teacher: "", portal: "" };
  const teacherLink = links.teacher;
  const studentLink = links.student;

  return (
    <DashboardShell
      role="admin"
      navItems={adminNav}
      title="Overview"
      subtitle={`Welcome back! Here's what's happening at ${institution?.name ?? "your institution"}.`}
    >
      <div className="space-y-6">
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className="bg-white rounded-xl border border-gray-200 p-6 animate-pulse">
                <div className="h-4 bg-gray-100 rounded w-24 mb-4" />
                <div className="h-8 bg-gray-100 rounded w-16" />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard
              label="Total Students"
              value={students.length}
              icon={<GraduationCap className="w-5 h-5" />}
              color="indigo"
            />
            <StatCard
              label="Total Teachers"
              value={teachers.length}
              icon={<Users className="w-5 h-5" />}
              color="cyan"
            />
            <StatCard
              label="Total Assessments"
              value={assessmentCount}
              icon={<FileText className="w-5 h-5" />}
              color="emerald"
            />
            <StatCard
              label="Average Pass Rate"
              value={passRate === null ? "—" : `${passRate}%`}
              icon={<TrendingUp className="w-5 h-5" />}
              color="amber"
              trendLabel={passRate === null ? "No submissions yet" : `Across ${submitted.length} attempts`}
              trend={passRate === null ? "neutral" : passRate >= 50 ? "up" : "down"}
            />
          </div>
        )}

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Recent activity */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <h2 className="text-lg font-semibold text-gray-900">Recent Activity</h2>
              <p className="text-sm text-gray-500 mt-0.5">Latest assessment attempts across your institution</p>
            </CardHeader>
            <CardBody className="p-0">
              {loading ? (
                <div className="p-6 space-y-3">
                  {[0, 1, 2].map((i) => (
                    <div key={i} className="h-12 bg-gray-50 rounded-lg animate-pulse" />
                  ))}
                </div>
              ) : recentAttempts.length === 0 ? (
                <div className="flex flex-col items-center gap-2 py-12 text-center">
                  <Inbox className="w-10 h-10 text-gray-300" />
                  <p className="text-sm font-medium text-gray-500">No activity yet</p>
                  <p className="text-xs text-gray-400">
                    Attempts will appear here once students start taking assessments.
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-gray-50">
                  {recentAttempts.map((a) => (
                    <div key={a.id} className="flex items-center gap-4 px-6 py-3">
                      <div className="w-8 h-8 bg-[var(--dash-primary-soft)] flex items-center justify-center text-[var(--dash-primary)] font-semibold text-sm shrink-0">
                        {a.studentName.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">{a.studentName}</p>
                        <p className="text-xs text-gray-500 truncate">{a.assessmentTitle}</p>
                      </div>
                      <span className="text-sm font-semibold text-gray-700">{Math.round(a.percent)}%</span>
                      {a.status === "in_progress" ? (
                        <Badge variant="info">In progress</Badge>
                      ) : (
                        <Badge variant={a.passed ? "success" : "danger"}>{a.passed ? "Pass" : "Fail"}</Badge>
                      )}
                      <span className="hidden sm:flex items-center gap-1 text-xs text-gray-400 shrink-0">
                        <Clock className="w-3 h-3" />
                        {new Date(a.submittedAt ?? a.startedAt).toLocaleString()}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </CardBody>
          </Card>

          <div className="space-y-6">
            {/* Join code card */}
            <Card>
              <CardHeader>
                <h2 className="text-lg font-semibold text-gray-900">Join Code</h2>
                <p className="text-sm text-gray-500 mt-0.5">Share this to let people join {institution?.name}</p>
              </CardHeader>
              <CardBody className="space-y-4">
                <div className="flex items-center justify-between bg-[var(--dash-primary-soft)] border border-[var(--dash-primary)] rounded-xl px-4 py-3">
                  <span className="text-2xl font-bold tracking-[0.3em] text-[var(--dash-primary)]">
                    {institution?.code ?? "……"}
                  </span>
                  {institution && <CopyButton text={institution.code} />}
                </div>
                <div className="space-y-2">
                  {links.portal && (
                    <div className="flex items-center gap-2 bg-gray-50 rounded-lg px-3 py-2">
                      <Link2 className="w-4 h-4 text-gray-400 shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-gray-700">School page</p>
                        <p className="text-xs text-gray-400 truncate">{links.portal}</p>
                      </div>
                      <CopyButton text={links.portal} />
                    </div>
                  )}
                  <div className="flex items-center gap-2 bg-gray-50 rounded-lg px-3 py-2">
                    <Link2 className="w-4 h-4 text-gray-400 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-gray-700">Teacher invite link</p>
                      <p className="text-xs text-gray-400 truncate">{teacherLink}</p>
                    </div>
                    <CopyButton text={teacherLink} />
                  </div>
                  <div className="flex items-center gap-2 bg-gray-50 rounded-lg px-3 py-2">
                    <Link2 className="w-4 h-4 text-gray-400 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-gray-700">Student invite link</p>
                      <p className="text-xs text-gray-400 truncate">{studentLink}</p>
                    </div>
                    <CopyButton text={studentLink} />
                  </div>
                </div>
              </CardBody>
            </Card>

            {/* Announcements preview */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-gray-900">Announcements</h2>
                  <Link
                    href="/dashboard/admin/announcements"
                    className="text-sm text-[var(--dash-primary)] hover:text-[var(--dash-primary)] font-medium"
                  >
                    View all
                  </Link>
                </div>
              </CardHeader>
              <CardBody>
                {loading ? (
                  <div className="space-y-3">
                    {[0, 1].map((i) => (
                      <div key={i} className="h-10 bg-gray-50 rounded-lg animate-pulse" />
                    ))}
                  </div>
                ) : announcements.length === 0 ? (
                  <div className="flex flex-col items-center gap-2 py-6 text-center">
                    <Megaphone className="w-8 h-8 text-gray-300" />
                    <p className="text-xs text-gray-400">No announcements sent yet.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {announcements.map((n) => (
                      <div key={n.id} className="flex gap-3">
                        <div className="w-8 h-8 rounded-lg bg-[var(--dash-primary-soft)] flex items-center justify-center shrink-0">
                          <Megaphone className="w-4 h-4 text-[var(--dash-primary)]" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">{n.title}</p>
                          <p className="text-xs text-gray-500 truncate">{htmlToPlain(n.body)}</p>
                          <p className="text-xs text-gray-400 mt-0.5">
                            {new Date(n.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardBody>
            </Card>
          </div>
        </div>

        {/* Quick actions */}
        <Card>
          <CardHeader>
            <h2 className="text-lg font-semibold text-gray-900">Quick Actions</h2>
          </CardHeader>
          <CardBody>
            <div className="grid md:grid-cols-3 gap-4">
              {[
                {
                  label: "Manage Teachers",
                  href: "/dashboard/admin/teachers",
                  icon: <UserPlus className="w-5 h-5" />,
                  color: "bg-[var(--dash-primary-soft)] text-[var(--dash-primary)]",
                },
                {
                  label: "Manage Students",
                  href: "/dashboard/admin/students",
                  icon: <GraduationCap className="w-5 h-5" />,
                  color: "bg-[var(--dash-primary-soft)] text-[var(--dash-primary)]",
                },
                {
                  label: "Send Announcement",
                  href: "/dashboard/admin/announcements",
                  icon: <Megaphone className="w-5 h-5" />,
                  color: "bg-emerald-50 text-emerald-600",
                },
              ].map((action) => (
                <Link
                  key={action.href}
                  href={action.href}
                  className="flex flex-col items-center gap-3 p-4 border border-gray-200 rounded-xl hover:border-black transition"
                >
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${action.color}`}>
                    {action.icon}
                  </div>
                  <span className="text-sm font-medium text-gray-700">{action.label}</span>
                </Link>
              ))}
            </div>
          </CardBody>
        </Card>
      </div>
    </DashboardShell>
  );
}
