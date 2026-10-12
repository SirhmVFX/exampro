import DashboardShell from "@/app/components/dashboard/shell";
import SessionsWorkspace from "@/app/components/dashboard/sessions-workspace";

export default function TeacherSessionsPage() {
  return (
    <DashboardShell
      role="teacher"
      title="Live sessions"
      subtitle="Schedule online classes and notify your students"
    >
      <SessionsWorkspace role="teacher" />
    </DashboardShell>
  );
}
