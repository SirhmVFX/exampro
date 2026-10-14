"use client";

import { useEffect, useMemo, useState } from "react";
import { Mail, Send, Users2, AlertTriangle, Inbox } from "lucide-react";
import toast from "react-hot-toast";
import { Card, CardBody, CardHeader } from "@/app/components/ui/card";
import { Button } from "@/app/components/ui/button";
import { Badge } from "@/app/components/ui/badge";
import { StudentPicker } from "@/app/components/ui/student-picker";
import { WysiwygEditor } from "@/app/components/ui/wysiwyg-editor";
import {
  DataTable,
  type Column,
  type FilterDef,
} from "@/app/components/ui/data-table";
import { useAuth } from "@/lib/auth-context";
import { listUsers, listParentMessages, saveParentMessage, newId, COL } from "@/lib/db";
import type { ParentMessage, Role, UserProfile } from "@/lib/types";
import { inputClass, formatDateTime } from "@/lib/utils";

export default function ParentMessages({ role }: { role: Role }) {
  const { institution, profile } = useAuth();
  const [students, setStudents] = useState<UserProfile[]>([]);
  const [messages, setMessages] = useState<ParentMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [classFilter, setClassFilter] = useState("");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");

  useEffect(() => {
    if (!institution) return;
    (async () => {
      const [users, msgs] = await Promise.all([
        listUsers(institution.id, "student"),
        listParentMessages(institution.id),
      ]);
      setStudents(users);
      setMessages(msgs);
      setLoading(false);
    })();
  }, [institution]);

  const classOptions = useMemo(() => {
    const set = new Set<string>();
    for (const s of students) {
      (s.classNames?.length ? s.classNames : s.className ? [s.className] : []).forEach(
        (c) => set.add(c),
      );
    }
    return [...set].sort();
  }, [students]);

  const selectedStudents = students.filter((s) => selectedIds.includes(s.uid));

  const resolved = useMemo(() => {
    const withEmail = selectedStudents.filter((s) => s.parentEmail?.trim());
    const missing = selectedStudents.filter((s) => !s.parentEmail?.trim());
    const emails = Array.from(
      new Set(withEmail.map((s) => s.parentEmail!.trim().toLowerCase())),
    );
    return { withEmail, missing, emails };
  }, [selectedStudents]);

  const send = async () => {
    if (!institution || !profile) return;
    if (resolved.emails.length === 0) {
      toast.error("Select at least one student with a parent/guardian email.");
      return;
    }
    if (!subject.trim()) {
      toast.error("Add a subject.");
      return;
    }
    if (!body.trim() || body === "<p></p>") {
      toast.error("Write a message first.");
      return;
    }
    setSending(true);
    try {
      const res = await fetch("/api/email/parent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          to: resolved.emails,
          subject: subject.trim(),
          html: body,
          schoolName: institution.name,
          replyTo: profile.email,
        }),
      });
      const data = await res.json();
      if (!res.ok && res.status !== 207) {
        throw new Error(data.error || "Failed to send");
      }
      const sent: string[] = data.sent ?? [];
      const failed: string[] = data.failed ?? [];
      const status: ParentMessage["status"] =
        failed.length === 0 ? "sent" : sent.length > 0 ? "partial" : "failed";

      await saveParentMessage({
        id: newId(COL.parentMessages),
        institutionId: institution.id,
        fromStaffId: profile.uid,
        fromStaffName: profile.name,
        fromStaffRole: role === "admin" ? "admin" : "teacher",
        subject: subject.trim(),
        body,
        studentIds: resolved.withEmail.map((s) => s.uid),
        studentNames: resolved.withEmail.map((s) => s.name),
        deliveredTo: sent,
        status,
        createdAt: Date.now(),
      });

      const fresh = await listParentMessages(institution.id);
      setMessages(fresh);

      if (status === "sent") {
        toast.success(`Sent to ${sent.length} parent${sent.length === 1 ? "" : "s"}.`);
      } else if (status === "partial") {
        toast(`Sent ${sent.length}, ${failed.length} failed.`, { icon: "⚠️" });
      } else {
        toast.error("Message could not be delivered.");
      }

      if (status !== "failed") {
        setSelectedIds([]);
        setSubject("");
        setBody("");
      }
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Couldn't send message.");
    } finally {
      setSending(false);
    }
  };

  const logColumns: Column<ParentMessage>[] = [
    {
      key: "subject",
      header: "Subject",
      sortValue: (m) => m.subject.toLowerCase(),
      cell: (m) => (
        <div>
          <p className="font-medium text-[var(--dash-text)]">{m.subject}</p>
          <p className="text-xs text-[var(--dash-text-muted)]">
            {m.studentNames.slice(0, 3).join(", ")}
            {m.studentNames.length > 3 ? ` +${m.studentNames.length - 3}` : ""}
          </p>
        </div>
      ),
    },
    {
      key: "from",
      header: "From",
      cell: (m) => <span className="text-[var(--dash-text-muted)]">{m.fromStaffName}</span>,
    },
    {
      key: "delivered",
      header: "Delivered",
      sortValue: (m) => m.deliveredTo.length,
      cell: (m) => <span className="tabular-nums">{m.deliveredTo.length}</span>,
    },
    {
      key: "status",
      header: "Status",
      sortValue: (m) => m.status,
      cell: (m) =>
        m.status === "sent" ? (
          <Badge variant="success">Sent</Badge>
        ) : m.status === "partial" ? (
          <Badge variant="warning">Partial</Badge>
        ) : (
          <Badge variant="danger">Failed</Badge>
        ),
    },
    {
      key: "date",
      header: "Date",
      sortValue: (m) => m.createdAt,
      className: "text-right",
      cell: (m) => (
        <span className="text-xs text-[var(--dash-text-muted)]">
          {formatDateTime(m.createdAt)}
        </span>
      ),
    },
  ];

  const logFilters: FilterDef<ParentMessage>[] = [
    {
      key: "status",
      label: "Status",
      getValue: (m) => m.status,
      options: [
        { value: "", label: "All statuses" },
        { value: "sent", label: "Sent" },
        { value: "partial", label: "Partial" },
        { value: "failed", label: "Failed" },
      ],
    },
  ];

  return (
    <div className="space-y-6">
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Compose */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Mail className="w-4 h-4 text-[var(--dash-primary)]" />
              <h2 className="text-lg font-semibold text-[var(--dash-text)]">
                New parent message
              </h2>
            </div>
          </CardHeader>
          <CardBody className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium text-[var(--dash-text-muted)]">
                  Students
                </label>
                <select
                  value={classFilter}
                  onChange={(e) => setClassFilter(e.target.value)}
                  className="rounded-md border border-[var(--dash-border)] bg-[var(--dash-surface)] px-2 py-1 text-xs"
                >
                  <option value="">All classes</option>
                  {classOptions.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>
              {loading ? (
                <div className="h-24 bg-[var(--dash-surface-alt)] rounded-lg animate-pulse" />
              ) : (
                <StudentPicker
                  students={students}
                  selectedIds={selectedIds}
                  onChange={setSelectedIds}
                  classFilter={classFilter || undefined}
                />
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-[var(--dash-text-muted)] mb-1.5">
                Subject
              </label>
              <input
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className={inputClass}
                placeholder="e.g. Progress update for your child"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[var(--dash-text-muted)] mb-1.5">
                Message
              </label>
              <div className="rounded-lg border border-[var(--dash-border)]">
                <WysiwygEditor
                  content={body}
                  onChange={setBody}
                  placeholder="Write your message to parents…"
                />
              </div>
            </div>

            {/* Resolved recipients */}
            <div className="rounded-lg bg-[var(--dash-surface-alt)] p-4 space-y-2">
              <div className="flex items-center gap-2 text-sm font-medium text-[var(--dash-text)]">
                <Users2 className="w-4 h-4" />
                {resolved.emails.length} parent address
                {resolved.emails.length === 1 ? "" : "es"} will receive this
              </div>
              {resolved.emails.length > 0 && (
                <ul className="text-xs text-[var(--dash-text-muted)] space-y-1 max-h-32 overflow-y-auto">
                  {resolved.withEmail.map((s) => (
                    <li key={s.uid}>
                      {s.name} → {s.parentEmail}
                    </li>
                  ))}
                </ul>
              )}
              {resolved.missing.length > 0 && (
                <p className="flex items-start gap-2 text-xs text-amber-600">
                  <AlertTriangle className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                  {resolved.missing.length} selected student
                  {resolved.missing.length === 1 ? " has" : "s have"} no parent email
                  on file and will be skipped.
                </p>
              )}
            </div>

            <Button
              fullWidth
              size="lg"
              loading={sending}
              disabled={resolved.emails.length === 0}
              onClick={() => void send()}
            >
              <Send className="w-4 h-4" /> Send to parents
            </Button>
          </CardBody>
        </Card>

        {/* Delivery log */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Inbox className="w-4 h-4 text-[var(--dash-primary)]" />
              <h2 className="text-lg font-semibold text-[var(--dash-text)]">
                Delivery log
              </h2>
            </div>
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
                  rows={messages}
                  columns={logColumns}
                  filters={logFilters}
                  searchKeys={(m) => `${m.subject} ${m.studentNames.join(" ")}`}
                  searchPlaceholder="Search messages…"
                  emptyTitle="No messages yet"
                  emptyDescription="Messages you send to parents will be logged here."
                  emptyIcon={<Mail className="w-6 h-6" />}
                  getRowId={(m) => m.id}
                />
              </div>
            )}
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
