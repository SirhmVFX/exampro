import { DocPage, DocH1, DocH2, DocH3, DocLead, DocP, DocUl, DocLi, Note, Tip, Warning } from "../../doc-components";

export default function Page() {
  return (
    <DocPage href="/docs/admin/structure" headings={[
      { id: "overview", label: "Overview", depth: 2 },
      { id: "classes", label: "Classes & vocabulary", depth: 2 },
      { id: "subjects", label: "Subjects", depth: 2 },
      { id: "skills", label: "Skills", depth: 2 },
      { id: "terms", label: "Terms & sessions", depth: 2 },
      { id: "departments", label: "Departments", depth: 2 },
      { id: "cohorts", label: "Cohorts, seats & waitlists", depth: 2 },
    ]}>
      <DocH1>Structure & terms</DocH1>
      <DocLead>Structure defines the vocabulary and taxonomy every teacher and student references. Get this right early — changes propagate automatically.</DocLead>

      <DocH2 id="overview">Overview</DocH2>
      <DocP>Go to <strong>Dashboard → Structure</strong>. This page controls five things: what you call a group, the list of groups, the list of subjects, skills, terms, and departments. Click <strong>Save structure</strong> after any change.</DocP>

      <DocH2 id="classes">Classes &amp; vocabulary</DocH2>
      <DocP>The <em>class label</em> is the word ExamPro uses instead of "class" everywhere in the product — buttons, export columns, select menus. Set it once to match your institution&apos;s language:</DocP>
      <DocUl>
        <DocLi><strong>K-12 schools</strong> — Class, Grade, Form, Year</DocLi>
        <DocLi><strong>Universities</strong> — Level, Year, Cohort</DocLi>
        <DocLi><strong>Bootcamps</strong> — Cohort, Track, Batch</DocLi>
        <DocLi><strong>Corporate</strong> — Department, Team, Group</DocLi>
      </DocUl>
      <DocP>Then add the actual group names. Type a name and press <kbd className="bg-white/8 border border-white/10 rounded px-1.5 py-0.5 text-xs font-mono">Enter</kbd>. Remove with the ×. Examples: <em>Grade 10</em>, <em>JSS 2A</em>, <em>Frontend Cohort 3</em>.</DocP>
      <Tip>After saving, class names are pushed to all teacher and student profile sync jobs automatically. Teachers see the updated list when assigning assessments.</Tip>

      <DocH2 id="subjects">Subjects</DocH2>
      <DocP>Subjects are the courses or disciplines at your institution. Every question and assessment is tagged with exactly one subject. Examples: <em>Mathematics</em>, <em>English Language</em>, <em>React Development</em>, <em>Compliance Training</em>.</DocP>
      <DocP>The gradebook and analytics group results by subject, so it&apos;s worth getting this list right. You can add subjects later — existing assessments keep their subject tag.</DocP>

      <DocH2 id="skills">Skills</DocH2>
      <DocP>Skills are optional sub-tags within a subject. Examples: <em>Algebra</em>, <em>Reading comprehension</em>, <em>React Hooks</em>, <em>SQL JOINs</em>.</DocP>
      <DocP>Teachers can tag individual questions with a skill. The student progress page then shows a skill-level breakdown in addition to subject averages — useful for identifying exactly where a student is struggling.</DocP>
      <Note>Skills are optional. If you don&apos;t add any, the product works fine — student progress shows subject averages only.</Note>

      <DocH2 id="terms">Terms &amp; sessions</DocH2>
      <DocP>Terms represent time periods in your academic calendar. The gradebook can be filtered by term, so results from different periods stay separate.</DocP>
      <DocUl>
        <DocLi>Click <strong>Add</strong> next to the term name field. A new term is created with a 90-day default duration and status <em>active</em>.</DocLi>
        <DocLi>Multiple terms can exist simultaneously. Only one needs to be active.</DocLi>
        <DocLi>Remove a term with the Remove button — this does not delete the assessments or results under it.</DocLi>
      </DocUl>
      <DocP>Example term names: <em>First Term 2025/26</em>, <em>Harmattan Semester</em>, <em>Fall 2026</em>, <em>Q1 Training</em>.</DocP>

      <DocH2 id="departments">Departments</DocH2>
      <DocP>Departments are used by corporate and university setups. A manager user is assigned to a department and sees only the people in it.</DocP>
      <DocUl>
        <DocLi>Add a department name and click <strong>Add</strong>.</DocLi>
        <DocLi>Assign a manager from <strong>Dashboard → Teachers</strong> (managers are a variant of the teacher role).</DocLi>
        <DocLi>Assign students to a department from their profile.</DocLi>
      </DocUl>

      <DocH2 id="cohorts">Cohorts, seats &amp; waitlists</DocH2>
      <DocP>When you save your class list, ExamPro automatically creates a <em>cohort</em> record for each class. Cohorts let you add dates and a seat cap.</DocP>
      <DocUl>
        <DocLi><strong>Start and end dates</strong> — shown to students on their dashboard.</DocLi>
        <DocLi><strong>Seat cap</strong> — enter a number to limit enrolments. 0 means no cap.</DocLi>
        <DocLi><strong>Waitlist</strong> — when the cap is reached, new enrolments go to the waitlist. Admins admit them one by one using the <strong>Admit</strong> button.</DocLi>
      </DocUl>
      <Warning>Removing a class from the structure list does <em>not</em> delete the cohort or its enrolments. Students in that cohort keep their data — they just won&apos;t see any new assessments targeting that class name.</Warning>
    </DocPage>
  );
}
