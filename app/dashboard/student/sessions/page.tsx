"use client";

import { useEffect, useState } from "react";
import { CalendarClock, Video, ExternalLink } from "lucide-react";
import DashboardShell from "@/app/components/dashboard/shell";
import { studentNav } from "@/app/components/dashboard/nav";
import { Card, CardBody, CardHeader } from "@/app/components/ui/card";
import { Badge } from "@/app/components/ui/badge";
import { Button } from "@/app/components/ui/button";
import { EmptyState } from "@/app/components/ui/empty";
import { useAuth } from "@/lib/auth-context";
import { listSessionsForLearner } from "@/lib/db";
import type { LiveSession } from "@/lib/types";
import { formatDateTime } from "@/lib/utils";

const PLATFORM_LABEL: Record<string, string> = {
  zoom: "Zoom",
  "google-meet": "Google Meet",
  "microsoft-teams": "Microsoft Teams",
  other: "Meeting",
};

export default function StudentSessionsPage() {
  const { profile, institution } = useAuth();
  const [sessions, setSessions] = useState<LiveSession[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!profile || !institution) {
      setLoading(false);
      return;
    }
    listSessionsForLearner(institution.id, profile)
      .then(setSessions)
      .finally(() => setLoading(false));
  }, [profile, institution]);

  const now = Date.now();
  const upcoming = sessions.filter((s) => s.status === "scheduled" && s.startsAt >= now);
  const past = sessions.filter((s) => !(s.status === "scheduled" && s.startsAt >= now));

  return (
    <DashboardShell
      role="student"
      navItems={studentNav}
      title="Live sessions"
      subtitle="Your scheduled online classes"
    >
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <h2 className="text-lg font-semibold text-[var(--dash-text)]">Upcoming</h2>
          </CardHeader>
          <CardBody className="p-0">
            {loading ? (
              <div className="p-6 space-y-3">
                {[0, 1].map((i) => (
                  <div key={i} className="h-16 bg-[var(--dash-surface-alt)] rounded-lg animate-pulse" />
                ))}
              </div>
            ) : upcoming.length === 0 ? (
              <EmptyState
                icon={<CalendarClock className="w-6 h-6" />}
                title="No upcoming sessions"
                description="When your teacher schedules a live class it will appear here and you'll be notified."
              />
            ) : (
              <div className="divide-y divide-[var(--dash-border)]">
                {upcoming.map((s) => (
                  <div key={s.id} className="flex items-center gap-4 px-6 py-4">
                    <div className="w-10 h-10 rounded-lg bg-[var(--dash-primary-soft)] text-[var(--dash-primary)] flex items-center justify-center shrink-0">
                      <Video className="w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-[var(--dash-text)] truncate">{s.title}</p>
                      <p className="text-xs text-[var(--dash-text-muted)]">
                        {formatDateTime(s.startsAt)} · {s.durationMins} min · {PLATFORM_LABEL[s.platform] ?? s.platform}
                      </p>
                      {s.description && (
                        <p className="text-xs text-[var(--dash-text-faint)] mt-1 line-clamp-2">{s.description}</p>
                      )}
                    </div>
                    <a href={s.url} target="_blank" rel="noopener noreferrer">
                      <Button size="sm">
                        Join <ExternalLink className="w-3.5 h-3.5" />
                      </Button>
                    </a>
                  </div>
                ))}
              </div>
            )}
          </CardBody>
        </Card>

        {past.length > 0 && (
          <Card>
            <CardHeader>
              <h2 className="text-lg font-semibold text-[var(--dash-text)]">Past</h2>
            </CardHeader>
            <CardBody className="p-0">
              <div className="divide-y divide-[var(--dash-border)]">
                {past.map((s) => (
                  <div key={s.id} className="flex items-center gap-4 px-6 py-3">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-[var(--dash-text)] truncate">{s.title}</p>
                      <p className="text-xs text-[var(--dash-text-muted)]">{formatDateTime(s.startsAt)}</p>
                    </div>
                    <Badge variant="outline">{s.status === "cancelled" ? "Cancelled" : "Ended"}</Badge>
                  </div>
                ))}
              </div>
            </CardBody>
          </Card>
        )}
      </div>
    </DashboardShell>
  );
}
