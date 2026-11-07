import { NextRequest, NextResponse } from "next/server";

interface TrialReminderPayload {
  adminEmail: string;
  adminName: string;
  institutionName: string;
  daysLeft: number;
}

export async function POST(req: NextRequest) {
  let body: TrialReminderPayload;
  try {
    body = (await req.json()) as TrialReminderPayload;
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  if (!body.adminEmail?.trim()) {
    return NextResponse.json({ error: "adminEmail is required" }, { status: 400 });
  }

  const resendKey = process.env.RESEND_API_KEY;
  if (!resendKey) {
    // No email configured — log and return 200 so callers don't error
    console.log("Trial reminder (no Resend key):", body);
    return NextResponse.json({ ok: true, configured: false });
  }

  const { adminEmail, adminName, institutionName, daysLeft } = body;
  const urgent = daysLeft <= 3;

  const html = `
    <div style="font-family:ui-sans-serif,system-ui,-apple-system,Segoe UI,Roboto,Helvetica,Arial;line-height:1.6;color:#111827;max-width:560px;margin:0 auto">
      <h2 style="margin:0 0 8px">Your ExamPro trial ${urgent ? "is expiring soon" : "ends in " + daysLeft + " days"}</h2>
      <p style="margin:0 0 16px;color:#6b7280">Hi ${escapeHtml(adminName || "there")},</p>
      <p style="margin:0 0 16px">Your 30-day free trial for <strong>${escapeHtml(institutionName)}</strong> ${daysLeft <= 0 ? "has ended" : `ends in <strong>${daysLeft} day${daysLeft !== 1 ? "s" : ""}</strong>`}.</p>
      ${daysLeft <= 0
        ? `<p style="margin:0 0 16px">Your account has moved to the Free plan (30 students, 3 teachers, 20 AI generations/month). Your data is fully preserved.</p>`
        : `<p style="margin:0 0 16px">After your trial, your account stays on the Free plan. Upgrade to keep unlimited students, AI generation, and advanced analytics.</p>`
      }
      <a href="https://app.exampro.io/dashboard/admin/billing"
         style="display:inline-block;padding:12px 24px;background:#000;color:#fff;text-decoration:none;border-radius:8px;font-weight:600;margin-bottom:16px">
        View billing &amp; upgrade →
      </a>
      <p style="margin:0;color:#9ca3af;font-size:13px">ExamPro · Assessment software for institutions</p>
    </div>`;

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${resendKey}`,
    },
    body: JSON.stringify({
      from: "ExamPro <noreply@exampro.io>",
      to: [adminEmail.trim()],
      subject: `${urgent ? "⚠️ " : ""}Your ExamPro trial ${daysLeft <= 0 ? "has ended" : `ends in ${daysLeft} day${daysLeft !== 1 ? "s" : ""}`}`,
      html,
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    console.error("Resend trial-reminder error:", err);
    return NextResponse.json({ error: "Email send failed." }, { status: 502 });
  }

  return NextResponse.json({ ok: true });
}

function escapeHtml(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}
