import { NextRequest, NextResponse } from "next/server";
import { PLANS } from "@/lib/plans";

// Initializes a Paystack transaction (NGN — local payments).
// Env: PAYSTACK_SECRET_KEY

export async function POST(req: NextRequest) {
  const secret = process.env.PAYSTACK_SECRET_KEY;
  if (!secret) {
    return NextResponse.json(
      { error: "PAYSTACK_SECRET_KEY is not configured." },
      { status: 500 }
    );
  }

  const { institutionId, planId, email } = await req.json();
  const plan = PLANS.find((p) => p.id === planId);
  if (!plan || plan.priceNgn <= 0 || !institutionId || !email) {
    return NextResponse.json(
      { error: "Invalid plan or missing fields" },
      { status: 400 }
    );
  }

  const origin = req.headers.get("origin") ?? req.nextUrl.origin;

  const res = await fetch("https://api.paystack.co/transaction/initialize", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${secret}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email,
      amount: plan.priceNgn * 100, // kobo
      currency: "NGN",
      callback_url: `${origin}/dashboard/admin/billing?provider=paystack`,
      metadata: { institutionId, planId },
    }),
  });

  const data = await res.json();
  if (!res.ok || !data.status) {
    return NextResponse.json(
      { error: data.message ?? "Paystack initialization failed" },
      { status: 502 }
    );
  }

  return NextResponse.json({
    authorizationUrl: data.data.authorization_url,
    reference: data.data.reference,
  });
}
