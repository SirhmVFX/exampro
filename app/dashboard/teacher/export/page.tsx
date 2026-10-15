import DashboardShell from "@/app/components/dashboard/shell";
import StudentDataExport from "@/app/components/dashboard/student-data-export";

export default function TeacherExportPage() {
  return (
    <DashboardShell
      role="teacher"
      title="Export"
      subtitle="Download or send your students' records and progress summaries"
    >
      <StudentDataExport role="teacher" />
    </DashboardShell>
  );
}
