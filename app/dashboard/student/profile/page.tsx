"use client";

import { useState } from "react";
import { Save } from "lucide-react";
import DashboardShell from "@/app/components/dashboard/shell";
import { studentNav } from "@/app/components/dashboard/nav";
import { Card, CardBody, CardHeader } from "@/app/components/ui/card";
import { Button } from "@/app/components/ui/button";
import { useAuth } from "@/lib/auth-context";
import { updateUserProfile, enrollLearner } from "@/lib/db";
import { inputClass } from "@/lib/utils";
import { learnerClassNames } from "@/lib/learners";
import { vocab } from "@/lib/vocab";

export default function StudentProfilePage() {
  const { profile, institution, refresh } = useAuth();
  const v = vocab(institution);
  const [name, setName] = useState(profile?.name ?? "");
  const [classNames, setClassNames] = useState<string[]>(learnerClassNames(profile));
  const [extraTime, setExtraTime] = useState(
    profile?.accommodations?.extraTimePercent ?? 0
  );
  const [largerText, setLargerText] = useState(
    Boolean(profile?.accommodations?.largerText)
  );
  const [hydrated, setHydrated] = useState(false);
  if (profile && !hydrated) {
    setName(profile.name);
    setClassNames(learnerClassNames(profile));
    setExtraTime(profile.accommodations?.extraTimePercent ?? 0);
    setLargerText(Boolean(profile.accommodations?.largerText));
    setHydrated(true);
  }
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const save = async () => {
    if (!profile) return;
    setSaving(true);
    try {
      await updateUserProfile(profile.uid, {
        name: name.trim(),
        className: classNames[0],
        classNames,
        accommodations: {
          extraTimePercent: extraTime || undefined,
          largerText: largerText || undefined,
        },
      });
      if (institution) {
        for (const c of classNames) {
          await enrollLearner({
            institutionId: institution.id,
            user: { uid: profile.uid, name: name.trim() },
            className: c,
          });
        }
      }
      await refresh();
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } finally {
      setSaving(false);
    }
  };

  return (
    <DashboardShell
      role="student"
      navItems={studentNav}
      title="Profile"
      subtitle="Your student account"
    >
      <div className="max-w-lg space-y-6">
        <Card>
          <CardHeader>
            <h2 className="font-semibold">Details</h2>
          </CardHeader>
          <CardBody className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1.5">Full name</label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                className={inputClass}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">Email</label>
              <input value={profile?.email ?? ""} disabled className={`${inputClass} bg-gray-50`} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">
                {v.classes}
              </label>
              {(institution?.classes.length ?? 0) > 0 ? (
                <div className="space-y-2 border border-gray-200 rounded-xl p-3">
                  {institution!.classes.map((c) => (
                    <label key={c} className="flex items-center gap-2 text-sm">
                      <input
                        type="checkbox"
                        checked={classNames.includes(c)}
                        onChange={() =>
                          setClassNames((prev) =>
                            prev.includes(c)
                              ? prev.filter((x) => x !== c)
                              : [...prev, c]
                          )
                        }
                      />
                      {c}
                    </label>
                  ))}
                </div>
              ) : (
                <input
                  value={classNames[0] ?? ""}
                  onChange={(e) =>
                    setClassNames(e.target.value ? [e.target.value] : [])
                  }
                  className={inputClass}
                />
              )}
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">
                Extra time (%)
              </label>
              <input
                type="number"
                min={0}
                max={100}
                value={extraTime}
                onChange={(e) => setExtraTime(Number(e.target.value))}
                className={inputClass}
              />
              <p className="text-xs text-gray-500 mt-1">
                Ask your {v.teacher.toLowerCase()} if you need this set by admin instead.
              </p>
            </div>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={largerText}
                onChange={(e) => setLargerText(e.target.checked)}
              />
              Larger text during assessments
            </label>
            <p className="text-xs text-gray-400">Institution: {institution?.name}</p>
            <div className="flex items-center gap-3">
              <Button loading={saving} onClick={() => void save()}>
                <Save className="w-4 h-4" /> Save
              </Button>
              {saved && <span className="text-sm text-emerald-600">Saved</span>}
            </div>
          </CardBody>
        </Card>
      </div>
    </DashboardShell>
  );
}
