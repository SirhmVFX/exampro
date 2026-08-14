import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { PLANS } from "@/lib/plans";

// Creates a Stripe Checkout session (USD — international payments).
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

  const { institutionId, planId, email } = await req.json();
  const plan = PLANS.find((p) => p.id === planId);
  if (!plan || plan.priceUsd <= 0 || !institutionId) {
    return NextResponse.json(
      { error: "Invalid plan or missing fields" },
      { status: 400 }
    );
  }

  const origin = req.headers.get("origin") ?? req.nextUrl.origin;

  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    customer_email: email,
    line_items: [
      {
        price_data: {
          currency: "usd",
          unit_amount: plan.priceUsd * 100,
          product_data: {
            name: `ExamPro ${plan.name} Plan — 1 month`,
            description: plan.tagline,
          },
        },
        quantity: 1,
      },
    ],
    metadata: { institutionId, planId },
    success_url: `${origin}/dashboard/admin/billing?provider=stripe&session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${origin}/dashboard/admin/billing?canceled=1`,
  });

  return NextResponse.json({ url: session.url, sessionId: session.id });
}
