"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Users,
  TrendingUp,
  Award,
  Flame,
  AlertTriangle,
  Target,
  X,
} from "lucide-react";
import { Card, CardBody, CardHeader } from "@/app/components/ui/card";
import { StatCard } from "@/app/components/ui/stat-card";
import { Badge } from "@/app/components/ui/badge";
import { EmptyState } from "@/app/components/ui/empty";
import {
  DataTable,
  type Column,
  type FilterDef,
} from "@/app/components/ui/data-table";
import { useAuth } from "@/lib/auth-context";
import {
  listUsers,
  listAllAttempts,
  listAttemptsByTeacher,
  listAttendanceDays,
  getLearningGaps,
} from "@/lib/db";
import { subjectMarks } from "@/lib/gradebook";
import type { Attempt, UserProfile } from "@/lib/types";
import { averagePercent, passRate, formatDate } from "@/lib/utils";

interface Row {
  student: UserProfile;
  attempts: Attempt[];
  avg: number | null;
  pass: number | null;
  count: number;
  lastAt?: number;
  risk: "at_risk" | "no_data" | "ok";
}

/** Consecutive-day attendance streak ending today or yesterday. */
function attendanceStreak(days: string[]): number {
  if (!days.length) return 0;
  const set = new Set(days);
  let streak = 0;
  const cursor = new Date();
  // Allow the streak to start today or yesterday.
  if (!set.has(cursor.toISOString().slice(0, 10))) cursor.setDate(cursor.getDate() - 1);
  while (set.has(cursor.toISOString().slice(0, 10))) {
    streak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }
  return streak;
}

function Sparkline({ points }: { points: number[] }) {
  if (points.length < 2) {
    return (
      <div className="h-10 flex items-center text-xs text-[var(--dash-text-faint)]">
        Not enough data for a trend
      </div>
    );
  }
  const w = 100;
  const h = 32;
  const min = Math.min(...points);
  const max = Math.max(...points);
  const span = max - min || 1;
  const step = w / (points.length - 1);
  const d = points
    .map((p, i) => {
      const x = i * step;
      const y = h - ((p - min) / span) * h;
      return `${i === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-10" preserveAspectRatio="none">
      <path
        d={d}
        fill="none"
        stroke="var(--dash-primary)"
        strokeWidth={2}
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  );
}

export default function StudentAnalytics({ role }: { role: "admin" | "teacher" }) {
  const { institution, profile } = useAuth();
  const [students, setStudents] = useState<UserProfile[]>([]);
  const [attempts, setAttempts] = useState<Attempt[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  // Per-student detail (lazy-loaded when a row is opened).
  const [detail, setDetail] = useState<{
    attendance: string[];
    gaps: { subject: string; topic: string; accuracy: number }[];
  } | null>(null);

  useEffect(() => {
    if (!institution || !profile) return;
    (async () => {
      const [users, att] = await Promise.all([
        listUsers(institution.id, "student"),
        role === "admin"
          ? listAllAttempts(institution.id)
          : listAttemptsByTeacher(institution.id, profile.uid),
      ]);
      setStudents(users);
      setAttempts(att.filter((a) => a.status !== "in_progress"));
      setLoading(false);
    })();
  }, [institution, profile, role]);

  const rows = useMemo<Row[]>(() => {
    const now = Date.now();
    return students.map((student) => {
      const mine = attempts.filter((a) => a.studentId === student.uid);
      const avg = averagePercent(mine);
      const lastAt = mine[0]?.submittedAt ?? mine[0]?.startedAt;
      const stale = !lastAt || now - lastAt > 30 * 24 * 60 * 60 * 1000;
      let risk: Row["risk"] = "ok";
      if (mine.length === 0) risk = "no_data";
      else if ((avg ?? 0) < 50 || stale) risk = "at_risk";
      return {
        student,
        attempts: mine,
        avg,
        pass: passRate(mine),
        count: mine.length,
        lastAt,
        risk,
      };
    });
  }, [students, attempts]);

  const classOptions = useMemo(() => {
    const set = new Set<string>();
    for (const s of students) {
      (s.classNames?.length ? s.classNames : s.className ? [s.className] : []).forEach(
        (c) => set.add(c),
      );
    }
    return [...set].sort();
  }, [students]);

  const selected = rows.find((r) => r.student.uid === selectedId) ?? null;

  useEffect(() => {
    if (!selected || !institution) {
      setDetail(null);
      return;
    }
    let alive = true;
    (async () => {
      const [attendance, gaps] = await Promise.all([
        listAttendanceDays(institution.id, selected.student.uid),
        getLearningGaps(institution.id, selected.student.uid),
      ]);
      if (alive) {
        setDetail({
          attendance,
          gaps: (gaps as { subject: string; topic: string; accuracy: number }[]) ?? [],
        });
      }
    })();
    return () => {
      alive = false;
    };
  }, [selected, institution]);

  const columns: Column<Row>[] = [
    {
      key: "student",
      header: "Student",
      sortValue: (r) => r.student.name.toLowerCase(),
      cell: (r) => (
        <div>
          <p className="font-medium text-[var(--dash-text)]">{r.student.name}</p>
          <p className="text-xs text-[var(--dash-text-muted)]">{r.student.email}</p>
        </div>
      ),
    },
    {
      key: "class",
      header: "Class",
      sortValue: (r) => r.student.className ?? "",
      cell: (r) => (
        <span className="text-[var(--dash-text-muted)]">
          {(r.student.classNames?.length ? r.student.classNames : [r.student.className ?? "—"]).join(
            ", ",
          )}
        </span>
      ),
    },
    {
      key: "count",
      header: "Attempts",
      sortValue: (r) => r.count,
      cell: (r) => <span className="tabular-nums">{r.count}</span>,
    },
    {
      key: "avg",
      header: "Average",
      sortValue: (r) => r.avg ?? -1,
      cell: (r) => (
        <span className="font-semibold tabular-nums">
          {r.avg === null ? "—" : `${r.avg}%`}
        </span>
      ),
    },
    {
      key: "pass",
      header: "Pass rate",
      sortValue: (r) => r.pass ?? -1,
      cell: (r) => <span className="tabular-nums">{r.pass === null ? "—" : `${r.pass}%`}</span>,
    },
    {
      key: "risk",
      header: "Status",
      sortValue: (r) => r.risk,
      cell: (r) =>
        r.risk === "at_risk" ? (
          <Badge variant="danger">
            <AlertTriangle className="w-3 h-3" /> At risk
          </Badge>
        ) : r.risk === "no_data" ? (
          <Badge variant="outline">No data</Badge>
        ) : (
          <Badge variant="success">On track</Badge>
        ),
    },
    {
      key: "action",
      header: "",
      className: "text-right",
      cell: (r) => (
        <button
          onClick={() => setSelectedId(r.student.uid)}
          className="text-sm font-medium text-[var(--dash-primary)] hover:underline"
        >
          View details
        </button>
      ),
    },
  ];

  const filters: FilterDef<Row>[] = [
    {
      key: "class",
      label: "Class",
      getValue: (r) => r.student.className ?? "",
      options: [
        { value: "", label: "All classes" },
        ...classOptions.map((c) => ({ value: c, label: c })),
      ],
    },
    {
      key: "risk",
      label: "Status",
      getValue: (r) => r.risk,
      options: [
        { value: "", label: "All statuses" },
        { value: "at_risk", label: "At risk" },
        { value: "ok", label: "On track" },
        { value: "no_data", label: "No data" },
      ],
    },
  ];

  const institutionAvg = averagePercent(attempts);
  const atRiskCount = rows.filter((r) => r.risk === "at_risk").length;

  return (
    <div className="space-y-6">
      <div className="grid sm:grid-cols-3 gap-4">
        <StatCard
          label="Students"
          value={students.length}
          icon={<Users className="w-5 h-5" />}
        />
        <StatCard
          label="Average score"
          value={institutionAvg === null ? "—" : `${institutionAvg}%`}
          icon={<TrendingUp className="w-5 h-5" />}
          color="cyan"
        />
        <StatCard
          label="At-risk students"
          value={atRiskCount}
          icon={<AlertTriangle className="w-5 h-5" />}
          color="red"
        />
      </div>

      <Card>
        <CardHeader>
          <h2 className="text-lg font-semibold text-[var(--dash-text)]">
            Student performance
          </h2>
        </CardHeader>
        <CardBody className="p-0">
          {loading ? (
            <div className="p-6 space-y-3">
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  className="h-12 bg-[var(--dash-surface-alt)] rounded-lg animate-pulse"
                />
              ))}
            </div>
          ) : (
            <div className="px-6 pb-6 pt-4">
              <DataTable
                rows={rows}
                columns={columns}
                filters={filters}
                searchKeys={(r) => `${r.student.name} ${r.student.email}`}
                searchPlaceholder="Search students…"
                emptyTitle="No students yet"
                emptyDescription="Student analytics appear once people join and submit work."
                emptyIcon={<Users className="w-6 h-6" />}
                getRowId={(r) => r.student.uid}
              />
            </div>
          )}
        </CardBody>
      </Card>

      {selected && (
        <StudentDetail
          row={selected}
          detail={detail}
          onClose={() => setSelectedId(null)}
        />
      )}
    </div>
  );
}

function StudentDetail({
  row,
  detail,
  onClose,
}: {
  row: Row;
  detail: { attendance: string[]; gaps: { subject: string; topic: string; accuracy: number }[] } | null;
  onClose: () => void;
}) {
  const marks = subjectMarks(row.attempts);
  const trend = [...row.attempts]
    .sort((a, b) => a.startedAt - b.startedAt)
    .map((a) => a.percent);
  const streak = detail ? attendanceStreak(detail.attendance) : 0;
  const weakest = detail ? detail.gaps.slice(0, 6) : [];

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold text-[var(--dash-text)]">
              {row.student.name}
            </h2>
            <p className="text-sm text-[var(--dash-text-muted)]">
              {(row.student.classNames?.length
                ? row.student.classNames
                : [row.student.className ?? "—"]
              ).join(", ")}
              {row.lastAt ? ` · last activity ${formatDate(row.lastAt)}` : ""}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-md text-[var(--dash-text-faint)] hover:bg-[var(--dash-surface-alt)] transition"
            aria-label="Close details"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </CardHeader>
      <CardBody className="space-y-6">
        <div className="grid sm:grid-cols-4 gap-4">
          <StatCard
            label="Average"
            value={row.avg === null ? "—" : `${row.avg}%`}
            icon={<Award className="w-5 h-5" />}
          />
          <StatCard
            label="Pass rate"
            value={row.pass === null ? "—" : `${row.pass}%`}
            icon={<Target className="w-5 h-5" />}
            color="emerald"
          />
          <StatCard
            label="Attempts"
            value={row.count}
            icon={<TrendingUp className="w-5 h-5" />}
            color="cyan"
          />
          <StatCard
            label="Attendance streak"
            value={streak ? `${streak}d` : "—"}
            icon={<Flame className="w-5 h-5" />}
            color="amber"
          />
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          <div>
            <h3 className="text-sm font-semibold text-[var(--dash-text-muted)] uppercase mb-2">
              Score over time
            </h3>
            <Sparkline points={trend} />
          </div>

          <div>
            <h3 className="text-sm font-semibold text-[var(--dash-text-muted)] uppercase mb-2">
              Subject breakdown
            </h3>
            {marks.length === 0 ? (
              <p className="text-sm text-[var(--dash-text-faint)]">No graded work yet.</p>
            ) : (
              <div className="space-y-2">
                {marks.map((m) => (
                  <div key={`${m.subject}-${m.className}`}>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-[var(--dash-text-muted)]">
                        {m.subject} · {m.className}
                      </span>
                      <span className="font-semibold text-[var(--dash-text)]">
                        {m.percent}%
                      </span>
                    </div>
                    <div className="h-2 rounded bg-[var(--dash-surface-alt)]">
                      <div
                        className="h-full rounded bg-[var(--dash-primary)]"
                        style={{ width: `${m.percent}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div>
          <h3 className="text-sm font-semibold text-[var(--dash-text-muted)] uppercase mb-2">
            Weakest topics
          </h3>
          {weakest.length === 0 ? (
            <EmptyState
              icon={<Target className="w-6 h-6" />}
              title="No learning gaps recorded"
              description="Topics drop below average as the student attempts more work."
            />
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {weakest.map((g) => (
                <div
                  key={`${g.subject}-${g.topic}`}
                  className="border border-[var(--dash-border)] rounded-lg p-3"
                >
                  <p className="text-sm font-medium text-[var(--dash-text)] truncate">
                    {g.topic}
                  </p>
                  <p className="text-xs text-[var(--dash-text-muted)]">{g.subject}</p>
                  <p
                    className={`text-sm font-semibold mt-1 ${
                      g.accuracy < 50 ? "text-red-600" : "text-amber-600"
                    }`}
                  >
                    {g.accuracy}% accuracy
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </CardBody>
    </Card>
  );
}
