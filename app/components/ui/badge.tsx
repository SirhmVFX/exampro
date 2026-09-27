import { ReactNode } from "react";

type BadgeVariant =
  | "default"
  | "success"
  | "warning"
  | "danger"
  | "info"
  | "outline";

const variantClasses: Record<BadgeVariant, string> = {
  default: "bg-[var(--dash-primary-soft)] text-[var(--dash-primary)]",
  success: "bg-emerald-100 text-emerald-700",
  warning: "bg-amber-100 text-amber-700",
  danger: "bg-red-100 text-red-700",
  info: "bg-[var(--dash-primary)] text-[var(--dash-on-primary)]",
  outline:
    "border border-[var(--dash-border)] text-[var(--dash-text-muted)] bg-transparent",
};

export function Badge({
  children,
  variant = "default",
  className = "",
}: {
  children: ReactNode;
  variant?: BadgeVariant;
  className?: string;
}) {
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${variantClasses[variant]} ${className}`}
    >
      {children}
    </span>
  );
}
