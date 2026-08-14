"use client";

import { useEffect, useState } from "react";
import { FolderTree, Save } from "lucide-react";
import DashboardShell from "@/app/components/dashboard/shell";
import { Card, CardBody, CardHeader } from "@/app/components/ui/card";
import { Button } from "@/app/components/ui/button";
import { TagInput } from "@/app/components/ui/tag-input";
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
} from "@/lib/db";
import type { Cohort, Department, Enrollment, Term } from "@/lib/types";
import { inputClass } from "@/lib/utils";
import { vocab } from "@/lib/vocab";

export default function AdminStructurePage() {
  const { institution, refresh } = useAuth();
  const v = vocab(institution);
  const [classLabel, setClassLabel] = useState(institution?.classLabel ?? "Class");
  const [classes, setClasses] = useState<string[]>(institution?.classes ?? []);
  const [subjects, setSubjects] = useState<string[]>(institution?.subjects ?? []);
  const [skills, setSkills] = useState<string[]>(institution?.skills ?? []);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [cohorts, setCohorts] = useState<Cohort[]>([]);
  const [terms, setTerms] = useState<Term[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [termName, setTermName] = useState("");
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

  useEffect(() => {
    reload();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [institution]);

  const save = async () => {
    if (!institution) return;
    setSaving(true);
    try {
      await updateInstitution(institution.id, {
        classLabel: classLabel.trim() || v.class,
        classes,
        subjects,
        skills,
      });
      await syncInstitutionClasses(institution.id, classes);
      await refresh();
      await reload();
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } finally {
      setSaving(false);
    }
  };

  const addTerm = async () => {
    if (!institution || !termName.trim()) return;
    const start = Date.now();
    await saveTerm({
      id: newId(COL.terms),
      institutionId: institution.id,
      name: termName.trim(),
      startAt: start,
      endAt: start + 90 * 24 * 60 * 60 * 1000,
      status: "active",
      createdAt: Date.now(),
    });
    setTermName("");
    await reload();
  };

  const addDept = async () => {
    if (!institution || !deptName.trim()) return;
    await saveDepartment({
      id: newId(COL.departments),
      institutionId: institution.id,
      name: deptName.trim(),
      createdAt: Date.now(),
    });
    setDeptName("");
    await reload();
  };

  return (
    <DashboardShell
      role="admin"
      title={`${v.classes} & subjects`}
      subtitle="Groups can have dates, a seat cap, and a waitlist. Learners can sit in more than one."
    >
      <div className="max-w-3xl space-y-6">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <FolderTree className="w-5 h-5 text-[var(--dash-primary)]" />
              <h2 className="text-lg font-semibold">Structure</h2>
            </div>
          </CardHeader>
          <CardBody className="space-y-5">
            <div>
              <label className="block text-sm font-medium mb-1.5">
                What do you call a group?
              </label>
              <input
                value={classLabel}
                onChange={(e) => setClassLabel(e.target.value)}
                className={inputClass}
                placeholder="Grade, Level, Cohort, Track…"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">
                {classLabel || v.classes}
              </label>
              <TagInput
                values={classes}
                onChange={setClasses}
                placeholder="Type a name and press Enter"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">
                Subjects / courses
              </label>
              <TagInput
                values={subjects}
                onChange={setSubjects}
                placeholder="e.g. Mathematics"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">Skills</label>
              <TagInput
                values={skills}
                onChange={setSkills}
                placeholder="HTML, React, Git"
              />
              <p className="text-xs text-gray-500 mt-1">
                Tag questions with these. Progress shows skill marks, not only an average.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Button loading={saving} onClick={() => void save()}>
                <Save className="w-4 h-4" /> Save structure
              </Button>
              {saved && <span className="text-sm text-emerald-600">Saved</span>}
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardHeader>
            <h2 className="text-lg font-semibold">Terms / sessions</h2>
            <p className="text-sm text-gray-500 mt-1">
              First term, Harmattan, Fall — used by the gradebook.
            </p>
          </CardHeader>
          <CardBody className="space-y-3">
            <div className="flex gap-2">
              <input
                value={termName}
                onChange={(e) => setTermName(e.target.value)}
                className={inputClass}
                placeholder="Harmattan 2026"
              />
              <Button variant="outline" onClick={() => void addTerm()}>
                Add
              </Button>
            </div>
            {terms.map((t) => (
              <div key={t.id} className="flex items-center justify-between text-sm border border-gray-200 px-3 py-2">
                <span>
                  {t.name}{" "}
                  <span className="text-gray-400">· {t.status}</span>
                </span>
                <Button variant="ghost" size="sm" onClick={() => void deleteTerm(t.id).then(reload)}>
                  Remove
                </Button>
              </div>
            ))}
          </CardBody>
        </Card>

        <Card>
          <CardHeader>
            <h2 className="text-lg font-semibold">Departments</h2>
            <p className="text-sm text-gray-500 mt-1">
              For corporates and faculties. Managers see people in their department.
            </p>
          </CardHeader>
          <CardBody className="space-y-3">
            <div className="flex gap-2">
              <input
                value={deptName}
                onChange={(e) => setDeptName(e.target.value)}
                className={inputClass}
                placeholder="Engineering"
              />
              <Button variant="outline" onClick={() => void addDept()}>
                Add
              </Button>
            </div>
            {departments.map((d) => (
              <div key={d.id} className="flex items-center justify-between text-sm border border-gray-200 px-3 py-2">
                <span>{d.name}</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => void deleteDepartment(d.id).then(reload)}
                >
                  Remove
                </Button>
              </div>
            ))}
          </CardBody>
        </Card>

        <Card>
          <CardHeader>
            <h2 className="text-lg font-semibold">{v.classes} — dates, seats, waitlist</h2>
          </CardHeader>
          <CardBody className="space-y-4">
            {cohorts.map((c) => {
              const enrolled = enrollments.filter((e) => e.cohortId === c.id);
              const active = enrolled.filter((e) => e.status === "active").length;
              const wait = enrolled.filter((e) => e.status === "waitlist").length;
              const dropped = enrolled.filter((e) => e.status === "dropped").length;
              return (
                <div key={c.id} className="border border-gray-200 p-4 space-y-3">
                  <div className="flex justify-between gap-2">
                    <p className="font-medium">{c.name}</p>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => void deleteCohort(c.id).then(reload)}
                    >
                      Remove
                    </Button>
                  </div>
                  <div className="grid sm:grid-cols-3 gap-2">
                    <input
                      type="date"
                      className={inputClass}
                      value={c.startAt ? new Date(c.startAt).toISOString().slice(0, 10) : ""}
                      onChange={(e) =>
                        void saveCohort({
                          ...c,
                          startAt: e.target.value ? new Date(e.target.value).getTime() : undefined,
                        }).then(reload)
                      }
                    />
                    <input
                      type="date"
                      className={inputClass}
                      value={c.endAt ? new Date(c.endAt).toISOString().slice(0, 10) : ""}
                      onChange={(e) =>
                        void saveCohort({
                          ...c,
                          endAt: e.target.value ? new Date(e.target.value).getTime() : undefined,
                        }).then(reload)
                      }
                    />
                    <input
                      type="number"
                      min={0}
                      className={inputClass}
                      placeholder="Seat cap (0 = none)"
                      value={c.capacity ?? 0}
                      onChange={(e) =>
                        void saveCohort({
                          ...c,
                          capacity: Number(e.target.value) || undefined,
                        }).then(reload)
                      }
                    />
                  </div>
                  <p className="text-xs text-gray-500">
                    {active} active · {wait} waitlist · {dropped} dropped
                  </p>
                  {wait > 0 && (
                    <div className="space-y-1">
                      {enrolled
                        .filter((e) => e.status === "waitlist")
                        .map((e) => (
                          <div key={e.id} className="flex justify-between text-xs">
                            <span>{e.userName}</span>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() =>
                                void setEnrollmentStatus(e.id, "active").then(reload)
                              }
                            >
                              Admit
                            </Button>
                          </div>
                        ))}
                    </div>
                  )}
                </div>
              );
            })}
            {cohorts.length === 0 && (
              <p className="text-sm text-gray-400">
                Save the {v.classes.toLowerCase()} list above to create groups you can date and cap.
              </p>
            )}
          </CardBody>
        </Card>
      </div>
    </DashboardShell>
  );
}
