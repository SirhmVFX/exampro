import { redirect } from "next/navigation";

export default function LegacyTrainerExamsRedirect() {
  redirect("/dashboard/teacher/assessments");
}
