import { DocPage, DocH1, DocH2, DocLead, DocP, DocUl, DocLi, Steps, Step, Tip, Note, Warning } from "../../doc-components";

export default function Page() {
  return (
    <DocPage href="/docs/billing/paystack" headings={[
      { id: "how", label: "How payment works", depth: 2 },
      { id: "upgrading", label: "Upgrading your plan", depth: 2 },
      { id: "methods", label: "Payment methods", depth: 2 },
      { id: "history", label: "Payment history", depth: 2 },
      { id: "support", label: "Payment issues", depth: 2 },
    ]}>
      <DocH1>Paying with Paystack</DocH1>
      <DocLead>ExamPro uses Paystack for all payments. The checkout is hosted by Paystack — your card details never touch ExamPro's servers.</DocLead>

      <DocH2 id="how">How payment works</DocH2>
      <DocP>When you click <strong>Upgrade</strong> on a plan, ExamPro initialises a transaction with Paystack and redirects you to the Paystack checkout page. After a successful payment, Paystack sends you back to ExamPro where your plan activates immediately.</DocP>

      <DocH2 id="upgrading">Upgrading your plan</DocH2>
      <Steps>
        <Step n={1} title="Go to Billing">Dashboard → <strong>Billing</strong>. Only admins can manage billing.</Step>
        <Step n={2} title="Find the plan you want">The four plan cards show features and pricing. Click <strong>Upgrade — $X/mo</strong> on the plan you want.</Step>
        <Step n={3} title="Complete Paystack checkout">You're redirected to Paystack's secure checkout. Enter your card or choose your payment method.</Step>
        <Step n={4} title="Return to ExamPro">After payment Paystack redirects you back. Your new plan is active immediately and shown in the Current plan card.</Step>
      </Steps>
      <Tip>Keep your Paystack receipt email — it contains the payment reference. You'll need it if you contact support about a charge.</Tip>

      <DocH2 id="methods">Payment methods</DocH2>
      <DocP>Paystack supports:</DocP>
      <DocUl>
        <DocLi>Nigerian debit/credit cards (GTBank, Access, Zenith, UBA, etc.)</DocLi>
        <DocLi>Visa and Mastercard from any country</DocLi>
        <DocLi>Bank transfer (NGN)</DocLi>
        <DocLi>USSD (*737#, *966#, etc.)</DocLi>
        <DocLi>Mobile money (some networks)</DocLi>
      </DocUl>

      <DocH2 id="history">Payment history</DocH2>
      <DocP>The <strong>Payment history</strong> table at the bottom of the Billing page shows every successful payment:</DocP>
      <DocUl>
        <DocLi>Date</DocLi>
        <DocLi>Plan purchased</DocLi>
        <DocLi>Amount charged</DocLi>
        <DocLi>Paystack reference number</DocLi>
        <DocLi>Status (success)</DocLi>
      </DocUl>

      <DocH2 id="support">Payment issues</DocH2>
      <Warning>If you were charged but your plan didn&apos;t upgrade, do not pay again. Note your Paystack reference number from your bank statement or receipt email and contact ExamPro support via the Contact page.</Warning>
      <DocP>Common issues:</DocP>
      <DocUl>
        <DocLi><strong>Card declined</strong> — contact your bank or try a different card.</DocLi>
        <DocLi><strong>Page closed before redirect</strong> — if Paystack shows a success screen but you never came back to ExamPro, your payment went through. Go to Billing — if the plan hasn&apos;t upgraded, contact support with your reference.</DocLi>
        <DocLi><strong>OTP not received</strong> — wait 2 minutes, then retry or use a different payment method.</DocLi>
      </DocUl>
    </DocPage>
  );
}
