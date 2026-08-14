import { redirect } from "next/navigation";

export default function LegacyTrainerAnalyticsRedirect() {
  redirect("/dashboard/teacher/analytics");
}
