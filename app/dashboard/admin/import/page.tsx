"use client";

import { useState } from "react";
import { Upload } from "lucide-react";
import DashboardShell from "@/app/components/dashboard/shell";
import { Card, CardBody, CardHeader } from "@/app/components/ui/card";
import { Button } from "@/app/components/ui/button";
import { useAuth } from "@/lib/auth-context";
import {
  COL,
  createInvite,
  listInvites,
  newId,
  writeAudit,
} from "@/lib/db";
import { downloadCsv, parseRosterCsv, rosterTemplateCsv } from "@/lib/csv";
import { vocab } from "@/lib/vocab";
import { canSelfJoin } from "@/lib/join-policy";

export default function RosterImportPage() {
  const { institution, profile } = useAuth();
  const v = vocab(institution);
  const [text, setText] = useState("");
  const [saving, setSaving] = useState(false);
  const [result, setResult] = useState("");
  const [error, setError] = useState("");

  const run = async () => {
    if (!institution || !profile) return;
    setError("");
    setResult("");
    const { rows, errors } = parseRosterCsv(text);
    if (errors.length) {
      setError(errors.slice(0, 8).join(" "));
      return;
    }
    if (!rows.length) {
      setError("No rows to import.");
      return;
    }
    setSaving(true);
    try {
      const existing = await listInvites(institution.id);
      const have = new Set(existing.map((i) => i.email.toLowerCase()));
      let created = 0;
      let skipped = 0;
      for (const row of rows) {
        const gate = canSelfJoin(institution, { email: row.email, hasInvite: true });
        if (!gate.ok) {
          skipped++;
          continue;
        }
        if (have.has(row.email)) {
          skipped++;
          continue;
        }
        await createInvite({
          id: newId(COL.invites),
          institutionId: institution.id,
          institutionName: institution.name,
          email: row.email,
          name: row.name,
          role: row.role,
          className: row.className || undefined,
          classNames: row.className ? [row.className] : undefined,
          externalId: row.externalId,
          status: "pending",
          createdAt: Date.now(),
        });
        have.add(row.email);
        created++;
        if (row.parentEmail && !have.has(row.parentEmail)) {
          await createInvite({
            id: newId(COL.invites),
            institutionId: institution.id,
            institutionName: institution.name,
            email: row.parentEmail,
            name: `Parent of ${row.name}`,
            role: "parent",
            status: "pending",
            createdAt: Date.now(),
          });
          have.add(row.parentEmail);
          created++;
        }
      }
      await writeAudit({
        institutionId: institution.id,
        actorId: profile.uid,
        actorName: profile.name,
        action: "roster.import",
        entityType: "invite",
        detail: `Created ${created} invites, skipped ${skipped}`,
      });
      setResult(
        `Imported ${created} ${v.students.toLowerCase()}. ${skipped} skipped (already invited or domain blocked). They sign up with that email — or Google/Microsoft SSO — and land in the right ${v.class.toLowerCase()}.`
      );
    } catch {
      setError("Import failed. Check your connection and try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <DashboardShell
      role="admin"
      title="Roster import"
      subtitle={`Add ${v.students.toLowerCase()} from a spreadsheet. They are invited, not added by hand.`}
    >
      <div className="max-w-3xl space-y-6">
        <Card>
          <CardHeader>
            <h2 className="text-lg font-semibold">CSV / Excel export</h2>
            <p className="text-sm text-gray-500 mt-1">
              Columns: name, email, class (or cohort / grade), id, role, department,
              parentEmail. Save Excel as CSV first.
            </p>
          </CardHeader>
          <CardBody className="space-y-4">
            {error && <p className="text-sm text-red-600">{error}</p>}
            {result && <p className="text-sm text-emerald-700">{result}</p>}
            <div className="flex flex-wrap gap-2">
              <Button
                variant="outline"
                onClick={() => downloadCsv("exampro-roster-template.csv", rosterTemplateCsv())}
              >
                Download template
              </Button>
              <label className="inline-flex items-center gap-2 text-sm font-medium text-[var(--dash-primary)] cursor-pointer">
                <Upload className="w-4 h-4" />
                Upload file
                <input
                  type="file"
                  accept=".csv,text/csv,.txt"
                  className="hidden"
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    setText(await file.text());
                  }}
                />
              </label>
            </div>
            <textarea
              rows={12}
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="name,email,class,id&#10;Ada Okonkwo,ada@school.edu,Cohort 12,STU-001"
              className="w-full px-4 py-2.5 rounded-lg border border-gray-300 text-sm font-mono"
            />
            <Button loading={saving} onClick={() => void run()}>
              Import roster
            </Button>
          </CardBody>
        </Card>
      </div>
    </DashboardShell>
  );
}
