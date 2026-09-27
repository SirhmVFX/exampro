"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";

type DashTheme = "light" | "dark";

interface DashThemeCtx {
  theme: DashTheme;
  toggle: () => void;
}

const Ctx = createContext<DashThemeCtx>({ theme: "dark", toggle: () => { } });

const KEY = "exampro:dash-theme";

export function DashThemeProvider({ children }: { children: ReactNode }) {
  // Default: dark — same true black as the marketing site
  const [theme, setTheme] = useState<DashTheme>("dark");

  useEffect(() => {
    try {
      const stored = localStorage.getItem(KEY) as DashTheme | null;
      if (stored === "light" || stored === "dark") setTheme(stored);
    } catch { /* ignore */ }
  }, []);

  const toggle = () => {
    setTheme((t) => {
      const next = t === "dark" ? "light" : "dark";
      try { localStorage.setItem(KEY, next); } catch { /* ignore */ }
      return next;
    });
  };

  return (
    <Ctx.Provider value={{ theme, toggle }}>
      {children}
    </Ctx.Provider>
  );
}

export function useDashTheme() {
  return useContext(Ctx);
}
