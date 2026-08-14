"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { Menu, X, ChevronDown } from "lucide-react";

const navLinks = [
  {
    label: "Product",
    href: "/#product",
    children: [
      { label: "For institutions", href: "/#roles", desc: "Admin workspace, billing, school-wide analytics" },
      { label: "For teachers", href: "/#product", desc: "Question library, AI generation, grading" },
      { label: "For students", href: "/#product", desc: "Timed assessments, playgrounds, instant results" },
    ],
  },
  { label: "How it works", href: "/#how" },
  { label: "Pricing", href: "/pricing" },
  { label: "FAQ", href: "/#faq" },
];

export default function MarketingNavbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();
  const solid = scrolled || pathname !== "/";

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <nav
      className={`fixed top-0 z-50 w-full transition-all duration-300 ${
        solid
          ? "bg-black/80 backdrop-blur-xl border-b border-white/10"
          : "bg-transparent border-b border-transparent"
      }`}
    >
      <div className="max-w-6xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 border border-white/80 flex items-center justify-center text-white text-[11px] font-bold tracking-tight group-hover:bg-white group-hover:text-black transition-colors">
              EP
            </div>
            <span className="text-lg font-semibold text-white tracking-tight">
              ExamPro
            </span>
          </Link>

          <ul className="hidden lg:flex items-center gap-1 text-sm font-medium text-white/60">
            {navLinks.map((link) =>
              link.children ? (
                <li
                  key={link.label}
                  className="relative"
                  onMouseEnter={() => setOpenDropdown(link.label)}
                  onMouseLeave={() => setOpenDropdown(null)}
                >
                  <button className="flex items-center gap-1 px-3 py-2 rounded-lg hover:text-white hover:bg-white/5 transition">
                    {link.label}
                    <ChevronDown className="w-3.5 h-3.5" />
                  </button>
                  {openDropdown === link.label && (
                    <div className="absolute top-full left-0 pt-1 z-50">
                      <div className="w-72 bg-zinc-950 border border-white/10 p-1.5">
                        {link.children.map((child) => (
                          <Link
                            key={child.label}
                            href={child.href}
                            className="flex flex-col px-3.5 py-2.5 rounded-lg hover:bg-white/5 transition"
                          >
                            <span className="font-medium text-white text-sm">
                              {child.label}
                            </span>
                            <span className="text-xs text-white/40 mt-0.5">
                              {child.desc}
                            </span>
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}
                </li>
              ) : (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="block px-3 py-2 rounded-lg hover:text-white hover:bg-white/5 transition"
                  >
                    {link.label}
                  </Link>
                </li>
              )
            )}
          </ul>

          <div className="hidden lg:flex items-center gap-2">
            <Link
              href="/auth/login"
              className="px-3.5 py-2 text-sm font-medium text-white/70 hover:text-white transition"
            >
              Log in
            </Link>
            <Link
              href="/auth/register/institution"
              className="px-4 py-2 text-sm font-medium rounded-lg bg-white text-black hover:bg-zinc-200 transition"
            >
              Start free
            </Link>
          </div>

          <button
            className="lg:hidden p-2 rounded-lg text-white/80 hover:bg-white/10 transition"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {mobileOpen && (
          <div className="lg:hidden mt-3 pb-4 border-t border-white/10 pt-3 space-y-1">
            {navLinks.map((link) => (
              <div key={link.label}>
                <Link
                  href={link.href}
                  className="block px-3 py-2 rounded-lg text-sm font-medium text-white/80 hover:bg-white/5"
                  onClick={() => setMobileOpen(false)}
                >
                  {link.label}
                </Link>
                {link.children?.map((child) => (
                  <Link
                    key={child.label}
                    href={child.href}
                    className="block px-6 py-2 text-sm text-white/40 hover:text-white"
                    onClick={() => setMobileOpen(false)}
                  >
                    {child.label}
                  </Link>
                ))}
              </div>
            ))}
            <div className="pt-3 flex flex-col gap-2">
              <Link
                href="/auth/login"
                onClick={() => setMobileOpen(false)}
                className="text-center px-4 py-2.5 rounded-lg border border-white/15 text-sm text-white"
              >
                Log in
              </Link>
              <Link
                href="/auth/register/institution"
                onClick={() => setMobileOpen(false)}
                className="text-center px-4 py-2.5 rounded-lg bg-white text-black text-sm font-medium"
              >
                Start free
              </Link>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
