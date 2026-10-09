import { redirect } from "next/navigation";

// Relative redirect — works on any deployment (Vercel, custom domain, localhost)
// without double-prefixing the origin the way authPath() does server-side.
export default async function JoinTeacherPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  redirect(`/auth/register/teacher?school=${encodeURIComponent(slug)}`);
}
