import { redirect } from "next/navigation";

// Redirect old ThinkTank scholarship page to homepage
export default function ScholarshipPage() {
  redirect("/");
}
