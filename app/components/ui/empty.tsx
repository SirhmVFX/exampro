import { ReactNode } from "react";

export function EmptyState({
  icon,
  title,
  description,
  action,
}: {
  icon: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center gap-2 py-12 text-center px-6">
      <div className="w-12 h-12 rounded-xl bg-[var(--dash-surface-alt)] flex items-center justify-center text-[var(--dash-text-faint)] mb-1">
        {icon}
      </div>
      <p className="text-sm font-medium text-[var(--dash-text)]">{title}</p>
      {description && (
        <p className="text-xs text-[var(--dash-text-muted)] max-w-sm">
          {description}
        </p>
      )}
      {action && <div className="mt-3">{action}</div>}
    </div>
  );
}
