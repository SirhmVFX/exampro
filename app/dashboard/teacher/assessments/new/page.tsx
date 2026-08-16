"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import DashboardShell from "@/app/components/dashboard/shell";
import { teacherNav } from "@/app/components/dashboard/nav";
import { Card, CardBody, CardHeader } from "@/app/components/ui/card";
import { Button } from "@/app/components/ui/button";
import { Badge } from "@/app/components/ui/badge";
import { WysiwygEditor } from "@/app/components/ui/wysiwyg-editor";
import { HtmlContent, isEmptyHtml } from "@/app/components/ui/html-content";
import { StudentPicker } from "@/app/components/ui/student-picker";
import { useAuth } from "@/lib/auth-context";
import {
  listQuestions,
  listMaterialsByTeacher,
  listAssessmentsByTeacher,
  listRubrics,
  listUsers,
  saveAssessment,
  newId,
  COL,
} from "@/lib/db";
import type { Assessment, AssessmentKind, Question, Rubric, UserProfile } from "@/lib/types";
import { inputClass, TYPE_LABEL } from "@/lib/utils";

export default function NewAssessmentPage() {
  const { profile, institution } = useAuth();
  const router = useRouter();
  const [library, setLibrary] = useState<Question[]>([]);
  const [materials, setMaterials] = useState<{ id: string; title: string }[]>([]);
  const [prior, setPrior] = useState<Assessment[]>([]);
  const [rubrics, setRubrics] = useState<Rubric[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [form, setForm] = useState({
    title: "",
    description: "",
    kind: "quiz" as AssessmentKind,
    subject: "",
    className: "",
    durationMins: 30,
    passPercent: 50,
    shuffleQuestions: true,
    allowRetake: false,
    maxAttempts: 1,
    showResultsImmediately: true,
    requiredMaterialId: "",
    requiredAssessmentId: "",
    rubricId: "",
    mode: "self_paced" as "live" | "practice" | "self_paced",
    confirmLeave: true,
    tabWarning: true,
    webcam: false,
    lockOnSubmit: false,
    startAt: "",
    endAt: "",
    publish: true,
  });
  const [students, setStudents] = useState<UserProfile[]>([]);
  const [assignedStudentIds, setAssignedStudentIds] = useState<string[]>([]);

  useEffect(() => {
    if (!institution || !profile) return;
    listQuestions(institution.id, profile.uid).then(setLibrary);
    listMaterialsByTeacher(institution.id, profile.uid).then((m) =>
      setMaterials(m.map((x) => ({ id: x.id, title: x.title })))
    );
    listAssessmentsByTeacher(institution.id, profile.uid).then(setPrior);
    listRubrics(institution.id).then(setRubrics);
    listUsers(institution.id, "student").then(setStudents);
  }, [institution, profile]);

  const subjects = institution?.subjects?.length
    ? institution.subjects
    : [...new Set(library.map((q) => q.subject))];
  const classes = institution?.classes?.length
    ? institution.classes
    : [...new Set(library.map((q) => q.className))];

  const matching = library.filter(
    (q) =>
      (!form.subject || q.subject === form.subject) &&
      (!form.className || q.className === form.className)
  );

  const picked = library.filter((q) => selected.has(q.id));
  const totalPoints = picked.reduce((s, q) => s + q.points, 0);

  const toggle = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const save = async () => {
    if (!institution || !profile) return;
    setError("");
    if (!form.title.trim() || !form.subject || !form.className) {
      setError("Title, subject and class are required.");
      return;
    }
    if (!picked.length) {
      setError("Select at least one question from your library.");
      return;
    }
    setSaving(true);
    try {
      await saveAssessment({
        id: newId(COL.assessments),
        institutionId: institution.id,
        teacherId: profile.uid,
        teacherName: profile.name,
        title: form.title.trim(),
        description: isEmptyHtml(form.description) ? undefined : form.description,
        kind: form.kind,
        subject: form.subject,
        className: form.className,
        questions: picked,
        durationMins: Number(form.durationMins) || 0,
        totalPoints,
        passPercent: Number(form.passPercent) || 50,
        shuffleQuestions: form.shuffleQuestions,
        allowRetake: form.allowRetake,
        maxAttempts: form.allowRetake ? Number(form.maxAttempts) || 0 : 1,
        showResultsImmediately: form.showResultsImmediately,
        requiredMaterialId: form.requiredMaterialId || undefined,
        requiredAssessmentId: form.requiredAssessmentId || undefined,
        rubricId: form.rubricId || undefined,
        mode: form.mode,
        integrity: {
          confirmLeave: form.confirmLeave,
          tabWarning: form.tabWarning,
          webcam: form.webcam,
          lockOnSubmit: form.lockOnSubmit,
        },
        startAt: form.startAt ? new Date(form.startAt).getTime() : undefined,
        endAt: form.endAt ? new Date(form.endAt).getTime() : undefined,
        assignedStudentIds: assignedStudentIds.length ? assignedStudentIds : undefined,
        status: form.publish ? "published" : "draft",
        createdAt: Date.now(),
      });
      router.push("/dashboard/teacher/assessments");
    } catch {
      setError("Couldn't save. Try again.");
      setSaving(false);
    }
  };

  return (
    <DashboardShell
      role="teacher"
      navItems={teacherNav}
      title="New assessment"
      subtitle="Pick questions from your library and set the rules"
    >
      <div className="grid lg:grid-cols-5 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <h2 className="font-semibold">Details</h2>
          </CardHeader>
          <CardBody className="space-y-4">
            {error && <p className="text-sm text-red-600">{error}</p>}
            <div>
              <label className="block text-sm font-medium mb-1.5">Title</label>
              <input
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                className={inputClass}
                placeholder="Midterm — Algebra"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">Description</label>
              <WysiwygEditor
                content={form.description}
                onChange={(description) => setForm({ ...form, description })}
                placeholder="Instructions shown to students"
                minHeight={110}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">Type</label>
              <select
                value={form.kind}
                onChange={(e) =>
                  setForm({ ...form, kind: e.target.value as AssessmentKind })
                }
                className={inputClass}
              >
                <option value="quiz">Quiz</option>
                <option value="test">Test</option>
                <option value="exam">Exam</option>
                <option value="assignment">Assignment</option>
                <option value="project">Project / capstone</option>
                <option value="practice">Practice (self-paced)</option>
              </select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium mb-1.5">Subject</label>
                <select
                  value={form.subject}
                  onChange={(e) => setForm({ ...form, subject: e.target.value })}
                  className={inputClass}
                >
                  <option value="">Select…</option>
                  {subjects.map((s) => (
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
                  {classes.map((s) => (
                    <option key={s}>{s}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium mb-1.5">
                  Duration (mins, 0 = untimed)
                </label>
                <input
                  type="number"
                  min={0}
                  value={form.durationMins}
                  onChange={(e) =>
                    setForm({ ...form, durationMins: Number(e.target.value) })
                  }
                  className={inputClass}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5">Pass %</label>
                <input
                  type="number"
                  min={0}
                  max={100}
                  value={form.passPercent}
                  onChange={(e) =>
                    setForm({ ...form, passPercent: Number(e.target.value) })
                  }
                  className={inputClass}
                />
              </div>
            </div>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={form.shuffleQuestions}
                onChange={(e) =>
                  setForm({ ...form, shuffleQuestions: e.target.checked })
                }
              />
              Shuffle questions
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={form.allowRetake}
                onChange={(e) =>
                  setForm({ ...form, allowRetake: e.target.checked })
                }
              />
              Allow retakes
            </label>
            {form.allowRetake && (
              <div>
                <label className="block text-sm font-medium mb-1.5">
                  Max attempts (0 = unlimited)
                </label>
                <input
                  type="number"
                  min={0}
                  value={form.maxAttempts}
                  onChange={(e) =>
                    setForm({ ...form, maxAttempts: Number(e.target.value) })
                  }
                  className={inputClass}
                />
              </div>
            )}
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={form.showResultsImmediately}
                onChange={(e) =>
                  setForm({ ...form, showResultsImmediately: e.target.checked })
                }
              />
              Show results immediately
            </label>
            <div>
              <label className="block text-sm font-medium mb-1.5">
                Require material first (optional)
              </label>
              <select
                value={form.requiredMaterialId}
                onChange={(e) =>
                  setForm({ ...form, requiredMaterialId: e.target.value })
                }
                className={inputClass}
              >
                <option value="">None</option>
                {materials.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.title}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">
                Unlock after passing (path gate)
              </label>
              <select
                value={form.requiredAssessmentId}
                onChange={(e) =>
                  setForm({ ...form, requiredAssessmentId: e.target.value })
                }
                className={inputClass}
              >
                <option value="">None</option>
                {prior.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.title}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">Rubric</label>
              <select
                value={form.rubricId}
                onChange={(e) => setForm({ ...form, rubricId: e.target.value })}
                className={inputClass}
              >
                <option value="">None</option>
                {rubrics.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">Mode</label>
              <select
                value={form.mode}
                onChange={(e) =>
                  setForm({ ...form, mode: e.target.value as typeof form.mode })
                }
                className={inputClass}
              >
                <option value="self_paced">Self-paced</option>
                <option value="live">Live window</option>
                <option value="practice">Practice</option>
              </select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium mb-1.5">Opens</label>
                <input
                  type="datetime-local"
                  value={form.startAt}
                  onChange={(e) => setForm({ ...form, startAt: e.target.value })}
                  className={inputClass}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5">Closes</label>
                <input
                  type="datetime-local"
                  value={form.endAt}
                  onChange={(e) => setForm({ ...form, endAt: e.target.value })}
                  className={inputClass}
                />
              </div>
            </div>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={form.confirmLeave}
                onChange={(e) => setForm({ ...form, confirmLeave: e.target.checked })}
              />
              Confirm before leaving the page
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={form.tabWarning}
                onChange={(e) => setForm({ ...form, tabWarning: e.target.checked })}
              />
              Log tab switches
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={form.webcam}
                onChange={(e) => setForm({ ...form, webcam: e.target.checked })}
              />
              Optional webcam presence
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={form.lockOnSubmit}
                onChange={(e) => setForm({ ...form, lockOnSubmit: e.target.checked })}
              />
              Lock after submit
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={form.publish}
                onChange={(e) => setForm({ ...form, publish: e.target.checked })}
              />
              Publish now
            </label>
            <div>
              <label className="block text-sm font-medium mb-1.5">
                Assign to specific students (optional)
              </label>
              <p className="text-xs text-gray-500 mb-2">
                Leave empty to assign to the whole {institution?.classLabel ?? "class"}.
                Pick one or more students to limit who can take this.
              </p>
              <StudentPicker
                students={students}
                selectedIds={assignedStudentIds}
                onChange={setAssignedStudentIds}
                classFilter={form.className || undefined}
              />
            </div>
            <p className="text-xs text-gray-500">
              {picked.length} questions · {totalPoints} points
            </p>
            <Button fullWidth loading={saving} onClick={() => void save()}>
              Save assessment
            </Button>
          </CardBody>
        </Card>

        <Card className="lg:col-span-3">
          <CardHeader>
            <h2 className="font-semibold">Question library</h2>
            <p className="text-sm text-gray-500">
              Filtered by the subject and class you selected
            </p>
          </CardHeader>
          <CardBody className="p-0">
            {matching.length === 0 ? (
              <p className="px-6 py-10 text-sm text-gray-400 text-center">
                No matching questions. Add some in the Question Library first.
              </p>
            ) : (
              <div className="divide-y divide-gray-50 max-h-[70vh] overflow-y-auto">
                {matching.map((q) => (
                  <label
                    key={q.id}
                    className="flex gap-3 px-6 py-3 hover:bg-gray-50 cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={selected.has(q.id)}
                      onChange={() => toggle(q.id)}
                      className="mt-1"
                    />
                    <div className="min-w-0">
                      <div className="flex gap-2 mb-1">
                        <Badge>{TYPE_LABEL[q.type]}</Badge>
                        <span className="text-xs text-gray-400">{q.points} pts</span>
                      </div>
                      <HtmlContent html={q.text} compact className="text-sm text-gray-900" />
                    </div>
                  </label>
                ))}
              </div>
            )}
          </CardBody>
        </Card>
      </div>
    </DashboardShell>
  );
}
