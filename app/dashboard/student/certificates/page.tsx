"use client";

import { useEffect, useState } from "react";
import DashboardShell from "@/app/components/dashboard/shell";
import { Card, CardBody, CardHeader } from "@/app/components/ui/card";
import { CopyButton } from "@/app/components/ui/copy-button";
import { useAuth } from "@/lib/auth-context";
import { listCertificates } from "@/lib/db";
import type { Certificate } from "@/lib/types";
import { formatDate } from "@/lib/utils";

export default function StudentCertificatesPage() {
  const { institution, profile } = useAuth();
  const [certs, setCerts] = useState<Certificate[]>([]);

  useEffect(() => {
    if (!institution || !profile) return;
    listCertificates(institution.id, profile.uid).then(setCerts);
  }, [institution, profile]);

  const origin = typeof window !== "undefined" ? window.location.origin : "";

  return (
    <DashboardShell role="student" title="Certificates">
      <Card>
        <CardHeader>
          <h2 className="font-semibold">Your credentials</h2>
        </CardHeader>
        <CardBody className="p-0">
          {certs.length === 0 ? (
            <p className="px-6 py-10 text-sm text-gray-400 text-center">
              No certificates yet. Your institution issues these when you complete a program.
            </p>
          ) : (
            certs.map((c) => {
              const url = `${origin}/verify/${c.verifyCode}`;
              return (
                <div key={c.id} className="px-6 py-4 flex items-center gap-3 border-t border-gray-50">
                  <div className="flex-1">
                    <p className="font-medium">{c.title}</p>
                    <p className="text-xs text-gray-500">
                      {formatDate(c.issuedAt)} · {c.verifyCode}
                    </p>
                  </div>
                  <CopyButton text={url} />
                </div>
              );
            })
          )}
        </CardBody>
      </Card>
    </DashboardShell>
  );
}
