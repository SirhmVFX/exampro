import { redirect } from "next/navigation";

export default function LegacyTrainerStudentsRedirect() {
  redirect("/dashboard/teacher/students");
}
