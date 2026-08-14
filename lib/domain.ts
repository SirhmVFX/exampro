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

export function rootDomain(): string {
  return (process.env.NEXT_PUBLIC_ROOT_DOMAIN || "localhost").replace(/^www\./, "");
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
  if (typeof window !== "undefined") {
    const { protocol, hostname, port } = window.location;
    const host = hostname === "localhost" || hostname.endsWith(".localhost")
      ? `localhost${port ? `:${port}` : ""}`
      : hostname.endsWith(`.${rootDomain()}`)
        ? `${rootDomain()}`
        : window.location.host;
    if (hostname === "localhost" || hostname.endsWith(".localhost")) {
      return `${protocol}//localhost${port ? `:${port}` : ""}`;
    }
    if (hostname.endsWith(`.${rootDomain()}`) || hostname === rootDomain() || hostname === `www.${rootDomain()}`) {
      const proto = rootDomain().includes("localhost") ? "http:" : protocol;
      const apex = rootDomain() === "localhost" ? `localhost${port ? `:${port}` : ""}` : rootDomain();
      return `${proto}//${apex}`;
    }
    return `${protocol}//${host}`;
  }
  const root = rootDomain();
  if (root === "localhost") return "http://localhost:3000";
  return `https://${root}`;
}

/**
 * Public school URL. Production: https://slug.exampro.io
 * Local: http://localhost:3000/s/slug (no /etc/hosts needed)
 */
export function institutionPublicUrl(slug: string, path = ""): string {
  const clean = !path || path === "/" ? "" : path.startsWith("/") ? path : `/${path}`;
  const root = rootDomain();
  if (typeof window !== "undefined") {
    const local =
      window.location.hostname === "localhost" ||
      window.location.hostname.endsWith(".localhost");
    if (local || root === "localhost") {
      return `${appOrigin()}/s/${slug}${clean}`;
    }
  }
  if (root === "localhost") {
    return `http://localhost:3000/s/${slug}${clean}`;
  }
  return `https://${slug}.${root}${clean}`;
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
