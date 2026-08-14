import { redirect } from "next/navigation";

export default function LegacyAdminTrainersRedirect() {
  redirect("/dashboard/admin/teachers");
}
