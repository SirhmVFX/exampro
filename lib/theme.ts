import type { CSSProperties } from "react";

export const DEFAULT_PRIMARY = "#000000";

export const DEFAULT_ACCENT = "#000000";

export const ACCENT_PRESETS: { name: string; color: string }[] = [
  { name: "Black", color: "#000000" },
  { name: "Navy", color: "#1e3a5f" },
  { name: "Forest", color: "#14532d" },
  { name: "Crimson", color: "#9f1239" },
  { name: "Gold", color: "#a16207" },
  { name: "Blue", color: "#1d4ed8" },
  { name: "Teal", color: "#0f766e" },
];

export const THEME_PRESETS: { name: string; color: string }[] = [
  { name: "Black", color: "#000000" },
  { name: "White", color: "#ffffff" },
  { name: "Navy", color: "#1e3a5f" },
  { name: "Forest", color: "#14532d" },
  { name: "Crimson", color: "#9f1239" },
  { name: "Gold", color: "#a16207" },
  { name: "Slate", color: "#334155" },
];

export function normalizeHex(input?: string | null): string {
  if (!input) return DEFAULT_PRIMARY;
  let h = input.trim();
  if (!h.startsWith("#")) h = `#${h}`;
  if (/^#[0-9a-fA-F]{3}$/.test(h)) {
    h = `#${h[1]}${h[1]}${h[2]}${h[2]}${h[3]}${h[3]}`;
  }
  if (!/^#[0-9a-fA-F]{6}$/.test(h)) return DEFAULT_PRIMARY;
  return h.toLowerCase();
}

export function hexToRgb(hex?: string | null): { r: number; g: number; b: number } {
  const h = normalizeHex(hex).slice(1);
  return {
    r: parseInt(h.slice(0, 2), 16),
    g: parseInt(h.slice(2, 4), 16),
    b: parseInt(h.slice(4, 6), 16),
  };
}

export function relativeLuminance(hex: string): number {
  const { r, g, b } = hexToRgb(hex);
  const lin = (c: number) => {
    const s = c / 255;
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  };
  return 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
}

export function onColor(hex: string): "#000000" | "#ffffff" {
  return relativeLuminance(hex) > 0.45 ? "#000000" : "#ffffff";
}

export function isNearBlack(hex?: string | null): boolean {
  const { r, g, b } = hexToRgb(hex);
  return r < 24 && g < 24 && b < 24;
}

export function institutionThemeVars(
  primary?: string | null,
  accent?: string | null
): CSSProperties {
  const p = normalizeHex(primary);
  const a = normalizeHex(accent ?? DEFAULT_ACCENT);
  const onSidebar = onColor(p);
  const onAccent = onColor(a);
  const fg = hexToRgb(onSidebar);
  const ar = hexToRgb(a);

  return {
    "--dash-sidebar": p,
    "--dash-sidebar-fg": onSidebar,
    "--dash-sidebar-muted": `rgba(${fg.r}, ${fg.g}, ${fg.b}, 0.5)`,
    "--dash-sidebar-border": `rgba(${fg.r}, ${fg.g}, ${fg.b}, 0.15)`,
    "--dash-sidebar-hover": `rgba(${fg.r}, ${fg.g}, ${fg.b}, 0.08)`,
    "--dash-nav-active": onSidebar,
    "--dash-nav-active-fg": p,
    "--dash-accent": a,
    "--dash-on-accent": onAccent,
    "--dash-accent-soft": `rgba(${ar.r}, ${ar.g}, ${ar.b}, 0.12)`,
    "--dash-primary": a,
    "--dash-on-primary": onAccent,
    "--dash-primary-soft": `rgba(${ar.r}, ${ar.g}, ${ar.b}, 0.12)`,
  } as CSSProperties;
}
