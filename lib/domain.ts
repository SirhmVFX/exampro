export const RESERVED_SLUGS = new Set([
  "www",
  "app",
  "api",
  "admin",
  "mail",
  "smtp",
  "ftp",
  "cdn",
  "static",
  "assets",
  "login",
  "signup",
  "register",
  "dashboard",
  "auth",
  "s",
  "exampro",
  "staging",
  "dev",
  "test",
  "help",
  "support",
  "billing",
  "status",
  "docs",
  "blog",
  "www2",
  "ns",
  "mx",
]);

/** Bare hostname used for subdomain matching, e.g. "exampro.io" or
 *  "tryexampro.vercel.app". Tolerates env values that include a scheme
 *  (https://) and/or a trailing slash. */
export function rootDomain(): string {
  const raw = (process.env.NEXT_PUBLIC_ROOT_DOMAIN || "localhost").trim();
  const host = raw
    .replace(/^https?:\/\//i, "")
    .replace(/\/+$/, "")
    .replace(/^www\./i, "");
  return host || "localhost";
}

/** Canonical public origin used for shareable links. Prefers an explicit
 *  NEXT_PUBLIC_SITE_URL, then NEXT_PUBLIC_ROOT_DOMAIN. Returns "" in local
 *  dev (no real domain) so callers fall back to the current window origin. */
export function siteOrigin(): string {
  const raw = (
    process.env.NEXT_PUBLIC_SITE_URL ||
    process.env.NEXT_PUBLIC_ROOT_DOMAIN ||
    ""
  )
    .trim()
    .replace(/\/+$/, "");
  if (!raw || /^localhost(?::\d+)?$/i.test(raw)) return "";
  return /^https?:\/\//i.test(raw) ? raw : `https://${raw}`;
}

export function slugify(input: string): string {
  const s = input
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48);
  return s || "school";
}

export function isReservedSlug(slug: string): boolean {
  return RESERVED_SLUGS.has(slug);
}

export function isValidSlug(slug: string): boolean {
  return /^[a-z0-9](?:[a-z0-9-]{0,46}[a-z0-9])?$/.test(slug) && !isReservedSlug(slug);
}

/** Extract tenant slug from Host, or null on the apex/marketing domain. */
export function slugFromHost(host: string, root = rootDomain()): string | null {
  const hostname = host.split(":")[0].toLowerCase();
  if (hostname === "localhost" || hostname === "127.0.0.1") return null;
  if (hostname === root || hostname === `www.${root}`) return null;
  if (hostname.endsWith(".localhost")) {
    const sub = hostname.slice(0, -".localhost".length);
    return sub && !sub.includes(".") ? sub : null;
  }
  if (hostname.endsWith(`.${root}`)) {
    const sub = hostname.slice(0, -(root.length + 1));
    if (!sub || sub.includes(".") || isReservedSlug(sub)) return null;
    return sub;
  }
  return null;
}

export function appOrigin(): string {
  const configured = siteOrigin();
  if (configured) return configured;
  if (typeof window !== "undefined") {
    const { protocol, hostname, port } = window.location;
    if (hostname === "localhost" || hostname.endsWith(".localhost")) {
      return `${protocol}//localhost${port ? `:${port}` : ""}`;
    }
    return `${protocol}//${window.location.host}`;
  }
  return "http://localhost:3000";
}

/**
 * Public school URL. Tenancy is path-based (/s/{slug}) so it resolves on
 * single-host deploys like *.vercel.app and on a custom apex alike. When a
 * live domain is configured it is always used — never localhost.
 * Local dev: http://localhost:3000/s/{slug}
 */
export function institutionPublicUrl(slug: string, path = ""): string {
  const clean = !path || path === "/" ? "" : path.startsWith("/") ? path : `/${path}`;
  return `${appOrigin()}/s/${slug}${clean}`;
}

export function joinStudentUrl(slug: string): string {
  return institutionPublicUrl(slug, "/join/student");
}

export function joinTeacherUrl(slug: string): string {
  return institutionPublicUrl(slug, "/join/teacher");
}

/** Auth always runs on the apex host so Firebase authorized domains stay simple. */
export function authPath(path: string): string {
  const p = path.startsWith("/") ? path : `/${path}`;
  if (rootDomain() === "localhost") return p;
  return `${appOrigin()}${p}`;
}

export function fallbackJoinUrl(
  role: "student" | "teacher",
  code: string
): string {
  return `${appOrigin()}/auth/register/${role}?code=${encodeURIComponent(code)}`;
}

export function institutionJoinLinks(inst: {
  slug?: string;
  code: string;
}): { portal: string; student: string; teacher: string } {
  if (inst.slug) {
    return {
      portal: institutionPublicUrl(inst.slug),
      student: joinStudentUrl(inst.slug),
      teacher: joinTeacherUrl(inst.slug),
    };
  }
  return {
    portal: "",
    student: fallbackJoinUrl("student", inst.code),
    teacher: fallbackJoinUrl("teacher", inst.code),
  };
}
