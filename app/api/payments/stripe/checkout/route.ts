import { NextResponse } from "next/server";

// Stripe payments are not enabled on this deployment.
// All payments are handled via Paystack (/api/payments/paystack).
export async function POST() {
  return NextResponse.json(
    { error: "Stripe payments are not enabled. Please use Paystack." },
    { status: 404 }
  );
}
