export interface BlogPost {
  slug: string;
  title: string;
  excerpt: string;
  category: string;
  date: string;
  readTime: string;
  content: string;
}

export const posts: BlogPost[] = [
  {
    slug: "design-assessments-that-measure-skill",
    title: "How to design assessments that actually measure skill",
    excerpt:
      "Mixing MCQ, short answer, essay, and coding so a paper isn't just recall.",
    category: "Practice",
    date: "May 8, 2026",
    readTime: "6 min",
    content: `
<h2>Why recall-only assessments fall short</h2>
<p>Most exams test memory, not understanding. A student can memorise ten definitions the night before and score 90% without being able to apply a single one. The fix is a question-type mix that forces different cognitive levels.</p>

<h2>The four-layer model</h2>
<p><strong>Multiple-choice questions</strong> are fast to grade and great for breadth — concepts, vocabulary, and reading comprehension. Keep them focused: one idea per stem, four plausible options, one clearly best answer.</p>
<p><strong>Short-answer questions</strong> require the student to produce an answer rather than recognise one. Use accepted-answers lists for objective topics, or flag them for manual review when nuance matters.</p>
<p><strong>Essay questions</strong> reveal reasoning and writing ability. Pair them with a rubric so grading is consistent — ExamPro lets teachers attach a rubric at the question level and score each criterion separately.</p>
<p><strong>Coding questions</strong> are the highest-signal item for technical skills. They run student JavaScript in a sandboxed Web Worker against hidden test cases, giving an objective pass/fail within seconds of submission.</p>

<h2>Practical ratios by assessment kind</h2>
<p>For a 30-minute quiz, lean MCQ-heavy (70%) with a few short-answer questions. For a two-hour exam, aim for 40% MCQ, 30% short, 20% essay, and 10% coding or project. This spread covers recall, application, analysis, and creation — the top four layers of Bloom's taxonomy.</p>

<h2>Shuffle and integrity</h2>
<p>Enable question shuffling to reduce seat-neighbour copying. For high-stakes exams, turn on tab-warning and confirm-on-leave integrity settings. These log events without blocking the student, keeping the experience clean while giving teachers an audit trail.</p>

<h2>Review after every sitting</h2>
<p>Look at per-question pass rates in your analytics page. Any question where more than 80% get it right is probably too easy; below 20% suggests it was ambiguous or not taught. Both are worth revising.</p>
    `.trim(),
  },
  {
    slug: "multi-tenancy-firestore-isolation",
    title: "Multi-tenancy: how ExamPro isolates institution data",
    excerpt:
      "institutionId on every document, join codes, and Firestore rules that match the product.",
    category: "Engineering",
    date: "Apr 28, 2026",
    readTime: "8 min",
    content: `
<h2>The core isolation primitive</h2>
<p>Every document in ExamPro carries an <code>institutionId</code> field stamped at creation time. No queries cross institution boundaries — every <code>where</code> clause begins with <code>institutionId == request.auth.token.institutionId</code>.</p>

<h2>Firestore security rules</h2>
<p>The rules mirror the product logic exactly. Students may read assessments and write their own attempts; teachers may read and write within their institution; admins have full read/write for their institution only. No cross-institution reads are permitted at the rules layer, so a compromised client token cannot leak another institution's data.</p>

<pre><code>match /assessments/{id} {
  allow read: if request.auth.token.institutionId == resource.data.institutionId;
  allow write: if request.auth.token.institutionId == resource.data.institutionId
                  && request.auth.token.role in ['admin', 'teacher'];
}</code></pre>

<h2>Join codes and invite-only mode</h2>
<p>Institutions choose a join mode: open, code-based, domain-restricted, or invite-only. The student registration flow validates the join code against the institution before creating a user profile. Invite-only mode requires a matching <code>Invite</code> document — no code can bypass it.</p>

<h2>Custom domains and slug routing</h2>
<p>Each institution can map a custom subdomain. The Next.js middleware rewrites <code>academy.exampro.io/*</code> to <code>exampro.io/s/academy/*</code>, so the institution's portal lives at a clean URL without a separate deployment.</p>

<h2>What this means for your data</h2>
<p>Your questions, student results, announcements, and certificates are never visible to another institution — not even to the ExamPro team without direct Firestore console access. The isolation is structural, not just policy.</p>
    `.trim(),
  },
  {
    slug: "computer-based-testing-africa",
    title: "Computer-based testing in African institutions",
    excerpt:
      "Why local payments, join codes, and offline-tolerant UX matter more than another feature.",
    category: "Industry",
    date: "Apr 15, 2026",
    readTime: "5 min",
    content: `
<h2>The infrastructure reality</h2>
<p>Most edtech products are designed for reliable 50 Mbps broadband. In many Nigerian secondary schools, a computer lab shares a single 4G hotspot between 30 students. ExamPro autosaves answers every 12 seconds so a dropped connection during an exam doesn't lose work.</p>

<h2>Local payments first</h2>
<p>Stripe is great — but most Nigerian institutions don't have a card that works for USD charges. ExamPro supports Paystack for NGN payments natively: schools pay in naira, funds settle to a local bank account, and the admin sees the plan upgrade immediately after payment.</p>

<h2>Join codes over email verification</h2>
<p>Many K-12 students don't have institutional email addresses. A teacher-issued join code lets a student register with any email (or a parent-provided one) and still end up in the right class on day one. The code is six characters, easy to write on a whiteboard.</p>

<h2>Vocabulary that fits the context</h2>
<p>Nigerian universities say "faculty" and "level", not "department" and "year". Lagos bootcamps say "cohort". The institution admin sets the vocabulary once during onboarding, and every label in the product — buttons, headings, export columns — reflects it.</p>

<h2>What we deliberately left out</h2>
<p>Video proctoring requires upload bandwidth that many sites don't have. Instead, ExamPro logs tab-switch and page-leave events that teachers can review per submission. Webcam presence is noted but not recorded — it deters casual copying without requiring infrastructure most schools can't provide.</p>
    `.trim(),
  },
  {
    slug: "javascript-exam-sandbox-browser",
    title: "A JavaScript exam sandbox in the browser",
    excerpt:
      "Web Workers, test cases, and what we refuse to let student code touch.",
    category: "Engineering",
    date: "Apr 2, 2026",
    readTime: "10 min",
    content: `
<h2>The problem with running student code</h2>
<p>Student code is unpredictable. It might loop forever, access <code>window.location</code>, or call <code>fetch</code>. Running it on the main thread would freeze the UI; running it on the server would open up a remote code execution vector. We run it in a browser Web Worker — a separate thread with no DOM, no global window, and a hard timeout.</p>

<h2>How the sandbox works</h2>
<p>When a student clicks "Run", the exam page serialises their code and the question's test cases into a message and posts it to a freshly-created Worker. The Worker's <code>onmessage</code> handler uses <code>new Function</code> to evaluate the code and calls the student's <code>solve()</code> function with each test case input.</p>

<pre><code>const fn = new Function(
  "input",
  studentCode + "\\n" +
  "if (typeof solve === 'function') return solve(JSON.parse(input));" +
  "throw new Error('Define a function named solve()');"
);
const result = fn(testCase.input);</code></pre>

<h2>What the Worker can't touch</h2>
<p>Workers have no access to the DOM, cookies, localStorage, or the main thread's globals. <code>fetch</code> is technically available in Workers, but a well-configured Content Security Policy blocks outbound requests. The sandbox stops infinite loops with a 4-second <code>setTimeout</code> that terminates the Worker if it hasn't responded.</p>

<h2>Test case format</h2>
<p>Teachers provide input/output pairs when creating a coding question. Inputs can be JSON arrays (for multi-argument functions) or plain strings. The sandbox parses input with <code>JSON.parse</code> and falls back to the raw string if that fails, so <code>solve("hello")</code> and <code>solve(1, 2, 3)</code> both work naturally.</p>

<h2>Partial credit</h2>
<p>If a student passes 3 of 5 test cases, they earn 60% of the question's points. The teacher sees a per-test-case breakdown in the submission detail view and can override the score or leave feedback.</p>

<h2>Other languages</h2>
<p>Python, HTML/CSS, and SQL questions fall through to manual grading — no server-side runner is involved. The HTML live preview uses a sandboxed <code>iframe</code> with <code>sandbox=""</code> and <code>srcDoc</code>, which is safe for rendering but doesn't execute server-side code.</p>
    `.trim(),
  },
];

export function getPost(slug: string): BlogPost | undefined {
  return posts.find((p) => p.slug === slug);
}
