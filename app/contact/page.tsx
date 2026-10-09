"use client";

import { useState } from "react";
import { Mail, MessageSquare, Phone, MapPin, Check, AlertCircle } from "lucide-react";
import { MarketingShell, PageHero } from "@/app/components/marketing/shell";
import { darkInput } from "@/app/components/marketing/auth-frame";
import { Button } from "@/app/components/ui/button";

interface FormState {
  firstName: string;
  lastName: string;
  email: string;
  institution: string;
  subject: string;
  message: string;
}

const DEFAULT_FORM: FormState = {
  firstName: "",
  lastName: "",
  email: "",
  institution: "",
  subject: "General inquiry",
  message: "",
};

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState<FormState>(DEFAULT_FORM);

  const set = (field: keyof FormState) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => setForm((prev) => ({ ...prev, [field]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName: form.firstName.trim(),
          lastName: form.lastName.trim(),
          email: form.email.trim(),
          institution: form.institution.trim() || undefined,
          subject: form.subject,
          message: form.message.trim(),
        }),
      });
      if (!res.ok) {
        const data = (await res.json()) as { error?: string };
        throw new Error(data.error ?? "Something went wrong. Please try again.");
      }
      setSubmitted(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <MarketingShell>
      <PageHero
        kicker="Contact"
        title="Talk to the team"
        subtitle="Demo, pricing, enterprise, or a bug — send a note. We reply within a business day."
      />

      <section className="px-6 pb-28">
        <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-10">
          <div className="space-y-6">
            {[
              {
                icon: Mail,
                label: "Email",
                value: "hello@exampro.io",
                href: "mailto:hello@exampro.io",
              },
              {
                icon: MessageSquare,
                label: "Hours",
                value: "Mon–Fri, 9am–6pm WAT",
                href: "#",
              },
              {
                icon: Phone,
                label: "Phone",
                value: "+234 800 EXAMPRO",
                href: "tel:+2348003926776",
              },
              {
                icon: MapPin,
                label: "Office",
                value: "Lagos · Remote-first",
                href: "#",
              },
            ].map((item) => (
              <div key={item.label} className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-lg border border-white/15 rounded-xl flex items-center justify-center shrink-0">
                  <item.icon className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs text-white/40 uppercase tracking-wider">
                    {item.label}
                  </p>
                  <a href={item.href} className="text-sm hover:text-white/70">
                    {item.value}
                  </a>
                </div>
              </div>
            ))}
            <div className="rounded-2xl border border-white/10 p-6">
              <p className="font-medium mb-2">Want a live walkthrough?</p>
              <p className="text-sm text-white/45">
                Thirty minutes. We&apos;ll use your institution type — K-12,
                university, or bootcamp — and show the three roles.
              </p>
            </div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-zinc-950 p-8">
            {submitted ? (
              <div className="py-10 text-center">
                <div className="w-12 h-12 rounded-2xl border border-white/20 flex items-center justify-center mx-auto mb-4">
                  <Check className="w-5 h-5" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Sent</h3>
                <p className="text-sm text-white/45">
                  We&apos;ll get back within 24 hours.
                </p>
                <button
                  onClick={() => { setSubmitted(false); setForm(DEFAULT_FORM); }}
                  className="mt-6 text-xs text-white/30 hover:text-white underline"
                >
                  Send another message
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <h2 className="text-lg font-medium mb-2">Send a message</h2>

                {error && (
                  <div className="flex items-start gap-2 bg-red-500/10 border border-red-500/20 text-red-400 text-sm rounded-lg px-4 py-3">
                    <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                    <span>{error}</span>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-white/40 mb-1.5">
                      First name
                    </label>
                    <input
                      required
                      placeholder="John"
                      value={form.firstName}
                      onChange={set("firstName")}
                      className={darkInput}
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-white/40 mb-1.5">
                      Last name
                    </label>
                    <input
                      required
                      placeholder="Doe"
                      value={form.lastName}
                      onChange={set("lastName")}
                      className={darkInput}
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs text-white/40 mb-1.5">
                    Work email
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="you@institution.com"
                    value={form.email}
                    onChange={set("email")}
                    className={darkInput}
                  />
                </div>
                <div>
                  <label className="block text-xs text-white/40 mb-1.5">
                    Institution
                  </label>
                  <input
                    placeholder="Northridge Academy"
                    value={form.institution}
                    onChange={set("institution")}
                    className={darkInput}
                  />
                </div>
                <div>
                  <label className="block text-xs text-white/40 mb-1.5">
                    Subject
                  </label>
                  <select
                    value={form.subject}
                    onChange={set("subject")}
                    className={`${darkInput} bg-zinc-950`}
                  >
                    <option>General inquiry</option>
                    <option>Request a demo</option>
                    <option>Pricing &amp; plans</option>
                    <option>Technical support</option>
                    <option>Enterprise</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-white/40 mb-1.5">
                    Message
                  </label>
                  <textarea
                    required
                    rows={4}
                    placeholder="What do you need?"
                    value={form.message}
                    onChange={set("message")}
                    className={`${darkInput} resize-none`}
                  />
                </div>
                <Button
                  type="submit"
                  variant="inverse"
                  fullWidth
                  size="lg"
                  loading={loading}
                >
                  Send
                </Button>
              </form>
            )}
          </div>
        </div>
      </section>
    </MarketingShell>
  );
}
