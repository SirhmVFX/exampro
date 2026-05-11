import { redirect } from "next/navigation";

// Redirect old ThinkTank URL to homepage
export default function SponsorPage() {
  redirect("/");
}
