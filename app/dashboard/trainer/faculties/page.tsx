import { redirect } from "next/navigation";

export default function LegacyTrainerFacultiesRedirect() {
  redirect("/dashboard/teacher");
}
