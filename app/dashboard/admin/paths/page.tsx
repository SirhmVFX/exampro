"use client";

import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import DashboardShell from "@/app/components/dashboard/shell";
import { Card, CardBody, CardHeader } from "@/app/components/ui/card";
import { Button } from "@/app/components/ui/button";
import { useAuth } from "@/lib/auth-context";
import {
  COL,
  listAllAssessments,
  listPaths,
  savePath,
  deletePath,
  newId,
  listMaterialsForClasses,
} from "@/lib/db";
import type { Assessment, LearningPath, Material, PathItem } from "@/lib/types";
import { inputClass } from "@/lib/utils";
import { WysiwygEditor } from "@/app/components/ui/wysiwyg-editor";
import { HtmlContent, isEmptyHtml } from "@/app/components/ui/html-content";
import { vocab } from "@/lib/vocab";

export default function PathsPage() {
  const { institution, profile } = useAuth();
  const v = vocab(institution);
  const [paths, setPaths] = useState<LearningPath[]>([]);
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [materials, setMaterials] = useState<Material[]>([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [className, setClassName] = useState("");
  const [items, setItems] = useState<PathItem[]>([]);
  const [saving, setSaving] = useState(false);

  const reload = async () => {
    if (!institution || !profile) return;
    const [p, a, m] = await Promise.all([
      listPaths(institution.id),
      listAllAssessments(institution.id),
      listMaterialsForClasses(institution.id, institution.classes ?? []),
    ]);
    setPaths(p);
    setAssessments(a);
    setMaterials(m);
  };

  useEffect(() => {
    reload();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [institution]);

  const addItem = (type: "material" | "assessment", refId: string, title: string) => {
    if (!refId) return;
    setItems((prev) => [
      ...prev,
      {
        id: newId("pathItems"),
        type,
        refId,
        title,
        required: true,
        passPercent: type === "assessment" ? 50 : undefined,
      },
    ]);
  };

  const save = async () => {
    if (!institution || !title.trim() || !items.length) return;
    setSaving(true);
    try {
      await savePath({
        id: newId(COL.paths),
        institutionId: institution.id,
        title: title.trim(),
        description: isEmptyHtml(description) ? undefined : description,
        className: className || undefined,
        items,
        createdAt: Date.now(),
      });
      setTitle("");
      setDescription("");
      setItems([]);
      await reload();
      toast.success("Learning path saved");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to save path. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <DashboardShell
      role="admin"
      title="Learning paths"
      subtitle="Week-by-week modules. Required items gate the next quiz."
    >
      <div className="grid lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <h2 className="font-semibold">New path</h2>
          </CardHeader>
          <CardBody className="space-y-3">
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className={inputClass}
              placeholder="Frontend · 12 weeks"
            />
            <WysiwygEditor
              content={description}
              onChange={setDescription}
              placeholder="Path details and notes for learners"
              minHeight={110}
            />
            <select
              value={className}
              onChange={(e) => setClassName(e.target.value)}
              className={inputClass}
            >
              <option value="">All {v.classes.toLowerCase()}</option>
              {(institution?.classes ?? []).map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
            <div className="grid grid-cols-2 gap-2">
              <select
                className={inputClass}
                defaultValue=""
                onChange={(e) => {
                  const m = materials.find((x) => x.id === e.target.value);
                  if (m) addItem("material", m.id, m.title);
                  e.target.value = "";
                }}
              >
                <option value="">Add material…</option>
                {materials.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.title}
                  </option>
                ))}
              </select>
              <select
                className={inputClass}
                defaultValue=""
                onChange={(e) => {
                  const a = assessments.find((x) => x.id === e.target.value);
                  if (a) addItem("assessment", a.id, a.title);
                  e.target.value = "";
                }}
              >
                <option value="">Add assessment…</option>
                {assessments.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.title}
                  </option>
                ))}
              </select>
            </div>
            <ol className="space-y-2 text-sm">
              {items.map((it, i) => (
                <li key={it.id} className="flex items-center gap-2 border border-gray-200 rounded-lg px-3 py-2">
                  <span className="text-gray-400">{i + 1}.</span>
                  <span className="flex-1">
                    {it.title}{" "}
                    <span className="text-xs text-gray-400">({it.type})</span>
                  </span>
                  <label className="text-xs flex items-center gap-1">
                    <input
                      type="checkbox"
                      checked={it.required}
                      onChange={(e) =>
                        setItems((prev) =>
                          prev.map((x) =>
                            x.id === it.id ? { ...x, required: e.target.checked } : x
                          )
                        )
                      }
                    />
                    Gate
                  </label>
                </li>
              ))}
            </ol>
            <Button loading={saving} onClick={() => void save()} disabled={!title || !items.length}>
              Save path
            </Button>
          </CardBody>
        </Card>
        <Card>
          <CardHeader>
            <h2 className="font-semibold">Paths</h2>
          </CardHeader>
          <CardBody className="space-y-4">
            {paths.length === 0 && (
              <p className="text-sm text-gray-400">No paths yet.</p>
            )}
            {paths.map((p) => (
              <div key={p.id} className="border border-gray-200 rounded-xl p-4">
                <div className="flex justify-between gap-2">
                  <div>
                    <p className="font-medium">{p.title}</p>
                    {p.description && (
                      <HtmlContent html={p.description} compact className="mt-1" />
                    )}
                    <p className="text-xs text-gray-500">
                      {p.className || "All"} · {p.items.length} items
                    </p>
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => void deletePath(p.id).then(reload)}>
                    Delete
                  </Button>
                </div>
                <ol className="mt-2 text-xs text-gray-600 space-y-1">
                  {p.items.map((it, i) => (
                    <li key={it.id}>
                      {i + 1}. {it.title}
                      {it.required ? " · required" : ""}
                    </li>
                  ))}
                </ol>
              </div>
            ))}
          </CardBody>
        </Card>
      </div>
    </DashboardShell>
  );
}
