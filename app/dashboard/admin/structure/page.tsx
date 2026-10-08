"use client";

import { useEffect, useState } from "react";
import { Save, BookOpen, GraduationCap, Calendar, Building2, Users, Plus, Trash2, CheckCircle } from "lucide-react";
import toast from "react-hot-toast";
import DashboardShell from "@/app/components/dashboard/shell";
import { Card, CardBody, CardHeader } from "@/app/components/ui/card";
import { Button } from "@/app/components/ui/button";
import { TagInput } from "@/app/components/ui/tag-input";
import { Badge } from "@/app/components/ui/badge";
import { useAuth } from "@/lib/auth-context";
import {
  COL,
  deleteCohort,
  deleteDepartment,
  deleteTerm,
  listCohorts,
  listDepartments,
  listEnrollments,
  listTerms,
  newId,
  saveCohort,
  saveDepartment,
  saveTerm,
  setEnrollmentStatus,
  syncInstitutionClasses,
  updateInstitution,
} from "@/lib/db"; import type { Cohort, Department, Enrollment, Term } from "@/lib/types";
import { inputClass } from "@/lib/utils";
import { vocab } from "@/lib/vocab";

type Tab = "groups" | "subjects" | "terms" | "departments";

const TABS: { id: Tab; label: string; icon: typeof BookOpen }[] = [
  { id: "groups", label: "Groups & Classes", icon: GraduationCap },
  { id: "subjects", label: "Subjects & Skills", icon: BookOpen },
  { id: "terms", label: "Terms & Sessions", icon: Calendar },
  { id: "departments", label: "Departments", icon: Building2 },
];

function TabBar({ active, onChange }: { active: Tab; onChange: (t: Tab) => void }) {
  return (
    <div className="flex flex-wrap gap-1 bg-[var(--dash-surface-alt)] p-1 rounded-xl border border-[var(--dash-border)]">
      {TABS.map((t) => {
        const Icon = t.icon;
        const on = active === t.id;
        return (
          <button
            key={t.id}
            onClick={() => onChange(t.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${on
              ? "bg-[var(--dash-surface)] text-[var(--dash-text)] shadow-sm border border-[var(--dash-border)]"
              : "text-[var(--dash-text-muted)] hover:text-[var(--dash-text)] hover:bg-[var(--dash-surface)]"
              }`}
          >
            <Icon className="w-4 h-4" />
            {t.label}
          </button>
        );
      })}
    </div>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--dash-text-faint)] mb-3">
      {children}
    </p>
  );
}

export default function AdminStructurePage() {
  const { institution, refresh } = useAuth();
  const v = vocab(institution);
  const [tab, setTab] = useState<Tab>("groups");
  const [classLabel, setClassLabel] = useState(institution?.classLabel ?? "Class");
  const [classes, setClasses] = useState<string[]>(institution?.classes ?? []);
  const [subjects, setSubjects] = useState<string[]>(institution?.subjects ?? []);
  const [skills, setSkills] = useState<string[]>(institution?.skills ?? []);
  const [saving, setSaving] = useState(false);
  const [cohorts, setCohorts] = useState<Cohort[]>([]);
  const [terms, setTerms] = useState<Term[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [termName, setTermName] = useState("");
  const [termStart, setTermStart] = useState("");
  const [termEnd, setTermEnd] = useState("");
  const [deptName, setDeptName] = useState("");
  const [hydrated, setHydrated] = useState(false);

  if (institution && !hydrated) {
    setClassLabel(institution.classLabel || v.class);
    setClasses(institution.classes ?? []);
    setSubjects(institution.subjects ?? []);
    setSkills(institution.skills ?? []);
    setHydrated(true);
  }

  const reload = async () => {
    if (!institution) return;
    const [c, t, d, e] = await Promise.all([
      listCohorts(institution.id),
      listTerms(institution.id),
      listDepartments(institution.id),
      listEnrollments(institution.id),
    ]);
    setCohorts(c);
    setTerms(t);
    setDepartments(d);
    setEnrollments(e);
  };

  useEffect(() => { reload(); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, [institution]);

  const save = async () => {
    if (!institution) return;
    setSaving(true);
    try {
      await updateInstitution(institution.id, { classLabel: classLabel.trim() || v.class, classes, subjects, skills });
      await syncInstitutionClasses(institution.id, classes);
      await refresh();
      await reload();
      toast.success("Structure saved");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to save.");
    } finally {
      setSaving(false);
    }
  };

  const addTerm = async () => {
    if (!institution || !termName.trim()) return;
    const start = termStart ? new Date(termStart).getTime() : Date.now();
    const end = termEnd ? new Date(termEnd).getTime() : start + 90 * 24 * 60 * 60 * 1000;
    try {
      await saveTerm({ id: newId(COL.terms), institutionId: institution.id, name: termName.trim(), startAt: start, endAt: end, status: "active", createdAt: Date.now() });
      setTermName(""); setTermStart(""); setTermEnd("");
      await reload();
      toast.success("Term added");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to add term.");
    }
  };

  const addDept = async () => {
    if (!institution || !deptName.trim()) return;
    try {
      await saveDepartment({ id: newId(COL.departments), institutionId: institution.id, name: deptName.trim(), createdAt: Date.now() });
      setDeptName("");
      await reload();
      toast.success("Department added");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to add department.");
    }
  };

  const termStatus = (t: Term): "upcoming" | "active" | "closed" => {
    const now = Date.now();
    if (now < t.startAt) return "upcoming";
    if (now > t.endAt) return "closed";
    return "active";
  };

  return (
    <DashboardShell
      role="admin"
      title="Structure"
      subtitle="Define the groups, subjects, terms, and departments your institution uses"
    >
      <div className="max-w-3xl space-y-5">
        <TabBar active={tab} onChange={setTab} />

        {/* ── GROUPS TAB ─────────────────────────────────────────────── */}
        {tab === "groups" && (
          <div className="space-y-5">
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <GraduationCap className="w-5 h-5 text-[var(--dash-primary)]" />
                  <h2 className="font-semibold text-[var(--dash-text)]">What do you call a group?</h2>
                </div>
              </CardHeader>
              <CardBody className="space-y-4">
                <div>
                  <SectionLabel>Group label</SectionLabel>
                  <input
                    value={classLabel}
                    onChange={(e) => setClassLabel(e.target.value)}
                    className={inputClass}
                    placeholder="Class, Grade, Level, Cohort, Track…"
                  />
                  <p className="text-xs text-[var(--dash-text-faint)] mt-1.5">
                    This word appears everywhere in the product. Change it to match how your institution talks.
                  </p>
                </div>

                <div>
                  <SectionLabel>{classLabel || "Groups"}</SectionLabel>
                  <TagInput values={classes} onChange={setClasses} placeholder="Type a name and press Enter" />
                  <p className="text-xs text-[var(--dash-text-faint)] mt-1.5">
                    Each group becomes a filter on assessments, materials, and rosters.
                  </p>
                </div>

                <div className="flex items-center gap-3 pt-2">
                  <Button loading={saving} onClick={() => void save()}>
                    <Save className="w-4 h-4" /> Save groups
                  </Button>
                </div>
              </CardBody>
            </Card>

            {/* Cohorts with dates and seat caps */}
            {cohorts.length > 0 && (
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <h2 className="font-semibold text-[var(--dash-text)]">Dates, seats &amp; waitlists</h2>
                    <p className="text-xs text-[var(--dash-text-faint)]">{cohorts.length} group{cohorts.length !== 1 ? "s" : ""}</p>
                  </div>
                </CardHeader>
                <CardBody className="space-y-4">
                  {cohorts.map((c) => {
                    const enrolled = enrollments.filter((e) => e.cohortId === c.id);
                    const active = enrolled.filter((e) => e.status === "active").length;
                    const wait = enrolled.filter((e) => e.status === "waitlist").length;
                    const dropped = enrolled.filter((e) => e.status === "dropped").length;
                    return (
                      <div key={c.id} className="border border-[var(--dash-border)] rounded-xl p-4 space-y-3">
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <p className="font-semibold text-[var(--dash-text)]">{c.name}</p>
                            <div className="flex gap-1.5">
                              {active > 0 && <Badge variant="success">{active} active</Badge>}
                              {wait > 0 && <Badge variant="warning">{wait} waitlist</Badge>}
                              {dropped > 0 && <Badge variant="danger">{dropped} dropped</Badge>}
                            </div>
                          </div>
                          <Button variant="ghost" size="sm" onClick={() => void deleteCohort(c.id).then(reload)}>
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                        <div className="grid sm:grid-cols-3 gap-2">
                          <div>
                            <label className="block text-xs text-[var(--dash-text-faint)] mb-1">Start date</label>
                            <input type="date" className={inputClass} value={c.startAt ? new Date(c.startAt).toISOString().slice(0, 10) : ""}
                              onChange={(e) => void saveCohort({ ...c, startAt: e.target.value ? new Date(e.target.value).getTime() : undefined }).then(reload)} />
                          </div>
                          <div>
                            <label className="block text-xs text-[var(--dash-text-faint)] mb-1">End date</label>
                            <input type="date" className={inputClass} value={c.endAt ? new Date(c.endAt).toISOString().slice(0, 10) : ""}
                              onChange={(e) => void saveCohort({ ...c, endAt: e.target.value ? new Date(e.target.value).getTime() : undefined }).then(reload)} />
                          </div>
                          <div>
                            <label className="block text-xs text-[var(--dash-text-faint)] mb-1">Seat cap (0 = none)</label>
                            <input type="number" min={0} className={inputClass} placeholder="0" value={c.capacity ?? 0}
                              onChange={(e) => void saveCohort({ ...c, capacity: Number(e.target.value) || undefined }).then(reload)} />
                          </div>
                        </div>
                        {wait > 0 && (
                          <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 space-y-2">
                            <p className="text-xs font-semibold text-amber-700">Waitlist — {wait} student{wait !== 1 ? "s" : ""}</p>
                            {enrolled.filter((e) => e.status === "waitlist").map((e) => (
                              <div key={e.id} className="flex items-center justify-between">
                                <span className="text-sm text-amber-800">{e.userName}</span>
                                <Button size="sm" variant="outline" onClick={() => void setEnrollmentStatus(e.id, "active").then(reload)}>
                                  <CheckCircle className="w-3.5 h-3.5" /> Admit
                                </Button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </CardBody>
              </Card>
            )}

            {cohorts.length === 0 && classes.length > 0 && (
              <div className="border border-dashed border-[var(--dash-border)] rounded-xl p-6 text-center">
                <GraduationCap className="w-8 h-8 text-[var(--dash-text-faint)] mx-auto mb-2" />
                <p className="text-sm text-[var(--dash-text-muted)]">Save your groups above to add dates and seat caps.</p>
              </div>
            )}
          </div>
        )}

        {/* ── SUBJECTS TAB ───────────────────────────────────────────── */}
        {tab === "subjects" && (
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-[var(--dash-primary)]" />
                <h2 className="font-semibold text-[var(--dash-text)]">Subjects &amp; Skills</h2>
              </div>
            </CardHeader>
            <CardBody className="space-y-6">
              <div>
                <SectionLabel>Subjects / courses</SectionLabel>
                <TagInput values={subjects} onChange={setSubjects} placeholder="e.g. Mathematics — press Enter to add" />
                <p className="text-xs text-[var(--dash-text-faint)] mt-1.5">
                  Every question and assessment is tagged with a subject. Teachers and students use these to filter their work.
                </p>
              </div>

              <div>
                <SectionLabel>Skills</SectionLabel>
                <TagInput values={skills} onChange={setSkills} placeholder="e.g. Algebra, React Hooks, SQL JOINs" />
                <p className="text-xs text-[var(--dash-text-faint)] mt-1.5">
                  Tag individual questions with skills. Student progress shows skill-level breakdowns, not just subject averages. Optional — leave blank if you don&apos;t need skill tracking.
                </p>
              </div>

              <div className="pt-2">
                <Button loading={saving} onClick={() => void save()}>
                  <Save className="w-4 h-4" /> Save subjects &amp; skills
                </Button>
              </div>
            </CardBody>
          </Card>
        )}

        {/* ── TERMS TAB ──────────────────────────────────────────────── */}
        {tab === "terms" && (
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-[var(--dash-primary)]" />
                  <h2 className="font-semibold text-[var(--dash-text)]">Add a term</h2>
                </div>
              </CardHeader>
              <CardBody className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-[var(--dash-text)] mb-1.5">Term name</label>
                  <input value={termName} onChange={(e) => setTermName(e.target.value)} className={inputClass} placeholder="e.g. First Term 2026, Fall Semester, Q1" />
                </div>
                <div className="grid sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-[var(--dash-text)] mb-1.5">Start date</label>
                    <input type="date" value={termStart} onChange={(e) => setTermStart(e.target.value)} className={inputClass} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[var(--dash-text)] mb-1.5">End date</label>
                    <input type="date" value={termEnd} onChange={(e) => setTermEnd(e.target.value)} className={inputClass} />
                  </div>
                </div>
                <p className="text-xs text-[var(--dash-text-faint)]">
                  Terms are used to filter the gradebook. Leave dates blank to default to 90 days from today.
                </p>
                <Button variant="outline" onClick={() => void addTerm()} disabled={!termName.trim()}>
                  <Plus className="w-4 h-4" /> Add term
                </Button>
              </CardBody>
            </Card>

            {terms.length > 0 && (
              <Card>
                <CardHeader>
                  <h2 className="font-semibold text-[var(--dash-text)]">Current terms</h2>
                </CardHeader>
                <CardBody className="p-0">
                  <div className="divide-y divide-[var(--dash-border)]">
                    {terms.map((t) => {
                      const status = termStatus(t);
                      return (
                        <div key={t.id} className="px-6 py-4 flex items-center justify-between gap-4">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <p className="font-medium text-[var(--dash-text)]">{t.name}</p>
                              <Badge variant={status === "active" ? "success" : status === "upcoming" ? "info" : "default"}>
                                {status}
                              </Badge>
                            </div>
                            <p className="text-xs text-[var(--dash-text-faint)] mt-0.5">
                              {new Date(t.startAt).toLocaleDateString()} → {new Date(t.endAt).toLocaleDateString()}
                            </p>
                          </div>
                          <Button variant="ghost" size="sm" onClick={() => void deleteTerm(t.id).then(reload)}>
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      );
                    })}
                  </div>
                </CardBody>
              </Card>
            )}

            {terms.length === 0 && (
              <div className="border border-dashed border-[var(--dash-border)] rounded-xl p-8 text-center">
                <Calendar className="w-8 h-8 text-[var(--dash-text-faint)] mx-auto mb-2" />
                <p className="text-sm text-[var(--dash-text-muted)]">No terms yet. Add your first one above.</p>
              </div>
            )}
          </div>
        )}

        {/* ── DEPARTMENTS TAB ────────────────────────────────────────── */}
        {tab === "departments" && (
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Building2 className="w-5 h-5 text-[var(--dash-primary)]" />
                  <div>
                    <h2 className="font-semibold text-[var(--dash-text)]">Departments</h2>
                    <p className="text-sm text-[var(--dash-text-muted)] mt-0.5">For universities and corporates. Manager accounts see only their department&apos;s students.</p>
                  </div>
                </div>
              </CardHeader>
              <CardBody className="space-y-3">
                <div className="flex gap-2">
                  <input value={deptName} onChange={(e) => setDeptName(e.target.value)} className={inputClass} placeholder="e.g. Engineering, Sciences, Marketing" />
                  <Button variant="outline" onClick={() => void addDept()} disabled={!deptName.trim()}>
                    <Plus className="w-4 h-4" /> Add
                  </Button>
                </div>
              </CardBody>
            </Card>

            {departments.length > 0 && (
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <h2 className="font-semibold text-[var(--dash-text)]">Departments</h2>
                    <Badge variant="info">{departments.length}</Badge>
                  </div>
                </CardHeader>
                <CardBody className="p-0">
                  <div className="divide-y divide-[var(--dash-border)]">
                    {departments.map((d) => (
                      <div key={d.id} className="px-6 py-3 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-[var(--dash-primary-soft)] flex items-center justify-center">
                            <Users className="w-4 h-4 text-[var(--dash-primary)]" />
                          </div>
                          <span className="text-sm font-medium text-[var(--dash-text)]">{d.name}</span>
                        </div>
                        <Button variant="ghost" size="sm" onClick={() => void deleteDepartment(d.id).then(reload)}>
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </CardBody>
              </Card>
            )}

            {departments.length === 0 && (
              <div className="border border-dashed border-[var(--dash-border)] rounded-xl p-8 text-center">
                <Building2 className="w-8 h-8 text-[var(--dash-text-faint)] mx-auto mb-2" />
                <p className="text-sm text-[var(--dash-text-muted)]">No departments yet.</p>
                <p className="text-xs text-[var(--dash-text-faint)] mt-1">Skip this if you don&apos;t have departments — it&apos;s only needed for manager-role access control.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </DashboardShell>
  );
}
