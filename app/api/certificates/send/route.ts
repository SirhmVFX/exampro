import { NextRequest, NextResponse } from "next/server";

interface CertSendPayload {
  /** Recipient student/parent email. */
  to: string;
  /** Recipient display name, used in the greeting. */
  studentName: string;
  subject: string;
  message: string;
  schoolName: string;
  /** Base64 (no data: prefix) rendered certificate image. */
  attachmentBase64: string;
  attachmentFilename?: string;
}

export async function POST(req: NextRequest) {
  let body: CertSendPayload;
  try {
    body = (await req.json()) as CertSendPayload;
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  if (!body.to?.trim() || !body.attachmentBase64) {
    return NextResponse.json(
      { error: "Recipient and certificate image are required" },
      { status: 400 },
    );
  }

  const resendKey = process.env.RESEND_API_KEY;
  if (!resendKey) {
    return NextResponse.json(
      {
        error:
          "Email is not configured on this server. Add RESEND_API_KEY to enable certificate delivery.",
        configured: false,
      },
      { status: 501 },
    );
  }

  const school = (body.schoolName || "ExamPro").trim();
  const filename = body.attachmentFilename || "certificate.png";

  const html = `
    <div style="font-family:ui-sans-serif,system-ui,-apple-system,Segoe UI,Roboto,Helvetica,Arial;line-height:1.6;color:#111827;max-width:560px;margin:0 auto">
      <h2 style="margin:0 0 4px">Congratulations, ${escapeHtml(body.studentName || "")}!</h2>
      <p style="margin:0 0 20px;color:#6b7280">${escapeHtml(school)}</p>
      <p style="margin:0 0 20px">${escapeHtml(body.message || "").replace(/\n/g, "<br/>")}</p>
      <p style="margin:0;color:#6b7280;font-size:13px">
        Your certificate is attached as an image. Anyone can verify its authenticity
        using the code printed on it.
      </p>
    </div>`;

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${resendKey}`,
    },
    body: JSON.stringify({
      from: `${school} <noreply@exampro.io>`,
      to: [body.to.trim()],
      subject: body.subject?.trim() || `Your certificate from ${school}`,
      html,
      attachments: [
        {
          filename,
          content: body.attachmentBase64,
          contentType: filename.toLowerCase().endsWith(".jpg") ||
            filename.toLowerCase().endsWith(".jpeg")
            ? "image/jpeg"
            : "image/png",
        },
      ],
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    console.error("Resend certificate-send error:", err);
    return NextResponse.json(
      { error: "Failed to send certificate. Please try again." },
      { status: 502 },
    );
  }

  return NextResponse.json({ ok: true });
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
