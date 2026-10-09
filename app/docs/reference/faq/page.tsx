"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronRight, ArrowRight } from "lucide-react";
import { DocPage, DocH1, DocH2, DocLead, DocP } from "../../doc-components";

const faqs: { category: string; items: { q: string; a: React.ReactNode }[] }[] = [
  {
    category: "Account & login",
    items: [
      { q: "I forgot my password", a: <>Click <strong>Forgot password?</strong> on the login page, enter your email, and check your inbox (including spam). The link expires after 1 hour.</> },
      { q: "I can't log in — it says my account is suspended", a: <>Your account has been suspended by your institution admin. Contact your school admin to get unsuspended — ExamPro support cannot override this.</> },
      { q: "How do I change my email?", a: <>Email addresses cannot be changed from within ExamPro. Contact your institution admin — they can update it from the admin dashboard.</> },
      { q: "How do I switch between institutions?", a: <>Click your avatar in the top-right of any dashboard page. A dropdown shows all your institutions. Click one to switch — your other memberships are preserved.</> },
    ],
  },
  {
    category: "Registration",
    items: [
      { q: "My join code says it's invalid", a: <>Join codes are case-sensitive. Check you've entered it exactly. If still failing, ask your admin to verify the code hasn't been rotated.</> },
      { q: "I registered but I'm in the wrong class", a: <>Ask your admin to update your class assignment from the Students page in the admin dashboard.</> },
      { q: "Can I register without a join code?", a: <>Only if your institution has set join mode to Open. Otherwise a join code is required. Contact your admin.</> },
    ],
  },
  {
    category: "Taking exams",
    items: [
      { q: "I can't see my assessment", a: <>Assessments are filtered by class. Ask your admin to confirm your class matches the assessment's target class. Also check if the assessment has a future start date.</> },
      { q: "The timer ran out before I finished", a: <>ExamPro auto-submits your answers when the timer hits zero. Your teacher can see how much time you used and may award points manually if you were close.</> },
      { q: "I accidentally submitted too early", a: <>Once confirmed, a submission cannot be reopened. Contact your teacher — they can override individual question scores in the grading view.</> },
      { q: "My internet dropped during the exam", a: <>Answers autosave every 12 seconds. When you reconnect, your last save is intact. If the timer expired while you were disconnected, the auto-submit fires on reconnect.</> },
      { q: "I see a tab-switch warning — am I in trouble?", a: <>The warning appears as a reminder, not as a punishment. Your teacher will see the count of switches. One accidental switch is usually fine — contact your teacher to explain if needed.</> },
    ],
  },
  {
    category: "Results & grading",
    items: [
      { q: "My result says 'Pending manual grade'", a: <>Your assessment has essay, project, or non-JavaScript coding questions. Your teacher needs to review those manually. The full result appears once they save grades.</> },
      { q: "My score is wrong", a: <>For auto-graded questions, ask your teacher to verify the accepted answers — they can override the score manually. For manual questions, they may have made a grading mistake they can correct.</> },
      { q: "I can't see my result", a: <>Your teacher may not have enabled 'Show results immediately'. Go to Dashboard → Results to see all your attempts once they're graded.</> },
    ],
  },
  {
    category: "Materials & learning paths",
    items: [
      { q: "I marked a material complete but the assessment is still locked", a: <>The assessment may require both a material AND a passing score on a previous assessment. Check the assessment description or ask your teacher.</> },
      { q: "I can't find a material my teacher mentioned", a: <>Materials are filtered by your class. Ask your teacher to confirm they published it to your class specifically.</> },
    ],
  },
  {
    category: "Billing & plans",
    items: [
      { q: "I paid but my plan didn't upgrade", a: <>Do not pay again. Note your Paystack reference from the receipt email or your bank statement, then contact us via the <Link href="/contact" className="text-blue-400 underline">Contact page</Link>.</> },
      { q: "Can I get a refund?", a: <>Plans are paid monthly with no auto-renewal. We don't offer refunds for partially used months, but you won't be charged again — the plan simply reverts to Free when the month ends.</> },
      { q: "My institution hit the student limit", a: <>Go to Dashboard → Billing and upgrade to a plan with a higher student cap, or suspend inactive students to free up seats.</> },
    ],
  },
];

function FaqItem({ q, a }: { q: string; a: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-white/8 last:border-0">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-start justify-between gap-4 py-4 text-left"
      >
        <span className="text-[15px] font-medium text-white/90">{q}</span>
        <ChevronRight className={`w-4 h-4 text-white/30 shrink-0 mt-0.5 transition-transform ${open ? "rotate-90" : ""}`} />
      </button>
      <div className={`grid transition-all duration-200 ${open ? "grid-rows-[1fr] opacity-100 pb-4" : "grid-rows-[0fr] opacity-0"}`}>
        <div className="overflow-hidden text-[15px] text-white/60 leading-7">{a}</div>
      </div>
    </div>
  );
}

export default function Page() {
  return (
    <DocPage href="/docs/reference/faq" headings={faqs.map((c) => ({ id: c.category.toLowerCase().replace(/[^a-z0-9]+/g, "-"), label: c.category, depth: 2 as const }))}>
      <DocH1>FAQ</DocH1>
      <DocLead>Answers to the most common questions — organised by topic.</DocLead>

      {faqs.map((cat) => (
        <div key={cat.category}>
          <DocH2 id={cat.category.toLowerCase().replace(/[^a-z0-9]+/g, "-")}>{cat.category}</DocH2>
          <div className="border border-white/10 rounded-xl px-4 divide-y divide-neutral-100 mb-8">
            {cat.items.map((item) => (
              <FaqItem key={item.q} q={item.q} a={item.a} />
            ))}
          </div>
        </div>
      ))}

      <div className="mt-8 border border-white/10 rounded-2xl p-6 text-center bg-white/5">
        <p className="font-semibold text-white mb-2">Didn&apos;t find your answer?</p>
        <p className="text-sm text-white/50 mb-4">We reply within one business day.</p>
        <Link
          href="/contact"
          className="inline-flex items-center gap-2 bg-black text-white text-sm font-medium px-5 py-2.5 rounded-xl hover:bg-zinc-900 transition-colors"
        >
          Contact support <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </DocPage>
  );
}
