import DashboardShell from "@/app/components/dashboard/shell";
import StudentAnalytics from "@/app/components/dashboard/student-analytics";

export default function TeacherStudentAnalyticsPage() {
  return (
    <DashboardShell
      role="teacher"
      title="Student analytics"
      subtitle="Deep per-student performance, trends and learning gaps"
    >
      <StudentAnalytics role="teacher" />
    </DashboardShell>
  );
}
