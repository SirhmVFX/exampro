import { NextRequest, NextResponse } from "next/server";

interface ParentEmailPayload {
  /** Resolved parent/guardian addresses to send to (one email per address). */
  to: string[];
  subject: string;
  /** HTML body; a plain-text fallback is derived from it. */
  html: string;
  /** Display name shown in the From header, e.g. the school name. */
  schoolName?: string;
  /** Reply-to address (the staff member's email). */
  replyTo?: string;
}

// Build a plain-text version from HTML so mail clients without HTML support
// still show a readable message.
function htmlToText(html: string): string {
  return html
    .replace(/<style[\s\S]*?<\/style>/gi, "")
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<\/(p|div|h[1-6]|li|tr)>/gi, "\n")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<li>/gi, "• ")
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

export async function POST(req: NextRequest) {
  let body: ParentEmailPayload;
  try {
    body = (await req.json()) as ParentEmailPayload;
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const recipients = Array.from(
    new Set((body.to ?? []).map((e) => e.trim().toLowerCase()).filter(Boolean)),
  );
  if (recipients.length === 0) {
    return NextResponse.json({ error: "No valid recipient emails" }, { status: 400 });
  }
  if (!body.subject?.trim() || !body.html?.trim()) {
    return NextResponse.json({ error: "Subject and message are required" }, { status: 400 });
  }

  const resendKey = process.env.RESEND_API_KEY;
  if (!resendKey) {
    // No provider configured — return a clear signal so the UI can inform staff.
    return NextResponse.json(
      {
        error:
          "Email is not configured on this server. Add RESEND_API_KEY to enable parent messaging.",
        configured: false,
      },
      { status: 501 },
    );
  }

  const school = (body.schoolName ?? "ExamPro").trim();
  const from = `${school} <noreply@exampro.io>`;
  const text = htmlToText(body.html);

  const sent: string[] = [];
  const failed: string[] = [];

  // Send one message per parent so addresses are never exposed to each other.
  for (const to of recipients) {
    try {
      const res = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${resendKey}`,
        },
        body: JSON.stringify({
          from,
          to: [to],
          ...(body.replyTo ? { reply_to: body.replyTo } : {}),
          subject: body.subject.trim(),
          html: body.html,
          text,
        }),
      });
      if (res.ok) sent.push(to);
      else {
        console.error("Resend parent-email error:", await res.text());
        failed.push(to);
      }
    } catch {
      failed.push(to);
    }
  }

  const status =
    sent.length === 0 ? 502 : failed.length === 0 ? 200 : 207;
  return NextResponse.json(
    { ok: sent.length > 0, sent, failed },
    { status },
  );
}
