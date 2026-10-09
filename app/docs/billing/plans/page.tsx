import Link from "next/link";
import { DocPage, DocH1, DocH2, DocLead, DocP, DocUl, DocLi, Note, Tip, DocTable } from "../../doc-components";

export default function Page() {
  return (
    <DocPage href="/docs/billing/plans" headings={[
      { id: "plans", label: "The plans", depth: 2 },
      { id: "free", label: "Free plan", depth: 2 },
      { id: "paid", label: "Paid plans", depth: 2 },
      { id: "enterprise", label: "Enterprise", depth: 2 },
    ]}>
      <DocH1>Plans</DocH1>
      <DocLead>ExamPro has four plans. Every institution starts on Free — upgrade when you need more capacity.</DocLead>

      <DocH2 id="plans">The plans</DocH2>
      <DocTable
        headers={["Plan", "Price", "Students", "Teachers", "AI gens/mo"]}
        rows={[
          ["Free", "$0", "30", "3", "20"],
          ["Starter", "$29/mo", "200", "15", "200"],
          ["Growth", "$79/mo", "1,000", "50", "Unlimited"],
          ["Enterprise", "Custom", "Unlimited", "Unlimited", "Unlimited"],
        ]}
      />
      <Note>AI generation quota is shared across all teachers in the institution for the calendar month.</Note>

      <DocH2 id="free">Free plan</DocH2>
      <DocP>The Free plan is permanent — it doesn&apos;t expire. It&apos;s suitable for small classes (up to 30 students, 3 teachers) and light AI usage. You get all core features: questions, assessments, grading, materials, and basic analytics.</DocP>
      <DocP>The Free plan does not require a credit card or any payment details.</DocP>

      <DocH2 id="paid">Paid plans</DocH2>
      <DocP>Starter and Growth are billed monthly. Payments are processed by <strong>Paystack</strong> — supports Nigerian bank cards, Visa, Mastercard, bank transfer, and USSD. Paid plans activate immediately after a successful payment.</DocP>
      <DocUl>
        <DocLi><strong>Starter ($29/mo)</strong> — growing schools up to 200 students. Includes full Cloudinary file storage for materials.</DocLi>
        <DocLi><strong>Growth ($79/mo)</strong> — established institutions up to 1,000 students. Unlimited AI generations and priority support.</DocLi>
      </DocUl>
      <Tip>Plans do not auto-renew. Each month is a separate payment. If you don&apos;t pay again, the plan stays active until the end of the paid month, then reverts to Free. No data is deleted.</Tip>

      <DocH2 id="enterprise">Enterprise</DocH2>
      <DocP>For universities, multi-campus institutions, or anyone with special requirements. Features include unlimited students and teachers, dedicated account manager, custom SLA, and onboarding support.</DocP>
      <DocP><Link href="/contact" className="text-blue-400 underline font-medium">Contact us</Link> to discuss pricing and requirements.</DocP>
    </DocPage>
  );
}
