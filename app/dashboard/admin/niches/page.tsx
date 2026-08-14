import { redirect } from "next/navigation";

export default function LegacyAdminNichesRedirect() {
  redirect("/dashboard/admin/structure");
}
