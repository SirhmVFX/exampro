import { DocPage, DocH1, DocH2, DocH3, DocLead, DocP, DocUl, DocLi, DocTable, Note, CardGrid, Card } from "../doc-components";

export default function Page() {
  return (
    <DocPage href="/docs/roles" headings={[
      { id: "admin", label: "Admin", depth: 2 },
      { id: "teacher", label: "Teacher", depth: 2 },
      { id: "student", label: "Student", depth: 2 },
      { id: "parent", label: "Parent", depth: 2 },
      { id: "manager", label: "Manager", depth: 2 },
      { id: "permissions", label: "Permissions matrix", depth: 2 },
    ]}>
      <DocH1>Roles overview</DocH1>
      <DocLead>ExamPro has five distinct roles. Each role gets a tailored dashboard and a different scope of access.</DocLead>

      <DocH2 id="admin">Admin</DocH2>
      <DocP>The admin is the institution owner. There is one super-admin per institution (the person who registered it), but additional admins can be granted from the Settings page.</DocP>
      <DocUl>
        <DocLi>Controls institution settings, branding, and the join code</DocLi>
        <DocLi>Invites, suspends, and removes teachers and students</DocLi>
        <DocLi>Manages billing and plans</DocLi>
        <DocLi>Views institution-wide analytics and gradebook</DocLi>
        <DocLi>Issues and revokes certificates</DocLi>
        <DocLi>Sends announcements to any audience</DocLi>
        <DocLi>Sees the full audit log</DocLi>
        <DocLi>Creates and manages learning paths</DocLi>
        <DocLi>Manages cohorts, terms, and departments</DocLi>
      </DocUl>

      <DocH2 id="teacher">Teacher</DocH2>
      <DocP>Teachers build and manage all instructional content for their assigned classes and subjects.</DocP>
      <DocUl>
        <DocLi>Creates, edits, and deletes questions in their library</DocLi>
        <DocLi>Generates questions with AI (counts against institution&apos;s monthly quota)</DocLi>
        <DocLi>Creates assessments: quiz, test, exam, assignment, project, practice</DocLi>
        <DocLi>Publishes, closes, and manages assessments</DocLi>
        <DocLi>Grades manual submissions and adds per-question feedback</DocLi>
        <DocLi>Uploads learning materials (documents, videos, links, notes)</DocLi>
        <DocLi>Builds rubrics for essay and project scoring</DocLi>
        <DocLi>Views analytics for their own assessments and classes</DocLi>
      </DocUl>

      <DocH2 id="student">Student</DocH2>
      <DocP>Students interact with published content — they cannot create questions or see other students&apos; data.</DocP>
      <DocUl>
        <DocLi>Takes published assessments for their class</DocLi>
        <DocLi>Views their own results with per-question breakdowns</DocLi>
        <DocLi>Reads and marks learning materials complete</DocLi>
        <DocLi>Tracks their own subject-by-subject progress</DocLi>
        <DocLi>Views and shares their certificates</DocLi>
        <DocLi>Updates their own profile and avatar</DocLi>
      </DocUl>

      <DocH2 id="parent">Parent</DocH2>
      <DocP>Parents have a read-only dashboard — they can see but never change anything.</DocP>
      <DocUl>
        <DocLi>Links to one or more children by their registered email</DocLi>
        <DocLi>Sees upcoming assessments for linked children</DocLi>
        <DocLi>Sees completed results (score, pass/fail, date)</DocLi>
        <DocLi>Cannot see question content or other students&apos; data</DocLi>
      </DocUl>

      <DocH2 id="manager">Manager</DocH2>
      <DocP>The manager role is designed for corporate L&D and universities where a head of department needs oversight without admin privileges.</DocP>
      <DocUl>
        <DocLi>Sees all people in their assigned department</DocLi>
        <DocLi>Sees a completion status badge (has results / incomplete) per person</DocLi>
        <DocLi>Cannot create questions, assessments, or access billing</DocLi>
      </DocUl>
      <Note>Managers are assigned to a department by an admin. If a user has the manager role but no department, their dashboard shows an empty list.</Note>

      <DocH2 id="permissions">Permissions matrix</DocH2>
      <DocTable
        headers={["Action", "Admin", "Teacher", "Student", "Parent", "Manager"]}
        rows={[
          ["Create questions", "✓", "✓", "—", "—", "—"],
          ["Create assessments", "✓", "✓", "—", "—", "—"],
          ["Take assessments", "—", "—", "✓", "—", "—"],
          ["Grade submissions", "✓", "✓", "—", "—", "—"],
          ["View all results", "✓", "Own classes", "Own only", "Child only", "Dept only"],
          ["Upload materials", "✓", "✓", "—", "—", "—"],
          ["Issue certificates", "✓", "—", "—", "—", "—"],
          ["Send announcements", "✓", "—", "—", "—", "—"],
          ["Manage billing", "✓", "—", "—", "—", "—"],
          ["View analytics", "Institution", "Own classes", "Own only", "—", "Dept only"],
          ["Edit institution settings", "✓", "—", "—", "—", "—"],
        ]}
      />
    </DocPage>
  );
}
