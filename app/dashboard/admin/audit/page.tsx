"use client";

import { useEffect, useState } from "react";
import DashboardShell from "@/app/components/dashboard/shell";
import { Card, CardBody } from "@/app/components/ui/card";
import { useAuth } from "@/lib/auth-context";
import { listAudit } from "@/lib/db";
import type { AuditEvent } from "@/lib/types";
import { formatDateTime } from "@/lib/utils";

export default function AuditLogPage() {
  const { institution } = useAuth();
  const [items, setItems] = useState<AuditEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!institution) return;
    listAudit(institution.id).then((rows) => {
      setItems(rows);
      setLoading(false);
    });
  }, [institution]);

  return (
    <DashboardShell
      role="admin"
      title="Audit log"
      subtitle="Who changed what, and when"
    >
      <Card>
        <CardBody className="p-0">
          {loading ? (
            <div className="h-32 animate-pulse bg-[var(--dash-surface-alt)]" />
          ) : items.length === 0 ? (
            <p className="px-6 py-10 text-sm text-gray-400 text-center">
              No events yet. Imports, certificates, and settings changes appear here.
            </p>
          ) : (
            <div className="divide-y divide-gray-100">
              {items.map((e) => (
                <div key={e.id} className="px-6 py-3 flex flex-wrap gap-3 text-sm">
                  <span className="text-gray-400 w-40 shrink-0">
                    {formatDateTime(e.createdAt)}
                  </span>
                  <span className="font-medium">{e.actorName}</span>
                  <span className="text-gray-600">{e.action}</span>
                  {e.detail && (
                    <span className="text-gray-400 truncate">{e.detail}</span>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardBody>
      </Card>
    </DashboardShell>
  );
}
