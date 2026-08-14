import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

// Verifies a Stripe Checkout session after the success redirect.
// Env: STRIPE_SECRET_KEY

export async function POST(req: NextRequest) {
  const secret = process.env.STRIPE_SECRET_KEY;
  if (!secret) {
    return NextResponse.json(
      { error: "STRIPE_SECRET_KEY is not configured." },
      { status: 500 }
    );
  }
  const stripe = new Stripe(secret);

  const { sessionId } = await req.json();
  if (!sessionId) {
    return NextResponse.json({ error: "sessionId required" }, { status: 400 });
  }

  const session = await stripe.checkout.sessions.retrieve(sessionId);

  return NextResponse.json({
    status: session.payment_status === "paid" ? "success" : session.payment_status,
    amount: (session.amount_total ?? 0) / 100,
    currency: (session.currency ?? "usd").toUpperCase(),
    reference: session.id,
    institutionId: session.metadata?.institutionId ?? null,
    planId: session.metadata?.planId ?? null,
  });
}
