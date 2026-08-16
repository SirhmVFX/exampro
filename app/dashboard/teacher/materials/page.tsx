"use client";

import { useEffect, useState } from "react";
import { BookOpen, Plus, Trash2, Upload } from "lucide-react";
import DashboardShell from "@/app/components/dashboard/shell";
import { teacherNav } from "@/app/components/dashboard/nav";
import { Card, CardBody } from "@/app/components/ui/card";
import { Badge } from "@/app/components/ui/badge";
import { Button } from "@/app/components/ui/button";
import { Modal } from "@/app/components/ui/modal";
import { EmptyState } from "@/app/components/ui/empty";
import { WysiwygEditor } from "@/app/components/ui/wysiwyg-editor";
import { HtmlContent, isEmptyHtml } from "@/app/components/ui/html-content";
import { useAuth } from "@/lib/auth-context";
import {
  listMaterialsByTeacher,
  listAssessmentsByTeacher,
  saveMaterial,
  deleteMaterial,
  newId,
  COL,
} from "@/lib/db";
import { uploadToCloudinary } from "@/lib/cloudinary";
import type { Material, MaterialType } from "@/lib/types";
import { formatDate, inputClass } from "@/lib/utils";

export default function TeacherMaterialsPage() {
  const { profile, institution } = useAuth();
  const [items, setItems] = useState<Material[]>([]);
  const [assessments, setAssessments] = useState<{ id: string; title: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    title: "",
    description: "",
    subject: "",
    className: "",
    type: "document" as MaterialType,
    url: "",
    content: "",
    linkedAssessmentId: "",
  });

  const reload = async () => {
    if (!institution || !profile) return;
    const [m, a] = await Promise.all([
      listMaterialsByTeacher(institution.id, profile.uid),
      listAssessmentsByTeacher(institution.id, profile.uid),
    ]);
    setItems(m);
    setAssessments(a.map((x) => ({ id: x.id, title: x.title })));
  };

  useEffect(() => {
    if (!institution || !profile) return;
    reload().finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [institution, profile]);

  const save = async () => {
    if (!institution || !profile) return;
    setError("");
    setSaving(true);
    try {
      await saveMaterial({
        id: newId(COL.materials),
        institutionId: institution.id,
        teacherId: profile.uid,
        teacherName: profile.name,
        title: form.title.trim(),
        description: isEmptyHtml(form.description) ? undefined : form.description.trim(),
        subject: form.subject,
        className: form.className,
        type: form.type,
        url: form.url || undefined,
        content: isEmptyHtml(form.content) ? undefined : form.content,
        linkedAssessmentId: form.linkedAssessmentId || undefined,
        createdAt: Date.now(),
      });
      setOpen(false);
      setForm({
        title: "",
        description: "",
        subject: institution.subjects[0] ?? "",
        className: institution.classes[0] ?? "",
        type: "document",
        url: "",
        content: "",
        linkedAssessmentId: "",
      });
      await reload();
    } catch {
      setError("Couldn't save material.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <DashboardShell
      role="teacher"
      navItems={teacherNav}
      title="Learning materials"
      subtitle="Share notes, files and videos — optionally require an assessment after"
    >
      <div className="space-y-6">
        <div className="flex justify-end">
          <Button
            onClick={() => {
              setForm((f) => ({
                ...f,
                subject: institution?.subjects[0] ?? "",
                className: institution?.classes[0] ?? "",
              }));
              setOpen(true);
            }}
          >
            <Plus className="w-4 h-4" /> Add material
          </Button>
        </div>
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
                description="Upload a document or add a note for your students."
              />
            ) : (
              <div className="divide-y divide-gray-50">
                {items.map((m) => (
                  <div key={m.id} className="px-6 py-4 flex gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex gap-2 mb-1">
                        <Badge variant="info">{m.type}</Badge>
                        <Badge variant="outline">{m.subject}</Badge>
                        <span className="text-xs text-gray-400">{m.className}</span>
                      </div>
                      <p className="font-medium text-gray-900">{m.title}</p>
                      {m.description && (
                        <HtmlContent html={m.description} compact className="mt-0.5" />
                      )}
                      <p className="text-xs text-gray-400 mt-1">{formatDate(m.createdAt)}</p>
                    </div>
                    <button
                      onClick={async () => {
                        if (!confirm("Delete this material?")) return;
                        await deleteMaterial(m.id);
                        await reload();
                      }}
                      className="p-2 text-gray-400 hover:text-red-600"
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

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="Add learning material"
        wide
        footer={
          <>
            <Button variant="ghost" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button loading={saving} onClick={() => void save()}>
              Save
            </Button>
          </>
        }
      >
        {error && <p className="text-sm text-red-600 mb-3">{error}</p>}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1.5">Title</label>
            <input
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              className={inputClass}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5">Description</label>
            <WysiwygEditor
              content={form.description}
              onChange={(description) => setForm({ ...form, description })}
              placeholder="What should students know about this material?"
              minHeight={110}
            />
          </div>
          <div className="grid sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-sm font-medium mb-1.5">Type</label>
              <select
                value={form.type}
                onChange={(e) =>
                  setForm({ ...form, type: e.target.value as MaterialType })
                }
                className={inputClass}
              >
                <option value="document">Document</option>
                <option value="video">Video</option>
                <option value="link">Link</option>
                <option value="note">Note</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">Subject</label>
              <select
                value={form.subject}
                onChange={(e) => setForm({ ...form, subject: e.target.value })}
                className={inputClass}
              >
                <option value="">Select…</option>
                {(institution?.subjects ?? []).map((s) => (
                  <option key={s}>{s}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">
                {institution?.classLabel ?? "Class"}
              </label>
              <select
                value={form.className}
                onChange={(e) => setForm({ ...form, className: e.target.value })}
                className={inputClass}
              >
                <option value="">Select…</option>
                {(institution?.classes ?? []).map((s) => (
                  <option key={s}>{s}</option>
                ))}
              </select>
            </div>
          </div>
          {form.type === "note" ? (
            <div>
              <label className="block text-sm font-medium mb-1.5">Note content</label>
              <WysiwygEditor
                content={form.content}
                onChange={(content) => setForm({ ...form, content })}
                placeholder="Write the lesson note. Insert images from the toolbar."
                minHeight={240}
              />
            </div>
          ) : form.type === "link" || form.type === "video" ? (
            <div>
              <label className="block text-sm font-medium mb-1.5">URL</label>
              <input
                value={form.url}
                onChange={(e) => setForm({ ...form, url: e.target.value })}
                className={inputClass}
                placeholder="https://"
              />
            </div>
          ) : (
            <div>
              <label className="block text-sm font-medium mb-1.5">File</label>
              <label className="flex items-center gap-2 text-sm text-[var(--dash-primary)] cursor-pointer">
                <Upload className="w-4 h-4" />
                {uploading ? "Uploading…" : form.url ? "Replace file" : "Upload to Cloudinary"}
                <input
                  type="file"
                  className="hidden"
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (!file || !institution) return;
                    setUploading(true);
                    setError("");
                    try {
                      const r = await uploadToCloudinary(
                        file,
                        `exampro/${institution.id}/materials`
                      );
                      setForm((f) => ({ ...f, url: r.url }));
                    } catch (err) {
                      setError(
                        err instanceof Error ? err.message : "Upload failed"
                      );
                    } finally {
                      setUploading(false);
                    }
                  }}
                />
              </label>
              {form.url && (
                <p className="text-xs text-emerald-600 mt-1 truncate">{form.url}</p>
              )}
            </div>
          )}
          <div>
            <label className="block text-sm font-medium mb-1.5">
              Follow-up assessment (optional)
            </label>
            <select
              value={form.linkedAssessmentId}
              onChange={(e) =>
                setForm({ ...form, linkedAssessmentId: e.target.value })
              }
              className={inputClass}
            >
              <option value="">None</option>
              {assessments.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.title}
                </option>
              ))}
            </select>
            <p className="text-xs text-gray-400 mt-1">
              Students will be prompted to take this after marking the material complete.
            </p>
          </div>
        </div>
      </Modal>
    </DashboardShell>
  );
}
