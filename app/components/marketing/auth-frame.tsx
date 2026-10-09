import Link from "next/link";
import { ReactNode, useState } from "react";
import { ArrowLeft, Eye, EyeOff } from "lucide-react";
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
    <div className="bg-zinc-950 border border-white/10 rounded-2xl p-8">
      <div className="mb-8">
        <Wordmark />
      </div>
      {children}
    </div>
  );
}
// Shared input style — rounded-xl for a softer look
export const darkInput =
  "w-full px-4 py-2.5 rounded-xl border border-white/15 bg-white/5 text-white text-sm placeholder:text-white/30 focus:outline-none focus:border-white/40 transition";

/**
 * Drop-in replacement for <input type="password"> — includes a show/hide eye toggle.
 * Renders the input + the eye button inside a relative wrapper.
 */
export function PasswordToggle({
  value,
  onChange,
  placeholder = "Min. 8 characters",
  required = true,
  minLength = 8,
  className = "",
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  required?: boolean;
  minLength?: number;
  className?: string;
}) {
  const [show, setShow] = useState(false);
  return (
    <div className="relative">
      <input
        type={show ? "text" : "password"}
        required={required}
        minLength={minLength}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={`${darkInput} pr-10 ${className}`}
      />
      <button
        type="button"
        onClick={() => setShow((s) => !s)}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white transition-colors"
        aria-label={show ? "Hide password" : "Show password"}
      >
        {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
      </button>
    </div>
  );
}
