// Client-side Cloudinary uploads.
// Uses an unsigned upload preset when NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET is
// set; otherwise requests a signature from /api/cloudinary/sign.

const CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
const UPLOAD_PRESET = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

export interface UploadResult {
  url: string;
  publicId: string;
  resourceType: string;
  bytes: number;
  originalFilename: string;
}

export async function uploadToCloudinary(
  file: File,
  folder: string
): Promise<UploadResult> {
  if (!CLOUD_NAME) {
    throw new Error(
      "Cloudinary is not configured. Set NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME in .env.local"
    );
  }

  const form = new FormData();
  form.append("file", file);
  form.append("folder", folder);

  if (UPLOAD_PRESET) {
    form.append("upload_preset", UPLOAD_PRESET);
  } else {
    const signRes = await fetch("/api/cloudinary/sign", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ folder }),
    });
    if (!signRes.ok) throw new Error("Could not sign Cloudinary upload");
    const { signature, timestamp, apiKey } = await signRes.json();
    form.append("signature", signature);
    form.append("timestamp", String(timestamp));
    form.append("api_key", apiKey);
  }

  const res = await fetch(
    `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/auto/upload`,
    { method: "POST", body: form }
  );
  if (!res.ok) {
    const err = await res.json().catch(() => null);
    throw new Error(err?.error?.message ?? "Cloudinary upload failed");
  }
  const data = await res.json();
  return {
    url: data.secure_url,
    publicId: data.public_id,
    resourceType: data.resource_type,
    bytes: data.bytes,
    originalFilename: data.original_filename,
  };
}
