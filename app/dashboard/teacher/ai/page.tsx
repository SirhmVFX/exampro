import DashboardShell from "@/app/components/dashboard/shell";
import AiGenerator from "@/app/components/dashboard/ai-generator";

export default function TeacherAiPage() {
  return (
    <DashboardShell
      role="teacher"
      title="AI Generator"
      subtitle="Generate tests, exams, quizzes and practice — saved straight to your question library"
    >
      <AiGenerator />
    </DashboardShell>
  );
}
