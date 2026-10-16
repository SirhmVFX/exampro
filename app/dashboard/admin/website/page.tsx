"use client";

import { useEffect, useState } from "react";
import { Globe, Plus, Trash2, Save, Eye, ExternalLink } from "lucide-react";
import toast from "react-hot-toast";
import DashboardShell from "@/app/components/dashboard/shell";
import { adminNav } from "@/app/components/dashboard/nav";
import { Button } from "@/app/components/ui/button";
import { Card, CardBody, CardHeader } from "@/app/components/ui/card";
import { CopyButton } from "@/app/components/ui/copy-button";
import { WysiwygEditor } from "@/app/components/ui/wysiwyg-editor";
import { SiteTemplate } from "@/app/components/site/templates";
import { useAuth } from "@/lib/auth-context";
import { updateInstitution, writeAudit } from "@/lib/db";
import { inputClass } from "@/lib/utils";
import { institutionPublicUrl, rootDomain } from "@/lib/domain";
import type { InstitutionSite } from "@/lib/types";

const TEMPLATES: {
  value: InstitutionSite["template"];
  label: string;
  hint: string;
}[] = [
  { value: "aurora", label: "Aurora", hint: "Dark, gradient hero" },
  { value: "slate", label: "Slate", hint: "Light, two-column" },
  { value: "warm", label: "Warm", hint: "Cream, stacked sections" },
];

function Label({ children }: { children: React.ReactNode }) {
  return (
    <label className="block text-sm font-medium text-[var(--dash-text)] mb-1.5">
      {children}
    </label>
  );
}

export default function AdminWebsitePage() {
  const { institution, profile, refresh } = useAuth();
  const [site, setSite] = useState<InstitutionSite>({
    template: "aurora",
    heroTitle: institution?.name ?? "",
    heroSubtitle: "",
    about: "",
    highlights: [],
    ctaLabel: "Log in to your workspace",
    showJoin: true,
    contactEmail: "",
    contactPhone: "",
  });
  const [hydrated, setHydrated] = useState(false);
  const [saving, setSaving] = useState(false);
  const [preview, setPreview] = useState(true);

  useEffect(() => {
    if (!institution || hydrated) return;
    if (institution.site) setSite(institution.site);
    else setSite((s) => ({ ...s, heroTitle: institution.name }));
    setHydrated(true);
  }, [institution, hydrated]);

  if (!institution) return null;

  const set = <K extends keyof InstitutionSite>(
    key: K,
    value: InstitutionSite[K],
  ) => setSite((s) => ({ ...s, [key]: value }));

  const addHighlight = () =>
    setSite((s) => ({
      ...s,
      highlights: [...(s.highlights ?? []), { title: "", body: "" }],
    }));
  const updateHighlight = (
    i: number,
    patch: Partial<{ title: string; body: string }>,
  ) =>
    setSite((s) => ({
      ...s,
      highlights: (s.highlights ?? []).map((h, idx) =>
        idx === i ? { ...h, ...patch } : h,
      ),
    }));
  const removeHighlight = (i: number) =>
    setSite((s) => ({
      ...s,
      highlights: (s.highlights ?? []).filter((_, idx) => idx !== i),
    }));

  const save = async () => {
    if (!profile) return;
    setSaving(true);
    try {
      const cleaned: InstitutionSite = {
        ...site,
        heroTitle: site.heroTitle.trim(),
        heroSubtitle: site.heroSubtitle.trim(),
        about: site.about?.trim() || undefined,
        ctaLabel: site.ctaLabel?.trim() || undefined,
        contactEmail: site.contactEmail?.trim() || undefined,
        contactPhone: site.contactPhone?.trim() || undefined,
        highlights: (site.highlights ?? [])
          .map((h) => ({ title: h.title.trim(), body: h.body.trim() }))
          .filter((h) => h.title || h.body),
      };
      await updateInstitution(institution.id, { site: cleaned });
      await writeAudit({
        institutionId: institution.id,
        actorId: profile.uid,
        actorName: profile.name,
        action: "website.update",
        entityType: "institution",
        entityId: institution.id,
      });
      await refresh();
      toast.success("Landing page saved");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Couldn't save.");
    } finally {
      setSaving(false);
    }
  };

  const shareUrl = institution.slug
    ? institutionPublicUrl(institution.slug)
    : "";
  const root = rootDomain();

  return (
    <DashboardShell
      role="admin"
      navItems={adminNav}
      title="Website"
      subtitle="Your public landing page that students and teachers can visit"
    >
      <div className="space-y-6 w-full">
        <Card>
          <CardBody className="flex flex-wrap items-center gap-3">
            <div className="flex-1 min-w-[220px]">
              <p className="text-sm font-medium text-[var(--dash-text)]">
                Public link
              </p>
              <p className="font-mono text-xs text-[var(--dash-text-muted)] truncate">
                {shareUrl || `${root}/s/${institution.slug ?? "your-school"}`}
              </p>
            </div>
            {shareUrl && <CopyButton text={shareUrl} />}
            {shareUrl && (
              <a href={shareUrl} target="_blank" rel="noreferrer">
                <Button variant="outline" size="sm">
                  <ExternalLink className="w-4 h-4" /> Open
                </Button>
              </a>
            )}
          </CardBody>
        </Card>

        <div className="grid lg:grid-cols-2 gap-6 items-start">
          {/* Editor */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <h2 className="text-sm font-semibold text-[var(--dash-text-muted)] uppercase tracking-wide">
                  Template
                </h2>
              </CardHeader>
              <CardBody className="grid grid-cols-3 gap-2">
                {TEMPLATES.map((t) => {
                  const on = site.template === t.value;
                  return (
                    <button
                      key={t.value}
                      type="button"
                      onClick={() => set("template", t.value)}
                      className={`rounded-xl border p-3 text-left transition ${on ? "border-[var(--dash-primary)] bg-[var(--dash-primary-soft)]" : "border-[var(--dash-border)] hover:border-[var(--dash-primary)]"}`}
                    >
                      <p className="text-sm font-semibold text-[var(--dash-text)]">
                        {t.label}
                      </p>
                      <p className="text-xs text-[var(--dash-text-muted)] mt-0.5">
                        {t.hint}
                      </p>
                    </button>
                  );
                })}
              </CardBody>
            </Card>

            <Card>
              <CardHeader>
                <h2 className="text-sm font-semibold text-[var(--dash-text-muted)] uppercase tracking-wide">
                  Content
                </h2>
              </CardHeader>
              <CardBody className="space-y-4">
                <div>
                  <Label>Hero title</Label>
                  <input
                    value={site.heroTitle}
                    onChange={(e) => set("heroTitle", e.target.value)}
                    className={inputClass}
                  />
                </div>
                <div>
                  <Label>Hero subtitle</Label>
                  <input
                    value={site.heroSubtitle}
                    onChange={(e) => set("heroSubtitle", e.target.value)}
                    className={inputClass}
                    placeholder="A short tagline about your institution"
                  />
                </div>
                <div>
                  <Label>About</Label>
                  <WysiwygEditor
                    content={site.about ?? ""}
                    onChange={(about) => set("about", about)}
                    placeholder="Tell visitors about your school…"
                    minHeight={160}
                  />
                </div>
                <div className="grid sm:grid-cols-2 gap-3">
                  <div>
                    <Label>Button label</Label>
                    <input
                      value={site.ctaLabel ?? ""}
                      onChange={(e) => set("ctaLabel", e.target.value)}
                      className={inputClass}
                      placeholder="Log in to your workspace"
                    />
                  </div>
                  <div>
                    <Label>Contact email (optional)</Label>
                    <input
                      value={site.contactEmail ?? ""}
                      onChange={(e) => set("contactEmail", e.target.value)}
                      className={inputClass}
                      placeholder="Defaults to institution email"
                    />
                  </div>
                  <div>
                    <Label>Contact phone (optional)</Label>
                    <input
                      value={site.contactPhone ?? ""}
                      onChange={(e) => set("contactPhone", e.target.value)}
                      className={inputClass}
                    />
                  </div>
                  <div className="flex items-end pb-1">
                    <label className="flex items-center gap-2 text-sm text-[var(--dash-text)] cursor-pointer">
                      <input
                        type="checkbox"
                        checked={site.showJoin !== false}
                        onChange={(e) => set("showJoin", e.target.checked)}
                      />
                      Show student / teacher join buttons
                    </label>
                  </div>
                </div>
              </CardBody>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <h2 className="text-sm font-semibold text-[var(--dash-text-muted)] uppercase tracking-wide">
                    Highlights
                  </h2>
                  <Button variant="outline" size="sm" onClick={addHighlight}>
                    <Plus className="w-4 h-4" /> Add
                  </Button>
                </div>
              </CardHeader>
              <CardBody className="space-y-3">
                {(site.highlights ?? []).length === 0 && (
                  <p className="text-sm text-[var(--dash-text-muted)]">
                    No highlights yet. Add a few short value points.
                  </p>
                )}
                {(site.highlights ?? []).map((h, i) => (
                  <div key={i} className="flex items-start gap-2">
                    <div className="flex-1 space-y-2">
                      <input
                        value={h.title}
                        onChange={(e) =>
                          updateHighlight(i, { title: e.target.value })
                        }
                        className={inputClass}
                        placeholder="Title"
                      />
                      <input
                        value={h.body}
                        onChange={(e) =>
                          updateHighlight(i, { body: e.target.value })
                        }
                        className={inputClass}
                        placeholder="Body"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => removeHighlight(i)}
                      className="p-2 rounded-md text-[var(--dash-text-faint)] hover:text-red-600"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </CardBody>
            </Card>

            <div className="flex items-center gap-3">
              <Button loading={saving} onClick={() => void save()}>
                <Save className="w-4 h-4" /> Save landing page
              </Button>
              <button
                type="button"
                onClick={() => setPreview((p) => !p)}
                className="text-sm text-[var(--dash-text-muted)] flex items-center gap-1.5"
              >
                <Eye className="w-4 h-4" /> {preview ? "Hide" : "Show"} preview
              </button>
            </div>
          </div>

          {/* Live preview */}
          {preview && (
            <div className="lg:sticky lg:top-6">
              <div className="flex items-center gap-2 mb-2 text-xs text-[var(--dash-text-muted)]">
                <Globe className="w-3.5 h-3.5" /> Live preview ·{" "}
                {TEMPLATES.find((t) => t.value === site.template)?.label}
              </div>
              <div className="border border-[var(--dash-border)] rounded-xl overflow-hidden h-[78vh] overflow-y-auto bg-[var(--dash-surface)]">
                <SiteTemplate institution={{ ...institution }} site={site} />
              </div>
            </div>
          )}
        </div>
      </div>
    </DashboardShell>
  );
}
