import { redirect } from "next/navigation";

// Redirect old ThinkTank URL to the new contact page
export default function CollaboratePage() {
  redirect("/");
}
