import {
  DocPage,
  DocH1,
  DocH2,
  DocLead,
  DocP,
  DocUl,
  DocLi,
  Note,
  Tip,
} from "../../doc-components";

export default function Page() {
  return (
    <DocPage
      href="/docs/student/progress"
      headings={[
        { id: "stats", label: "Overview stats", depth: 2 },
        { id: "paths", label: "Learning path progress", depth: 2 },
        { id: "attendance", label: "Attendance", depth: 2 },
        { id: "subjects", label: "By subject", depth: 2 },
        { id: "enrollments", label: "Your groups", depth: 2 },
      ]}
    >
      <DocH1>Progress</DocH1>
      <DocLead>
        Track your average score, pass rate, learning path completion, attendance,
        and material completion — broken down by subject and path.
      </DocLead>

      <DocH2 id="stats">Overview stats</DocH2>
      <DocP>Go to <strong>Dashboard → Progress</strong>. The stat cards show:</DocP>
      <DocUl>
        <DocLi><strong>Average score</strong> — mean percentage across all your submitted and graded attempts.</DocLi>
        <DocLi><strong>Pass rate</strong> — what percentage of your attempts you passed.</DocLi>
        <DocLi><strong>Materials completed</strong> — percentage of your class materials you have marked complete, with the raw count shown below.</DocLi>
        <DocLi><strong>Days attended</strong> — how many days you have logged in, with the last-30-day count shown below.</DocLi>
      </DocUl>

      <DocH2 id="paths">Learning path progress</DocH2>
      <DocP>
        If your institution has learning paths set up, a <strong>Learning path progress</strong> card appears below the stats. Each path shows:
      </DocP>
      <DocUl>
        <DocLi>Path title and overall progress fraction (e.g. <strong>2 / 5 steps · 40%</strong>)</DocLi>
        <DocLi>A colour-filled progress bar</DocLi>
        <DocLi>A numbered step list — completed steps (assessments you passed) show a green ✓; pending steps show their number</DocLi>
        <DocLi>Whether each step is <strong>required</strong> (gates the next step)</DocLi>
      </DocUl>
      <Note>
        Path progress currently tracks completed <em>assessments</em> (passed attempts). Materials within paths are shown in the step list but their completion is tracked separately in the Materials section.
      </Note>
      <Tip>If a required step is locked, pass its prerequisite assessment first. The lock lifts automatically once you pass.</Tip>

      <DocH2 id="attendance">Attendance</DocH2>
      <DocP>Below the stats sits an <strong>Attendance</strong> card summarising your presence:</DocP>
      <DocUl>
        <DocLi><strong>Present</strong> — total distinct days you have attended.</DocLi>
        <DocLi><strong>Last 30 days</strong> — days present within the trailing month.</DocLi>
        <DocLi><strong>Current streak</strong> — consecutive days attended up to today.</DocLi>
      </DocUl>
      <Note>
        You are marked present automatically the first time you open your dashboard on any given day — there is nothing to click. Teachers and admins see the same attendance in their student lists.
      </Note>

      <DocH2 id="subjects">By subject</DocH2>
      <DocP>The chart shows one row per subject you have taken at least one assessment in. Each row shows:</DocP>
      <DocUl>
        <DocLi>Subject name</DocLi>
        <DocLi>Your average score in that subject</DocLi>
        <DocLi>Your pass rate in that subject</DocLi>
        <DocLi>Number of attempts</DocLi>
        <DocLi>A progress bar filled to your average score</DocLi>
      </DocUl>
      <Note>In-progress attempts (started but not submitted) are excluded. The chart only appears after you have submitted your first assessment.</Note>

      <DocH2 id="enrollments">Your groups</DocH2>
      <DocP>
        If your institution uses cohorts or enrolment groups, a <strong>Your groups</strong> card appears at the top. It lists each group you are enrolled in and your status: active, waitlist, completed, or dropped.
      </DocP>
    </DocPage>
  );
}
