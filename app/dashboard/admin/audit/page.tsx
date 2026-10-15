"use client";

import { useEffect, useMemo, useState } from "react";
import { History } from "lucide-react";
import DashboardShell from "@/app/components/dashboard/shell";
import { Card, CardBody } from "@/app/components/ui/card";
import {
  DataTable,
  type Column,
  type FilterDef,
} from "@/app/components/ui/data-table";
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

  const columns: Column<AuditEvent>[] = [
    {
      key: "time",
      header: "When",
      sortValue: (e) => e.createdAt,
      cell: (e) => (
        <span className="text-[var(--dash-text-muted)] whitespace-nowrap">
          {formatDateTime(e.createdAt)}
        </span>
      ),
    },
    {
      key: "actor",
      header: "Actor",
      sortValue: (e) => e.actorName.toLowerCase(),
      cell: (e) => <span className="font-medium">{e.actorName}</span>,
    },
    { key: "action", header: "Action", cell: (e) => e.action },
    { key: "entity", header: "Type", cell: (e) => e.entityType },
    {
      key: "detail",
      header: "Detail",
      cell: (e) => (
        <span className="text-[var(--dash-text-muted)]">{e.detail ?? "—"}</span>
      ),
    },
  ];

  const entityTypes = useMemo(
    () => [...new Set(items.map((e) => e.entityType))].sort(),
    [items],
  );

  const filters: FilterDef<AuditEvent>[] = [
    {
      key: "entity",
      label: "Type",
      getValue: (e) => e.entityType,
      options: [
        { value: "", label: "All types" },
        ...entityTypes.map((t) => ({ value: t, label: t })),
      ],
    },
  ];

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
          ) : (
            <div className="px-6 pb-6 pt-4">
              <DataTable
                rows={items}
                columns={columns}
                filters={filters}
                searchKeys={(e) => `${e.actorName} ${e.action} ${e.detail ?? ""}`}
                searchPlaceholder="Search the audit log…"
                emptyTitle="No events yet"
                emptyDescription="Imports, certificates, and settings changes appear here."
                emptyIcon={<History className="w-6 h-6" />}
                getRowId={(e) => e.id}
              />
            </div>
          )}
        </CardBody>
      </Card>
    </DashboardShell>
  );
}
