import { DocPage, DocH1, DocH2, DocLead, DocP, DocUl, DocLi, Steps, Step, Note, Tip } from "../../doc-components";

export default function Page() {
  return (
    <DocPage href="/docs/student/profile" headings={[
      { id: "editing", label: "Editing your profile", depth: 2 },
      { id: "password", label: "Changing your password", depth: 2 },
      { id: "accommodations", label: "Accommodations", depth: 2 },
    ]}>
      <DocH1>Profile &amp; password</DocH1>
      <DocLead>Update your name, contact details, and password from the Profile page. Your institution admin can also update these on your behalf.</DocLead>

      <DocH2 id="editing">Editing your profile</DocH2>
      <Steps>
        <Step n={1} title="Go to Profile">Dashboard → <strong>Profile</strong> (bottom of the left sidebar).</Step>
        <Step n={2} title="Update your details">You can edit:
          <DocUl>
            <DocLi><strong>Full name</strong> — shown to teachers and on certificates.</DocLi>
            <DocLi><strong>Phone</strong> — optional contact number.</DocLi>
            <DocLi><strong>Date of birth</strong> — optional, stored for record-keeping.</DocLi>
            <DocLi><strong>Gender</strong> — optional.</DocLi>
            <DocLi><strong>Class(es)</strong> — tick which class groups you belong to. Changes here enrol you in those classes immediately.</DocLi>
          </DocUl>
        </Step>
        <Step n={3} title="Click Save">Changes take effect immediately.</Step>
      </Steps>
      <Note>Your email address cannot be changed from the profile page — contact your admin or ExamPro support if you need to update it.</Note>

      <DocH2 id="password">Changing your password</DocH2>
      <Steps>
        <Step n={1} title="Go to Profile">Dashboard → <strong>Profile</strong>.</Step>
        <Step n={2} title="Click Change password">The password change modal opens.</Step>
        <Step n={3} title="Enter your current password">This confirms it is you making the change.</Step>
        <Step n={4} title="Enter and confirm your new password">Must be at least 6 characters.</Step>
        <Step n={5} title="Click Update password">Your password is changed immediately. You remain logged in.</Step>
      </Steps>
      <Tip>If you signed up with Google, the password change option will tell you that passwords are managed through your Google account.</Tip>
      <Note>If you forgot your current password, log out and use <strong>Forgot password</strong> on the login page instead.</Note>

      <DocH2 id="accommodations">Accommodations</DocH2>
      <DocP>
        Some students need extra support during assessments. Your admin sets these — but you can view what is configured for your account on the Profile page:
      </DocP>
      <DocUl>
        <DocLi><strong>Extra time (%)</strong> — your exam timer is extended by this percentage. For example, 25% extra time turns a 60-minute exam into 75 minutes.</DocLi>
        <DocLi><strong>Larger text</strong> — increases the font size during assessments.</DocLi>
      </DocUl>
      <Note>Ask your admin or teacher if you need accommodations set up. You can see the current values here but changes must be made by staff.</Note>
    </DocPage>
  );
}
