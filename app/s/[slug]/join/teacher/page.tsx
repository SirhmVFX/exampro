import { redirect } from "next/navigation";
import { authPath } from "@/lib/domain";

export default async function JoinTeacherPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  redirect(authPath(`/auth/register/teacher?school=${encodeURIComponent(slug)}`));
}
