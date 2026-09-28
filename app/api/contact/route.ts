import { NextRequest, NextResponse } from "next/server";

export interface ContactPayload {
  firstName: string;
  lastName: string;
  email: string;
  institution?: string;
  subject: string;
  message: string;
}

export async function POST(req: NextRequest) {
  let body: ContactPayload;
  try {
    body = (await req.json()) as ContactPayload;
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const { firstName, lastName, email, subject, message } = body;
  if (!firstName?.trim() || !lastName?.trim() || !email?.trim() || !message?.trim()) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  // ── Option A: Forward via Resend (set RESEND_API_KEY in .env.local) ──────────
  const resendKey = process.env.RESEND_API_KEY;
  const toEmail = process.env.CONTACT_TO_EMAIL ?? "hello@exampro.io";

  if (resendKey) {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${resendKey}`,
      },
      body: JSON.stringify({
        from: "ExamPro Contact <noreply@exampro.io>",
        to: [toEmail],
        reply_to: email.trim(),
        subject: `[ExamPro Contact] ${subject} — ${firstName} ${lastName}`,
        text: [
          `From: ${firstName} ${lastName} <${email}>`,
          `Institution: ${body.institution ?? "—"}`,
          `Subject: ${subject}`,
          "",
          message,
        ].join("\n"),
      }),
    });

    if (!res.ok) {
      const err = await res.text();
      console.error("Resend error:", err);
      return NextResponse.json(
        { error: "Failed to send message. Please try again." },
        { status: 502 }
      );
    }

    return NextResponse.json({ ok: true });
  }

  // ── Option B: No email provider configured — log and return success ───────────
  // Replace this block with your preferred email service (SendGrid, Nodemailer, etc.)
  console.log("📩 Contact form submission (no email provider configured):", {
    from: `${firstName} ${lastName} <${email}>`,
    institution: body.institution,
    subject,
    message,
  });

  return NextResponse.json({ ok: true });
}
