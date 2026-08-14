"use client";

import { useState } from "react";
import { Mail, MessageSquare, Phone, MapPin, Check } from "lucide-react";
import { MarketingShell, PageHero } from "@/app/components/marketing/shell";
import { darkInput } from "@/app/components/marketing/auth-frame";
import { Button } from "@/app/components/ui/button";

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setSubmitted(true);
    }, 1200);
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
                <div className="w-10 h-10 rounded-lg border border-white/15 flex items-center justify-center shrink-0">
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
                <div className="w-12 h-12 border border-white/20 flex items-center justify-center mx-auto mb-4">
                  <Check className="w-5 h-5" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Sent</h3>
                <p className="text-sm text-white/45">
                  We&apos;ll get back within 24 hours.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <h2 className="text-lg font-medium mb-2">Send a message</h2>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-white/40 mb-1.5">
                      First name
                    </label>
                    <input required placeholder="John" className={darkInput} />
                  </div>
                  <div>
                    <label className="block text-xs text-white/40 mb-1.5">
                      Last name
                    </label>
                    <input required placeholder="Doe" className={darkInput} />
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
                    className={darkInput}
                  />
                </div>
                <div>
                  <label className="block text-xs text-white/40 mb-1.5">
                    Institution
                  </label>
                  <input placeholder="Northridge Academy" className={darkInput} />
                </div>
                <div>
                  <label className="block text-xs text-white/40 mb-1.5">
                    Subject
                  </label>
                  <select className={`${darkInput} bg-zinc-950`}>
                    <option>General inquiry</option>
                    <option>Request a demo</option>
                    <option>Pricing & plans</option>
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
                    className={`${darkInput} resize-none`}
                  />
                </div>
                <Button type="submit" variant="inverse" fullWidth size="lg" loading={loading}>
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
