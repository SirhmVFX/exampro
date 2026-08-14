import { redirect } from "next/navigation";
import { authPath } from "@/lib/domain";

export default async function JoinStudentPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  redirect(authPath(`/auth/register/student?school=${encodeURIComponent(slug)}`));
}
