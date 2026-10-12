import DashboardShell from "@/app/components/dashboard/shell";
import SessionsWorkspace from "@/app/components/dashboard/sessions-workspace";

export default function AdminSessionsPage() {
  return (
    <DashboardShell
      role="admin"
      title="Live sessions"
      subtitle="Schedule online classes and notify students"
    >
      <SessionsWorkspace role="admin" />
    </DashboardShell>
  );
}
