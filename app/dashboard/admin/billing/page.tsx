"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import {
  CheckCircle, CreditCard, AlertCircle, Clock, ArrowUpRight, Zap,
} from "lucide-react";
import Link from "next/link";
import DashboardShell from "@/app/components/dashboard/shell";
import { adminNav } from "@/app/components/dashboard/nav";
import { Card, CardBody, CardHeader } from "@/app/components/ui/card";
import { Badge } from "@/app/components/ui/badge";
import { Button } from "@/app/components/ui/button";
import { useAuth } from "@/lib/auth-context";
import { PLANS, getPlan } from "@/lib/plans";
import {
  listPayments,
  listUsers,
  savePayment,
  setInstitutionPlan,
  checkAndExpirePlan,
  newId,
  COL,
} from "@/lib/db";
import type { PaymentRecord, PlanId } from "@/lib/types";
import { formatDate } from "@/lib/utils";

// ─── helpers ─────────────────────────────────────────────────────────────────

function daysLeft(ts: number): number {
  return Math.max(0, Math.ceil((ts - Date.now()) / (1000 * 60 * 60 * 24)));
}

function TrialBanner({ trialEndsAt }: { trialEndsAt: number }) {
  const days = daysLeft(trialEndsAt);
  const expired = days === 0;
  return (
    <div
      className={`flex items-start gap-3 rounded-xl px-4 py-3.5 text-sm ${expired
          ? "bg-red-50 border border-red-200 text-red-700"
          : days <= 7
            ? "bg-amber-50 border border-amber-200 text-amber-800"
            : "bg-blue-50 border border-blue-200 text-blue-800"
        }`}
    >
      <Clock className="w-4 h-4 mt-0.5 shrink-0" />
      <div className="flex-1">
        {expired ? (
          <p>
            <strong>Your 30-day free trial has ended.</strong> Upgrade to keep all your data and continue running assessments. On the Free plan, you are limited to 30 students and 3 teachers.
          </p>
        ) : (
          <p>
            <strong>{days} day{days !== 1 ? "s" : ""} left on your free trial.</strong>{" "}
            {days <= 7
              ? "Upgrade now to avoid interruption when your trial ends."
              : "After the trial your account stays on the Free plan (30 students, 3 teachers, 20 AI gens/month)."}
          </p>
        )}
      </div>
    </div>
  );
}

// ─── Inner component (needs useSearchParams, so it sits inside Suspense) ─────

function BillingInner() {
  const { institution, profile, refresh } = useAuth();
  const search = useSearchParams();
  const [paying, setPaying] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [payments, setPayments] = useState<PaymentRecord[]>([]);
  const [counts, setCounts] = useState({ students: 0, teachers: 0 });
  const [checked, setChecked] = useState(false);

  // On load: check whether plan or trial has expired
  useEffect(() => {
    if (!institution || checked) return;
    (async () => {
      await checkAndExpirePlan(institution);
      await refresh();
      setChecked(true);
    })();
  }, [institution, checked, refresh]);

  useEffect(() => {
    if (!institution) return;
    listPayments(institution.id).then(setPayments);
    listUsers(institution.id).then((users) =>
      setCounts({
        students: users.filter((u) => u.role === "student").length,
        teachers: users.filter((u) => u.role === "teacher").length,
      })
    );
  }, [institution]);

  // Handle Paystack callback
  useEffect(() => {
    if (!institution) return;
    const provider = search.get("provider");
    const canceled = search.get("canceled");
    if (canceled) {
      setNotice("Checkout was canceled. No charge was made.");
      return;
    }
    if (provider === "paystack") {
      const reference = search.get("reference") || search.get("trxref");
      if (reference) void verifyPaystack(reference);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [institution, search]);

  const applySuccess = async (opts: {
    reference: string;
    planId: PlanId;
    amount: number;
    currency: string;
  }) => {
    if (!institution) return;
    const already = (await listPayments(institution.id)).some(
      (p) => p.reference === opts.reference && p.status === "success"
    );
    if (already) {
      setNotice("Plan already activated for this payment.");
      return;
    }
    // Renews 30 days from now — manual monthly cycle
    const renewsAt = Date.now() + 30 * 24 * 60 * 60 * 1000;
    await savePayment({
      id: newId(COL.payments),
      institutionId: institution.id,
      provider: "paystack",
      reference: opts.reference,
      plan: opts.planId,
      amount: opts.amount,
      currency: opts.currency,
      status: "success",
      createdAt: Date.now(),
    });
    await setInstitutionPlan(institution.id, opts.planId, renewsAt);
    await refresh();
    setPayments(await listPayments(institution.id));
    setNotice(`You're now on the ${getPlan(opts.planId).name} plan. Welcome! 🎉`);
  };

  const verifyPaystack = async (reference: string) => {
    setError("");
    try {
      const res = await fetch("/api/payments/paystack/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reference }),
      });
      const data = await res.json();
      if (!res.ok || data.status !== "success") {
        setError(
          data.error ??
          "Payment could not be verified. If you were charged, contact support with your reference number."
        );
        return;
      }
      await applySuccess({
        reference: data.reference,
        planId: data.planId,
        amount: data.amount,
        currency: data.currency,
      });
    } catch {
      setError(
        "Could not verify payment. Please contact support with your Paystack reference number."
      );
    }
  };

  const startPaystack = async (planId: PlanId) => {
    if (!institution || !profile) return;
    setPaying(planId);
    setError("");
    try {
      const res = await fetch("/api/payments/paystack/init", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          institutionId: institution.id,
          planId,
          email: profile.email,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Could not start payment.");
      window.location.href = data.authorizationUrl;
    } catch (e) {
      setError(e instanceof Error ? e.message : "Payment initiation failed. Try again.");
      setPaying(null);
    }
  };

  const downgradeFree = async () => {
    if (!institution) return;
    await setInstitutionPlan(institution.id, "free", Date.now());
    await refresh();
    setNotice("Switched to the Free plan.");
  };

  const current = institution ? getPlan(institution.plan) : PLANS[0];
  const trialActive =
    institution?.trialEndsAt && institution.trialEndsAt > Date.now();
  const trialExpired =
    institution?.trialEndsAt &&
    institution.trialEndsAt <= Date.now() &&
    institution.plan === "free";

  // planStatus badge
  const statusVariant =
    institution?.planStatus === "active"
      ? "success"
      : institution?.planStatus === "past_due"
        ? "warning"
        : "danger";

  return (
    <DashboardShell
      role="admin"
      navItems={adminNav}
      title="Billing"
      subtitle="Manage your institution's ExamPro plan"
    >
      <div className="space-y-6 max-w-4xl">
        {/* Error / success banners */}
        {error && (
          <div className="flex items-start gap-2 bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3.5">
            <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
            <span>{error}</span>
          </div>
        )}
        {notice && (
          <div className="flex items-start gap-2 bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm rounded-xl px-4 py-3.5">
            <CheckCircle className="w-4 h-4 mt-0.5 shrink-0" />
            <span>{notice}</span>
          </div>
        )}

        {/* Trial banner */}
        {(trialActive || trialExpired) && institution?.trialEndsAt && (
          <TrialBanner trialEndsAt={institution.trialEndsAt} />
        )}

        {/* Current plan card */}
        <Card>
          <CardHeader>
            <h2 className="text-lg font-semibold">Current plan</h2>
          </CardHeader>
          <CardBody className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <p className="text-2xl font-bold text-gray-900">{current.name}</p>
                <Badge variant={statusVariant}>
                  {institution?.planStatus === "past_due"
                    ? "Trial ended"
                    : institution?.planStatus ?? "active"}
                </Badge>
                {trialActive && institution?.trialEndsAt && (
                  <Badge variant="info">
                    Trial · {daysLeft(institution.trialEndsAt)}d left
                  </Badge>
                )}
              </div>
              <p className="text-sm text-gray-500 mt-1">{current.tagline}</p>
              <p className="text-xs text-gray-400 mt-2">
                {counts.students} /{" "}
                {current.maxStudents === -1 ? "∞" : current.maxStudents} students ·{" "}
                {counts.teachers} /{" "}
                {current.maxTeachers === -1 ? "∞" : current.maxTeachers} teachers ·{" "}
                {institution?.aiGenerationsUsed ?? 0} /{" "}
                {current.aiGenerationsPerMonth === -1
                  ? "∞"
                  : current.aiGenerationsPerMonth}{" "}
                AI generations this month
              </p>
              {institution?.planRenewsAt && institution.plan !== "free" && (
                <p className="text-xs text-gray-400 mt-1">
                  Plan active until {formatDate(institution.planRenewsAt)} · payments are
                  manual (no auto-renew)
                </p>
              )}
            </div>
            <CreditCard className="w-10 h-10 text-[var(--dash-primary)]" />
          </CardBody>
        </Card>

        {/* Plan cards */}
        <div className="grid md:grid-cols-2 xl:grid-cols-4 gap-4">
          {PLANS.map((plan) => {
            const isCurrent =
              institution?.plan === plan.id &&
              institution?.planStatus === "active" &&
              !trialExpired;
            return (
              <Card
                key={plan.id}
                className={plan.highlighted ? "ring-2 ring-[var(--dash-primary)]" : ""}
              >
                <CardBody className="space-y-3 flex flex-col">
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-gray-900">{plan.name}</h3>
                    {plan.highlighted && <Badge>Popular</Badge>}
                  </div>
                  <p className="text-sm text-gray-500 min-h-10">{plan.tagline}</p>

                  {/* Price */}
                  <p className="text-2xl font-extrabold text-gray-900">
                    {plan.priceUsd < 0
                      ? "Custom"
                      : plan.priceUsd === 0
                        ? "Free"
                        : `$${plan.priceUsd}`}
                    {plan.priceUsd > 0 && (
                      <span className="text-sm font-medium text-gray-400">/mo</span>
                    )}
                  </p>
                  {plan.priceNgn > 0 && (
                    <p className="text-xs text-gray-400">
                      ≈ ₦{plan.priceNgn.toLocaleString()} via Paystack
                    </p>
                  )}

                  <ul className="text-xs text-gray-600 space-y-1 flex-1">
                    {plan.features.slice(0, 4).map((f) => (
                      <li key={f} className="flex items-start gap-1.5">
                        <CheckCircle className="w-3 h-3 text-emerald-500 mt-0.5 shrink-0" />
                        {f}
                      </li>
                    ))}
                  </ul>

                  {/* CTA */}
                  {plan.id === "enterprise" ? (
                    <Link href="/contact" className="block mt-auto">
                      <Button variant="outline" fullWidth>
                        Contact sales
                      </Button>
                    </Link>
                  ) : isCurrent ? (
                    <Button variant="ghost" fullWidth disabled className="mt-auto">
                      Current plan
                    </Button>
                  ) : plan.priceUsd === 0 ? (
                    <Button
                      variant="outline"
                      fullWidth
                      className="mt-auto"
                      onClick={downgradeFree}
                    >
                      Switch to Free
                    </Button>
                  ) : (
                    <div className="space-y-1.5 mt-auto">
                      <Button
                        fullWidth
                        loading={paying === plan.id}
                        onClick={() => void startPaystack(plan.id)}
                        className="flex items-center justify-center gap-2"
                      >
                        <Zap className="w-3.5 h-3.5" />
                        Upgrade — ${plan.priceUsd}/mo
                      </Button>
                      <p className="text-[10px] text-center text-gray-400">
                        Paid via Paystack · ≈ ₦{plan.priceNgn.toLocaleString()} · no auto-renew
                      </p>
                    </div>
                  )}
                </CardBody>
              </Card>
            );
          })}
        </div>

        {/* What happens on Free */}
        {(trialExpired || institution?.plan === "free") && (
          <Card>
            <CardBody className="flex items-start gap-4">
              <AlertCircle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-gray-900 mb-1">Free plan limits</p>
                <ul className="text-sm text-gray-500 space-y-1">
                  <li>· New student sign-ups blocked after 30 students</li>
                  <li>· New teacher sign-ups blocked after 3 teachers</li>
                  <li>· AI generation limited to 20 per month</li>
                  <li>· All existing data, assessments, and results are preserved</li>
                </ul>
              </div>
            </CardBody>
          </Card>
        )}

        {/* Payment history */}
        <Card>
          <CardHeader>
            <h2 className="text-lg font-semibold">Payment history</h2>
          </CardHeader>
          <CardBody className="p-0">
            {payments.length === 0 ? (
              <div className="px-6 py-10 text-center">
                <p className="text-sm text-gray-400">No payments yet.</p>
                <p className="text-xs text-gray-400 mt-1">
                  Your payment history appears here after your first upgrade.
                </p>
              </div>
            ) : (
              <table className="w-full text-sm">
                <thead className="bg-gray-50 text-left text-xs font-semibold text-gray-500 uppercase">
                  <tr>
                    <th className="px-6 py-3">Date</th>
                    <th className="px-6 py-3">Plan</th>
                    <th className="px-6 py-3">Amount</th>
                    <th className="px-6 py-3">Reference</th>
                    <th className="px-6 py-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {payments.map((p) => (
                    <tr key={p.id}>
                      <td className="px-6 py-3">{formatDate(p.createdAt)}</td>
                      <td className="px-6 py-3 capitalize">{p.plan}</td>
                      <td className="px-6 py-3">
                        {p.currency} {p.amount.toLocaleString()}
                      </td>
                      <td className="px-6 py-3 font-mono text-xs text-gray-400">
                        {p.reference}
                      </td>
                      <td className="px-6 py-3">
                        <Badge
                          variant={p.status === "success" ? "success" : "danger"}
                        >
                          {p.status}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </CardBody>
        </Card>

        {/* Support note */}
        <p className="text-xs text-gray-400 text-center">
          Payment issues?{" "}
          <Link href="/contact" className="underline hover:text-gray-700">
            Contact support
          </Link>{" "}
          with your Paystack reference number.{" "}
          <a
            href="https://paystack.com"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-0.5 underline hover:text-gray-700"
          >
            Paystack <ArrowUpRight className="w-3 h-3" />
          </a>{" "}
          processes all payments securely.
        </p>
      </div>
    </DashboardShell>
  );
}

export default function AdminBillingPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <div className="w-10 h-10 border-4 border-[var(--dash-primary)] border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <BillingInner />
    </Suspense>
  );
}
