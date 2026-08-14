import { redirect } from "next/navigation";

export default function LegacyTrainerSubmissionsRedirect() {
  redirect("/dashboard/teacher/submissions");
}
