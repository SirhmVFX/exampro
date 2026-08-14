import { redirect } from "next/navigation";

export default function LegacyTrainerCreateRedirect() {
  redirect("/dashboard/teacher/assessments/new");
}
