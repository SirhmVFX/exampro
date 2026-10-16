"use client";

import { createContext, useContext, useEffect, useRef, useState, ReactNode } from "react";

type DashTheme = "light" | "dark";

interface DashThemeCtx {
  theme: DashTheme;
  toggle: () => void;
  /** Set the base theme from the institution default, only if the user has not chosen. */
  syncDefault: (mode: DashTheme) => void;
}

const Ctx = createContext<DashThemeCtx>({ theme: "dark", toggle: () => {}, syncDefault: () => {} });

const KEY = "exampro:dash-theme";

export function DashThemeProvider({ children }: { children: ReactNode }) {
  // Default: dark — same true black as the marketing site
  const [theme, setTheme] = useState<DashTheme>("dark");
  // True once the member has explicitly toggled (or a stored choice exists),
  // after which the institution default no longer applies to them.
  const explicitRef = useRef(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(KEY) as DashTheme | null;
      if (stored === "light" || stored === "dark") {
        setTheme(stored);
        explicitRef.current = true;
      }
    } catch { /* ignore */ }
  }, []);

  const toggle = () => {
    explicitRef.current = true;
    setTheme((t) => {
      const next = t === "dark" ? "light" : "dark";
      try { localStorage.setItem(KEY, next); } catch { /* ignore */ }
      return next;
    });
  };

  const syncDefault = (mode: DashTheme) => {
    if (explicitRef.current) return;
    setTheme(mode);
  };

  return (
    <Ctx.Provider value={{ theme, toggle, syncDefault }}>
      {children}
    </Ctx.Provider>
  );
}

export function useDashTheme() {
  return useContext(Ctx);
}
