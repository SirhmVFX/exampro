"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import { getCertificateByCode } from "@/lib/db";
import type { Certificate } from "@/lib/types";
import { Wordmark } from "@/app/components/marketing/shell";
import { formatDate } from "@/lib/utils";

export default function VerifyCertificatePage({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const { code } = use(params);
  const [cert, setCert] = useState<Certificate | null | undefined>(undefined);

  useEffect(() => {
    getCertificateByCode(code).then(setCert);
  }, [code]);

  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center px-6">
      <Link href="/" className="mb-12 opacity-70 hover:opacity-100">
        <Wordmark />
      </Link>
      {cert === undefined ? (
        <div className="w-10 h-10 border-4 border-white/20 border-t-white rounded-full animate-spin" />
      ) : !cert ? (
        <div className="text-center max-w-md">
          <h1 className="text-2xl font-semibold">Not a valid certificate</h1>
          <p className="mt-2 text-white/45 text-sm">
            No record matches {code.toUpperCase()}. Check the link with the issuer.
          </p>
        </div>
      ) : (
        <div className="max-w-lg w-full border border-white/15 p-10 text-center">
          <p className="text-[11px] uppercase tracking-[0.25em] text-white/35">
            Verified credential
          </p>
          <h1 className="mt-4 text-3xl font-semibold">{cert.userName}</h1>
          <p className="mt-2 text-white/70">{cert.title}</p>
          {cert.cohortName && (
            <p className="mt-1 text-sm text-white/45">{cert.cohortName}</p>
          )}
          {cert.skills?.length ? (
            <p className="mt-4 text-sm text-white/60">{cert.skills.join(" · ")}</p>
          ) : null}
          <p className="mt-8 text-xs text-white/35">
            Issued {formatDate(cert.issuedAt)} by {cert.institutionName}
          </p>
          <p className="mt-1 font-mono text-xs tracking-widest text-white/50">
            {cert.verifyCode}
          </p>
        </div>
      )}
    </div>
  );
}
