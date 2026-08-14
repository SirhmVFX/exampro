import Link from "next/link";
import { ArrowUpRight, MapPin } from "lucide-react";
import { MarketingShell, PageHero } from "@/app/components/marketing/shell";

const openings = [
  { title: "Senior Full-Stack Engineer", team: "Engineering", location: "Remote", type: "Full-time" },
  { title: "Product Designer", team: "Design", location: "Remote", type: "Full-time" },
  { title: "Customer Success Manager", team: "Success", location: "Lagos / Remote", type: "Full-time" },
  { title: "DevOps Engineer", team: "Infrastructure", location: "Remote", type: "Full-time" },
  { title: "Technical Writer", team: "Marketing", location: "Remote", type: "Contract" },
];

export default function CareersPage() {
  return (
    <MarketingShell>
      <PageHero
        kicker="Careers"
        title="Build assessment software"
        subtitle="A small team. A real SaaS. Schools that need the product, not another pitch deck."
      />
      <section className="px-6 pb-28">
        <div className="max-w-3xl mx-auto">
          <p className="text-[11px] uppercase tracking-[0.2em] text-white/35 mb-6">
            Open roles
          </p>
          <div className="divide-y divide-white/10 border-y border-white/10">
            {openings.map((job) => (
              <Link
                key={job.title}
                href="/contact"
                className="flex items-center justify-between gap-4 py-5 group hover:bg-white/5 -mx-4 px-4 transition"
              >
                <div>
                  <p className="font-medium">{job.title}</p>
                  <p className="text-sm text-white/40 mt-1 flex items-center gap-3">
                    <span>{job.team}</span>
                    <span className="inline-flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      {job.location}
                    </span>
                    <span>{job.type}</span>
                  </p>
                </div>
                <span className="text-xs text-white/40 group-hover:text-white inline-flex items-center gap-1 shrink-0">
                  Apply <ArrowUpRight className="w-3.5 h-3.5" />
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </MarketingShell>
  );
}
