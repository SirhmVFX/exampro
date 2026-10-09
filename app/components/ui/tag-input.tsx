"use client";

import { X } from "lucide-react";
import { KeyboardEvent, useState } from "react";
import { inputClass } from "@/lib/utils";

const darkInput =
  "w-full px-4 py-2.5 border border-white/15 bg-white/5 text-white text-sm placeholder:text-white/30 focus:outline-none focus:border-white/40 transition";

export function TagInput({
  values,
  onChange,
  placeholder,
  variant = "light",
}: {
  values: string[];
  onChange: (next: string[]) => void;
  placeholder?: string;
  variant?: "light" | "dark";
}) {
  const [draft, setDraft] = useState("");

  const add = (raw: string) => {
    const v = raw.trim();
    if (!v) return;
    if (values.some((x) => x.toLowerCase() === v.toLowerCase())) {
      setDraft("");
      return;
    }
    onChange([...values, v]);
    setDraft("");
  };

  const onKey = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      add(draft);
    } else if (e.key === "Backspace" && !draft && values.length) {
      onChange(values.slice(0, -1));
    }
  };

  const dark = variant === "dark";

  return (
    <div
      className={`${dark ? darkInput : inputClass} flex flex-wrap gap-2 min-h-[46px] py-2`}
    >
      {values.map((v) => (
        <span
          key={v}
          className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-md ${dark
              ? "bg-white text-black"
              : "bg-[var(--dash-primary-soft)] text-[var(--dash-primary)]"
            }`}
        >
          {v}
          <button
            type="button"
            onClick={() => onChange(values.filter((x) => x !== v))}
            className={dark ? "hover:opacity-60" : "hover:opacity-70"}
            aria-label={`Remove ${v}`}
          >
            <X className="w-3 h-3" />
          </button>
        </span>
      ))}
      <input
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onKeyDown={onKey}
        onBlur={() => add(draft)}
        placeholder={values.length ? "" : placeholder}
        className={`flex-1 min-w-32 outline-none text-sm bg-transparent ${dark ? "text-white placeholder:text-white/30" : ""
          }`}
      />
    </div>
  );
}
