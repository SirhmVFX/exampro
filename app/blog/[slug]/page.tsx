import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import type { Metadata } from "next";
import { MarketingShell } from "@/app/components/marketing/shell";
import { posts, getPost } from "../posts";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return posts.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) return {};
  return {
    title: `${post.title} — ExamPro Journal`,
    description: post.excerpt,
  };
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) notFound();

  return (
    <MarketingShell>
      {/* Top back link */}
      <div className="max-w-3xl mx-auto px-6 pt-32 pb-4">
        <Link
          href="/blog"
          className="inline-flex items-center gap-1.5 text-sm text-white/40 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Journal
        </Link>
      </div>

      {/* Header */}
      <header className="max-w-3xl mx-auto px-6 pb-10 border-b border-white/10">
        <p className="text-[11px] uppercase tracking-[0.2em] text-white/35 mb-4">
          {post.category}
        </p>
        <h1 className="text-3xl md:text-5xl font-semibold tracking-tight leading-[1.15] mb-6">
          {post.title}
        </h1>
        <p className="text-base text-white/45 leading-relaxed mb-6">
          {post.excerpt}
        </p>
        <p className="text-xs text-white/30">
          {post.date} · {post.readTime} read
        </p>
      </header>

      {/* Body */}
      <article
        className="
          max-w-3xl mx-auto px-6 py-12 pb-28
          prose prose-invert
          prose-headings:font-semibold prose-headings:tracking-tight
          prose-h2:text-2xl prose-h2:mt-10 prose-h2:mb-4
          prose-p:text-white/70 prose-p:leading-relaxed
          prose-a:text-white prose-a:underline
          prose-code:bg-white/10 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:text-sm
          prose-pre:bg-white/5 prose-pre:border prose-pre:border-white/10 prose-pre:rounded-xl
          prose-strong:text-white
          max-w-none
        "
        dangerouslySetInnerHTML={{ __html: post.content }}
      />

      {/* Related posts */}
      <section className="border-t border-white/10 px-6 pb-28">
        <div className="max-w-3xl mx-auto pt-12">
          <h2 className="text-sm text-white/35 uppercase tracking-wider mb-6">
            More from the Journal
          </h2>
          <div className="grid sm:grid-cols-2 gap-3">
            {posts
              .filter((p) => p.slug !== slug)
              .slice(0, 2)
              .map((p) => (
                <Link
                  key={p.slug}
                  href={`/blog/${p.slug}`}
                  className="group rounded-2xl border border-white/10 p-6 hover:bg-white hover:text-black transition-colors"
                >
                  <p className="text-[10px] uppercase tracking-[0.18em] text-white/30 group-hover:text-black/40 mb-2">
                    {p.category}
                  </p>
                  <p className="text-sm font-medium leading-snug mb-2">{p.title}</p>
                  <p className="text-xs text-white/35 group-hover:text-black/40">
                    {p.date} · {p.readTime}
                  </p>
                </Link>
              ))}
          </div>
        </div>
      </section>
    </MarketingShell>
  );
}
