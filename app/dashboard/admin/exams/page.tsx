import { redirect } from "next/navigation";

export default function LegacyAdminExamsRedirect() {
  redirect("/dashboard/admin/assessments");
}
