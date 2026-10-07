"use client";

import { useEffect, useState } from "react";
import { Megaphone, Send, Trash2 } from "lucide-react";
import toast from "react-hot-toast";
import DashboardShell from "@/app/components/dashboard/shell";
import { adminNav } from "@/app/components/dashboard/nav";
import { Card, CardBody, CardHeader } from "@/app/components/ui/card";
import { Badge } from "@/app/components/ui/badge";
import { Button } from "@/app/components/ui/button";
import { EmptyState } from "@/app/components/ui/empty";
import { WysiwygEditor } from "@/app/components/ui/wysiwyg-editor";
import { HtmlContent, isEmptyHtml } from "@/app/components/ui/html-content";
import { useAuth } from "@/lib/auth-context";
import {
  listNotificationsSent,
  listUsers,
  sendNotification,
  deleteNotification,
  newId,
  COL,
} from "@/lib/db";
import type { Audience, Notification, UserProfile } from "@/lib/types";
import { formatDateTime, inputClass } from "@/lib/utils";

const AUDIENCE_LABEL: Record<Audience, string> = {
  all: "Everyone",
  students: "All students",
  teachers: "All teachers",
  user: "Specific person",
};

export default function AdminAnnouncementsPage() {
  const { profile, institution } = useAuth();
  const [items, setItems] = useState<Notification[]>([]);
  const [people, setPeople] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [form, setForm] = useState({
    title: "",
    body: "",
    audience: "all" as Audience,
    targetUserId: "",
  });

  const reload = async () => {
    if (!institution) return;
    const [sent, users] = await Promise.all([
      listNotificationsSent(institution.id),
      listUsers(institution.id),
    ]);
    setItems(sent);
    setPeople(users.filter((u) => u.role !== "admin"));
  };

  useEffect(() => {
    if (!institution) return;
    reload().finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [institution]);

  const send = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!institution || !profile) return;
    if (form.audience === "user" && !form.targetUserId) return;
    if (isEmptyHtml(form.body)) return;
    setSending(true);
    try {
      await sendNotification({
        id: newId(COL.notifications),
        institutionId: institution.id,
        title: form.title.trim(),
        body: isEmptyHtml(form.body) ? "" : form.body,
        audience: form.audience,
        targetUserId: form.audience === "user" ? form.targetUserId : undefined,
        senderId: profile.uid,
        senderName: profile.name,
        senderRole: "admin",
        readBy: [profile.uid],
        createdAt: Date.now(),
      });
      setForm({ title: "", body: "", audience: "all", targetUserId: "" });
      await reload();
      toast.success("Announcement sent");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to send announcement. Please try again.");
    } finally {
      setSending(false);
    }
  };

  return (
    <DashboardShell
      role="admin"
      navItems={adminNav}
      title="Announcements"
      subtitle="Notify students, teachers, or everyone in your institution"
    >
      <div className="grid lg:grid-cols-5 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <h2 className="text-lg font-semibold text-[var(--dash-text)]">New announcement</h2>
          </CardHeader>
          <CardBody>
            <form onSubmit={send} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Audience
                </label>
                <select
                  value={form.audience}
                  onChange={(e) =>
                    setForm({ ...form, audience: e.target.value as Audience })
                  }
                  className={inputClass}
                >
                  <option value="all">Everyone</option>
                  <option value="students">All students</option>
                  <option value="teachers">All teachers</option>
                  <option value="user">A specific person</option>
                </select>
              </div>
              {form.audience === "user" && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Recipient
                  </label>
                  <select
                    required
                    value={form.targetUserId}
                    onChange={(e) =>
                      setForm({ ...form, targetUserId: e.target.value })
                    }
                    className={inputClass}
                  >
                    <option value="">Select…</option>
                    {people.map((p) => (
                      <option key={p.uid} value={p.uid}>
                        {p.name} ({p.role}) — {p.email}
                      </option>
                    ))}
                  </select>
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Title
                </label>
                <input
                  required
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  className={inputClass}
                  placeholder="Exam timetable released"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Message
                </label>
                <WysiwygEditor
                  content={form.body}
                  onChange={(body) => setForm({ ...form, body })}
                  placeholder="Write the announcement…"
                  minHeight={160}
                />
              </div>
              <Button type="submit" loading={sending} fullWidth>
                <Send className="w-4 h-4" /> Send
              </Button>
            </form>
          </CardBody>
        </Card>

        <Card className="lg:col-span-3">
          <CardHeader>
            <h2 className="text-lg font-semibold text-[var(--dash-text)]">Sent</h2>
          </CardHeader>
          <CardBody className="p-0">
            {loading ? (
              <div className="p-6 space-y-3">
                {[0, 1].map((i) => (
                  <div key={i} className="h-16 bg-gray-50 rounded-lg animate-pulse" />
                ))}
              </div>
            ) : items.length === 0 ? (
              <EmptyState
                icon={<Megaphone className="w-6 h-6" />}
                title="No announcements yet"
                description="Send one to students, teachers, or a specific person."
              />
            ) : (
              <div className="divide-y divide-gray-50">
                {items.map((n) => (
                  <div key={n.id} className="px-6 py-4 flex gap-4">
                    <div className="w-9 h-9 rounded-lg bg-[var(--dash-primary-soft)] flex items-center justify-center shrink-0">
                      <Megaphone className="w-4 h-4 text-[var(--dash-primary)]" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="text-sm font-semibold text-[var(--dash-text)]">{n.title}</p>
                        <Badge variant="info">{AUDIENCE_LABEL[n.audience]}</Badge>
                      </div>
                      <HtmlContent html={n.body} compact className="mt-1" />
                      <p className="text-xs text-gray-400 mt-2">
                        {formatDateTime(n.createdAt)} · {n.readBy.length} read
                      </p>
                    </div>
                    <button
                      onClick={async () => {
                        setDeletingId(n.id);
                        try {
                          await deleteNotification(n.id);
                          await reload();
                          toast.success("Announcement deleted");
                        } catch {
                          toast.error("Failed to delete. Please try again.");
                        } finally {
                          setDeletingId(null);
                        }
                      }}
                      disabled={deletingId === n.id}
                      className="p-2 text-gray-400 hover:text-red-600 disabled:opacity-40"
                      aria-label="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </CardBody>
        </Card>
      </div>
    </DashboardShell>
  );
}
