import { NextRequest, NextResponse } from "next/server";
import { PLANS } from "@/lib/plans";

// Initializes a Paystack transaction (NGN payments).
// Env: PAYSTACK_SECRET_KEY

// Exchange rate used to convert USD display price → NGN charge.
// Admins see prices in USD; Paystack charges in NGN.
// Update this constant when the rate changes significantly.
const USD_TO_NGN = 1600;

export async function POST(req: NextRequest) {
  const secret = process.env.PAYSTACK_SECRET_KEY;
  if (!secret) {
    return NextResponse.json(
      { error: "PAYSTACK_SECRET_KEY is not configured. Contact your administrator." },
      { status: 500 }
    );
  }

  let body: { institutionId?: string; planId?: string; email?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const { institutionId, planId, email } = body;

  const plan = PLANS.find((p) => p.id === planId);
  if (!plan || plan.priceUsd <= 0) {
    return NextResponse.json(
      { error: "Invalid plan. Only Starter and Growth are purchasable." },
      { status: 400 }
    );
  }
  if (!institutionId || !email) {
    return NextResponse.json(
      { error: "institutionId and email are required." },
      { status: 400 }
    );
  }

  // Use the explicit NGN price if set, otherwise convert from USD at the current rate.
  const amountNgn = plan.priceNgn > 0 ? plan.priceNgn : plan.priceUsd * USD_TO_NGN;
  const amountKobo = amountNgn * 100; // Paystack expects kobo (1 NGN = 100 kobo)

  const origin = req.headers.get("origin") ?? req.nextUrl.origin;

  const res = await fetch("https://api.paystack.co/transaction/initialize", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${secret}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email,
      amount: amountKobo,
      currency: "NGN",
      callback_url: `${origin}/dashboard/admin/billing?provider=paystack`,
      metadata: {
        institutionId,
        planId,
        planName: plan.name,
        priceUsd: plan.priceUsd,
      },
    }),
  });

  const data = await res.json();
  if (!res.ok || !data.status) {
    return NextResponse.json(
      { error: data.message ?? "Paystack initialization failed. Try again." },
      { status: 502 }
    );
  }

  return NextResponse.json({
    authorizationUrl: data.data.authorization_url,
    reference: data.data.reference,
  });
}
