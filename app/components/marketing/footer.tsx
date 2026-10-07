import Link from "next/link";

const footerLinks = {
  Product: [
    { label: "Features", href: "/features" },
    { label: "Product overview", href: "/product" },
    { label: "Pricing", href: "/pricing" },
    { label: "Solutions", href: "/solutions" },
  ],
  Resources: [
    { label: "Documentation", href: "/docs/introduction" },
    { label: "Quick start", href: "/docs/quick-start" },
    { label: "Blog", href: "/blog" },
    { label: "Changelog", href: "/blog" },
  ],
  Company: [
    { label: "About", href: "/about" },
    { label: "Contact", href: "/contact" },
    { label: "Careers", href: "/career" },
    { label: "Collaborate", href: "/collaborate-with-us" },
  ],
};

export default function MarketingFooter() {
  return (
    <footer className="bg-black text-white/50 border-t border-white/10">
      <div className="max-w-6xl mx-auto px-6 py-16">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-10 mb-12">
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="flex items-center gap-2.5 mb-4">
              <div className="w-8 h-8 border border-white/80 flex items-center justify-center text-white text-[11px] font-bold">
                EP
              </div>
              <span className="text-lg font-semibold text-white">ExamPro</span>
            </Link>
            <p className="text-sm leading-relaxed text-white/40 max-w-xs">
              Assessment software for schools. Quizzes, exams, coding
              playgrounds, and analytics — one workspace per institution.
            </p>
          </div>

          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category}>
              <h4 className="text-white font-medium text-sm mb-4">{category}</h4>
              <ul className="space-y-2.5">
                {links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-sm hover:text-white transition"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-sm">
          <p>© {new Date().getFullYear()} ExamPro</p>
          <p className="text-white/30">Built for institutions that take assessment seriously.</p>
        </div>
      </div>
    </footer>
  );
}
