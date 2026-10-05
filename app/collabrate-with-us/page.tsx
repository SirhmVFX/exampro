import { redirect } from "next/navigation";

// Fix for typo in old URL — permanently redirect to the correctly-spelled page
export default function CollabratePage() {
  redirect("/collaborate-with-us");
}
