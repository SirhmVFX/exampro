"use client";

import { useEffect, useState } from "react";
import DashboardShell from "@/app/components/dashboard/shell";
import { Card, CardBody, CardHeader } from "@/app/components/ui/card";
import { Button } from "@/app/components/ui/button";
import { useAuth } from "@/lib/auth-context";
import { COL, deleteRubric, listRubrics, newId, saveRubric } from "@/lib/db";
import type { Rubric, RubricCriterion } from "@/lib/types";
import { inputClass } from "@/lib/utils";

export default function RubricsPage() {
  const { institution, profile } = useAuth();
  const [items, setItems] = useState<Rubric[]>([]);
  const [name, setName] = useState("Essay rubric");
  const [criteria, setCriteria] = useState<RubricCriterion[]>([
    { id: "c1", name: "Clarity", maxPoints: 5 },
    { id: "c2", name: "Evidence", maxPoints: 5 },
    { id: "c3", name: "Structure", maxPoints: 5 },
  ]);
  const [saving, setSaving] = useState(false);

  const reload = () => {
    if (!institution) return;
    listRubrics(institution.id).then(setItems);
  };

  useEffect(() => {
    reload();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [institution]);

  const save = async () => {
    if (!institution || !profile) return;
    setSaving(true);
    try {
      await saveRubric({
        id: newId(COL.rubrics),
        institutionId: institution.id,
        teacherId: profile.uid,
        name: name.trim(),
        criteria,
        createdAt: Date.now(),
      });
      await reload();
    } finally {
      setSaving(false);
    }
  };

  return (
    <DashboardShell
      role="teacher"
      title="Rubrics"
      subtitle="Shared scoring guides so essays and projects are marked the same way"
    >
      <div className="grid lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <h2 className="font-semibold">New rubric</h2>
          </CardHeader>
          <CardBody className="space-y-3">
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={inputClass}
            />
            {criteria.map((c, i) => (
              <div key={c.id} className="grid grid-cols-3 gap-2">
                <input
                  className={`${inputClass} col-span-2`}
                  value={c.name}
                  onChange={(e) =>
                    setCriteria((prev) =>
                      prev.map((x, idx) => (idx === i ? { ...x, name: e.target.value } : x))
                    )
                  }
                />
                <input
                  type="number"
                  className={inputClass}
                  value={c.maxPoints}
                  onChange={(e) =>
                    setCriteria((prev) =>
                      prev.map((x, idx) =>
                        idx === i ? { ...x, maxPoints: Number(e.target.value) } : x
                      )
                    )
                  }
                />
              </div>
            ))}
            <Button
              variant="outline"
              onClick={() =>
                setCriteria((p) => [
                  ...p,
                  { id: newId("crit"), name: "Criterion", maxPoints: 5 },
                ])
              }
            >
              Add criterion
            </Button>
            <Button loading={saving} onClick={() => void save()}>
              Save rubric
            </Button>
          </CardBody>
        </Card>
        <Card>
          <CardHeader>
            <h2 className="font-semibold">Library</h2>
          </CardHeader>
          <CardBody className="space-y-3">
            {items.map((r) => (
              <div key={r.id} className="border border-gray-200 p-3 flex justify-between gap-2">
                <div>
                  <p className="font-medium text-sm">{r.name}</p>
                  <p className="text-xs text-gray-500">
                    {r.criteria.map((c) => `${c.name} ${c.maxPoints}`).join(" · ")}
                  </p>
                </div>
                <Button variant="ghost" size="sm" onClick={() => void deleteRubric(r.id).then(reload)}>
                  Delete
                </Button>
              </div>
            ))}
          </CardBody>
        </Card>
      </div>
    </DashboardShell>
  );
}
