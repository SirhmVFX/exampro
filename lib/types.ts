// ─── Core domain types for ExamPro (multi-tenant assessment SaaS) ───

export type Role = "admin" | "teacher" | "student" | "parent" | "manager";

export type PlanId = "free" | "starter" | "growth" | "enterprise";

export type InstitutionType =
  | "k12"
  | "university"
  | "training"
  | "corporate"
  | "tutoring"
  | "faith"
  | "language"
  | "professional"
  | "other";

export type JoinMode = "code" | "invite_only" | "open" | "domain";

export interface Vocabulary {
  student: string;
  students: string;
  teacher: string;
  teachers: string;
  class: string;
  classes: string;
  admin: string;
}

export interface Institution {
  id: string;
  name: string;
  code: string;
  type: InstitutionType;
  email: string;
  phone?: string;
  address?: string;
  country?: string;
  website?: string;
  logoUrl?: string;
  primaryColor?: string;
  accentColor?: string;
  slug?: string;
  classLabel: string;
  classes: string[];
  subjects: string[];
  skills?: string[];
  vocabulary?: Vocabulary;
  joinMode?: JoinMode;
  allowedEmailDomains?: string[];
  adminId: string;
  adminIds?: string[];
  onboarded: boolean;
  plan: PlanId;
  planStatus: "active" | "past_due" | "canceled";
  planRenewsAt?: number;
  trialEndsAt?: number;        // ms timestamp — set 30 days after creation; absent = no trial
  aiGenerationsUsed: number;
  createdAt: number;
}

export interface Accommodations {
  extraTimePercent?: number;
  largerText?: boolean;
  skipQuestionTypes?: QuestionType[];
}

export interface UserProfile {
  uid: string;
  institutionId: string;
  role: Role;
  name: string;
  email: string;
  avatarUrl?: string;
  status: "active" | "suspended";
  externalId?: string;
  departmentId?: string;
  departmentName?: string;
  subjects?: string[];
  classes?: string[];
  className?: string;
  classNames?: string[];
  linkedStudentIds?: string[];
  parentEmail?: string;
  parentIds?: string[];
  accommodations?: Accommodations;
  createdAt: number;
}

/** One person can belong to many institutions. The user doc holds the active one. */
export interface Membership {
  id: string;
  uid: string;
  institutionId: string;
  institutionName?: string;
  role: Role;
  name: string;
  email: string;
  status: "active" | "suspended";
  className?: string;
  classNames?: string[];
  classes?: string[];
  subjects?: string[];
  departmentId?: string;
  departmentName?: string;
  externalId?: string;
  createdAt: number;
}

export interface Invite {
  id: string;
  institutionId: string;
  institutionName: string;
  email: string;
  name?: string;
  role: "teacher" | "student" | "parent" | "manager";
  className?: string;
  classNames?: string[];
  externalId?: string;
  status: "pending" | "accepted";
  createdAt: number;
}

export interface Department {
  id: string;
  institutionId: string;
  name: string;
  managerId?: string;
  createdAt: number;
}

export interface Term {
  id: string;
  institutionId: string;
  name: string;
  startAt: number;
  endAt: number;
  status: "upcoming" | "active" | "closed";
  createdAt: number;
}

export interface Cohort {
  id: string;
  institutionId: string;
  name: string;
  termId?: string;
  departmentId?: string;
  startAt?: number;
  endAt?: number;
  capacity?: number;
  status: "open" | "closed";
  createdAt: number;
}

export type EnrollmentStatus =
  | "active"
  | "waitlist"
  | "completed"
  | "dropped"
  | "alumni";

export interface Enrollment {
  id: string;
  institutionId: string;
  userId: string;
  userName: string;
  cohortId: string;
  cohortName: string;
  status: EnrollmentStatus;
  startedAt: number;
  endedAt?: number;
}

export interface RubricCriterion {
  id: string;
  name: string;
  description?: string;
  maxPoints: number;
}

export interface Rubric {
  id: string;
  institutionId: string;
  teacherId: string;
  name: string;
  criteria: RubricCriterion[];
  createdAt: number;
}

export interface PathItem {
  id: string;
  type: "material" | "assessment";
  refId: string;
  title: string;
  required: boolean;
  passPercent?: number;
}

export interface LearningPath {
  id: string;
  institutionId: string;
  title: string;
  description?: string;
  className?: string;
  items: PathItem[];
  createdAt: number;
}

export interface Certificate {
  id: string;
  institutionId: string;
  institutionName: string;
  userId: string;
  userName: string;
  title: string;
  cohortName?: string;
  skills?: string[];
  verifyCode: string;
  issuedAt: number;
}

export interface AuditEvent {
  id: string;
  institutionId: string;
  actorId: string;
  actorName: string;
  action: string;
  entityType: string;
  entityId?: string;
  detail?: string;
  createdAt: number;
}

export type QuestionType =
  | "mcq"
  | "truefalse"
  | "short"
  | "essay"
  | "coding"
  | "project";

export interface TestCase {
  input: string;
  expectedOutput: string;
}

export interface Question {
  id: string;
  institutionId: string;
  teacherId: string;
  subject: string;
  className: string;
  topic?: string;
  skill?: string;
  type: QuestionType;
  text: string;
  points: number;
  explanation?: string;
  options?: string[];
  correctIndex?: number;
  correctBool?: boolean;
  acceptedAnswers?: string[];
  language?: "javascript" | "python" | "html" | "css" | "sql" | "other";
  starterCode?: string;
  testCases?: TestCase[];
  rubricId?: string;
  shared?: boolean;
  aiGenerated?: boolean;
  createdAt: number;
}

export type AssessmentKind =
  | "quiz"
  | "test"
  | "exam"
  | "assignment"
  | "project"
  | "practice";

export type AssessmentMode = "live" | "practice" | "self_paced";

export interface IntegritySettings {
  confirmLeave?: boolean;
  tabWarning?: boolean;
  webcam?: boolean;
  lockOnSubmit?: boolean;
}

export interface Assessment {
  id: string;
  institutionId: string;
  teacherId: string;
  teacherName: string;
  title: string;
  description?: string;
  kind: AssessmentKind;
  mode?: AssessmentMode;
  subject: string;
  className: string;
  classNames?: string[];
  termId?: string;
  departmentId?: string;
  questions: Question[];
  durationMins: number;
  totalPoints: number;
  passPercent: number;
  shuffleQuestions: boolean;
  allowRetake: boolean;
  maxAttempts: number;
  showResultsImmediately: boolean;
  requiredMaterialId?: string;
  requiredAssessmentId?: string;
  rubricId?: string;
  integrity?: IntegritySettings;
  assignedStudentIds?: string[];
  status: "draft" | "published" | "closed";
  startAt?: number;
  endAt?: number;
  createdAt: number;
}

export interface RubricScore {
  criterionId: string;
  points: number;
}

export interface PerQuestionResult {
  questionId: string;
  answer: unknown;
  correct: boolean | null;
  pointsAwarded: number;
  maxPoints: number;
  teacherFeedback?: string;
  rubricScores?: RubricScore[];
  fileUrl?: string;
  githubUrl?: string;
}

export interface AttemptEvent {
  type:
  | "start"
  | "resume"
  | "autosave"
  | "tab_blur"
  | "tab_focus"
  | "leave_attempt"
  | "webcam_on"
  | "webcam_off"
  | "submit";
  at: number;
  detail?: string;
}

export interface Attempt {
  id: string;
  institutionId: string;
  assessmentId: string;
  assessmentTitle: string;
  assessmentKind: AssessmentKind;
  subject: string;
  className: string;
  teacherId: string;
  studentId: string;
  studentName: string;
  attemptNumber: number;
  perQuestion: PerQuestionResult[];
  score: number;
  maxScore: number;
  percent: number;
  passed: boolean;
  needsManualGrading: boolean;
  status: "in_progress" | "submitted" | "graded";
  startedAt: number;
  submittedAt?: number;
  timeTakenSecs?: number;
  events?: AttemptEvent[];
  locked?: boolean;
  extraTimePercent?: number;
}

export type MaterialType = "document" | "video" | "link" | "note";

export interface Material {
  id: string;
  institutionId: string;
  teacherId: string;
  teacherName: string;
  title: string;
  description?: string;
  subject: string;
  className: string;
  type: MaterialType;
  url?: string;
  content?: string;
  linkedAssessmentId?: string;
  createdAt: number;
}

export interface MaterialProgress {
  id: string;
  institutionId: string;
  materialId: string;
  studentId: string;
  completed: boolean;
  completedAt?: number;
}

export type Audience = "all" | "students" | "teachers" | "user";

export interface Notification {
  id: string;
  institutionId: string;
  title: string;
  body: string;
  audience: Audience;
  targetUserId?: string;
  senderId: string;
  senderName: string;
  senderRole: Role;
  readBy: string[];
  createdAt: number;
}

export interface PaymentRecord {
  id: string;
  institutionId: string;
  provider: "paystack" | "stripe";
  reference: string;
  plan: PlanId;
  amount: number;
  currency: string;
  status: "success" | "failed" | "pending";
  createdAt: number;
}
