"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { Menu, X, Search } from "lucide-react";
import MarketingNavbar from "@/app/components/marketing/navbar";
import MarketingFooter from "@/app/components/marketing/footer";
import { NAV_GROUPS } from "./docs-nav";

// ─── Sidebar ─────────────────────────────────────────────────────────────────

function Sidebar({ onClose }: { onClose?: () => void }) {
  const pathname = usePathname();

  return (
    <div className="flex flex-col h-full">
      {/* Search hint */}
      <div className="px-4 pb-5">
        <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white/35">
          <Search className="w-3.5 h-3.5 shrink-0" />
          <span>Search docs…</span>
          <kbd className="ml-auto text-[10px] bg-white/8 border border-white/10 rounded px-1.5 py-0.5 text-white/30 font-mono">⌘K</kbd>
        </div>
      </div>

      {/* Nav groups */}
      <nav className="flex-1 overflow-y-auto px-3 pb-10 space-y-7">
        {NAV_GROUPS.map((group) => (
          <div key={group.title}>
            <p className="px-2 mb-2 text-[10px] font-semibold uppercase tracking-[0.15em] text-white/30">
              {group.title}
            </p>
            <ul className="space-y-0.5">
              {group.items.map((item) => {
                const active = pathname === item.href;
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      onClick={onClose}
                      className={`flex items-center gap-2.5 px-3 py-1.5 rounded-lg text-sm transition-colors ${active
                          ? "bg-white text-black font-medium"
                          : "text-white/50 hover:text-white hover:bg-white/8"
                        }`}
                    >
                      {item.icon && (
                        <item.icon className={`w-3.5 h-3.5 shrink-0 ${active ? "opacity-70" : "opacity-40"}`} />
                      )}
                      {item.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>
    </div>
  );
}

// ─── Layout ───────────────────────────────────────────────────────────────────

export default function DocsLayout({ children }: { children: React.ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [mobileOpen]);

  return (
    <div className="bg-black text-white min-h-screen selection:bg-white selection:text-black">
      <MarketingNavbar />

      {/* Mobile toggle */}
      <div className="lg:hidden fixed bottom-5 right-5 z-50">
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="w-12 h-12 rounded-full bg-white text-black shadow-2xl flex items-center justify-center"
          aria-label="Toggle sidebar"
        >
          {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="lg:hidden fixed inset-0 z-40 bg-black/70 backdrop-blur-sm"
          onClick={() => setMobileOpen(false)}
        >
          <div
            className="absolute left-0 top-0 bottom-0 w-72 bg-zinc-950 border-r border-white/10 pt-20 overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <Sidebar onClose={() => setMobileOpen(false)} />
          </div>
        </div>
      )}

      <div className="pt-16 flex min-h-screen">
        {/* Desktop sidebar */}
        <aside className="hidden lg:block w-64 xl:w-72 shrink-0 border-r border-white/10 bg-zinc-950 sticky top-16 self-start h-[calc(100vh-4rem)] overflow-y-auto pt-8">
          <Sidebar />
        </aside>

        {/* Content */}
        <main className="flex-1 min-w-0 bg-black">
          {children}
        </main>
      </div>

      <MarketingFooter />
    </div>
  );
}
