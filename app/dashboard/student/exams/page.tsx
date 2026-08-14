import { redirect } from "next/navigation";

export default function LegacyStudentExamsRedirect() {
  redirect("/dashboard/student/assessments");
}
