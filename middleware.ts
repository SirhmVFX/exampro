import { NextRequest, NextResponse } from "next/server";
import { slugFromHost } from "@/lib/domain";

export function middleware(req: NextRequest) {
  const slug = slugFromHost(req.headers.get("host") || "");
  if (!slug) return NextResponse.next();

  const { pathname } = req.nextUrl;
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname.startsWith("/s/")
  ) {
    return NextResponse.next();
  }

  if (
    pathname.startsWith("/auth") ||
    pathname.startsWith("/dashboard") ||
    pathname.startsWith("/onboarding") ||
    pathname.startsWith("/verify")
  ) {
    return NextResponse.next();
  }

  const url = req.nextUrl.clone();
  if (pathname === "/" || pathname === "") {
    url.pathname = `/s/${slug}`;
    return NextResponse.rewrite(url);
  }
  if (
    pathname.startsWith("/join/") ||
    pathname === "/login" ||
    pathname === "/join"
  ) {
    url.pathname = `/s/${slug}${pathname}`;
    return NextResponse.rewrite(url);
  }

  url.pathname = `/s/${slug}`;
  return NextResponse.rewrite(url);
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
