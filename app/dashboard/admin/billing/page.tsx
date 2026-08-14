"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { CheckCircle, CreditCard, AlertCircle } from "lucide-react";
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
  newId,
  COL,
} from "@/lib/db";
import type { PaymentRecord, PlanId } from "@/lib/types";
import { formatDate } from "@/lib/utils";

function BillingInner() {
  const { institution, profile, refresh } = useAuth();
  const search = useSearchParams();
  const [paying, setPaying] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [payments, setPayments] = useState<PaymentRecord[]>([]);
  const [counts, setCounts] = useState({ students: 0, teachers: 0 });

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

  useEffect(() => {
    if (!institution) return;
    const provider = search.get("provider");
    const canceled = search.get("canceled");
    if (canceled) {
      setNotice("Checkout was canceled. No charge was made.");
      return;
    }
    if (provider === "stripe") {
      const sessionId = search.get("session_id");
      if (sessionId) void verifyStripe(sessionId);
    }
    if (provider === "paystack") {
      const reference = search.get("reference") || search.get("trxref");
      if (reference) void verifyPaystack(reference);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [institution, search]);

  const applySuccess = async (opts: {
    provider: "paystack" | "stripe";
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
    const renewsAt = Date.now() + 30 * 24 * 60 * 60 * 1000;
    await savePayment({
      id: newId(COL.payments),
      institutionId: institution.id,
      provider: opts.provider,
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
    setNotice(`You're now on the ${getPlan(opts.planId).name} plan.`);
  };

  const verifyStripe = async (sessionId: string) => {
    setError("");
    try {
      const res = await fetch("/api/payments/stripe/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId }),
      });
      const data = await res.json();
      if (!res.ok || data.status !== "success") {
        setError(data.error ?? "Stripe payment could not be verified.");
        return;
      }
      await applySuccess({
        provider: "stripe",
        reference: data.reference,
        planId: data.planId,
        amount: data.amount,
        currency: data.currency,
      });
    } catch {
      setError("Could not verify Stripe payment.");
    }
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
        setError(data.error ?? "Paystack payment could not be verified.");
        return;
      }
      await applySuccess({
        provider: "paystack",
        reference: data.reference,
        planId: data.planId,
        amount: data.amount,
        currency: data.currency,
      });
    } catch {
      setError("Could not verify Paystack payment.");
    }
  };

  const startPaystack = async (planId: PlanId) => {
    if (!institution || !profile) return;
    setPaying(`paystack-${planId}`);
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
      if (!res.ok) throw new Error(data.error);
      window.location.href = data.authorizationUrl;
    } catch (e) {
      setError(e instanceof Error ? e.message : "Paystack init failed");
      setPaying(null);
    }
  };

  const startStripe = async (planId: PlanId) => {
    if (!institution || !profile) return;
    setPaying(`stripe-${planId}`);
    setError("");
    try {
      const res = await fetch("/api/payments/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          institutionId: institution.id,
          planId,
          email: profile.email,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      window.location.href = data.url;
    } catch (e) {
      setError(e instanceof Error ? e.message : "Stripe checkout failed");
      setPaying(null);
    }
  };

  const current = institution ? getPlan(institution.plan) : PLANS[0];

  return (
    <DashboardShell
      role="admin"
      navItems={adminNav}
      title="Billing"
      subtitle="Manage your institution's ExamPro plan"
    >
      <div className="space-y-6">
        {error && (
          <div className="flex items-start gap-2 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3">
            <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
            {error}
          </div>
        )}
        {notice && (
          <div className="flex items-start gap-2 bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm rounded-lg px-4 py-3">
            <CheckCircle className="w-4 h-4 mt-0.5 shrink-0" />
            {notice}
          </div>
        )}

        <Card>
          <CardHeader>
            <h2 className="text-lg font-semibold">Current plan</h2>
          </CardHeader>
          <CardBody className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <p className="text-2xl font-bold text-gray-900">{current.name}</p>
                <Badge variant={institution?.planStatus === "active" ? "success" : "warning"}>
                  {institution?.planStatus ?? "active"}
                </Badge>
              </div>
              <p className="text-sm text-gray-500 mt-1">{current.tagline}</p>
              <p className="text-xs text-gray-400 mt-2">
                Using {counts.students}/{current.maxStudents === -1 ? "∞" : current.maxStudents} students ·{" "}
                {counts.teachers}/{current.maxTeachers === -1 ? "∞" : current.maxTeachers} teachers ·{" "}
                {institution?.aiGenerationsUsed ?? 0}/
                {current.aiGenerationsPerMonth === -1 ? "∞" : current.aiGenerationsPerMonth} AI gens
              </p>
              {institution?.planRenewsAt && (
                <p className="text-xs text-gray-400 mt-1">
                  Renews {formatDate(institution.planRenewsAt)}
                </p>
              )}
            </div>
            <CreditCard className="w-10 h-10 text-[var(--dash-primary)]" />
          </CardBody>
        </Card>

        <div className="grid md:grid-cols-2 xl:grid-cols-4 gap-4">
          {PLANS.map((plan) => {
            const isCurrent = institution?.plan === plan.id;
            return (
              <Card
                key={plan.id}
                className={plan.highlighted ? "ring-2 ring-[var(--dash-primary)]" : ""}
              >
                <CardBody className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-gray-900">{plan.name}</h3>
                    {plan.highlighted && <Badge>Popular</Badge>}
                  </div>
                  <p className="text-sm text-gray-500 min-h-10">{plan.tagline}</p>
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
                      or ₦{plan.priceNgn.toLocaleString()}/mo
                    </p>
                  )}
                  <ul className="text-xs text-gray-600 space-y-1">
                    {plan.features.slice(0, 4).map((f) => (
                      <li key={f}>· {f}</li>
                    ))}
                  </ul>
                  {plan.id === "enterprise" ? (
                    <a href="/contact">
                      <Button variant="outline" fullWidth>
                        Contact sales
                      </Button>
                    </a>
                  ) : isCurrent ? (
                    <Button variant="ghost" fullWidth disabled>
                      Current plan
                    </Button>
                  ) : plan.priceUsd === 0 ? (
                    <Button
                      variant="outline"
                      fullWidth
                      onClick={async () => {
                        if (!institution) return;
                        await setInstitutionPlan(institution.id, "free", Date.now());
                        await refresh();
                        setNotice("Switched to the Free plan.");
                      }}
                    >
                      Switch to Free
                    </Button>
                  ) : (
                    <div className="space-y-2">
                      <Button
                        fullWidth
                        loading={paying === `paystack-${plan.id}`}
                        onClick={() => void startPaystack(plan.id)}
                      >
                        Pay with Paystack (₦)
                      </Button>
                      <Button
                        variant="outline"
                        fullWidth
                        loading={paying === `stripe-${plan.id}`}
                        onClick={() => void startStripe(plan.id)}
                      >
                        Pay with Stripe ($)
                      </Button>
                    </div>
                  )}
                </CardBody>
              </Card>
            );
          })}
        </div>

        <Card>
          <CardHeader>
            <h2 className="text-lg font-semibold">Payment history</h2>
          </CardHeader>
          <CardBody className="p-0">
            {payments.length === 0 ? (
              <p className="px-6 py-8 text-sm text-gray-400 text-center">
                No payments yet.
              </p>
            ) : (
              <table className="w-full text-sm">
                <thead className="bg-gray-50 text-left text-xs font-semibold text-gray-500 uppercase">
                  <tr>
                    <th className="px-6 py-3">Date</th>
                    <th className="px-6 py-3">Plan</th>
                    <th className="px-6 py-3">Provider</th>
                    <th className="px-6 py-3">Amount</th>
                    <th className="px-6 py-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {payments.map((p) => (
                    <tr key={p.id}>
                      <td className="px-6 py-3">{formatDate(p.createdAt)}</td>
                      <td className="px-6 py-3 capitalize">{p.plan}</td>
                      <td className="px-6 py-3 capitalize">{p.provider}</td>
                      <td className="px-6 py-3">
                        {p.currency} {p.amount.toLocaleString()}
                      </td>
                      <td className="px-6 py-3">
                        <Badge variant={p.status === "success" ? "success" : "danger"}>
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
