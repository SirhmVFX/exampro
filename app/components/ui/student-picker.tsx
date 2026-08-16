"use client";

import { useMemo, useState } from "react";
import type { UserProfile } from "@/lib/types";
import { learnerClassNames } from "@/lib/learners";
import { inputClass } from "@/lib/utils";

export function StudentPicker({
  students,
  selectedIds,
  onChange,
  classFilter,
}: {
  students: UserProfile[];
  selectedIds: string[];
  onChange: (ids: string[]) => void;
  classFilter?: string;
}) {
  const [search, setSearch] = useState("");
  const selected = useMemo(() => new Set(selectedIds), [selectedIds]);

  const visible = useMemo(() => {
    const q = search.trim().toLowerCase();
    return students.filter((s) => {
      if (classFilter) {
        const classes = learnerClassNames(s);
        if (classes.length && !classes.includes(classFilter)) return false;
      }
      if (!q) return true;
      return (
        s.name.toLowerCase().includes(q) ||
        s.email.toLowerCase().includes(q) ||
        (s.className ?? "").toLowerCase().includes(q)
      );
    });
  }, [students, search, classFilter]);

  const toggle = (uid: string) => {
    const next = new Set(selected);
    if (next.has(uid)) next.delete(uid);
    else next.add(uid);
    onChange([...next]);
  };

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-2">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className={`${inputClass} flex-1 min-w-[160px]`}
          placeholder="Search students…"
        />
        <button
          type="button"
          className="text-xs font-medium text-[var(--dash-primary)] px-2"
          onClick={() => onChange(visible.map((s) => s.uid))}
        >
          Select shown ({visible.length})
        </button>
        <button
          type="button"
          className="text-xs font-medium text-gray-500 px-2"
          onClick={() => onChange([])}
        >
          Clear
        </button>
      </div>
      <p className="text-xs text-gray-500">
        {selectedIds.length} selected
        {classFilter ? ` · filtered by ${classFilter}` : ""}
      </p>
      <div className="max-h-48 overflow-y-auto border border-gray-200 divide-y divide-gray-50">
        {visible.length === 0 ? (
          <p className="px-3 py-4 text-xs text-gray-400">No students match.</p>
        ) : (
          visible.map((s) => (
            <label
              key={s.uid}
              className="flex items-center gap-2 px-3 py-2 text-sm cursor-pointer hover:bg-gray-50"
            >
              <input
                type="checkbox"
                checked={selected.has(s.uid)}
                onChange={() => toggle(s.uid)}
              />
              <span className="flex-1 min-w-0 truncate">{s.name}</span>
              <span className="text-xs text-gray-400 truncate">
                {learnerClassNames(s)[0] ?? s.email}
              </span>
            </label>
          ))
        )}
      </div>
    </div>
  );
}
