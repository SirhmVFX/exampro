import { redirect } from "next/navigation";
import { authPath } from "@/lib/domain";

export default function SchoolLoginPage() {
  redirect(authPath("/auth/login"));
}
