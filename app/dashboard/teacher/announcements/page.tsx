"use client";

import { useEffect, useState } from "react";
import { Megaphone, Send, Trash2 } from "lucide-react";
import toast from "react-hot-toast";
import DashboardShell from "@/app/components/dashboard/shell";
import { teacherNav } from "@/app/components/dashboard/nav";
import { Card, CardBody, CardHeader } from "@/app/components/ui/card";
import { Badge } from "@/app/components/ui/badge";
import { Button } from "@/app/components/ui/button";
import { EmptyState } from "@/app/components/ui/empty";
import { WysiwygEditor } from "@/app/components/ui/wysiwyg-editor";
import { HtmlContent, isEmptyHtml } from "@/app/components/ui/html-content";
import { useAuth } from "@/lib/auth-context";
import {
  listNotificationsSent,
  sendNotification,
  deleteNotification,
  newId,
  COL,
} from "@/lib/db";
import type { Notification } from "@/lib/types";
import { formatDateTime, inputClass } from "@/lib/utils";

export default function TeacherAnnouncementsPage() {
  const { profile, institution } = useAuth();
  const [items, setItems] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [form, setForm] = useState({ title: "", body: "", audience: "students" as "students" | "all" });

  const reload = async () => {
    if (!institution) return;
    // Filter to only this teacher's announcements
    const all = await listNotificationsSent(institution.id);
    setItems(all.filter((n) => n.senderId === profile?.uid));
  };

  useEffect(() => {
    if (!institution || !profile) return;
    reload().finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [institution, profile]);

  const send = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!institution || !profile || isEmptyHtml(form.body) || !form.title.trim()) return;
    setSending(true);
    try {
      await sendNotification({
        id: newId(COL.notifications),
        institutionId: institution.id,
        title: form.title.trim(),
        body: form.body,
        audience: form.audience,
        senderId: profile.uid,
        senderName: profile.name,
        senderRole: "teacher",
        readBy: [profile.uid],
        createdAt: Date.now(),
      });
      setForm({ title: "", body: "", audience: "students" });
      await reload();
      toast.success("Announcement sent");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to send. Please try again.");
    } finally {
      setSending(false);
    }
  };

  const AUDIENCE_LABEL: Record<string, string> = {
    students: "My students",
    all: "Everyone",
  };

  return (
    <DashboardShell
      role="teacher"
      navItems={teacherNav}
      title="Announcements"
      subtitle="Send notices to your students"
    >
      <div className="grid lg:grid-cols-5 gap-6">
        {/* Compose */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <h2 className="text-lg font-semibold">New announcement</h2>
          </CardHeader>
          <CardBody>
            <form onSubmit={send} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[var(--dash-text)] mb-1.5">Audience</label>
                <select value={form.audience} onChange={(e) => setForm({ ...form, audience: e.target.value as typeof form.audience })} className={inputClass}>
                  <option value="students">All students</option>
                  <option value="all">Everyone (students + teachers)</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-[var(--dash-text)] mb-1.5">Title</label>
                <input required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })}
                  className={inputClass} placeholder="Homework due Friday" />
              </div>
              <div>
                <label className="block text-sm font-medium text-[var(--dash-text)] mb-1.5">Message</label>
                <WysiwygEditor content={form.body} onChange={(body) => setForm({ ...form, body })}
                  placeholder="Write your announcement…" minHeight={140} />
              </div>
              <Button type="submit" loading={sending} fullWidth disabled={!form.title.trim() || isEmptyHtml(form.body)}>
                <Send className="w-4 h-4" /> Send
              </Button>
            </form>
          </CardBody>
        </Card>

        {/* Sent list */}
        <Card className="lg:col-span-3">
          <CardHeader>
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Sent</h2>
              <Badge variant="info">{items.length}</Badge>
            </div>
          </CardHeader>
          <CardBody className="p-0">
            {loading ? (
              <div className="p-6 space-y-3">
                {[0, 1].map((i) => <div key={i} className="h-16 bg-[var(--dash-surface-alt)] rounded-lg animate-pulse" />)}
              </div>
            ) : items.length === 0 ? (
              <EmptyState icon={<Megaphone className="w-6 h-6" />} title="No announcements yet"
                description="Send one to notify your students." />
            ) : (
              <div className="divide-y divide-[var(--dash-border)]">
                {items.map((n) => (
                  <div key={n.id} className="px-6 py-4 flex gap-4">
                    <div className="w-9 h-9 rounded-lg bg-[var(--dash-primary-soft)] flex items-center justify-center shrink-0">
                      <Megaphone className="w-4 h-4 text-[var(--dash-primary)]" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <p className="text-sm font-semibold text-[var(--dash-text)]">{n.title}</p>
                        <Badge variant="info">{AUDIENCE_LABEL[n.audience] ?? n.audience}</Badge>
                      </div>
                      <HtmlContent html={n.body} compact className="mt-1" />
                      <p className="text-xs text-[var(--dash-text-faint)] mt-2">
                        {formatDateTime(n.createdAt)} · {n.readBy.length} read
                      </p>
                    </div>
                    <button
                      onClick={async () => {
                        setDeletingId(n.id);
                        try {
                          await deleteNotification(n.id);
                          await reload();
                          toast.success("Deleted");
                        } catch {
                          toast.error("Failed to delete.");
                        } finally {
                          setDeletingId(null);
                        }
                      }}
                      disabled={deletingId === n.id}
                      className="p-2 text-[var(--dash-text-faint)] hover:text-red-600 disabled:opacity-40 transition-colors"
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
