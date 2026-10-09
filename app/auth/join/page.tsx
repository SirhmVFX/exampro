"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { AlertCircle, Building2, ChevronRight } from "lucide-react";
import {
  getInstitutionByCode,
  joinInstitution,
  listUsers,
  getPendingInviteByEmail,
  acceptInvite,
  enrollLearner,
  getMembership,
} from "@/lib/db";
import { getPlan, planAllows } from "@/lib/plans";
import { canSelfJoin } from "@/lib/join-policy";
import type { Institution, Role } from "@/lib/types";
import { dashboardPathForRole, useAuth } from "@/lib/auth-context";
import { Button } from "@/app/components/ui/button";
import { AuthCard, AuthFrame, darkInput } from "@/app/components/marketing/auth-frame";
import { vocab } from "@/lib/vocab";

const ROLES: { value: Role; label: string }[] = [
  { value: "student", label: "Student / learner" },
  { value: "teacher", label: "Teacher / instructor" },
  { value: "parent", label: "Parent / guardian" },
  { value: "manager", label: "Manager" },
];

function JoinForm() {
  const router = useRouter();
  const params = useSearchParams();
  const { firebaseUser, profile, loading, refresh, switchOrg } = useAuth();
  const [code, setCode] = useState((params.get("code") ?? "").toUpperCase().slice(0, 6));
  const [role, setRole] = useState<Role>((params.get("role") as Role) || "student");
  const [institution, setInstitution] = useState<Institution | null>(null);
  const [classNames, setClassNames] = useState<string[]>([]);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (loading) return;
    if (!firebaseUser || !profile) {
      const q = new URLSearchParams();
      q.set("next", `/auth/join?code=${code}&role=${role}`);
      router.replace(`/auth/login?${q.toString()}`);
    }
  }, [loading, firebaseUser, profile, router, code, role]);

  const verify = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      const inst = await getInstitutionByCode(code);
      if (!inst) {
        setError("No institution found with that code.");
        return;
      }
      setInstitution(inst);
    } catch {
      setError("Couldn't verify that code.");
    } finally {
      setBusy(false);
    }
  };

  const join = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile || !institution) return;
    setError("");
    setBusy(true);
    try {
      const already = await getMembership(profile.uid, institution.id);
      if (already) {
        await switchOrg(institution.id);
        router.replace(dashboardPathForRole(already.role));
        return;
      }
      const invite = await getPendingInviteByEmail(institution.id, profile.email);
      if (role === "student" || role === "teacher") {
        const gate = canSelfJoin(institution, {
          email: profile.email,
          hasInvite: Boolean(invite),
        });
        if (!gate.ok) {
          setError(gate.reason ?? "You cannot join this institution.");
          setBusy(false);
          return;
        }
      }
      if (role === "teacher") {
        const teachers = await listUsers(institution.id, "teacher");
        if (!planAllows(getPlan(institution.plan), { teachers: teachers.length }).teachers) {
          setError("This institution has reached its teacher limit.");
          setBusy(false);
          return;
        }
      }
      if (role === "student") {
        const students = await listUsers(institution.id, "student");
        if (!planAllows(getPlan(institution.plan), { students: students.length }).students) {
          setError("This institution has reached its student limit.");
          setBusy(false);
          return;
        }
      }
      await joinInstitution({
        user: profile,
        institution,
        role,
        classNames: role === "student" ? classNames : undefined,
        classes: role === "teacher" ? classNames : undefined,
      });
      if (role === "student") {
        for (const c of classNames) {
          await enrollLearner({
            institutionId: institution.id,
            user: { uid: profile.uid, name: profile.name },
            className: c,
          });
        }
      }
      if (invite) await acceptInvite(invite.id);
      await refresh();
      router.replace(dashboardPathForRole(role));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't join that institution.");
    } finally {
      setBusy(false);
    }
  };

  if (loading || !profile) {
    return (
      <div className="w-10 h-10 border-4 border-white/20 border-t-white rounded-full animate-spin" />
    );
  }

  return (
    <AuthCard>
      <h1 className="text-2xl font-semibold tracking-tight mb-1">
        Join another institution
      </h1>
      <p className="text-white/45 text-sm mb-8">
        Signed in as {profile.name} ({profile.email}). You can belong to several
        schools — pick this workspace from the sidebar after you join.
      </p>
      {error && (
        <div className="mb-5 flex items-start gap-2 bg-white/5 border border-white/15 rounded-xl text-white/80 text-sm px-4 py-3">
          <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
          <span>{error}</span>
        </div>
      )}
      {!institution ? (
        <form onSubmit={verify} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-white/70 mb-1.5">
              Join as
            </label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value as Role)}
              className={`${darkInput} bg-zinc-950`}
            >
              {ROLES.map((r) => (
                <option key={r.value} value={r.value}>
                  {r.label}
                </option>
              ))}
            </select>
          </div>
          <input
            required
            minLength={6}
            maxLength={6}
            value={code}
            onChange={(e) =>
              setCode(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 6))
            }
            className={`${darkInput} font-mono tracking-[0.3em] text-center text-lg`}
            placeholder="JOIN CODE"
          />
          <Button
            type="submit"
            variant="inverse"
            fullWidth
            loading={busy}
            disabled={code.length !== 6}
          >
            Verify code <ChevronRight className="w-4 h-4" />
          </Button>
        </form>
      ) : (
        <form onSubmit={join} className="space-y-5">
          <div className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-xl px-4 py-3">
            <Building2 className="w-5 h-5" />
            <div>
              <p className="text-sm font-semibold">{institution.name}</p>
              <p className="text-xs text-white/45">Joining as {role}</p>
            </div>
          </div>
          {(role === "student" || role === "teacher") &&
            institution.classes.length > 0 && (
              <div>
                <label className="block text-sm font-medium text-white/70 mb-1.5">
                  {institution.classLabel || vocab(institution).class}
                </label>
                <div className="space-y-2 max-h-40 overflow-y-auto border border-white/10 rounded-xl p-3">
                  {institution.classes.map((c) => (
                    <label key={c} className="flex items-center gap-2 text-sm text-white/80">
                      <input
                        type="checkbox"
                        checked={classNames.includes(c)}
                        onChange={() =>
                          setClassNames((prev) =>
                            prev.includes(c) ? prev.filter((x) => x !== c) : [...prev, c]
                          )
                        }
                      />
                      {c}
                    </label>
                  ))}
                </div>
              </div>
            )}
          <Button type="submit" variant="inverse" fullWidth loading={busy}>
            Join {institution.name}
          </Button>
          <Button
            type="button"
            variant="ghost"
            className="w-full text-white/60"
            onClick={() => setInstitution(null)}
          >
            Different code
          </Button>
        </form>
      )}
      <p className="mt-6 text-center text-sm text-white/40">
        Need a new workspace instead?{" "}
        <Link href="/dashboard/org/new" className="text-white underline">
          Create an institution
        </Link>
      </p>
    </AuthCard>
  );
}

export default function JoinPage() {
  return (
    <AuthFrame>
      <Suspense
        fallback={
          <div className="w-10 h-10 border-4 border-white/20 border-t-white rounded-full animate-spin" />
        }
      >
        <JoinForm />
      </Suspense>
    </AuthFrame>
  );
}
