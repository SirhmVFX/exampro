import type { Institution } from "./types";

export function normalizeDomain(input: string): string {
  return input.trim().replace(/^@/, "").toLowerCase();
}

export function emailDomain(email: string): string {
  return (email.split("@")[1] ?? "").toLowerCase();
}

export function emailAllowed(
  institution: Institution,
  email: string
): boolean {
  const domains = (institution.allowedEmailDomains ?? [])
    .map(normalizeDomain)
    .filter(Boolean);
  const mode = institution.joinMode ?? "code";
  if (mode !== "domain" && domains.length === 0) return true;
  if (domains.length === 0) return true;
  const d = emailDomain(email);
  return domains.includes(d);
}

export function canSelfJoin(
  institution: Institution,
  opts: { email: string; hasInvite: boolean }
): { ok: boolean; reason?: string } {
  const mode = institution.joinMode ?? "code";
  if (mode === "invite_only" && !opts.hasInvite) {
    return {
      ok: false,
      reason: "This institution is invite-only. Ask your admin for an invite.",
    };
  }
  if (!emailAllowed(institution, opts.email)) {
    const list = (institution.allowedEmailDomains ?? [])
      .map(normalizeDomain)
      .filter(Boolean)
      .join(", ");
    return {
      ok: false,
      reason: list
        ? `Use an email ending in ${list}.`
        : "That email domain is not allowed.",
    };
  }
  return { ok: true };
}

export function joinRequiresCode(institution: Institution): boolean {
  const mode = institution.joinMode ?? "code";
  return mode === "code" || mode === "domain";
}
