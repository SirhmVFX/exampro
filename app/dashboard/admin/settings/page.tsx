"use client";

import { useState } from "react";
import { ImageUpload } from "@/app/components/ui/image-upload";
import DashboardShell from "@/app/components/dashboard/shell";
import { adminNav } from "@/app/components/dashboard/nav";
import { Card, CardBody, CardHeader } from "@/app/components/ui/card";
import { Button } from "@/app/components/ui/button";
import { CopyButton } from "@/app/components/ui/copy-button";
import { useAuth } from "@/lib/auth-context";
import {
  updateInstitution,
  updateUserProfile,
  generateJoinCode,
  assertSlugAvailable,
  allocateSlug,
  writeAudit,
} from "@/lib/db";
import { Save } from "lucide-react";
import { inputClass } from "@/lib/utils";
import {
  DEFAULT_ACCENT,
  DEFAULT_PRIMARY,
  THEME_PRESETS,
  ACCENT_PRESETS,
  normalizeHex,
} from "@/lib/theme";
import {
  institutionJoinLinks,
  rootDomain,
  slugify,
} from "@/lib/domain";
import { defaultVocabulary } from "@/lib/vocab";
import type { JoinMode } from "@/lib/types";

function ColorField({
  label,
  hint,
  value,
  presets,
  onChange,
}: {
  label: string;
  hint: string;
  value: string;
  presets: { name: string; color: string }[];
  onChange: (color: string) => void;
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1.5">
        {label}
      </label>
      <p className="text-xs text-gray-500 mb-3">{hint}</p>
      <div className="flex flex-wrap gap-2 mb-3">
        {presets.map((preset) => {
          const active = normalizeHex(value) === normalizeHex(preset.color);
          return (
            <button
              key={preset.color + preset.name}
              type="button"
              onClick={() => onChange(preset.color)}
              className={`flex items-center gap-2 px-3 py-2 text-xs font-medium border transition ${
                active
                  ? "border-black bg-black text-white"
                  : "border-gray-200 hover:border-black"
              }`}
            >
              <span
                className="w-3.5 h-3.5 border border-black/20"
                style={{ background: preset.color }}
              />
              {preset.name}
            </button>
          );
        })}
      </div>
      <div className="flex items-center gap-3">
        <input
          type="color"
          value={normalizeHex(value)}
          onChange={(e) => onChange(e.target.value)}
          className="w-12 h-10 border border-gray-200 cursor-pointer bg-transparent"
        />
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={inputClass}
        />
      </div>
    </div>
  );
}

export default function AdminSettingsPage() {
  const { institution, profile, refresh } = useAuth();
  const [form, setForm] = useState({
    name: institution?.name ?? "",
    phone: institution?.phone ?? "",
    website: institution?.website ?? "",
    address: institution?.address ?? "",
    country: institution?.country ?? "",
    logoUrl: institution?.logoUrl ?? "",
    primaryColor: institution?.primaryColor ?? DEFAULT_PRIMARY,
    accentColor: institution?.accentColor ?? DEFAULT_ACCENT,
    slug: institution?.slug ?? "",
    adminName: profile?.name ?? "",
    joinMode: institution?.joinMode ?? "code",
    allowedEmailDomains: (institution?.allowedEmailDomains ?? []).join(", "),
    studentWord: institution?.vocabulary?.student ?? "",
    teacherWord: institution?.vocabulary?.teacher ?? "",
    classWord: institution?.vocabulary?.class ?? institution?.classLabel ?? "",
  });
  const [hydrated, setHydrated] = useState(false);
  if (institution && profile && !hydrated) {
    setForm({
      name: institution.name,
      phone: institution.phone ?? "",
      website: institution.website ?? "",
      address: institution.address ?? "",
      country: institution.country ?? "",
      logoUrl: institution.logoUrl ?? "",
      primaryColor: institution.primaryColor ?? DEFAULT_PRIMARY,
      accentColor: institution.accentColor ?? DEFAULT_ACCENT,
      slug: institution.slug || slugify(institution.name),
      adminName: profile.name,
      joinMode: institution.joinMode ?? "code",
      allowedEmailDomains: (institution.allowedEmailDomains ?? []).join(", "),
      studentWord: institution.vocabulary?.student ?? "",
      teacherWord: institution.vocabulary?.teacher ?? "",
      classWord: institution.vocabulary?.class ?? institution.classLabel ?? "",
    });
    setHydrated(true);
  }

  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [rotating, setRotating] = useState(false);
  const [error, setError] = useState("");

  const save = async () => {
    if (!institution || !profile) return;
    setSaving(true);
    setError("");
    try {
      const slug = form.slug.trim()
        ? await assertSlugAvailable(form.slug, institution.id)
        : await allocateSlug(form.name || institution.name, institution.id);
      const domains = form.allowedEmailDomains
        .split(/[,;\s]+/)
        .map((d) => d.trim().replace(/^@/, "").toLowerCase())
        .filter(Boolean);
      const baseVocab = defaultVocabulary(institution.type);
      await updateInstitution(institution.id, {
        name: form.name.trim(),
        phone: form.phone.trim() || undefined,
        website: form.website.trim() || undefined,
        address: form.address.trim() || undefined,
        country: form.country.trim() || undefined,
        logoUrl: form.logoUrl || undefined,
        primaryColor: form.primaryColor,
        accentColor: form.accentColor,
        slug,
        joinMode: form.joinMode as JoinMode,
        allowedEmailDomains: domains,
        classLabel: form.classWord.trim() || institution.classLabel,
        vocabulary: {
          ...baseVocab,
          ...(institution.vocabulary ?? {}),
          student: form.studentWord.trim() || baseVocab.student,
          students: `${form.studentWord.trim() || baseVocab.student}s`,
          teacher: form.teacherWord.trim() || baseVocab.teacher,
          teachers: `${form.teacherWord.trim() || baseVocab.teacher}s`,
          class: form.classWord.trim() || baseVocab.class,
          classes: `${form.classWord.trim() || baseVocab.class}s`,
        },
      });
      await writeAudit({
        institutionId: institution.id,
        actorId: profile.uid,
        actorName: profile.name,
        action: "settings.update",
        entityType: "institution",
        entityId: institution.id,
      });
      if (form.adminName.trim() !== profile.name) {
        await updateUserProfile(profile.uid, { name: form.adminName.trim() });
      }
      setForm((f) => ({ ...f, slug }));
      await refresh();
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Couldn't save settings.");
    } finally {
      setSaving(false);
    }
  };

  const rotateCode = async () => {
    if (!institution) return;
    if (!confirm("This will invalidate the current join code. Continue?")) return;
    setRotating(true);
    try {
      await updateInstitution(institution.id, { code: generateJoinCode() });
      await refresh();
    } finally {
      setRotating(false);
    }
  };

  const links = institution
    ? institutionJoinLinks({
        slug: form.slug || institution.slug,
        code: institution.code,
      })
    : null;
  const root = rootDomain();
  const domainPreview =
    root === "localhost"
      ? `localhost/s/${form.slug || "your-school"}`
      : `${form.slug || "your-school"}.${root}`;

  return (
    <DashboardShell
      role="admin"
      navItems={adminNav}
      title="Settings"
      subtitle="Institution profile, branding, domain, and your admin account"
    >
      <div className="max-w-2xl space-y-6">
        {error && (
          <div className="border border-red-200 bg-red-50 text-red-800 text-sm px-4 py-3">
            {error}
          </div>
        )}
        <Card>
          <CardHeader>
            <h2 className="text-lg font-semibold">Institution</h2>
          </CardHeader>
          <CardBody className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Name</label>
              <input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className={inputClass}
              />
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Phone</label>
                <input
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  className={inputClass}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Country</label>
                <input
                  value={form.country}
                  onChange={(e) => setForm({ ...form, country: e.target.value })}
                  className={inputClass}
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Website</label>
              <input
                value={form.website}
                onChange={(e) => setForm({ ...form, website: e.target.value })}
                className={inputClass}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Address</label>
              <input
                value={form.address}
                onChange={(e) => setForm({ ...form, address: e.target.value })}
                className={inputClass}
              />
            </div>
            <ImageUpload
              label="Logo"
              value={form.logoUrl}
              onChange={(logoUrl) => setForm({ ...form, logoUrl })}
              folder={institution ? `exampro/${institution.id}/logo` : "exampro/logo"}
            />
            <ColorField
              label="Sidebar color"
              hint="Fills the dashboard sidebar. Default is black."
              value={form.primaryColor}
              presets={THEME_PRESETS}
              onChange={(primaryColor) => setForm({ ...form, primaryColor })}
            />
            <ColorField
              label="Accent color"
              hint="Buttons, links, and highlights in the white workspace."
              value={form.accentColor}
              presets={ACCENT_PRESETS}
              onChange={(accentColor) => setForm({ ...form, accentColor })}
            />
          </CardBody>
        </Card>

        <Card>
          <CardHeader>
            <h2 className="text-lg font-semibold">School domain</h2>
          </CardHeader>
          <CardBody className="space-y-4">
            <p className="text-sm text-gray-500">
              Share {domainPreview} so students and teachers land on your school,
              not a generic ExamPro page.
            </p>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Subdomain
              </label>
              <div className="flex items-center border border-gray-300 bg-white">
                <input
                  value={form.slug}
                  onChange={(e) =>
                    setForm({ ...form, slug: slugify(e.target.value) })
                  }
                  placeholder="northridge"
                  className="flex-1 px-4 py-2.5 text-sm focus:outline-none"
                />
                <span className="px-3 text-sm text-gray-400 border-l border-gray-200 whitespace-nowrap">
                  .{root === "localhost" ? "exampro" : root}
                </span>
              </div>
            </div>
            {links?.portal && (
              <div className="flex items-center justify-between gap-3 bg-gray-50 px-4 py-3 text-sm">
                <span className="truncate font-mono text-xs">{links.portal}</span>
                <CopyButton text={links.portal} />
              </div>
            )}
          </CardBody>
        </Card>

        <Card>
          <CardHeader>
            <h2 className="text-lg font-semibold">Who can join</h2>
          </CardHeader>
          <CardBody className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Join mode
              </label>
              <select
                value={form.joinMode}
                onChange={(e) =>
                  setForm({ ...form, joinMode: e.target.value as JoinMode })
                }
                className={inputClass}
              >
                <option value="code">Join code (anyone with the code)</option>
                <option value="open">Open (public page, no code)</option>
                <option value="invite_only">Invite-only (imported / emailed people)</option>
                <option value="domain">Institution email domain required</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Allowed email domains
              </label>
              <input
                value={form.allowedEmailDomains}
                onChange={(e) =>
                  setForm({ ...form, allowedEmailDomains: e.target.value })
                }
                className={inputClass}
                placeholder="school.edu.ng, academy.com"
              />
              <p className="text-xs text-gray-500 mt-1">
                Comma-separated. Used for domain mode, and as an extra check in any mode.
              </p>
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardHeader>
            <h2 className="text-lg font-semibold">Words you use</h2>
            <p className="text-sm text-gray-500 mt-1">
              Same screens, your language. Learner / instructor / cohort instead of student / teacher / class.
            </p>
          </CardHeader>
          <CardBody className="grid sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Student
              </label>
              <input
                value={form.studentWord}
                onChange={(e) => setForm({ ...form, studentWord: e.target.value })}
                className={inputClass}
                placeholder="Learner"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Teacher
              </label>
              <input
                value={form.teacherWord}
                onChange={(e) => setForm({ ...form, teacherWord: e.target.value })}
                className={inputClass}
                placeholder="Instructor"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Class
              </label>
              <input
                value={form.classWord}
                onChange={(e) => setForm({ ...form, classWord: e.target.value })}
                className={inputClass}
                placeholder="Cohort"
              />
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardHeader>
            <h2 className="text-lg font-semibold">Join code</h2>
          </CardHeader>
          <CardBody className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-2 bg-[var(--dash-primary-soft)] px-4 py-3">
              <span className="text-xl font-bold tracking-[0.3em] text-[var(--dash-primary)]">
                {institution?.code}
              </span>
              {institution && <CopyButton text={institution.code} />}
            </div>
            <Button variant="outline" loading={rotating} onClick={() => void rotateCode()}>
              Rotate code
            </Button>
          </CardBody>
        </Card>

        <Card>
          <CardHeader>
            <h2 className="text-lg font-semibold">Your admin profile</h2>
          </CardHeader>
          <CardBody className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Name</label>
              <input
                value={form.adminName}
                onChange={(e) => setForm({ ...form, adminName: e.target.value })}
                className={inputClass}
              />
            </div>
            <p className="text-sm text-gray-500">{profile?.email}</p>
          </CardBody>
        </Card>

        <div className="flex items-center gap-3">
          <Button loading={saving} onClick={() => void save()}>
            <Save className="w-4 h-4" /> Save settings
          </Button>
          {saved && <span className="text-sm text-emerald-600">Saved</span>}
        </div>
      </div>
    </DashboardShell>
  );
}
