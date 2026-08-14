"use client";

import Link from "next/link";
import { use, useEffect, useState } from "react";
import { GraduationCap, Users, LogIn } from "lucide-react";
import { getInstitutionBySlug } from "@/lib/db";
import type { Institution } from "@/lib/types";
import { Wordmark } from "@/app/components/marketing/shell";
import { onColor } from "@/lib/theme";
import { authPath } from "@/lib/domain";

export default function SchoolPortalPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = use(params);
  const [institution, setInstitution] = useState<Institution | null | undefined>(
    undefined
  );

  useEffect(() => {
    let cancelled = false;
    getInstitutionBySlug(slug).then((inst) => {
      if (!cancelled) setInstitution(inst);
    });
    return () => {
      cancelled = true;
    };
  }, [slug]);

  if (institution === undefined) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-white/20 border-t-white rounded-full animate-spin" />
      </div>
    );
  }

  if (!institution) {
    return (
      <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center px-6">
        <Wordmark />
        <h1 className="mt-10 text-2xl font-semibold">School not found</h1>
        <p className="mt-2 text-white/45 text-sm text-center max-w-md">
          No institution is registered at this address. Check the link with your
          school, or go to the main site.
        </p>
        <Link href="/" className="mt-8 text-sm underline underline-offset-4">
          exampro home
        </Link>
      </div>
    );
  }

  const sidebar = institution.primaryColor || "#000000";
  const accent = institution.accentColor || "#000000";
  const onSidebar = onColor(sidebar);

  return (
    <div className="min-h-screen bg-black text-white relative overflow-hidden">
      <div className="absolute inset-0 lp-grid pointer-events-none" />
      <div className="absolute inset-0 lp-noise pointer-events-none" />
      <div className="relative max-w-lg mx-auto px-6 py-16">
        <Link href="/" className="inline-block mb-12 opacity-60 hover:opacity-100">
          <Wordmark />
        </Link>
        <div
          className="border border-white/10 p-8"
          style={{ borderTop: `4px solid ${sidebar}` }}
        >
          <div className="flex items-center gap-4 mb-6">
            {institution.logoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={institution.logoUrl}
                alt=""
                className="w-14 h-14 object-cover border border-white/15"
              />
            ) : (
              <div
                className="w-14 h-14 flex items-center justify-center text-sm font-bold"
                style={{ background: sidebar, color: onSidebar }}
              >
                {institution.name.slice(0, 2).toUpperCase()}
              </div>
            )}
            <div>
              <p className="text-[11px] uppercase tracking-[0.2em] text-white/35">
                Institution
              </p>
              <h1 className="text-2xl font-semibold tracking-tight">
                {institution.name}
              </h1>
            </div>
          </div>
          <p className="text-sm text-white/45 mb-8">
            Sign in to your workspace, or join with an invite from your admin.
          </p>
          <div className="space-y-2">
            <Link
              href={authPath("/auth/login")}
              className="flex items-center justify-center gap-2 w-full py-3 text-sm font-medium"
              style={{ background: accent, color: onColor(accent) }}
            >
              <LogIn className="w-4 h-4" /> Log in
            </Link>
            <Link
              href={authPath(
                `/auth/register/student?school=${institution.slug ?? slug}`
              )}
              className="flex items-center justify-center gap-2 w-full py-3 text-sm font-medium border border-white/15 hover:bg-white/5"
            >
              <GraduationCap className="w-4 h-4" /> Join as student
            </Link>
            <Link
              href={authPath(
                `/auth/register/teacher?school=${institution.slug ?? slug}`
              )}
              className="flex items-center justify-center gap-2 w-full py-3 text-sm font-medium border border-white/15 hover:bg-white/5"
            >
              <Users className="w-4 h-4" /> Join as teacher
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
