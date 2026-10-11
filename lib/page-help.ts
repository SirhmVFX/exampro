// Route-keyed helper copy shown on dashboard pages so admins, teachers and
// students understand what each page is for and how to use it. Keys are the
// pathname suffix under /dashboard (e.g. "admin/students").

export interface PageHelpEntry {
  title: string;
  purpose: string;
  howItWorks: string[];
}

export const PAGE_HELP: Record<string, PageHelpEntry> = {
  admin: {
    title: "Institution overview",
    purpose:
      "Your command centre — a live snapshot of everyone and everything happening at your school.",
    howItWorks: [
      "Stat cards count students, teachers, assessments and the average pass rate across all attempts.",
      "The join code and invite links on the right are what you share so people can sign up.",
      "Recent Activity shows the latest submissions; use Quick Actions to jump to common tasks.",
    ],
  },
  "admin/students": {
    title: "Managing students",
    purpose: "See every student who has joined and control their access.",
    howItWorks: [
      "Search by name/email and filter by class, then suspend or reactivate a student in one click.",
      "Invite by email to send a join link; pending invites appear below the roster.",
      "Attendance (30d) counts the days each student opened their dashboard this month.",
    ],
  },
  "admin/teachers": {
    title: "Managing teachers",
    purpose: "Add instructors and manage who can create assessments.",
    howItWorks: [
      "Invite teachers by email or share the teacher join link.",
      "Suspend access here if a teacher leaves — their assessments stay in the library.",
    ],
  },
  "admin/questions": {
    title: "Question library",
    purpose: "A shared bank of questions and question sets, filed into subject folders.",
    howItWorks: [
      "Create questions by hand, import a CSV, or generate a set with AI.",
      "Sets are grouped by subject so you can reuse them when building any assessment.",
      "Mark a question shared so other teachers can reuse it too.",
    ],
  },
  "admin/assessments": {
    title: "Assessments",
    purpose: "Quizzes, tests, exams, assignments, projects and practice for the whole school.",
    howItWorks: [
      "Use the sidebar tabs (Quizzes/Tests/Exams…) to filter by kind.",
      "Publish an assessment to make it visible to the selected classes or students.",
      "Open any assessment to review submissions and grades.",
    ],
  },
  "admin/materials": {
    title: "Learning materials",
    purpose: "Documents, PDFs, videos and notes you share with students.",
    howItWorks: [
      "Upload a file or paste a link; assign it to a class or specific students.",
      "Students tick materials as complete — some assessments can require a material first.",
    ],
  },
  "admin/attendance": {
    title: "Attendance",
    purpose: "Track which students are actively showing up.",
    howItWorks: [
      "Attendance is recorded automatically the first time a student opens their dashboard each day.",
      "You can also mark a student present on their behalf from here.",
    ],
  },
  "admin/gradebook": {
    title: "Gradebook",
    purpose: "Per-student marks across subjects and terms in one table.",
    howItWorks: [
      "Best attempt per assessment is used to compute each subject mark.",
      "Filter by class and term, then export for records.",
    ],
  },
  "admin/certificates": {
    title: "Certificates",
    purpose: "Issue completion certificates and send them to students.",
    howItWorks: [
      "Issue a certificate to generate a public verify code and link.",
      "Upload a template, place the name, and batch-send personalised certificates by email.",
    ],
  },
  "admin/announcements": {
    title: "Announcements",
    purpose: "Broadcast notices to students, teachers, or everyone.",
    howItWorks: [
      "Write a message and choose an audience — it lands in their notification bell.",
      "Sent announcements are listed with a read count.",
    ],
  },
  "admin/sessions": {
    title: "Live sessions",
    purpose: "Schedule online classes and share the join link with students.",
    howItWorks: [
      "Add the title, the meeting link (Zoom/Meet/Teams), start time and duration.",
      "Choose who it is for — everyone, selected classes, or specific students.",
      "Students are notified and see the session on their dashboard.",
    ],
  },
  "admin/student-analytics": {
    title: "Student analytics",
    purpose: "A detailed look at how each student is progressing.",
    howItWorks: [
      "Pick a student to see averages, pass rate, subject breakdown, weakest topics and attendance.",
      "Use the class/subject filters to compare cohorts at a glance.",
    ],
  },
  "admin/messages": {
    title: "Message parents",
    purpose: "Email parents and guardians directly about their child.",
    howItWorks: [
      "Select one or more students — we resolve their parent/guardian email automatically.",
      "Write your message and send; delivery is logged below.",
      "Students provide a parent email when they sign up.",
    ],
  },
  "admin/analytics": {
    title: "Analytics",
    purpose: "How the whole institution is performing.",
    howItWorks: [
      "Roll-ups by subject and by assessment help you spot where students struggle.",
      "Data appears once students start submitting work.",
    ],
  },
  "admin/export": {
    title: "Export & data",
    purpose: "Download results, questions, roster and individual student data.",
    howItWorks: [
      "Export whole categories as CSV, or select students for a detailed report.",
      "Send a student's summary straight to their parent by email.",
    ],
  },
  "admin/ai": {
    title: "AI question generator",
    purpose: "Generate tests, exams, quizzes and practice questions with AI.",
    howItWorks: [
      "Pick subject, topic, difficulty and format, then generate.",
      "Save the result to the question library so you can import it into any assessment.",
    ],
  },
  "admin/submissions": {
    title: "All submissions",
    purpose:
      "Every attempt across the institution — review auto-graded work and mark essays or projects by hand.",
    howItWorks: [
      "Filter by status to find the ones that still need grading.",
      "Search by student or assessment, sort by score, and open a row to review it.",
    ],
  },
  "admin/audit": {
    title: "Audit log",
    purpose: "A trail of who changed what and when across your institution.",
    howItWorks: [
      "Imports, certificates and settings changes are recorded here automatically.",
      "Filter by entity type or search for a person or action.",
    ],
  },
  "admin/website": {
    title: "Institution website",
    purpose:
      "Build the public landing page students and teachers see when you share your school link.",
    howItWorks: [
      "Pick a template, write your headline and about text, and add a few highlights.",
      "The live preview on the right reflects your branding colours and content instantly.",
      "Copy the public link to share it — sign-in and join buttons appear automatically.",
    ],
  },
  teacher: {
    title: "Teacher overview",
    purpose: "Your classroom at a glance.",
    howItWorks: [
      "Stat cards show your questions, assessments, materials and what needs grading.",
      "Jump straight into creating with the action buttons.",
    ],
  },
  "teacher/questions": {
    title: "Your question library",
    purpose: "Create and organise the questions you reuse across assessments.",
    howItWorks: [
      "Add questions manually, import a CSV, or generate a set with AI.",
      "Shared questions are visible to colleagues too.",
    ],
  },
  "teacher/assessments": {
    title: "Your assessments",
    purpose: "Build and publish quizzes, tests, exams and assignments.",
    howItWorks: [
      "Create an assessment, pull questions from your library, and publish to a class.",
      "Sidebar tabs filter by kind (Quizzes/Tests/Exams…).",
    ],
  },
  "teacher/submissions": {
    title: "Submissions",
    purpose: "Grade the work your students hand in.",
    howItWorks: [
      "Auto-marked questions are graded instantly; essays and projects wait for you here.",
      "Open a submission to award points and leave feedback.",
    ],
  },
  "teacher/students": {
    title: "Your students",
    purpose: "The learners in your classes.",
    howItWorks: [
      "Search and filter by class to find a student quickly.",
      "Use analytics and messaging to follow up on anyone who needs support.",
    ],
  },
  "teacher/sessions": {
    title: "Live sessions",
    purpose: "Schedule online classes for your students.",
    howItWorks: [
      "Provide the title, meeting link, start time and duration, then choose the audience.",
      "Students are notified and see the session on their dashboard.",
    ],
  },
  "teacher/student-analytics": {
    title: "Student analytics",
    purpose: "Track each of your students' progress in detail.",
    howItWorks: [
      "Select a student to see averages, pass rate, subject breakdown and weak topics.",
      "At-risk flags surface students who may need a check-in.",
    ],
  },
  "teacher/messages": {
    title: "Message parents",
    purpose: "Email a student's parent or guardian.",
    howItWorks: [
      "Pick students, write your note, and send — parent emails are resolved from their profile.",
    ],
  },
  "teacher/analytics": {
    title: "Your analytics",
    purpose: "How your students are doing across your assessments.",
    howItWorks: [
      "See pass rates by subject and by assessment.",
      "Data appears after students submit work.",
    ],
  },
  "teacher/ai": {
    title: "AI question generator",
    purpose: "Generate tests, quizzes and practice questions with AI.",
    howItWorks: [
      "Pick subject, topic, difficulty and format, then generate.",
      "Save the result to your question library so you can import it into any assessment.",
    ],
  },
  "teacher/materials": {
    title: "Learning materials",
    purpose: "Share notes, PDFs, videos and links with your students.",
    howItWorks: [
      "Add a material and assign it to a whole class or specific students.",
      "Optionally require a follow-up assessment once they finish it.",
    ],
  },
  "teacher/attendance": {
    title: "Attendance",
    purpose: "Daily login-based attendance for the students in your classes.",
    howItWorks: [
      "Presence is recorded automatically when a student opens their dashboard.",
      "Filter by class, search a student, and sort by streak to spot anyone slipping.",
    ],
  },
  "teacher/certificates": {
    title: "Certificates",
    purpose: "Issue and send certificates to your students.",
    howItWorks: [
      "Use a template to merge each student's name onto an image, then email it.",
      "Every certificate gets a verify code anyone can check.",
    ],
  },
  "teacher/export": {
    title: "Export & send data",
    purpose:
      "Download your students' results, or send a progress summary to their parents.",
    howItWorks: [
      "Select students to build a combined CSV/JSON bundle.",
      "Send to parents emails each selected student's summary to their guardian.",
    ],
  },
  student: {
    title: "Your dashboard",
    purpose: "Everything you need to learn and get assessed, in one place.",
    howItWorks: [
      "Start any available assessment from here.",
      "Keep an eye on upcoming live sessions and due-soon tasks.",
      "Your average score and completed materials update automatically.",
    ],
  },
  "student/assessments": {
    title: "Your assessments",
    purpose: "Quizzes, tests and assignments set for you.",
    howItWorks: [
      "Open an assessment and press Start — a timer runs if it is timed.",
      "Some assessments unlock only after you finish the required material or previous task.",
    ],
  },
  "student/materials": {
    title: "Learning materials",
    purpose: "The lessons and resources your teachers share.",
    howItWorks: [
      "Read or watch a material, then mark it complete.",
      "Completing a required material can unlock its assessment.",
    ],
  },
  "student/results": {
    title: "Your results",
    purpose: "Scores and feedback for everything you have completed.",
    howItWorks: [
      "Open a result to see per-question marks and teacher comments.",
      "Pass/fail reflects the pass mark your teacher set.",
    ],
  },
  "student/sessions": {
    title: "Live sessions",
    purpose: "Your scheduled online classes.",
    howItWorks: [
      "Upcoming sessions show a Join link that opens at the scheduled time.",
      "Past sessions are listed for reference.",
    ],
  },
  "student/practice": {
    title: "AI practice",
    purpose: "Extra practice questions generated for the topics you find hardest.",
    howItWorks: [
      "Practice does not affect your graded results — use it to improve.",
      "We focus new questions on your weak topics over time.",
    ],
  },
  "student/progress": {
    title: "Your progress",
    purpose: "How you are doing over time.",
    howItWorks: [
      "Track your average, subject strengths and attendance streak.",
    ],
  },
  "student/certificates": {
    title: "Your certificates",
    purpose: "Certificates issued to you, with a link anyone can verify.",
    howItWorks: [
      "Download or share your certificate; the verify code proves it is genuine.",
    ],
  },
};

export function pageHelpFor(pathname: string): PageHelpEntry | null {
  const m = pathname.match(/\/dashboard\/(.+)/);
  if (!m) return null;
  const key = m[1].replace(/\/+$/, "");
  if (PAGE_HELP[key]) return PAGE_HELP[key];
  // For detail routes (e.g. "admin/submissions/123") fall back to the parent
  // page's copy — but never to a different section's role overview.
  const parts = key.split("/");
  while (parts.length > 2) {
    parts.pop();
    const candidate = parts.join("/");
    if (PAGE_HELP[candidate]) return PAGE_HELP[candidate];
  }
  return null;
}
