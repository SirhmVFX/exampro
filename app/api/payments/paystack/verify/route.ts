import { NextRequest, NextResponse } from "next/server";

// Verifies a Paystack transaction after the callback redirect.
// Env: PAYSTACK_SECRET_KEY

export async function POST(req: NextRequest) {
  const secret = process.env.PAYSTACK_SECRET_KEY;
  if (!secret) {
    return NextResponse.json(
      { error: "PAYSTACK_SECRET_KEY is not configured." },
      { status: 500 }
    );
  }

  const { reference } = await req.json();
  if (!reference) {
    return NextResponse.json({ error: "reference required" }, { status: 400 });
  }

  const res = await fetch(
    `https://api.paystack.co/transaction/verify/${encodeURIComponent(reference)}`,
    { headers: { Authorization: `Bearer ${secret}` } }
  );
  const data = await res.json();

  if (!res.ok || !data.status) {
    return NextResponse.json(
      { error: data.message ?? "Verification failed" },
      { status: 502 }
    );
  }

  const tx = data.data;
  return NextResponse.json({
    status: tx.status, // "success" when paid
    amount: tx.amount / 100,
    currency: tx.currency,
    reference: tx.reference,
    institutionId: tx.metadata?.institutionId ?? null,
    planId: tx.metadata?.planId ?? null,
    paidAt: tx.paid_at,
  });
}
