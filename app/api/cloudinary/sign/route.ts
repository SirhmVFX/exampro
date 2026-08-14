import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";

// Signs Cloudinary upload params when no unsigned upload preset is configured.
// Env: CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET

export async function POST(req: NextRequest) {
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;
  if (!apiKey || !apiSecret) {
    return NextResponse.json(
      {
        error:
          "Cloudinary signing not configured. Set CLOUDINARY_API_KEY and CLOUDINARY_API_SECRET, or use an unsigned upload preset.",
      },
      { status: 500 }
    );
  }

  const { folder } = await req.json().catch(() => ({ folder: "exampro" }));
  const timestamp = Math.floor(Date.now() / 1000);
  const toSign = `folder=${folder}&timestamp=${timestamp}${apiSecret}`;
  const signature = crypto.createHash("sha1").update(toSign).digest("hex");

  return NextResponse.json({ signature, timestamp, apiKey });
}
