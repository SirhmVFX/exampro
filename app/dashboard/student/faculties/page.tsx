import { redirect } from "next/navigation";

export default function LegacyStudentFacultiesRedirect() {
  redirect("/dashboard/student/materials");
}
