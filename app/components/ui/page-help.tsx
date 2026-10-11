"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { Lightbulb, ChevronDown, X } from "lucide-react";
import { pageHelpFor } from "@/lib/page-help";

const DISMISS_KEY = (route: string) => `exampro:pagehelp:dismissed:${route}`;

/**
 * A small "what is this page / how does it work" helper shown at the top of a
 * dashboard page. Collapsible and dismissible (per-route, remembered locally).
 */
export function PageHelp() {
  const pathname = usePathname();
  const entry = pageHelpFor(pathname);
  const [dismissed, setDismissed] = useState(true); // hide until we know it is not dismissed
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!entry) {
      setDismissed(true);
      return;
    }
    let isDismissed = false;
    try {
      isDismissed = localStorage.getItem(DISMISS_KEY(pathname)) === "1";
    } catch {
      /* private mode */
    }
    setDismissed(isDismissed);
    setOpen(!isDismissed);
  }, [pathname, entry]);

  if (!entry || dismissed) return null;

  const dismiss = () => {
    setDismissed(true);
    try {
      localStorage.setItem(DISMISS_KEY(pathname), "1");
    } catch {
      /* ignore */
    }
  };

  return (
    <div className="mb-6 border border-[var(--dash-border)] bg-[var(--dash-surface)] rounded-xl overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-[var(--dash-surface-alt)] transition-colors"
      >
        <span className="w-8 h-8 shrink-0 rounded-lg bg-[var(--dash-primary-soft)] text-[var(--dash-primary)] flex items-center justify-center">
          <Lightbulb className="w-4 h-4" />
        </span>
        <span className="flex-1 min-w-0">
          <span className="block text-sm font-semibold text-[var(--dash-text)]">
            {entry.title}
          </span>
          <span className="block text-xs text-[var(--dash-text-muted)] truncate">
            {entry.purpose}
          </span>
        </span>
        <ChevronDown
          className={`w-4 h-4 shrink-0 text-[var(--dash-text-muted)] transition-transform ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>
      {open && (
        <div className="px-4 pb-4 pl-[3.5rem] relative">
          <button
            type="button"
            onClick={dismiss}
            className="absolute right-3 top-3 p-1 rounded-md text-[var(--dash-text-faint)] hover:text-[var(--dash-text)] hover:bg-[var(--dash-surface-alt)] transition"
            aria-label="Dismiss help"
            title="Dismiss help"
          >
            <X className="w-3.5 h-3.5" />
          </button>
          <p className="text-sm text-[var(--dash-text)] font-medium mb-2">
            How this page works
          </p>
          <ul className="space-y-1.5">
            {entry.howItWorks.map((line, i) => (
              <li
                key={i}
                className="flex gap-2 text-sm text-[var(--dash-text-muted)]"
              >
                <span className="text-[var(--dash-primary)] mt-0.5">•</span>
                <span>{line}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
