import Link from "next/link";
import { ReactNode } from "react";
import { ArrowLeft } from "lucide-react";
import { Wordmark } from "./shell";

export function AuthFrame({
  children,
  showBack = true,
  wide = false,
}: {
  children: ReactNode;
  showBack?: boolean;
  wide?: boolean;
}) {
  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center px-4 py-12 relative overflow-hidden">
      <div className="absolute inset-0 lp-grid pointer-events-none" />
      <div className="absolute inset-0 lp-noise pointer-events-none" />
      <div className={`relative w-full ${wide ? "max-w-xl" : "max-w-lg"}`}>
        {showBack && (
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-white/40 hover:text-white text-sm mb-8 transition"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to home
          </Link>
        )}
        {children}
      </div>
    </div>
  );
}

export function AuthCard({ children }: { children: ReactNode }) {
  return (
    <div className="bg-zinc-950 border border-white/10 p-8">
      <div className="mb-8">
        <Wordmark />
      </div>
      {children}
    </div>
  );
}

export const darkInput =
  "w-full px-4 py-2.5 border border-white/15 bg-white/5 text-white text-sm placeholder:text-white/30 focus:outline-none focus:border-white/40 transition";
