import Link from "next/link";
import { GraduationCap, Users, LogIn, Mail, Phone, MapPin } from "lucide-react";
import { HtmlContent } from "@/app/components/ui/html-content";
import { onColor } from "@/lib/theme";
import { authPath } from "@/lib/domain";
import type { Institution, InstitutionSite } from "@/lib/types";

export interface SiteTemplateProps {
  institution: Institution;
  site: InstitutionSite;
}

function joinHref(slug: string, role: "student" | "teacher") {
  return authPath(`/auth/register/${role}?school=${slug}`);
}

function Ctas({ institution, site, tone }: { institution: Institution; site: InstitutionSite; tone: "light" | "dark" }) {
  const slug = institution.slug ?? "";
  const accent = institution.accentColor || "#000000";
  const onAccent = onColor(accent);
  const showJoin = site.showJoin !== false;
  const solidBtn =
    tone === "light"
      ? { background: accent, color: onAccent }
      : { background: accent, color: onAccent };
  const ghostBtn =
    tone === "light"
      ? "border border-black/15 hover:bg-black/5 text-black/70"
      : "border border-white/15 hover:bg-white/5 text-white/80";
  return (
    <div className="flex flex-col gap-2">
      <Link
        href={authPath("/auth/login")}
        className="flex items-center justify-center gap-2 w-full py-3 rounded-xl text-sm font-medium"
        style={solidBtn}
      >
        <LogIn className="w-4 h-4" /> {site.ctaLabel || "Log in to your workspace"}
      </Link>
      {showJoin && (
        <>
          <Link href={joinHref(slug, "student")} className={`flex items-center justify-center gap-2 w-full py-3 rounded-xl text-sm font-medium ${ghostBtn}`}>
            <GraduationCap className="w-4 h-4" /> Join as student
          </Link>
          <Link href={joinHref(slug, "teacher")} className={`flex items-center justify-center gap-2 w-full py-3 rounded-xl text-sm font-medium ${ghostBtn}`}>
            <Users className="w-4 h-4" /> Join as teacher
          </Link>
        </>
      )}
    </div>
  );
}

function Logo({ institution, size = 56 }: { institution: Institution; size?: number }) {
  const sidebar = institution.primaryColor || "#000000";
  if (institution.logoUrl) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={institution.logoUrl} alt="" style={{ width: size, height: size }} className="object-cover rounded-xl" />;
  }
  return (
    <div
      className="flex items-center justify-center rounded-xl text-sm font-bold"
      style={{ width: size, height: size, background: sidebar, color: onColor(sidebar) }}
    >
      {institution.name.slice(0, 2).toUpperCase()}
    </div>
  );
}

function Contact({ institution, site, tone }: { institution: Institution; site: InstitutionSite; tone: "light" | "dark" }) {
  const items: React.ReactNode[] = [];
  const email = site.contactEmail || institution.email;
  const phone = site.contactPhone || institution.phone;
  const muted = tone === "light" ? "text-black/50" : "text-white/50";
  if (email) items.push(<span key="e" className={`inline-flex items-center gap-1.5 ${muted}`}><Mail className="w-3.5 h-3.5" />{email}</span>);
  if (phone) items.push(<span key="p" className={`inline-flex items-center gap-1.5 ${muted}`}><Phone className="w-3.5 h-3.5" />{phone}</span>);
  if (institution.address) items.push(<span key="a" className={`inline-flex items-center gap-1.5 ${muted}`}><MapPin className="w-3.5 h-3.5" />{institution.address}</span>);
  if (!items.length) return null;
  return <div className="flex flex-wrap gap-x-5 gap-y-1.5 text-sm">{items}</div>;
}

/* ── Aurora: dark gradient hero, glassy centered card ───────────────────── */
export function AuroraTemplate({ institution, site }: SiteTemplateProps) {
  const accent = institution.accentColor || "#4f46e5";
  return (
    <div className="min-h-screen bg-black text-white relative overflow-hidden">
      <div className="absolute inset-0 lp-grid pointer-events-none" />
      <div
        className="absolute -top-40 left-1/2 -translate-x-1/2 w-[120%] h-[420px] rounded-full blur-3xl opacity-30 pointer-events-none"
        style={{ background: `radial-gradient(closest-side, ${accent}, transparent)` }}
      />
      <div className="relative max-w-4xl mx-auto px-6 py-16">
        <div className="flex items-center gap-4">
          <Logo institution={institution} />
          <div>
            <p className="text-[11px] uppercase tracking-[0.2em] text-white/40">{institution.type}</p>
            <h1 className="text-2xl font-semibold tracking-tight">{institution.name}</h1>
          </div>
        </div>
        <div className="mt-12">
          <h2 className="text-4xl sm:text-5xl font-bold tracking-tight leading-[1.1]">{site.heroTitle || institution.name}</h2>
          <p className="mt-4 text-lg text-white/60 max-w-2xl">{site.heroSubtitle}</p>
        </div>
        <div className="mt-10 border border-white/10 rounded-3xl p-8 bg-white/[0.03]">
          <div className="grid sm:grid-cols-3 gap-8">
            <div className="sm:col-span-2">
              {site.about && (
                <div className="text-white/70 [&_.html-content]:text-white/70">
                  <HtmlContent html={site.about} />
                </div>
              )}
              {site.highlights && site.highlights.length > 0 && (
                <div className="mt-8 grid sm:grid-cols-2 gap-4">
                  {site.highlights.map((h, i) => (
                    <div key={i} className="border border-white/10 rounded-2xl p-4">
                      <p className="font-semibold text-white">{h.title}</p>
                      <p className="text-sm text-white/55 mt-1">{h.body}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div>
              <Ctas institution={institution} site={site} tone="dark" />
              {institution.subjects && institution.subjects.length > 0 && (
                <div className="mt-6">
                  <p className="text-[11px] uppercase tracking-wider text-white/40 mb-2">Programs</p>
                  <div className="flex flex-wrap gap-1.5">
                    {institution.subjects.slice(0, 12).map((s) => (
                      <span key={s} className="text-xs px-2 py-1 rounded-full border border-white/10 text-white/70">{s}</span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
        <div className="mt-8"><Contact institution={institution} site={site} tone="dark" /></div>
      </div>
    </div>
  );
}

/* ── Slate: light, two-column with sticky brand panel ───────────────────── */
export function SlateTemplate({ institution, site }: SiteTemplateProps) {
  const sidebar = institution.primaryColor || "#1e293b";
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <div className="mx-auto max-w-6xl px-6 py-14">
        <div className="flex items-center gap-3">
          <Logo institution={institution} size={48} />
          <div>
            <p className="text-[11px] uppercase tracking-[0.18em] text-slate-400">{institution.type}</p>
            <h1 className="text-xl font-bold">{institution.name}</h1>
          </div>
        </div>
        <div className="mt-10 grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="rounded-2xl border border-slate-200 bg-white p-8">
              <h2 className="text-3xl font-bold tracking-tight">{site.heroTitle || institution.name}</h2>
              <p className="mt-3 text-slate-600">{site.heroSubtitle}</p>
              {site.about && <div className="mt-6 text-slate-700"><HtmlContent html={site.about} /></div>}
              {site.highlights && site.highlights.length > 0 && (
                <div className="mt-8 grid sm:grid-cols-2 gap-4">
                  {site.highlights.map((h, i) => (
                    <div key={i} className="rounded-xl border border-slate-200 p-4">
                      <p className="font-semibold text-slate-900">{h.title}</p>
                      <p className="text-sm text-slate-500 mt-1">{h.body}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
          <aside className="lg:col-span-1">
            <div className="rounded-2xl p-6 text-white sticky top-8" style={{ background: sidebar }}>
              <p className="text-sm font-semibold">Get started</p>
              <div className="mt-4">
                <Ctas institution={institution} site={site} tone="dark" />
              </div>
              {institution.subjects && institution.subjects.length > 0 && (
                <div className="mt-6">
                  <p className="text-[11px] uppercase tracking-wider text-white/50">Programs</p>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {institution.subjects.slice(0, 12).map((s) => (
                      <span key={s} className="text-xs px-2 py-1 rounded-full bg-white/10">{s}</span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </aside>
        </div>
        <div className="mt-8"><Contact institution={institution} site={site} tone="light" /></div>
      </div>
    </div>
  );
}

/* ── Warm: cream stacked sections with accent rule ──────────────────────── */
export function WarmTemplate({ institution, site }: SiteTemplateProps) {
  const accent = institution.accentColor || "#a16207";
  return (
    <div className="min-h-screen text-stone-900" style={{ background: "#fbf7f0" }}>
      <div className="mx-auto max-w-3xl px-6 py-16">
        <div className="flex items-center gap-4">
          <Logo institution={institution} />
          <div>
            <h1 className="text-2xl font-bold tracking-tight">{institution.name}</h1>
            <p className="text-[11px] uppercase tracking-[0.18em] text-stone-400">{institution.type}</p>
          </div>
        </div>
        <div className="mt-12" style={{ borderTop: `3px solid ${accent}`, paddingTop: 24 }}>
          <h2 className="text-3xl font-bold tracking-tight">{site.heroTitle || institution.name}</h2>
          <p className="mt-3 text-stone-600">{site.heroSubtitle}</p>
        </div>
        {site.about && <div className="mt-6 text-stone-700"><HtmlContent html={site.about} /></div>}
        {site.highlights && site.highlights.length > 0 && (
          <div className="mt-8 grid sm:grid-cols-2 gap-4">
            {site.highlights.map((h, i) => (
              <div key={i} className="rounded-2xl bg-white border border-stone-200 p-5">
                <p className="font-semibold" style={{ color: accent }}>{h.title}</p>
                <p className="text-sm text-stone-600 mt-1">{h.body}</p>
              </div>
            ))}
          </div>
        )}
        <div className="mt-10 max-w-sm">
          <Ctas institution={institution} site={site} tone="light" />
        </div>
        {institution.subjects && institution.subjects.length > 0 && (
          <div className="mt-8">
            <p className="text-[11px] uppercase tracking-wider text-stone-400 mb-2">Programs</p>
            <div className="flex flex-wrap gap-1.5">
              {institution.subjects.slice(0, 16).map((s) => (
                <span key={s} className="text-xs px-2.5 py-1 rounded-full bg-white border border-stone-200 text-stone-600">{s}</span>
              ))}
            </div>
          </div>
        )}
        <div className="mt-10"><Contact institution={institution} site={site} tone="light" /></div>
      </div>
    </div>
  );
}

export function SiteTemplate(props: SiteTemplateProps) {
  switch (props.site.template) {
    case "slate":
      return <SlateTemplate {...props} />;
    case "warm":
      return <WarmTemplate {...props} />;
    case "aurora":
    default:
      return <AuroraTemplate {...props} />;
  }
}
