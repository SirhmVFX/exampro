"use client";

import { useState } from "react";
import {
  Building2, Palette, Globe, Languages, User, Key, Save,
  Link as LinkIcon, Copy, RefreshCw, Check, AlertCircle,
} from "lucide-react";
import { ImageUpload } from "@/app/components/ui/image-upload";
import DashboardShell from "@/app/components/dashboard/shell";
import { adminNav } from "@/app/components/dashboard/nav";
import { Button } from "@/app/components/ui/button";
import { CopyButton } from "@/app/components/ui/copy-button";
import { Badge } from "@/app/components/ui/badge";
import { useAuth } from "@/lib/auth-context";
import { updateInstitution, updateUserProfile, generateJoinCode, assertSlugAvailable, allocateSlug, writeAudit } from "@/lib/db";
import { inputClass } from "@/lib/utils";
import { DEFAULT_ACCENT, DEFAULT_PRIMARY, THEME_PRESETS, ACCENT_PRESETS, normalizeHex } from "@/lib/theme";
import { institutionJoinLinks, rootDomain, slugify } from "@/lib/domain";
import { defaultVocabulary } from "@/lib/vocab";
import type { JoinMode } from "@/lib/types";
import toast from "react-hot-toast";

// ── Shared primitives ──────────────────────────────────────────────────────

type Tab = "institution" | "branding" | "domain" | "vocabulary" | "profile";

const TABS: { id: Tab; label: string; icon: typeof Building2 }[] = [
  { id: "institution", label: "Institution", icon: Building2 },
  { id: "branding", label: "Branding", icon: Palette },
  { id: "domain", label: "Domain & Access", icon: Globe },
  { id: "vocabulary", label: "Vocabulary", icon: Languages },
  { id: "profile", label: "Admin profile", icon: User },
];

function Label({ children }: { children: React.ReactNode }) {
  return <label className="block text-sm font-medium text-[var(--dash-text)] mb-1.5">{children}</label>;
}

function Hint({ children }: { children: React.ReactNode }) {
  return <p className="text-xs text-[var(--dash-text-faint)] mt-1.5 leading-relaxed">{children}</p>;
}

function SettingRow({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div className="py-5 border-b border-[var(--dash-border)] last:border-0">
      <div className="grid sm:grid-cols-3 gap-4 items-start">
        <div className="sm:col-span-1">
          <p className="text-sm font-medium text-[var(--dash-text)]">{label}</p>
          {hint && <p className="text-xs text-[var(--dash-text-faint)] mt-0.5 leading-relaxed">{hint}</p>}
        </div>
        <div className="sm:col-span-2">{children}</div>
      </div>
    </div>
  );
}

function SectionCard({ title, subtitle, children }: { title: string; subtitle?: string; children: React.ReactNode }) {
  return (
    <div className="bg-[var(--dash-surface)] border border-[var(--dash-border)] rounded-xl overflow-hidden">
      <div className="px-6 py-4 border-b border-[var(--dash-border)]">
        <h2 className="font-semibold text-[var(--dash-text)]">{title}</h2>
        {subtitle && <p className="text-sm text-[var(--dash-text-muted)] mt-0.5">{subtitle}</p>}
      </div>
      <div className="px-6">{children}</div>
    </div>
  );
}

function ColorPicker({
  label, hint, value, presets, onChange,
}: { label: string; hint: string; value: string; presets: { name: string; color: string }[]; onChange: (v: string) => void }) {
  return (
    <SettingRow label={label} hint={hint}>
      <div className="space-y-3">
        <div className="flex flex-wrap gap-2">
          {presets.map((p) => {
            const active = normalizeHex(value) === normalizeHex(p.color);
            return (
              <button key={p.color} type="button" onClick={() => onChange(p.color)}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium border transition ${active ? "border-[var(--dash-primary)] bg-[var(--dash-primary)] text-[var(--dash-on-primary)]" : "border-[var(--dash-border)] text-[var(--dash-text-muted)] hover:border-[var(--dash-primary)]"
                  }`}>
                <span className="w-3.5 h-3.5 rounded border border-black/20" style={{ background: p.color }} />
                {p.name}
                {active && <Check className="w-3 h-3" />}
              </button>
            );
          })}
        </div>
        <div className="flex items-center gap-3">
          <input type="color" value={normalizeHex(value)} onChange={(e) => onChange(e.target.value)}
            className="w-10 h-10 rounded-lg border border-[var(--dash-border)] cursor-pointer bg-transparent" />
          <input value={value} onChange={(e) => onChange(e.target.value)} className={`${inputClass} flex-1`} placeholder="#000000" />
        </div>
      </div>
    </SettingRow>
  );
}

// ── Main page ──────────────────────────────────────────────────────────────

export default function AdminSettingsPage() {
  const { institution, profile, refresh } = useAuth();
  const [tab, setTab] = useState<Tab>("institution");
  const [saving, setSaving] = useState(false);
  const [rotating, setRotating] = useState(false);
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

  const set = (field: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm((f) => ({ ...f, [field]: e.target.value }));

  const save = async () => {
    if (!institution || !profile) return;
    setSaving(true);
    try {
      const slug = form.slug.trim()
        ? await assertSlugAvailable(form.slug, institution.id)
        : await allocateSlug(form.name || institution.name, institution.id);
      const domains = form.allowedEmailDomains.split(/[,;\s]+/).map((d) => d.trim().replace(/^@/, "").toLowerCase()).filter(Boolean);
      const baseVocab = defaultVocabulary(institution.type);
      await updateInstitution(institution.id, {
        name: form.name.trim(), phone: form.phone.trim() || undefined,
        website: form.website.trim() || undefined, address: form.address.trim() || undefined,
        country: form.country.trim() || undefined, logoUrl: form.logoUrl || undefined,
        primaryColor: form.primaryColor, accentColor: form.accentColor, slug,
        joinMode: form.joinMode as JoinMode, allowedEmailDomains: domains,
        classLabel: form.classWord.trim() || institution.classLabel,
        vocabulary: {
          ...baseVocab, ...(institution.vocabulary ?? {}),
          student: form.studentWord.trim() || baseVocab.student,
          students: `${form.studentWord.trim() || baseVocab.student}s`,
          teacher: form.teacherWord.trim() || baseVocab.teacher,
          teachers: `${form.teacherWord.trim() || baseVocab.teacher}s`,
          class: form.classWord.trim() || baseVocab.class,
          classes: `${form.classWord.trim() || baseVocab.class}s`,
        },
      });
      await writeAudit({ institutionId: institution.id, actorId: profile.uid, actorName: profile.name, action: "settings.update", entityType: "institution", entityId: institution.id });
      if (form.adminName.trim() !== profile.name) await updateUserProfile(profile.uid, { name: form.adminName.trim() });
      setForm((f) => ({ ...f, slug }));
      await refresh();
      toast.success("Settings saved");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Couldn't save settings.");
    } finally {
      setSaving(false);
    }
  };

  const rotateCode = async () => {
    if (!institution) return;
    if (!confirm("Rotate the join code? The old code will stop working immediately.")) return;
    setRotating(true);
    try { await updateInstitution(institution.id, { code: generateJoinCode() }); await refresh(); toast.success("Join code rotated"); }
    catch { toast.error("Failed to rotate."); }
    finally { setRotating(false); }
  };

  const links = institution ? institutionJoinLinks({ slug: form.slug || institution.slug, code: institution.code }) : null;
  const root = rootDomain();

  return (
    <DashboardShell role="admin" navItems={adminNav} title="Settings" subtitle="Manage your institution workspace">
      <div className="max-w-4xl space-y-6">

        {/* Tab bar */}
        <div className="flex flex-wrap gap-1 bg-[var(--dash-surface-alt)] p-1 rounded-xl border border-[var(--dash-border)]">
          {TABS.map((t) => {
            const Icon = t.icon;
            const on = tab === t.id;
            return (
              <button key={t.id} onClick={() => setTab(t.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${on ? "bg-[var(--dash-surface)] text-[var(--dash-text)] shadow-sm border border-[var(--dash-border)]"
                    : "text-[var(--dash-text-muted)] hover:text-[var(--dash-text)] hover:bg-[var(--dash-surface)]"
                  }`}>
                <Icon className="w-4 h-4" />
                <span className="hidden sm:inline">{t.label}</span>
              </button>
            );
          })}
        </div>

        {/* ── Institution ──────────────────────────────────────────────── */}
        {tab === "institution" && (
          <SectionCard title="Institution details" subtitle="Basic information about your school, university, or training centre.">
            <SettingRow label="Institution name" hint="Shown in the sidebar, on certificates, and on your school portal.">
              <input value={form.name} onChange={set("name")} className={inputClass} placeholder="Northridge Academy" />
            </SettingRow>
            <SettingRow label="Country">
              <input value={form.country} onChange={set("country")} className={inputClass} placeholder="Nigeria" />
            </SettingRow>
            <SettingRow label="Phone" hint="Optional contact number.">
              <input value={form.phone} onChange={set("phone")} className={inputClass} placeholder="+234 800 000 0000" type="tel" />
            </SettingRow>
            <SettingRow label="Website">
              <input value={form.website} onChange={set("website")} className={inputClass} placeholder="myschool.com" />
            </SettingRow>
            <SettingRow label="Address">
              <input value={form.address} onChange={set("address")} className={inputClass} placeholder="123 Lagos Road" />
            </SettingRow>
          </SectionCard>
        )}

        {/* ── Branding ─────────────────────────────────────────────────── */}
        {tab === "branding" && (
          <div className="space-y-6">
            <SectionCard title="Logo & colours" subtitle="Make the dashboard feel like yours.">
              <SettingRow label="Logo" hint="Shown in the sidebar and on certificates. Square image recommended (400×400 px+).">
                <ImageUpload value={form.logoUrl} onChange={(logoUrl) => setForm((f) => ({ ...f, logoUrl }))}
                  folder={institution ? `exampro/${institution.id}/logo` : "exampro/logo"} />
              </SettingRow>
              <ColorPicker label="Sidebar colour" hint="Fills the left navigation panel. Dark colours work best."
                value={form.primaryColor} presets={THEME_PRESETS} onChange={(v) => setForm((f) => ({ ...f, primaryColor: v }))} />
              <ColorPicker label="Accent colour" hint="Used on buttons, active states, and highlights. Mid-tones work best."
                value={form.accentColor} presets={ACCENT_PRESETS} onChange={(v) => setForm((f) => ({ ...f, accentColor: v }))} />
            </SectionCard>
          </div>
        )}

        {/* ── Domain & Access ───────────────────────────────────────────── */}
        {tab === "domain" && (
          <div className="space-y-6">
            {/* School portal URL */}
            <SectionCard title="School portal" subtitle="Give your school a branded URL instead of the generic ExamPro one.">
              <SettingRow label="Subdomain" hint={`Your school will be accessible at ${root === "localhost" ? `localhost:3000/s/${form.slug || "your-school"}` : `${form.slug || "your-school"}.${root}`}`}>
                <div className="flex items-center border border-[var(--dash-border)] rounded-lg bg-[var(--dash-surface)] overflow-hidden">
                  <input value={form.slug} onChange={(e) => setForm((f) => ({ ...f, slug: slugify(e.target.value) }))}
                    placeholder="northridge" className="flex-1 px-4 py-2.5 text-sm focus:outline-none bg-transparent text-[var(--dash-text)]" />
                  <span className="px-3 text-sm text-[var(--dash-text-faint)] border-l border-[var(--dash-border)] whitespace-nowrap">
                    .{root === "localhost" ? "exampro" : root}
                  </span>
                </div>
              </SettingRow>

              {/* Invite links */}
              {links && (
                <SettingRow label="Invite links" hint="Share these links with teachers and students to join your school.">
                  <div className="space-y-2">
                    {[
                      { label: "🏫 School portal", url: links.portal },
                      { label: "🎓 Student sign-up", url: links.student },
                      { label: "👩‍🏫 Teacher sign-up", url: links.teacher },
                    ].filter((x) => x.url).map(({ label, url }) => (
                      <div key={label} className="flex items-center gap-3 bg-[var(--dash-surface-alt)] border border-[var(--dash-border)] rounded-lg px-4 py-2.5">
                        <div className="flex-1 min-w-0">
                          <p className="text-[11px] text-[var(--dash-text-faint)] font-medium mb-0.5">{label}</p>
                          <p className="font-mono text-xs text-[var(--dash-text-muted)] truncate">{url}</p>
                        </div>
                        <CopyButton text={url} />
                      </div>
                    ))}
                  </div>
                </SettingRow>
              )}
            </SectionCard>

            {/* Join mode */}
            <SectionCard title="Join settings" subtitle="Control who can register into your institution.">
              <SettingRow label="Join mode" hint="How new members get into your workspace.">
                <select value={form.joinMode} onChange={set("joinMode")} className={inputClass}>
                  <option value="code">Join code — anyone with the 6-character code</option>
                  <option value="open">Open — anyone who visits the portal can join</option>
                  <option value="invite_only">Invite only — must be pre-imported or invited by email</option>
                  <option value="domain">Domain restricted — email must match allowed domains</option>
                </select>
              </SettingRow>
              <SettingRow label="Allowed email domains" hint="Comma-separated. e.g. school.edu.ng, academy.com. Used in domain mode and as an extra check in any mode.">
                <input value={form.allowedEmailDomains} onChange={set("allowedEmailDomains")}
                  className={inputClass} placeholder="school.edu.ng, academy.com" />
              </SettingRow>

              {/* Join code */}
              <SettingRow label="Join code" hint="Share this 6-character code with teachers and students for them to register.">
                <div className="flex items-center gap-4 flex-wrap">
                  <div className="flex items-center gap-3 bg-[var(--dash-surface-alt)] border border-[var(--dash-border)] rounded-xl px-5 py-3">
                    <span className="text-2xl font-bold tracking-[0.35em] text-[var(--dash-text)] font-mono">
                      {institution?.code}
                    </span>
                    {institution && <CopyButton text={institution.code} />}
                  </div>
                  <Button variant="outline" size="sm" loading={rotating} onClick={() => void rotateCode()}>
                    <RefreshCw className="w-3.5 h-3.5" /> Rotate code
                  </Button>
                </div>
                <Hint>Rotating invalidates the old code immediately. Existing members are not affected.</Hint>
              </SettingRow>
            </SectionCard>
          </div>
        )}

        {/* ── Vocabulary ────────────────────────────────────────────────── */}
        {tab === "vocabulary" && (
          <SectionCard title="Custom vocabulary" subtitle="Rename the three core words used throughout the product to match your institution's language.">
            <SettingRow label="Student → ?" hint='What do you call the people learning? e.g. "Learner", "Participant", "Candidate"'>
              <input value={form.studentWord} onChange={set("studentWord")} className={inputClass} placeholder="Learner" />
            </SettingRow>
            <SettingRow label="Teacher → ?" hint='What do you call instructors? e.g. "Instructor", "Facilitator", "Tutor", "Trainer"'>
              <input value={form.teacherWord} onChange={set("teacherWord")} className={inputClass} placeholder="Instructor" />
            </SettingRow>
            <SettingRow label="Class → ?" hint='What do you call a group? e.g. "Cohort", "Grade", "Level", "Track", "Group"'>
              <input value={form.classWord} onChange={set("classWord")} className={inputClass} placeholder="Cohort" />
            </SettingRow>
            <div className="py-4">
              <div className="bg-[var(--dash-surface-alt)] border border-[var(--dash-border)] rounded-xl p-4 text-sm text-[var(--dash-text-muted)]">
                <p className="font-medium text-[var(--dash-text)] mb-1">Preview</p>
                <p>Nav items, tables, export headers, and prompts will say <strong>{form.studentWord || "Learner"}</strong>, <strong>{form.teacherWord || "Instructor"}</strong>, and <strong>{form.classWord || "Cohort"}</strong> instead of student, teacher, class.</p>
              </div>
            </div>
          </SectionCard>
        )}

        {/* ── Admin profile ─────────────────────────────────────────────── */}
        {tab === "profile" && (
          <SectionCard title="Your admin profile" subtitle="Your display name as it appears to other users.">
            <SettingRow label="Display name">
              <input value={form.adminName} onChange={set("adminName")} className={inputClass} />
            </SettingRow>
            <SettingRow label="Email address" hint="Your login email cannot be changed here. Contact support if you need to update it.">
              <div className="flex items-center gap-3 bg-[var(--dash-surface-alt)] border border-[var(--dash-border)] rounded-lg px-4 py-2.5">
                <span className="text-sm text-[var(--dash-text-muted)]">{profile?.email}</span>
                <Badge variant="default" className="ml-auto">Admin</Badge>
              </div>
            </SettingRow>
          </SectionCard>
        )}

        {/* Save button — always visible */}
        <div className="flex items-center gap-3 pt-2">
          <Button loading={saving} onClick={() => void save()}>
            <Save className="w-4 h-4" /> Save changes
          </Button>
          <p className="text-xs text-[var(--dash-text-faint)]">Changes apply across the whole institution immediately.</p>
        </div>
      </div>
    </DashboardShell>
  );
}
