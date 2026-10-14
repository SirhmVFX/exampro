import DashboardShell from "@/app/components/dashboard/shell";
import ParentMessages from "@/app/components/dashboard/parent-messages";

export default function TeacherMessagesPage() {
  return (
    <DashboardShell
      role="teacher"
      title="Message parents"
      subtitle="Send emails to parents and guardians of your students"
    >
      <ParentMessages role="teacher" />
    </DashboardShell>
  );
}
