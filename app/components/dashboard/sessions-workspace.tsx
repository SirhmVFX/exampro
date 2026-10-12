"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Plus,
  Trash2,
  Pencil,
  Send,
  CalendarClock,
  ExternalLink,
} from "lucide-react";
import toast from "react-hot-toast";
import { Card, CardBody, CardHeader } from "@/app/components/ui/card";
import { Button } from "@/app/components/ui/button";
import { Badge } from "@/app/components/ui/badge";
import { Modal } from "@/app/components/ui/modal";
import { StudentPicker } from "@/app/components/ui/student-picker";
import { DataTable, type Column, type FilterDef } from "@/app/components/ui/data-table";
import { useAuth } from "@/lib/auth-context";
import {
  listLiveSessions,
  saveLiveSession,
  updateLiveSession,
  deleteLiveSession,
  listUsers,
  sendNotification,
  newId,
  COL,
} from "@/lib/db";
import type { LiveSession, Role, UserProfile } from "@/lib/types";
import { inputClass, formatDateTime } from "@/lib/utils";
import { vocab } from "@/lib/vocab";

const PLATFORMS: { value: LiveSession["platform"]; label: string }[] = [
  { value: "zoom", label: "Zoom" },
  { value: "google-meet", label: "Google Meet" },
  { value: "microsoft-teams", label: "Microsoft Teams" },
  { value: "other", label: "Other" },
];

function emptyForm() {
  return {
    title: "",
    description: "",
    platform: "zoom" as LiveSession["platform"],
    url: "",
    when: "", // datetime-local string
    durationMins: 60,
    audience: "all" as LiveSession["audience"],
    classNames: [] as string[],
    assignedStudentIds: [] as string[],
  };
}

export default function SessionsWorkspace({ role }: { role: Role }) {
  const { institution, profile } = useAuth();
  const v = vocab(institution);
  const [sessions, setSessions] = useState<LiveSession[]>([]);
  const [students, setStudents] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm());
  const [saving, setSaving] = useState(false);

  const reload = async () => {
    if (!institution) return;
    const [list, users] = await Promise.all([
      listLiveSessions(institution.id),
      listUsers(institution.id, "student"),
    ]);
    setSessions(list);
    setStudents(users);
  };

  useEffect(() => {
    reload().finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [institution]);

  const now = Date.now();
  const upcoming = sessions.filter((s) => s.status === "scheduled" && s.startsAt >= now);
  const past = sessions.filter((s) => s.status !== "scheduled" || s.startsAt < now);

  const openCreate = () => {
    setEditingId(null);
    setForm(emptyForm());
    setFormOpen(true);
  };

  const openEdit = (s: LiveSession) => {
    setEditingId(s.id);
    setForm({
      title: s.title,
      description: s.description ?? "",
      platform: s.platform,
      url: s.url,
      when: toLocalInput(s.startsAt),
      durationMins: s.durationMins,
      audience: s.audience,
      classNames: s.classNames ?? [],
      assignedStudentIds: s.assignedStudentIds ?? [],
    });
    setFormOpen(true);
  };

  const save = async () => {
    if (!institution || !profile) return;
    if (!form.title.trim() || !form.url.trim() || !form.when) {
      toast.error("Title, link and start time are required.");
      return;
    }
    const startsAt = new Date(form.when).getTime();
    if (Number.isNaN(startsAt)) {
      toast.error("Please pick a valid start time.");
      return;
    }
    setSaving(true);
    try {
      const row: LiveSession = {
        id: editingId ?? newId(COL.liveSessions),
        institutionId: institution.id,
        hostId: profile.uid,
        hostName: profile.name,
        title: form.title.trim(),
        description: form.description.trim() || undefined,
        platform: form.platform,
        url: form.url.trim(),
        startsAt,
        durationMins: Math.max(5, Number(form.durationMins) || 60),
        audience: form.audience,
        classNames: form.audience === "classes" ? form.classNames : undefined,
        assignedStudentIds:
          form.audience === "students" ? form.assignedStudentIds : undefined,
        status: "scheduled",
        createdAt: editingId
          ? (sessions.find((s) => s.id === editingId)?.createdAt ?? Date.now())
          : Date.now(),
      };
      if (editingId) {
        await updateLiveSession(editingId, row);
        toast.success("Session updated");
      } else {
        await saveLiveSession(row);
        // Notify the targeted students so the session lands in their bell.
        await notifyStudents(row);
        toast.success("Session scheduled — students notified");
      }
      setFormOpen(false);
      await reload();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Couldn't save session.");
    } finally {
      setSaving(false);
    }
  };

  const notifyStudents = async (s: LiveSession) => {
    if (!institution || !profile) return;
    await sendNotification({
      id: newId(COL.notifications),
      institutionId: institution.id,
      title: `Live session: ${s.title}`,
      body: `${formatDateTime(s.startsAt)} · ${s.durationMins} min · ${PLATFORMS.find((p) => p.value === s.platform)?.label ?? s.platform}. Join link: ${s.url}`,
      audience: s.audience === "all" ? "students" : "user",
      targetUserId: s.audience === "students" ? s.assignedStudentIds?.[0] : undefined,
      senderId: profile.uid,
      senderName: profile.name,
      senderRole: role,
      readBy: [profile.uid],
      createdAt: Date.now(),
    });
  };

  const remove = async (s: LiveSession) => {
    if (!confirm(`Delete "${s.title}"?`)) return;
    await deleteLiveSession(s.id);
    await reload();
    toast.success("Deleted");
  };

  const endOrCancel = async (s: LiveSession, status: "ended" | "cancelled") => {
    await updateLiveSession(s.id, { status });
    await reload();
  };

  const columns: Column<LiveSession>[] = useMemo(
    () => [
      {
        key: "title",
        header: "Session",
        sortValue: (s) => s.title.toLowerCase(),
        cell: (s) => (
          <div className="min-w-0">
            <p className="font-medium text-[var(--dash-text)] truncate">{s.title}</p>
            <p className="text-xs text-[var(--dash-text-muted)]">
              {PLATFORMS.find((p) => p.value === s.platform)?.label ?? s.platform} · {s.hostName}
            </p>
          </div>
        ),
      },
      {
        key: "startsAt",
        header: "Starts",
        sortValue: (s) => s.startsAt,
        cell: (s) => (
          <span className="text-[var(--dash-text-muted)] whitespace-nowrap">
            {formatDateTime(s.startsAt)}
          </span>
        ),
      },
      {
        key: "duration",
        header: "Duration",
        sortValue: (s) => s.durationMins,
        cell: (s) => <span>{s.durationMins} min</span>,
      },
      {
        key: "audience",
        header: "Audience",
        cell: (s) => (
          <span className="text-xs text-[var(--dash-text-muted)]">
            {s.audience === "all"
              ? "Everyone"
              : s.audience === "classes"
                ? (s.classNames ?? []).join(", ") || "Classes"
                : `${(s.assignedStudentIds ?? []).length} student(s)`}
          </span>
        ),
      },
      {
        key: "status",
        header: "Status",
        cell: (s) => (
          <Badge
            variant={
              s.status === "scheduled"
                ? s.startsAt >= now
                  ? "success"
                  : "info"
                : s.status === "cancelled"
                  ? "danger"
                  : "outline"
            }
          >
            {s.status === "scheduled" && s.startsAt >= now
              ? "Upcoming"
              : s.status === "scheduled"
                ? "Live / past"
                : s.status}
          </Badge>
        ),
      },
      {
        key: "actions",
        header: "",
        className: "text-right whitespace-nowrap",
        cell: (s) => (
          <div className="flex items-center justify-end gap-1">
            <a
              href={s.url}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 rounded-lg text-[var(--dash-text-muted)] hover:text-[var(--dash-primary)] hover:bg-[var(--dash-surface-alt)] transition"
              title="Open link"
            >
              <ExternalLink className="w-4 h-4" />
            </a>
            {s.status === "scheduled" && (
              <button
                onClick={() => endOrCancel(s, "ended")}
                className="px-2 py-1 text-xs text-[var(--dash-text-muted)] hover:text-[var(--dash-text)]"
                title="Mark as ended"
              >
                End
              </button>
            )}
            <button
              onClick={() => openEdit(s)}
              className="p-2 rounded-lg text-[var(--dash-text-muted)] hover:bg-[var(--dash-surface-alt)] transition"
              title="Edit"
            >
              <Pencil className="w-4 h-4" />
            </button>
            <button
              onClick={() => remove(s)}
              className="p-2 rounded-lg text-[var(--dash-text-faint)] hover:text-red-600 transition"
              title="Delete"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ),
      },
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [now],
  );

  const filters: FilterDef<LiveSession>[] = [
    {
      key: "status",
      label: "Status",
      getValue: (s) =>
        s.status === "scheduled"
          ? s.startsAt >= now
            ? "upcoming"
            : "past"
          : s.status,
      options: [
        { value: "", label: "All statuses" },
        { value: "upcoming", label: "Upcoming" },
        { value: "past", label: "Past / ended" },
        { value: "cancelled", label: "Cancelled" },
      ],
    },
    {
      key: "platform",
      label: "Platform",
      getValue: (s) => s.platform,
      options: [
        { value: "", label: "All platforms" },
        ...PLATFORMS.map((p) => ({ value: p.value, label: p.label })),
      ],
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-[var(--dash-text-muted)]">
          {upcoming.length} upcoming · {past.length} past
        </p>
        <Button onClick={openCreate}>
          <Plus className="w-4 h-4" /> Schedule session
        </Button>
      </div>

      <Card>
        <CardHeader>
          <h2 className="text-lg font-semibold text-[var(--dash-text)]">
            All sessions
          </h2>
        </CardHeader>
        <CardBody className="p-0">
          <div className="px-6 py-4">
            {loading ? (
              <div className="space-y-3">
                {[0, 1, 2].map((i) => (
                  <div
                    key={i}
                    className="h-12 bg-[var(--dash-surface-alt)] rounded-lg animate-pulse"
                  />
                ))}
              </div>
            ) : sessions.length === 0 ? (
              <div className="flex flex-col items-center gap-2 py-12 text-center">
                <CalendarClock className="w-10 h-10 text-gray-300" />
                <p className="text-sm text-[var(--dash-text-muted)]">
                  No sessions scheduled yet.
                </p>
              </div>
            ) : (
              <DataTable
                rows={sessions}
                columns={columns}
                filters={filters}
                searchKeys={(s) => `${s.title} ${s.hostName}`}
                searchPlaceholder="Search sessions…"
                getRowId={(s) => s.id}
                emptyTitle="No sessions match"
              />
            )}
          </div>
        </CardBody>
      </Card>

      <Modal
        open={formOpen}
        onClose={() => setFormOpen(false)}
        title={editingId ? "Edit session" : "Schedule a live session"}
        wide
        footer={
          <>
            <Button variant="ghost" onClick={() => setFormOpen(false)}>
              Cancel
            </Button>
            <Button loading={saving} onClick={() => void save()}>
              <Send className="w-4 h-4" /> {editingId ? "Save changes" : "Schedule & notify"}
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1.5">Session title</label>
            <input
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              className={inputClass}
              placeholder="e.g. Algebra revision — Week 5"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5">
              Description <span className="text-[var(--dash-text-faint)]">(optional)</span>
            </label>
            <textarea
              rows={2}
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className={inputClass}
              placeholder="What will be covered?"
            />
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1.5">Platform</label>
              <select
                value={form.platform}
                onChange={(e) =>
                  setForm({ ...form, platform: e.target.value as LiveSession["platform"] })
                }
                className={inputClass}
              >
                {PLATFORMS.map((p) => (
                  <option key={p.value} value={p.value}>
                    {p.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">Join link</label>
              <input
                type="url"
                value={form.url}
                onChange={(e) => setForm({ ...form, url: e.target.value })}
                className={inputClass}
                placeholder="https://zoom.us/j/…"
              />
            </div>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1.5">Starts at</label>
              <input
                type="datetime-local"
                value={form.when}
                onChange={(e) => setForm({ ...form, when: e.target.value })}
                className={inputClass}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">Duration (minutes)</label>
              <input
                type="number"
                min={5}
                value={form.durationMins}
                onChange={(e) =>
                  setForm({ ...form, durationMins: Number(e.target.value) })
                }
                className={inputClass}
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5">Who is this for?</label>
            <select
              value={form.audience}
              onChange={(e) =>
                setForm({ ...form, audience: e.target.value as LiveSession["audience"] })
              }
              className={inputClass}
            >
              <option value="all">All {v.students.toLowerCase()}</option>
              <option value="classes">Selected {institution?.classLabel?.toLowerCase() ?? "classes"}</option>
              <option value="students">Specific students</option>
            </select>
          </div>
          {form.audience === "classes" && (
            <div className="space-y-2">
              {(institution?.classes ?? []).length === 0 ? (
                <p className="text-xs text-[var(--dash-text-faint)]">
                  No classes defined yet — add them under Structure.
                </p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {(institution?.classes ?? []).map((c) => {
                    const on = form.classNames.includes(c);
                    return (
                      <button
                        key={c}
                        type="button"
                        onClick={() =>
                          setForm({
                            ...form,
                            classNames: on
                              ? form.classNames.filter((x) => x !== c)
                              : [...form.classNames, c],
                          })
                        }
                        className={`px-3 py-1.5 rounded-lg border text-sm transition ${
                          on
                            ? "border-[var(--dash-primary)] bg-[var(--dash-primary-soft)] text-[var(--dash-primary)]"
                            : "border-[var(--dash-border)] text-[var(--dash-text-muted)]"
                        }`}
                      >
                        {c}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          )}
          {form.audience === "students" && (
            <StudentPicker
              students={students}
              selectedIds={form.assignedStudentIds}
              onChange={(ids) => setForm({ ...form, assignedStudentIds: ids })}
            />
          )}
        </div>
      </Modal>
    </div>
  );
}

function toLocalInput(ms: number): string {
  const d = new Date(ms);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(
    d.getHours(),
  )}:${pad(d.getMinutes())}`;
}
