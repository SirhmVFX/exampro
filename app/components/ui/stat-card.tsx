import { ReactNode } from "react";

export function StatCard({
  label,
  value,
  icon,
  trend,
  trendLabel,
}: {
  label: string;
  value: string | number;
  icon: ReactNode;
  trend?: "up" | "down" | "neutral";
  trendLabel?: string;
  color?: "indigo" | "emerald" | "amber" | "cyan" | "red";
}) {
  const trendColor =
    trend === "up"
      ? "text-emerald-500"
      : trend === "down"
        ? "text-red-500"
        : "text-[var(--dash-text-muted)]";

  const trendIcon = trend === "up" ? "↑" : trend === "down" ? "↓" : "→";

  return (
    <div className="bg-[var(--dash-surface)] border border-[var(--dash-border)] rounded-xl p-6">
      <div className="flex items-center justify-between mb-4">
        <span className="text-sm font-medium text-[var(--dash-text-muted)]">
          {label}
        </span>
        <div className="p-2 rounded-lg bg-[var(--dash-primary-soft)] text-[var(--dash-primary)]">
          {icon}
        </div>
      </div>
      <div className="text-3xl font-bold text-[var(--dash-text)] mb-1">
        {value}
      </div>
      {trendLabel && (
        <p className={`text-sm ${trendColor}`}>
          {trendIcon} {trendLabel}
        </p>
      )}
    </div>
  );
}
