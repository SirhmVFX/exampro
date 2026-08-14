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
      <div className="w-12 h-12 bg-gray-50 flex items-center justify-center text-gray-300 mb-1">
        {icon}
      </div>
      <p className="text-sm font-medium text-gray-600">{title}</p>
      {description && (
        <p className="text-xs text-gray-400 max-w-sm">{description}</p>
      )}
      {action && <div className="mt-3">{action}</div>}
    </div>
  );
}
