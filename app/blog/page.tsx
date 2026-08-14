import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { MarketingShell, PageHero } from "@/app/components/marketing/shell";

const posts = [
  {
    title: "How to design assessments that actually measure skill",
    excerpt:
      "Mixing MCQ, short answer, essay, and coding so a paper isn't just recall.",
    category: "Practice",
    date: "May 8, 2026",
    readTime: "6 min",
  },
  {
    title: "Multi-tenancy: how ExamPro isolates institution data",
    excerpt:
      "institutionId on every document, join codes, and Firestore rules that match the product.",
    category: "Engineering",
    date: "Apr 28, 2026",
    readTime: "8 min",
  },
  {
    title: "Computer-based testing in African institutions",
    excerpt:
      "Why local payments, join codes, and offline-tolerant UX matter more than another feature.",
    category: "Industry",
    date: "Apr 15, 2026",
    readTime: "5 min",
  },
  {
    title: "A JavaScript exam sandbox in the browser",
    excerpt:
      "Web Workers, test cases, and what we refuse to let student code touch.",
    category: "Engineering",
    date: "Apr 2, 2026",
    readTime: "10 min",
  },
];

export default function BlogPage() {
  return (
    <MarketingShell>
      <PageHero
        kicker="Journal"
        title="Notes from the product"
        subtitle="Assessment design, tenancy, and what we learned shipping ExamPro."
      />
      <section className="px-6 pb-28">
        <div className="max-w-4xl mx-auto grid md:grid-cols-2 gap-3">
          {posts.map((post) => (
            <Link
              key={post.title}
              href="/blog"
              className="group rounded-2xl border border-white/10 p-7 hover:bg-white hover:text-black transition-colors"
            >
              <p className="text-[11px] uppercase tracking-[0.18em] text-white/35 group-hover:text-black/40 mb-4">
                {post.category}
              </p>
              <h2 className="text-lg font-medium leading-snug mb-3">
                {post.title}
              </h2>
              <p className="text-sm text-white/45 group-hover:text-black/55 leading-relaxed mb-6">
                {post.excerpt}
              </p>
              <div className="flex items-center justify-between text-xs text-white/30 group-hover:text-black/40">
                <span>
                  {post.date} · {post.readTime}
                </span>
                <ArrowUpRight className="w-4 h-4" />
              </div>
            </Link>
          ))}
        </div>
      </section>
    </MarketingShell>
  );
}
