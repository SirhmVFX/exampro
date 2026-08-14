import { redirect } from "next/navigation";

export default function LegacyTrainerRedirect() {
  redirect("/dashboard/teacher");
}
