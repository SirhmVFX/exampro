import { redirect } from "next/navigation";

// Use a relative path so Next.js redirect() works on any deployment
// (Vercel, custom domain, localhost) without double-prefixing the origin.
export default async function JoinStudentPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  redirect(`/auth/register/student?school=${encodeURIComponent(slug)}`);
}
