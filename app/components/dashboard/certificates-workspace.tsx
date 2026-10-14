"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import toast from "react-hot-toast";
import {
  Award,
  LayoutTemplate,
  Send,
  Trash2,
  Plus,
  ImageIcon,
} from "lucide-react";
import { Card, CardBody, CardHeader } from "@/app/components/ui/card";
import { Button } from "@/app/components/ui/button";
import { Badge } from "@/app/components/ui/badge";
import { EmptyState } from "@/app/components/ui/empty";
import { StudentPicker } from "@/app/components/ui/student-picker";
import { ImageUpload } from "@/app/components/ui/image-upload";
import { CopyButton } from "@/app/components/ui/copy-button";
import { useAuth } from "@/lib/auth-context";
import {
  issueCertificate,
  saveCertificate,
  listCertificates,
  listUsers,
  writeAudit,
  listCertificateTemplates,
  saveCertificateTemplate,
  deleteCertificateTemplate,
  newId,
  COL,
} from "@/lib/db";
import type {
  Certificate,
  CertificateTemplate,
  Role,
  UserProfile,
} from "@/lib/types";
import { inputClass, formatDate } from "@/lib/utils";
import { vocab } from "@/lib/vocab";
import { learnerClassNames } from "@/lib/learners";
import { uploadToCloudinary } from "@/lib/cloudinary";
import { appOrigin } from "@/lib/domain";

type Tab = "issue" | "templates" | "send";

const FONT_SIZES = [24, 32, 40, 48, 56, 64, 72, 96, 120];
const FONTS = ["Georgia, serif", "Times New Roman, serif", "Arial, sans-serif", "cursive"];

/** Load an image allowing canvas export, returning its data URL after drawing
 *  the recipient name onto a template. */
async function renderCertificate(
  imageUrl: string,
  name: string,
  tpl: Pick<CertificateTemplate, "nameX" | "nameY" | "fontSize" | "fontFamily" | "color" | "centerName">,
): Promise<string> {
  const img = new Image();
  img.crossOrigin = "anonymous";
  img.src = imageUrl;
  await new Promise<void>((resolve, reject) => {
    img.onload = () => resolve();
    img.onerror = () => reject(new Error("Could not load the certificate image."));
  });
  const canvas = document.createElement("canvas");
  canvas.width = img.naturalWidth;
  canvas.height = img.naturalHeight;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas is not supported in this browser.");
  ctx.drawImage(img, 0, 0);
  ctx.font = `${tpl.fontSize}px ${tpl.fontFamily}`;
  ctx.fillStyle = tpl.color;
  ctx.textBaseline = "middle";
  ctx.textAlign = tpl.centerName ? "center" : "left";
  ctx.fillText(name, tpl.nameX, tpl.nameY);
  return canvas.toDataURL("image/png");
}

function dataUrlToBase64(dataUrl: string): string {
  return dataUrl.split(",")[1] ?? "";
}

function dataUrlToFile(dataUrl: string, filename: string): File {
  const [head, b64] = dataUrl.split(",");
  const mime = head.match(/:(.*?);/)?.[1] ?? "image/png";
  const bin = atob(b64);
  const arr = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) arr[i] = bin.charCodeAt(i);
  return new File([arr], filename, { type: mime });
}

export default function CertificatesWorkspace({ role }: { role: Role }) {
  const { institution } = useAuth();
  const v = vocab(institution);
  const [tab, setTab] = useState<Tab>("issue");
  const [certs, setCerts] = useState<Certificate[]>([]);
  const [students, setStudents] = useState<UserProfile[]>([]);
  const [templates, setTemplates] = useState<CertificateTemplate[]>([]);
  const [loading, setLoading] = useState(true);

  const reload = useCallback(async () => {
    if (!institution) return;
    const [c, s, t] = await Promise.all([
      listCertificates(institution.id),
      listUsers(institution.id, "student"),
      listCertificateTemplates(institution.id),
    ]);
    setCerts(c);
    setStudents(s);
    setTemplates(t);
    setLoading(false);
  }, [institution]);

  useEffect(() => {
    void reload();
  }, [reload]);

  const origin = typeof window !== "undefined" ? window.location.origin : appOrigin();

  const tabs: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: "issue", label: "Issue", icon: <Award className="w-4 h-4" /> },
    { id: "templates", label: "Templates", icon: <LayoutTemplate className="w-4 h-4" /> },
    { id: "send", label: "Send", icon: <Send className="w-4 h-4" /> },
  ];

  return (
    <div className="space-y-6">
      <div className="flex gap-2 border-b border-[var(--dash-border)]">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition ${
              tab === t.id
                ? "border-[var(--dash-primary)] text-[var(--dash-primary)]"
                : "border-transparent text-[var(--dash-text-muted)] hover:text-[var(--dash-text)]"
            }`}
          >
            {t.icon}
            {t.label}
          </button>
        ))}
      </div>

      {tab === "issue" && (
        <IssueTab
          origin={origin}
          certs={certs}
          students={students}
          loading={loading}
          v={v}
          onIssued={reload}
        />
      )}
      {tab === "templates" && (
        <TemplatesTab
          templates={templates}
          onSaved={reload}
          role={role}
        />
      )}
      {tab === "send" && (
        <SendTab
          templates={templates}
          students={students}
          origin={origin}
          role={role}
          onSent={reload}
        />
      )}
    </div>
  );
}

// ─── Issue (verify-code) ──────────────────────────────────────────────────────

function IssueTab({
  origin,
  certs,
  students,
  loading,
  v,
  onIssued,
}: {
  origin: string;
  certs: Certificate[];
  students: UserProfile[];
  loading: boolean;
  v: ReturnType<typeof vocab>;
  onIssued: () => Promise<void>;
}) {
  const { institution, profile } = useAuth();
  const [form, setForm] = useState({
    userId: "",
    title: "Certificate of completion",
    skills: "",
  });
  const [saving, setSaving] = useState(false);

  const issue = async () => {
    if (!institution || !profile || !form.userId) return;
    const user = students.find((s) => s.uid === form.userId);
    if (!user) return;
    setSaving(true);
    try {
      const cert = await issueCertificate({
        institution,
        user,
        title: form.title.trim() || "Certificate of completion",
        cohortName: learnerClassNames(user)[0],
        skills: form.skills.split(",").map((x) => x.trim()).filter(Boolean),
      });
      await writeAudit({
        institutionId: institution.id,
        actorId: profile.uid,
        actorName: profile.name,
        action: "certificate.issue",
        entityType: "certificate",
        entityId: cert.id,
        detail: `${user.name} · ${cert.verifyCode}`,
      });
      setForm({ userId: "", title: "Certificate of completion", skills: "" });
      await onIssued();
      toast.success(`Certificate issued for ${user.name}`);
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to issue certificate.",
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="grid lg:grid-cols-2 gap-6 items-start">
      <Card>
        <CardHeader>
          <h2 className="font-semibold text-[var(--dash-text)]">
            Issue with verify code
          </h2>
        </CardHeader>
        <CardBody className="space-y-3">
          <select
            value={form.userId}
            onChange={(e) => setForm({ ...form, userId: e.target.value })}
            className={inputClass}
          >
            <option value="">Select {v.student.toLowerCase()}…</option>
            {students.map((s) => (
              <option key={s.uid} value={s.uid}>
                {s.name} · {s.email}
              </option>
            ))}
          </select>
          <input
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            className={inputClass}
            placeholder="Title"
          />
          <input
            value={form.skills}
            onChange={(e) => setForm({ ...form, skills: e.target.value })}
            className={inputClass}
            placeholder="Skills (comma separated)"
          />
          <Button loading={saving} onClick={() => void issue()} disabled={!form.userId}>
            Issue certificate
          </Button>
        </CardBody>
      </Card>

      <Card>
        <CardHeader>
          <h2 className="font-semibold text-[var(--dash-text)]">Issued certificates</h2>
        </CardHeader>
        <CardBody className="p-0 max-h-[60vh] overflow-y-auto">
          {loading ? (
            <p className="px-6 py-8 text-sm text-[var(--dash-text-faint)]">Loading…</p>
          ) : certs.length === 0 ? (
            <EmptyState
              icon={<Award className="w-6 h-6" />}
              title="None issued yet"
              description="Issue a certificate to get started."
            />
          ) : (
            <div className="divide-y divide-[var(--dash-border)]">
              {certs.map((c) => (
                <div key={c.id} className="px-6 py-3 flex items-center gap-3 text-sm">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-[var(--dash-text)]">{c.userName}</p>
                    <p className="text-xs text-[var(--dash-text-muted)] truncate">
                      {c.title} · {formatDate(c.issuedAt)} · {c.verifyCode}
                      {c.emailedAt ? " · emailed" : ""}
                    </p>
                  </div>
                  <CopyButton text={`${origin}/verify/${c.verifyCode}`} />
                </div>
              ))}
            </div>
          )}
        </CardBody>
      </Card>
    </div>
  );
}

// ─── Templates ────────────────────────────────────────────────────────────────

function TemplatesTab({
  templates,
  onSaved,
  role,
}: {
  templates: CertificateTemplate[];
  onSaved: () => Promise<void>;
  role: Role;
}) {
  const { institution } = useAuth();
  const [creating, setCreating] = useState(false);
  const [imageUrl, setImageUrl] = useState("");
  const [name, setName] = useState("");
  const [fontSize, setFontSize] = useState(48);
  const [fontFamily, setFontFamily] = useState(FONTS[0]);
  const [color, setColor] = useState("#1f2937");
  const [centerName, setCenterName] = useState(true);
  const [defaultTitle, setDefaultTitle] = useState("Certificate of Completion");
  const [pos, setPos] = useState<{ x: number; y: number } | null>(null);
  const [natural, setNatural] = useState<{ w: number; h: number } | null>(null);
  const [sampleName] = useState("Jane Doe");
  const [saving, setSaving] = useState(false);
  const previewRef = useRef<HTMLImageElement>(null);

  // When an image is set, capture its natural dimensions.
  useEffect(() => {
    if (!imageUrl) {
      setNatural(null);
      setPos(null);
      return;
    }
    const img = new Image();
    img.onload = () => setNatural({ w: img.naturalWidth, h: img.naturalHeight });
    img.src = imageUrl;
  }, [imageUrl]);

  const handleClick = (e: React.MouseEvent<HTMLImageElement>) => {
    if (!natural || !previewRef.current) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * natural.w;
    const y = ((e.clientY - rect.top) / rect.height) * natural.h;
    setPos({ x: Math.round(x), y: Math.round(y) });
  };

  const reset = () => {
    setCreating(false);
    setImageUrl("");
    setName("");
    setPos(null);
    setFontSize(48);
    setFontFamily(FONTS[0]);
    setColor("#1f2937");
    setCenterName(true);
    setDefaultTitle("Certificate of Completion");
  };

  const save = async () => {
    if (!institution) return;
    if (!imageUrl || !name.trim() || !pos) {
      toast.error("Upload an image, name the template and click where the name goes.");
      return;
    }
    setSaving(true);
    try {
      await saveCertificateTemplate({
        id: newId(COL.certificateTemplates),
        institutionId: institution.id,
        name: name.trim(),
        imageUrl,
        imageWidth: natural?.w ?? 0,
        imageHeight: natural?.h ?? 0,
        nameX: pos.x,
        nameY: pos.y,
        fontSize,
        fontFamily,
        color,
        centerName,
        defaultTitle: defaultTitle.trim() || undefined,
        createdAt: Date.now(),
      });
      await onSaved();
      toast.success("Template saved");
      reset();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Couldn't save template.");
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id: string) => {
    if (!confirm("Delete this template?")) return;
    try {
      await deleteCertificateTemplate(id);
      await onSaved();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Couldn't delete template.");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-[var(--dash-text)]">
          Certificate templates
        </h2>
        {!creating && (
          <Button size="sm" onClick={() => setCreating(true)}>
            <Plus className="w-4 h-4" /> New template
          </Button>
        )}
      </div>

      {creating && (
        <Card>
          <CardHeader>
            <h3 className="font-semibold text-[var(--dash-text)]">New template</h3>
          </CardHeader>
          <CardBody className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <ImageUpload
                label="Blank certificate image"
                value={imageUrl}
                onChange={setImageUrl}
                folder="exampro/certificates"
              />
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-[var(--dash-text-muted)] mb-1">
                    Template name
                  </label>
                  <input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className={inputClass}
                    placeholder="e.g. Award of Excellence"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[var(--dash-text-muted)] mb-1">
                    Default title
                  </label>
                  <input
                    value={defaultTitle}
                    onChange={(e) => setDefaultTitle(e.target.value)}
                    className={inputClass}
                  />
                </div>
              </div>
            </div>

            {imageUrl ? (
              <div className="space-y-3">
                <p className="text-sm text-[var(--dash-text-muted)]">
                  Click on the certificate to place where each student&apos;s name goes.
                  <span className="text-[var(--dash-text-faint)]"> (sample: {sampleName})</span>
                </p>
                <div className="relative inline-block max-w-full">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    ref={previewRef}
                    src={imageUrl}
                    alt="Template preview"
                    onClick={handleClick}
                    className="max-w-full rounded-lg border border-[var(--dash-border)] cursor-crosshair"
                  />
                  {pos && natural && (
                    <span
                      className="absolute text-[var(--dash-primary)] font-semibold pointer-events-none whitespace-nowrap"
                      style={{
                        left: `${(pos.x / natural.w) * 100}%`,
                        top: `${(pos.y / natural.h) * 100}%`,
                        transform: centerName ? "translate(-50%, -50%)" : "translate(0, -50%)",
                        fontSize: `${Math.max(12, Math.min(28, fontSize / 3))}px`,
                        fontFamily,
                        color,
                      }}
                    >
                      {sampleName}
                    </span>
                  )}
                </div>
                {pos && (
                  <p className="text-xs text-[var(--dash-text-faint)]">
                    Position: x={pos.x}, y={pos.y} of {natural?.w}×{natural?.h}
                  </p>
                )}

                <div className="grid sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-semibold uppercase text-[var(--dash-text-muted)] mb-1">
                      Font size
                    </label>
                    <select
                      value={fontSize}
                      onChange={(e) => setFontSize(Number(e.target.value))}
                      className={inputClass}
                    >
                      {FONT_SIZES.map((s) => (
                        <option key={s} value={s}>
                          {s}px
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold uppercase text-[var(--dash-text-muted)] mb-1">
                      Font
                    </label>
                    <select
                      value={fontFamily}
                      onChange={(e) => setFontFamily(e.target.value)}
                      className={inputClass}
                    >
                      {FONTS.map((f) => (
                        <option key={f} value={f}>
                          {f.split(",")[0]}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold uppercase text-[var(--dash-text-muted)] mb-1">
                      Color
                    </label>
                    <input
                      type="color"
                      value={color}
                      onChange={(e) => setColor(e.target.value)}
                      className="w-full h-9 rounded-lg border border-[var(--dash-border)] bg-[var(--dash-surface)]"
                    />
                  </div>
                </div>

                <label className="flex items-center gap-2 text-sm text-[var(--dash-text)]">
                  <input
                    type="checkbox"
                    checked={centerName}
                    onChange={(e) => setCenterName(e.target.checked)}
                  />
                  Center the name on the placed point
                </label>
              </div>
            ) : (
              <p className="text-sm text-[var(--dash-text-faint)]">
                Upload a certificate image to place the name token.
              </p>
            )}

            <div className="flex gap-2">
              <Button onClick={() => void save()} loading={saving}>
                Save template
              </Button>
              <Button variant="outline" onClick={reset}>
                Cancel
              </Button>
            </div>
          </CardBody>
        </Card>
      )}

      {templates.length === 0 && !creating ? (
        <Card>
          <EmptyState
            icon={<LayoutTemplate className="w-6 h-6" />}
            title="No templates yet"
            description="Create a template to auto-merge each student's name onto a certificate."
          />
        </Card>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {templates.map((t) => (
            <Card key={t.id}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={t.imageUrl} alt={t.name} className="w-full h-36 object-cover rounded-t-xl" />
              <CardBody className="space-y-1">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="font-medium text-[var(--dash-text)]">{t.name}</p>
                    <p className="text-xs text-[var(--dash-text-muted)]">
                      {t.defaultTitle ?? "Certificate"} · {t.fontSize}px
                    </p>
                  </div>
                  {role === "admin" && (
                    <button
                      onClick={() => void remove(t.id)}
                      className="p-1.5 rounded-md text-[var(--dash-text-faint)] hover:text-red-600 transition"
                      title="Delete template"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </CardBody>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Send (merge + deliver) ───────────────────────────────────────────────────

function SendTab({
  templates,
  students,
  origin,
  role,
  onSent,
}: {
  templates: CertificateTemplate[];
  students: UserProfile[];
  origin: string;
  role: Role;
  onSent: () => Promise<void>;
}) {
  const { institution, profile } = useAuth();
  const [mode, setMode] = useState<"template" | "upload">("template");
  const [templateId, setTemplateId] = useState("");
  const [uploadUrl, setUploadUrl] = useState("");
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState(
    "Congratulations on your achievement! Your certificate is attached.",
  );
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [classFilter, setClassFilter] = useState("");
  const [sendToParent, setSendToParent] = useState(false);
  const [sending, setSending] = useState(false);
  const [progress, setProgress] = useState("");

  const template = useMemo(
    () => templates.find((t) => t.id === templateId) ?? null,
    [templates, templateId],
  );

  useEffect(() => {
    if (template?.defaultTitle && !title) setTitle(template.defaultTitle);
  }, [template, title]);

  const selectedStudents = students.filter((s) => selectedIds.includes(s.uid));

  const classOptions = useMemo(() => {
    const set = new Set<string>();
    for (const s of students) {
      (s.classNames?.length ? s.classNames : s.className ? [s.className] : []).forEach((c) =>
        set.add(c),
      );
    }
    return [...set].sort();
  }, [students]);

  const imageUrl = mode === "template" ? template?.imageUrl : uploadUrl;

  const handleSend = async () => {
    if (!institution || !profile) return;
    if (!imageUrl) {
      toast.error("Choose a template or upload a finished certificate.");
      return;
    }
    if (selectedStudents.length === 0) {
      toast.error("Select at least one recipient.");
      return;
    }
    setSending(true);
    let sentCount = 0;
    let failCount = 0;
    try {
      for (let i = 0; i < selectedStudents.length; i++) {
        const student = selectedStudents[i];
        setProgress(`Rendering ${i + 1}/${selectedStudents.length} · ${student.name}`);
        const certTitle = title.trim() || template?.defaultTitle || "Certificate of Completion";

        // Render the merged image (template) or reuse the upload.
        let dataUrl: string;
        if (mode === "template" && template) {
          dataUrl = await renderCertificate(imageUrl!, student.name, template);
        } else {
          dataUrl = imageUrl!;
        }

        // Persist a Certificate record with a verify code.
        const cert = await issueCertificate({
          institution,
          user: { uid: student.uid, name: student.name },
          title: certTitle,
          cohortName: learnerClassNames(student)[0],
        });
        let hostedUrl: string | undefined;
        try {
          const file = dataUrlToFile(dataUrl, `certificate-${student.name}.png`);
          const up = await uploadToCloudinary(file, "exampro/certificates/issued");
          hostedUrl = up.url;
        } catch {
          // Hosting is optional; the emailed attachment still carries the image.
        }
        await saveCertificate({
          ...cert,
          imageUrl: hostedUrl,
          templateId: mode === "template" ? template?.id : undefined,
        });

        setProgress(`Emailing ${i + 1}/${selectedStudents.length} · ${student.name}`);
        const emailTo =
          sendToParent && student.parentEmail?.trim() ? student.parentEmail.trim() : student.email;
        const res = await fetch("/api/certificates/send", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            to: emailTo,
            studentName: student.name,
            subject: `${certTitle} — ${institution.name}`,
            message: `${message}\n\nVerify code: ${cert.verifyCode}\nCheck online: ${origin}/verify/${cert.verifyCode}`,
            schoolName: institution.name,
            attachmentBase64: dataUrlToBase64(dataUrl),
            attachmentFilename: `certificate-${student.name.replace(/\s+/g, "-").toLowerCase()}.png`,
          }),
        });
        if (res.ok) {
          sentCount += 1;
          await saveCertificate({ ...cert, imageUrl: hostedUrl, emailedAt: Date.now() });
        } else {
          failCount += 1;
          const d = await res.json().catch(() => null);
          console.error("cert send failed", d?.error);
        }
      }

      await writeAudit({
        institutionId: institution.id,
        actorId: profile.uid,
        actorName: profile.name,
        action: "certificate.send",
        entityType: "certificate",
        entityId: "",
        detail: `${sentCount} sent, ${failCount} failed`,
      });
      await onSent();

      if (failCount === 0) toast.success(`Delivered ${sentCount} certificate(s).`);
      else if (sentCount > 0) toast(`Sent ${sentCount}, ${failCount} failed.`, { icon: "⚠️" });
      else toast.error("Certificates could not be delivered.");

      if (sentCount > 0) setSelectedIds([]);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Something went wrong.");
    } finally {
      setSending(false);
      setProgress("");
    }
  };

  return (
    <div className="grid lg:grid-cols-2 gap-6 items-start">
      <Card>
        <CardHeader>
          <h2 className="font-semibold text-[var(--dash-text)]">Compose & send</h2>
        </CardHeader>
        <CardBody className="space-y-4">
          <div className="flex gap-2">
            {(["template", "upload"] as const).map((m) => (
              <button
                key={m}
                onClick={() => setMode(m)}
                className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium border transition ${
                  mode === m
                    ? "border-[var(--dash-primary)] bg-[var(--dash-primary-soft)] text-[var(--dash-primary)]"
                    : "border-[var(--dash-border)] text-[var(--dash-text-muted)]"
                }`}
              >
                {m === "template" ? "Use a template" : "Upload finished file"}
              </button>
            ))}
          </div>

          {mode === "template" ? (
            templates.length === 0 ? (
              <p className="text-sm text-[var(--dash-text-faint)]">
                No templates yet — create one in the Templates tab first.
              </p>
            ) : (
              <>
                <select
                  value={templateId}
                  onChange={(e) => setTemplateId(e.target.value)}
                  className={inputClass}
                >
                  <option value="">Select template…</option>
                  {templates.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name}
                    </option>
                  ))}
                </select>
                {template && (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img
                    src={template.imageUrl}
                    alt={template.name}
                    className="w-full max-h-56 object-contain rounded-lg border border-[var(--dash-border)]"
                  />
                )}
              </>
            )
          ) : (
            <ImageUpload label="Finished certificate image" value={uploadUrl} onChange={setUploadUrl} folder="exampro/certificates" />
          )}

          <div>
            <label className="block text-sm font-medium text-[var(--dash-text-muted)] mb-1">
              Title
            </label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className={inputClass}
              placeholder={template?.defaultTitle ?? "Certificate of Completion"}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[var(--dash-text-muted)] mb-1">
              Message
            </label>
            <textarea
              rows={3}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className={inputClass}
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium text-[var(--dash-text-muted)]">
                Recipients
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
            <StudentPicker
              students={students}
              selectedIds={selectedIds}
              onChange={setSelectedIds}
              classFilter={classFilter || undefined}
            />
          </div>

          <label className="flex items-center gap-2 text-sm text-[var(--dash-text)]">
            <input
              type="checkbox"
              checked={sendToParent}
              onChange={(e) => setSendToParent(e.target.checked)}
            />
            Send to the parent/guardian email when available (else the student&apos;s)
          </label>

          <Button
            fullWidth
            size="lg"
            loading={sending}
            disabled={!imageUrl || selectedStudents.length === 0}
            onClick={() => void handleSend()}
          >
            <Send className="w-4 h-4" />
            {progress || `Render & send ${selectedStudents.length || ""} certificate(s)`}
          </Button>
        </CardBody>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <ImageIcon className="w-4 h-4 text-[var(--dash-primary)]" />
            <h2 className="font-semibold text-[var(--dash-text)]">What gets sent</h2>
          </div>
        </CardHeader>
        <CardBody className="space-y-3 text-sm text-[var(--dash-text-muted)]">
          <p>
            {mode === "template"
              ? "Each recipient's name is drawn onto the template at the position you placed, rendered to an image, then emailed as an attachment."
              : "The uploaded image is emailed to each selected recipient as their certificate."}
          </p>
          <ul className="space-y-1.5">
            <li className="flex gap-2">
              <Badge variant="outline">1</Badge> Issue a verify code so anyone can confirm it
            </li>
            <li className="flex gap-2">
              <Badge variant="outline">2</Badge> Render the merged certificate image
            </li>
            <li className="flex gap-2">
              <Badge variant="outline">3</Badge> Email it and log delivery
            </li>
          </ul>
          {role === "teacher" && (
            <p className="text-xs text-[var(--dash-text-faint)]">
              As a teacher you can send certificates to your students. Deleting templates is
              admin-only.
            </p>
          )}
        </CardBody>
      </Card>
    </div>
  );
}
