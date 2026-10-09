// Firestore data-access helpers. All collections are top-level and scoped by
// institutionId so a single Firebase project serves every tenant.
import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit as fbLimit,
  onSnapshot,
  arrayUnion,
  increment,
  Unsubscribe,
} from "firebase/firestore";
import { db } from "./firebase";
import type {
  Institution,
  UserProfile,
  Invite,
  Question,
  Assessment,
  Attempt,
  AttemptEvent,
  Material,
  MaterialProgress,
  Notification,
  PaymentRecord,
  Role,
  PlanId,
  Department,
  Term,
  Cohort,
  Enrollment,
  EnrollmentStatus,
  Rubric,
  LearningPath,
  Certificate,
  AuditEvent,
  Membership,
} from "./types";
import { assessmentVisibleTo, learnerClassNames } from "./learners";
import { isReservedSlug, isValidSlug, slugify } from "./domain";
import { defaultVocabulary } from "./vocab";

export const COL = {
  institutions: "institutions",
  users: "users",
  invites: "invites",
  questions: "questions",
  assessments: "assessments",
  attempts: "attempts",
  materials: "materials",
  materialProgress: "materialProgress",
  notifications: "notifications",
  payments: "payments",
  departments: "departments",
  terms: "terms",
  cohorts: "cohorts",
  enrollments: "enrollments",
  rubrics: "rubrics",
  paths: "paths",
  certificates: "certificates",
  audit: "audit",
  memberships: "memberships",
} as const;

export function newId(col: string): string {
  return doc(collection(db, col)).id;
}

export function generateJoinCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  return Array.from(
    { length: 6 },
    () => chars[Math.floor(Math.random() * chars.length)]
  ).join("");
}

/** Firestore rejects undefined values — strip them before writing. */
function clean<T extends object>(data: T): T {
  return JSON.parse(JSON.stringify(data)) as T;
}

// ─── Institutions ───

export async function createInstitution(inst: Institution) {
  await setDoc(doc(db, COL.institutions, inst.id), clean(inst));
}

export async function createAdditionalInstitution(opts: {
  admin: UserProfile;
  name: string;
  type: Institution["type"];
  email?: string;
  country?: string;
  phone?: string;
  website?: string;
}): Promise<Institution> {
  const instId = newId(COL.institutions);
  const slug = await allocateSlug(opts.name);
  const vocab = defaultVocabulary(opts.type);
  const inst: Institution = {
    id: instId,
    name: opts.name,
    code: generateJoinCode(),
    slug,
    type: opts.type,
    email: opts.email || opts.admin.email,
    phone: opts.phone,
    country: opts.country,
    website: opts.website,
    classLabel: vocab.class,
    classes: [],
    subjects: [],
    vocabulary: vocab,
    joinMode: "code",
    adminId: opts.admin.uid,
    adminIds: [opts.admin.uid],
    onboarded: false,
    plan: "free",
    planStatus: "active",
    primaryColor: "#000000",
    accentColor: "#000000",
    aiGenerationsUsed: 0,
    createdAt: Date.now(),
  };
  await createInstitution(inst);
  await joinInstitution({
    user: opts.admin,
    institution: inst,
    role: "admin",
    makeActive: true,
  });
  return inst;
}

export async function getInstitution(id: string): Promise<Institution | null> {
  const snap = await getDoc(doc(db, COL.institutions, id));
  return snap.exists() ? (snap.data() as Institution) : null;
}

export async function getInstitutionByCode(
  code: string
): Promise<Institution | null> {
  const snap = await getDocs(
    query(
      collection(db, COL.institutions),
      where("code", "==", code.toUpperCase().trim()),
      fbLimit(1)
    )
  );
  return snap.empty ? null : (snap.docs[0].data() as Institution);
}

export async function getInstitutionBySlug(
  slug: string
): Promise<Institution | null> {
  const value = slugify(slug);
  if (!value) return null;
  const snap = await getDocs(
    query(collection(db, COL.institutions), where("slug", "==", value), fbLimit(1))
  );
  return snap.empty ? null : (snap.docs[0].data() as Institution);
}

export async function allocateSlug(
  name: string,
  excludeId?: string
): Promise<string> {
  const base = slugify(name);
  let candidate = base;
  let n = 2;
  while (n < 80) {
    if (!isReservedSlug(candidate)) {
      const existing = await getInstitutionBySlug(candidate);
      if (!existing || existing.id === excludeId) return candidate;
    }
    candidate = `${base}-${n++}`;
  }
  return `${base}-${Date.now().toString(36)}`;
}

export async function assertSlugAvailable(
  slug: string,
  excludeId?: string
): Promise<string> {
  const value = slugify(slug);
  if (!isValidSlug(value)) {
    throw new Error(
      "Domain must be 2–48 characters: lowercase letters, numbers, and hyphens."
    );
  }
  const existing = await getInstitutionBySlug(value);
  if (existing && existing.id !== excludeId) {
    throw new Error("That domain is already taken. Try another.");
  }
  return value;
}

export async function updateInstitution(
  id: string,
  data: Partial<Institution>
) {
  await updateDoc(doc(db, COL.institutions, id), clean(data));
}

export async function incrementAiUsage(institutionId: string) {
  await updateDoc(doc(db, COL.institutions, institutionId), {
    aiGenerationsUsed: increment(1),
  });
}

export async function setInstitutionPlan(
  institutionId: string,
  plan: PlanId,
  renewsAt: number
) {
  await updateDoc(doc(db, COL.institutions, institutionId), {
    plan,
    planStatus: "active",
    planRenewsAt: renewsAt,
    aiGenerationsUsed: 0,
  });
}

/**
 * Call this on every billing page load.
 * - If the institution is on a paid plan whose renewsAt has passed, reverts to Free.
 * - If it's still on Free and trialEndsAt has passed, marks planStatus "past_due"
 *   so the admin sees an urgent upgrade banner.
 * Returns the (possibly updated) institution.
 */
export async function checkAndExpirePlan(institution: Institution): Promise<Institution> {
  const now = Date.now();

  // Paid plan that has expired (manual monthly payments, no auto-renew)
  if (
    institution.plan !== "free" &&
    institution.plan !== "enterprise" &&
    institution.planRenewsAt &&
    now > institution.planRenewsAt &&
    institution.planStatus === "active"
  ) {
    await updateDoc(doc(db, COL.institutions, institution.id), {
      plan: "free",
      planStatus: "active",
      planRenewsAt: null,
      aiGenerationsUsed: 0,
    });
    return { ...institution, plan: "free", planStatus: "active", planRenewsAt: undefined, aiGenerationsUsed: 0 };
  }

  // Free plan trial expired — flag as past_due so billing page shows upgrade CTA
  if (
    institution.plan === "free" &&
    institution.trialEndsAt &&
    now > institution.trialEndsAt &&
    institution.planStatus !== "past_due"
  ) {
    await updateDoc(doc(db, COL.institutions, institution.id), {
      planStatus: "past_due",
    });
    return { ...institution, planStatus: "past_due" };
  }

  return institution;
}

// ─── Users ───

export function membershipDocId(uid: string, institutionId: string): string {
  return `${uid}_${institutionId}`;
}

export function membershipFromProfile(
  profile: UserProfile,
  institutionName?: string
): Membership {
  return {
    id: membershipDocId(profile.uid, profile.institutionId),
    uid: profile.uid,
    institutionId: profile.institutionId,
    institutionName,
    role: profile.role,
    name: profile.name,
    email: profile.email,
    status: profile.status,
    className: profile.className,
    classNames: profile.classNames,
    classes: profile.classes,
    subjects: profile.subjects,
    departmentId: profile.departmentId,
    departmentName: profile.departmentName,
    externalId: profile.externalId,
    createdAt: profile.createdAt,
  };
}

export function profileFromMembership(
  m: Membership,
  identity?: UserProfile | null
): UserProfile {
  return {
    uid: m.uid,
    institutionId: m.institutionId,
    role: m.role,
    name: m.name || identity?.name || "",
    email: m.email || identity?.email || "",
    avatarUrl: identity?.avatarUrl,
    status: m.status,
    externalId: m.externalId ?? identity?.externalId,
    departmentId: m.departmentId,
    departmentName: m.departmentName,
    subjects: m.subjects,
    classes: m.classes,
    className: m.className,
    classNames: m.classNames,
    linkedStudentIds: identity?.linkedStudentIds,
    parentEmail: identity?.parentEmail,
    parentIds: identity?.parentIds,
    accommodations: identity?.accommodations,
    createdAt: m.createdAt,
  };
}

export async function saveMembership(m: Membership) {
  await setDoc(doc(db, COL.memberships, m.id), clean(m));
}

export async function getMembership(
  uid: string,
  institutionId: string
): Promise<Membership | null> {
  const snap = await getDoc(doc(db, COL.memberships, membershipDocId(uid, institutionId)));
  return snap.exists() ? (snap.data() as Membership) : null;
}

export async function listMembershipsForUser(uid: string): Promise<Membership[]> {
  const snap = await getDocs(
    query(collection(db, COL.memberships), where("uid", "==", uid))
  );
  return snap.docs
    .map((d) => d.data() as Membership)
    .sort((a, b) => a.createdAt - b.createdAt);
}

export async function listMembershipsForInstitution(
  institutionId: string,
  role?: Role
): Promise<Membership[]> {
  const constraints = [where("institutionId", "==", institutionId)];
  if (role) constraints.push(where("role", "==", role));
  const snap = await getDocs(query(collection(db, COL.memberships), ...constraints));
  return snap.docs
    .map((d) => d.data() as Membership)
    .sort((a, b) => a.name.localeCompare(b.name));
}

export async function ensureMembership(
  profile: UserProfile,
  institutionName?: string
): Promise<Membership> {
  const existing = await getMembership(profile.uid, profile.institutionId);
  if (existing) return existing;
  const m = membershipFromProfile(profile, institutionName);
  await saveMembership(m);
  return m;
}

export async function switchActiveInstitution(
  uid: string,
  institutionId: string
): Promise<UserProfile> {
  const [user, membership] = await Promise.all([
    getUserProfile(uid),
    getMembership(uid, institutionId),
  ]);
  if (!user) throw new Error("Account not found.");
  if (!membership) throw new Error("You are not a member of that institution.");
  if (membership.status === "suspended") {
    throw new Error("Your access to that institution is suspended.");
  }
  await updateDoc(
    doc(db, COL.users, uid),
    clean({
      institutionId: membership.institutionId,
      role: membership.role,
      className: membership.className ?? null,
      classNames: membership.classNames ?? [],
      classes: membership.classes ?? [],
      subjects: membership.subjects ?? [],
      departmentId: membership.departmentId ?? null,
      departmentName: membership.departmentName ?? null,
      externalId: membership.externalId ?? null,
      status: membership.status,
    })
  );
  const next = await getUserProfile(uid);
  if (!next) throw new Error("Couldn't switch institution.");
  return next;
}

export async function joinInstitution(opts: {
  user: UserProfile;
  institution: Institution;
  role: Role;
  className?: string;
  classNames?: string[];
  classes?: string[];
  subjects?: string[];
  makeActive?: boolean;
}): Promise<Membership> {
  const existing = await getMembership(opts.user.uid, opts.institution.id);
  if (existing) {
    throw new Error(`You already belong to ${opts.institution.name}. Switch to it from the sidebar.`);
  }
  const classNames =
    opts.classNames?.length
      ? opts.classNames
      : opts.className
        ? [opts.className]
        : opts.user.classNames ?? [];
  const m: Membership = {
    id: membershipDocId(opts.user.uid, opts.institution.id),
    uid: opts.user.uid,
    institutionId: opts.institution.id,
    institutionName: opts.institution.name,
    role: opts.role,
    name: opts.user.name,
    email: opts.user.email,
    status: "active",
    className: classNames[0] || opts.className,
    classNames,
    classes: opts.classes,
    subjects: opts.subjects,
    createdAt: Date.now(),
  };
  await saveMembership(m);
  if (opts.role === "admin") {
    const adminIds = Array.from(
      new Set([...(opts.institution.adminIds ?? []), opts.institution.adminId, opts.user.uid])
    );
    await updateInstitution(opts.institution.id, { adminIds });
  }
  if (opts.makeActive !== false) {
    await switchActiveInstitution(opts.user.uid, opts.institution.id);
  }
  return m;
}

export async function createUserProfile(profile: UserProfile) {
  await setDoc(doc(db, COL.users, profile.uid), clean(profile));
  await ensureMembership(profile);
}

export async function getUserProfile(
  uid: string
): Promise<UserProfile | null> {
  const snap = await getDoc(doc(db, COL.users, uid));
  return snap.exists() ? (snap.data() as UserProfile) : null;
}

/** Signup writes Auth first, then Firestore — retry so the profile is visible. */
export async function waitForUserProfile(
  uid: string,
  attempts = 10,
  delayMs = 300
): Promise<UserProfile | null> {
  for (let i = 0; i < attempts; i++) {
    const profile = await getUserProfile(uid);
    if (profile) return profile;
    await new Promise((r) => setTimeout(r, delayMs));
  }
  return null;
}

export async function updateUserProfile(
  uid: string,
  data: Partial<UserProfile>
) {
  await updateDoc(doc(db, COL.users, uid), clean(data));
  const [user, memberships] = await Promise.all([
    getUserProfile(uid),
    listMembershipsForUser(uid),
  ]);
  if (!user || !memberships.length) return;
  const identity: Partial<Membership> = {};
  if (data.name !== undefined) identity.name = data.name;
  if (data.email !== undefined) identity.email = data.email;
  for (const m of memberships) {
    const patch: Partial<Membership> = { ...identity };
    if (m.institutionId === user.institutionId) {
      if (data.role !== undefined) patch.role = data.role;
      if (data.status !== undefined) patch.status = data.status;
      if (data.className !== undefined) patch.className = data.className;
      if (data.classNames !== undefined) patch.classNames = data.classNames;
      if (data.classes !== undefined) patch.classes = data.classes;
      if (data.subjects !== undefined) patch.subjects = data.subjects;
      if (data.departmentId !== undefined) patch.departmentId = data.departmentId;
      if (data.departmentName !== undefined) patch.departmentName = data.departmentName;
      if (data.externalId !== undefined) patch.externalId = data.externalId;
    }
    if (Object.keys(patch).length) {
      await updateDoc(doc(db, COL.memberships, m.id), clean(patch));
    }
  }
}

export async function listUsers(
  institutionId: string,
  role?: Role
): Promise<UserProfile[]> {
  const [memberships, snap] = await Promise.all([
    listMembershipsForInstitution(institutionId, role),
    getDocs(
      query(
        collection(db, COL.users),
        ...(role
          ? [where("institutionId", "==", institutionId), where("role", "==", role)]
          : [where("institutionId", "==", institutionId)])
      )
    ),
  ]);
  const legacy = snap.docs.map((d) => d.data() as UserProfile);
  const identityByUid = new Map(legacy.map((u) => [u.uid, u]));
  const byUid = new Map<string, UserProfile>();
  for (const u of legacy) byUid.set(u.uid, u);
  for (const m of memberships) {
    byUid.set(m.uid, profileFromMembership(m, identityByUid.get(m.uid) ?? byUid.get(m.uid)));
  }
  return [...byUid.values()].sort((a, b) => a.name.localeCompare(b.name));
}

// ─── Invites ───

export async function createInvite(invite: Invite) {
  await setDoc(doc(db, COL.invites, invite.id), clean(invite));
}

export async function listInvites(institutionId: string): Promise<Invite[]> {
  const snap = await getDocs(
    query(
      collection(db, COL.invites),
      where("institutionId", "==", institutionId)
    )
  );
  return snap.docs
    .map((d) => d.data() as Invite)
    .sort((a, b) => b.createdAt - a.createdAt);
}

export async function deleteInvite(id: string) {
  await deleteDoc(doc(db, COL.invites, id));
}

export async function getPendingInviteByEmail(
  institutionId: string,
  email: string
): Promise<Invite | null> {
  const all = await listInvites(institutionId);
  const needle = email.toLowerCase().trim();
  return (
    all.find((i) => i.email.toLowerCase() === needle && i.status === "pending") ??
    null
  );
}

export async function getPendingInviteAnywhere(
  email: string
): Promise<Invite | null> {
  const snap = await getDocs(
    query(
      collection(db, COL.invites),
      where("email", "==", email.toLowerCase().trim()),
      where("status", "==", "pending"),
      fbLimit(1)
    )
  );
  return snap.empty ? null : (snap.docs[0].data() as Invite);
}

export async function acceptInvite(id: string) {
  await updateDoc(doc(db, COL.invites, id), { status: "accepted" });
}

// ─── Questions ───

export async function saveQuestion(q: Question) {
  await setDoc(doc(db, COL.questions, q.id), clean(q));
}

export async function deleteQuestion(id: string) {
  await deleteDoc(doc(db, COL.questions, id));
}

export async function listQuestions(
  institutionId: string,
  teacherId?: string
): Promise<Question[]> {
  const snap = await getDocs(
    query(
      collection(db, COL.questions),
      where("institutionId", "==", institutionId)
    )
  );
  const all = snap.docs.map((d) => d.data() as Question);
  const filtered = teacherId
    ? all.filter((q) => q.teacherId === teacherId || q.shared)
    : all;
  return filtered.sort((a, b) => b.createdAt - a.createdAt);
}

// ─── Assessments ───

export async function saveAssessment(a: Assessment) {
  await setDoc(doc(db, COL.assessments, a.id), clean(a));
}

export async function getAssessment(id: string): Promise<Assessment | null> {
  const snap = await getDoc(doc(db, COL.assessments, id));
  return snap.exists() ? (snap.data() as Assessment) : null;
}

export async function updateAssessment(id: string, data: Partial<Assessment>) {
  await updateDoc(doc(db, COL.assessments, id), clean(data));
}

export async function deleteAssessment(id: string) {
  await deleteDoc(doc(db, COL.assessments, id));
}

export async function listAssessmentsByTeacher(
  institutionId: string,
  teacherId: string
): Promise<Assessment[]> {
  const snap = await getDocs(
    query(
      collection(db, COL.assessments),
      where("institutionId", "==", institutionId),
      where("teacherId", "==", teacherId)
    )
  );
  return snap.docs
    .map((d) => d.data() as Assessment)
    .sort((a, b) => b.createdAt - a.createdAt);
}

export async function listAssessmentsForClass(
  institutionId: string,
  className: string
): Promise<Assessment[]> {
  return listAssessmentsForClasses(institutionId, [className]);
}

export async function listAssessmentsForClasses(
  institutionId: string,
  classNames: string[]
): Promise<Assessment[]> {
  const all = await listAllAssessments(institutionId);
  return all.filter((a) => assessmentVisibleTo(a, classNames));
}

export async function listAssessmentsForLearner(
  institutionId: string,
  profile: UserProfile
): Promise<Assessment[]> {
  const all = await listAllAssessments(institutionId);
  const classNames = learnerClassNames(profile);
  return all.filter((a) => assessmentVisibleTo(a, classNames, profile.uid));
}

export async function listAllAssessments(
  institutionId: string
): Promise<Assessment[]> {
  const snap = await getDocs(
    query(
      collection(db, COL.assessments),
      where("institutionId", "==", institutionId)
    )
  );
  return snap.docs
    .map((d) => d.data() as Assessment)
    .sort((a, b) => b.createdAt - a.createdAt);
}

// ─── Attempts ───

export async function saveAttempt(attempt: Attempt) {
  await setDoc(doc(db, COL.attempts, attempt.id), clean(attempt));
}

export async function updateAttempt(id: string, data: Partial<Attempt>) {
  await updateDoc(doc(db, COL.attempts, id), clean(data));
}

export async function listAttemptsByStudent(
  institutionId: string,
  studentId: string
): Promise<Attempt[]> {
  const snap = await getDocs(
    query(
      collection(db, COL.attempts),
      where("institutionId", "==", institutionId),
      where("studentId", "==", studentId)
    )
  );
  return snap.docs
    .map((d) => d.data() as Attempt)
    .sort((a, b) => b.startedAt - a.startedAt);
}

export async function listAttemptsForAssessment(
  assessmentId: string
): Promise<Attempt[]> {
  const snap = await getDocs(
    query(
      collection(db, COL.attempts),
      where("assessmentId", "==", assessmentId)
    )
  );
  return snap.docs
    .map((d) => d.data() as Attempt)
    .sort((a, b) => b.startedAt - a.startedAt);
}

export async function listAttemptsByTeacher(
  institutionId: string,
  teacherId: string
): Promise<Attempt[]> {
  const snap = await getDocs(
    query(
      collection(db, COL.attempts),
      where("institutionId", "==", institutionId),
      where("teacherId", "==", teacherId)
    )
  );
  return snap.docs
    .map((d) => d.data() as Attempt)
    .sort((a, b) => b.startedAt - a.startedAt);
}

export async function listAllAttempts(
  institutionId: string
): Promise<Attempt[]> {
  const snap = await getDocs(
    query(
      collection(db, COL.attempts),
      where("institutionId", "==", institutionId)
    )
  );
  return snap.docs
    .map((d) => d.data() as Attempt)
    .sort((a, b) => b.startedAt - a.startedAt);
}

// ─── Materials ───

export async function saveMaterial(m: Material) {
  await setDoc(doc(db, COL.materials, m.id), clean(m));
}

export async function deleteMaterial(id: string) {
  await deleteDoc(doc(db, COL.materials, id));
}

export async function getMaterial(id: string): Promise<Material | null> {
  const snap = await getDoc(doc(db, COL.materials, id));
  return snap.exists() ? (snap.data() as Material) : null;
}

export async function listMaterialsByTeacher(
  institutionId: string,
  teacherId: string
): Promise<Material[]> {
  const snap = await getDocs(
    query(
      collection(db, COL.materials),
      where("institutionId", "==", institutionId),
      where("teacherId", "==", teacherId)
    )
  );
  return snap.docs
    .map((d) => d.data() as Material)
    .sort((a, b) => b.createdAt - a.createdAt);
}

export async function listMaterialsForClass(
  institutionId: string,
  className: string
): Promise<Material[]> {
  return listMaterialsForClasses(institutionId, [className]);
}

export async function listMaterialsForClasses(
  institutionId: string,
  classNames: string[]
): Promise<Material[]> {
  const snap = await getDocs(
    query(
      collection(db, COL.materials),
      where("institutionId", "==", institutionId)
    )
  );
  const set = new Set(classNames);
  return snap.docs
    .map((d) => d.data() as Material)
    .filter((m) => !m.className || set.has(m.className))
    .sort((a, b) => b.createdAt - a.createdAt);
}

export async function listMaterialsForLearner(
  institutionId: string,
  profile: UserProfile
): Promise<Material[]> {
  return listMaterialsForClasses(institutionId, learnerClassNames(profile));
}

export async function setMaterialProgress(p: MaterialProgress) {
  await setDoc(doc(db, COL.materialProgress, p.id), clean(p));
}

export async function listMaterialProgress(
  institutionId: string,
  studentId: string
): Promise<MaterialProgress[]> {
  const snap = await getDocs(
    query(
      collection(db, COL.materialProgress),
      where("institutionId", "==", institutionId),
      where("studentId", "==", studentId)
    )
  );
  return snap.docs.map((d) => d.data() as MaterialProgress);
}

export async function listProgressForMaterial(
  materialId: string
): Promise<MaterialProgress[]> {
  const snap = await getDocs(
    query(
      collection(db, COL.materialProgress),
      where("materialId", "==", materialId)
    )
  );
  return snap.docs.map((d) => d.data() as MaterialProgress);
}

// ─── Notifications ───

export async function sendNotification(n: Notification) {
  await setDoc(doc(db, COL.notifications, n.id), clean(n));
}

export async function deleteNotification(id: string) {
  await deleteDoc(doc(db, COL.notifications, id));
}

export async function markNotificationRead(id: string, uid: string) {
  await updateDoc(doc(db, COL.notifications, id), { readBy: arrayUnion(uid) });
}

/** Notifications visible to a given user (audience filtering client-side). */
export function subscribeToNotifications(
  institutionId: string,
  user: { uid: string; role: Role },
  cb: (items: Notification[]) => void
): Unsubscribe {
  const q = query(
    collection(db, COL.notifications),
    where("institutionId", "==", institutionId),
    orderBy("createdAt", "desc"),
    fbLimit(50)
  );
  return onSnapshot(q, (snap) => {
    const all = snap.docs.map((d) => d.data() as Notification);
    cb(
      all.filter((n) => {
        if (n.audience === "all") return true;
        if (n.audience === "students") return user.role === "student";
        if (n.audience === "teachers") return user.role === "teacher";
        return n.targetUserId === user.uid;
      })
    );
  });
}

export async function listNotificationsSent(
  institutionId: string
): Promise<Notification[]> {
  const snap = await getDocs(
    query(
      collection(db, COL.notifications),
      where("institutionId", "==", institutionId)
    )
  );
  return snap.docs
    .map((d) => d.data() as Notification)
    .sort((a, b) => b.createdAt - a.createdAt);
}

// ─── Payments ───

export async function savePayment(p: PaymentRecord) {
  await setDoc(doc(db, COL.payments, p.id), clean(p));
}

export async function listPayments(
  institutionId: string
): Promise<PaymentRecord[]> {
  const snap = await getDocs(
    query(
      collection(db, COL.payments),
      where("institutionId", "==", institutionId)
    )
  );
  return snap.docs
    .map((d) => d.data() as PaymentRecord)
    .sort((a, b) => b.createdAt - a.createdAt);
}

// ─── Audit ───

export async function writeAudit(
  event: Omit<AuditEvent, "id" | "createdAt"> & { id?: string; createdAt?: number }
) {
  const id = event.id ?? newId(COL.audit);
  const row: AuditEvent = {
    id,
    createdAt: event.createdAt ?? Date.now(),
    institutionId: event.institutionId,
    actorId: event.actorId,
    actorName: event.actorName,
    action: event.action,
    entityType: event.entityType,
    entityId: event.entityId,
    detail: event.detail,
  };
  await setDoc(doc(db, COL.audit, id), clean(row));
}

export async function listAudit(
  institutionId: string,
  limitN = 200
): Promise<AuditEvent[]> {
  const snap = await getDocs(
    query(
      collection(db, COL.audit),
      where("institutionId", "==", institutionId)
    )
  );
  return snap.docs
    .map((d) => d.data() as AuditEvent)
    .sort((a, b) => b.createdAt - a.createdAt)
    .slice(0, limitN);
}

export async function appendAttemptEvent(attemptId: string, event: AttemptEvent) {
  const snap = await getDoc(doc(db, COL.attempts, attemptId));
  if (!snap.exists()) return;
  const att = snap.data() as Attempt;
  const events = [...(att.events ?? []), event].slice(-80);
  await updateDoc(doc(db, COL.attempts, attemptId), { events });
}

// ─── Departments ───

export async function saveDepartment(d: Department) {
  await setDoc(doc(db, COL.departments, d.id), clean(d));
}

export async function deleteDepartment(id: string) {
  await deleteDoc(doc(db, COL.departments, id));
}

export async function listDepartments(institutionId: string): Promise<Department[]> {
  const snap = await getDocs(
    query(collection(db, COL.departments), where("institutionId", "==", institutionId))
  );
  return snap.docs
    .map((d) => d.data() as Department)
    .sort((a, b) => a.name.localeCompare(b.name));
}

// ─── Terms ───

export async function saveTerm(t: Term) {
  await setDoc(doc(db, COL.terms, t.id), clean(t));
}

export async function deleteTerm(id: string) {
  await deleteDoc(doc(db, COL.terms, id));
}

export async function listTerms(institutionId: string): Promise<Term[]> {
  const snap = await getDocs(
    query(collection(db, COL.terms), where("institutionId", "==", institutionId))
  );
  return snap.docs
    .map((d) => d.data() as Term)
    .sort((a, b) => b.startAt - a.startAt);
}

// ─── Cohorts ───

export async function saveCohort(c: Cohort) {
  await setDoc(doc(db, COL.cohorts, c.id), clean(c));
}

export async function deleteCohort(id: string) {
  await deleteDoc(doc(db, COL.cohorts, id));
}

export async function listCohorts(institutionId: string): Promise<Cohort[]> {
  const snap = await getDocs(
    query(collection(db, COL.cohorts), where("institutionId", "==", institutionId))
  );
  return snap.docs
    .map((d) => d.data() as Cohort)
    .sort((a, b) => a.name.localeCompare(b.name));
}

export async function getCohortByName(
  institutionId: string,
  name: string
): Promise<Cohort | null> {
  const all = await listCohorts(institutionId);
  return all.find((c) => c.name.toLowerCase() === name.toLowerCase()) ?? null;
}

export async function ensureCohort(
  institutionId: string,
  name: string,
  extra?: Partial<Cohort>
): Promise<Cohort> {
  const existing = await getCohortByName(institutionId, name);
  if (existing) return existing;
  const c: Cohort = {
    id: newId(COL.cohorts),
    institutionId,
    name,
    status: "open",
    createdAt: Date.now(),
    ...extra,
  };
  await saveCohort(c);
  return c;
}

export async function syncInstitutionClasses(institutionId: string, names: string[]) {
  const unique = [...new Set(names.map((n) => n.trim()).filter(Boolean))];
  await updateInstitution(institutionId, { classes: unique });
  const existing = await listCohorts(institutionId);
  const have = new Set(existing.map((c) => c.name.toLowerCase()));
  await Promise.all(
    unique
      .filter((n) => !have.has(n.toLowerCase()))
      .map((name) =>
        saveCohort({
          id: newId(COL.cohorts),
          institutionId,
          name,
          status: "open",
          createdAt: Date.now(),
        })
      )
  );
}

// ─── Enrollments ───

export async function saveEnrollment(e: Enrollment) {
  await setDoc(doc(db, COL.enrollments, e.id), clean(e));
}

export async function listEnrollments(
  institutionId: string,
  userId?: string
): Promise<Enrollment[]> {
  const constraints = [where("institutionId", "==", institutionId)];
  if (userId) constraints.push(where("userId", "==", userId));
  const snap = await getDocs(query(collection(db, COL.enrollments), ...constraints));
  return snap.docs
    .map((d) => d.data() as Enrollment)
    .sort((a, b) => b.startedAt - a.startedAt);
}

export async function listEnrollmentsForCohort(
  institutionId: string,
  cohortId: string
): Promise<Enrollment[]> {
  const snap = await getDocs(
    query(
      collection(db, COL.enrollments),
      where("institutionId", "==", institutionId),
      where("cohortId", "==", cohortId)
    )
  );
  return snap.docs.map((d) => d.data() as Enrollment);
}

export async function enrollLearner(opts: {
  institutionId: string;
  user: Pick<UserProfile, "uid" | "name">;
  className: string;
}): Promise<Enrollment> {
  const cohort = await ensureCohort(opts.institutionId, opts.className);
  const id = `${opts.user.uid}_${cohort.id}`;
  const existingSnap = await getDoc(doc(db, COL.enrollments, id));
  if (existingSnap.exists()) return existingSnap.data() as Enrollment;

  let status: EnrollmentStatus = "active";
  if (cohort.capacity && cohort.capacity > 0) {
    const current = await listEnrollmentsForCohort(opts.institutionId, cohort.id);
    const taken = current.filter((e) => e.status === "active" || e.status === "completed").length;
    if (taken >= cohort.capacity) status = "waitlist";
  }
  const row: Enrollment = {
    id,
    institutionId: opts.institutionId,
    userId: opts.user.uid,
    userName: opts.user.name,
    cohortId: cohort.id,
    cohortName: cohort.name,
    status,
    startedAt: Date.now(),
  };
  await saveEnrollment(row);
  return row;
}

export async function setEnrollmentStatus(
  id: string,
  status: EnrollmentStatus
) {
  const extra =
    status === "completed" || status === "dropped" || status === "alumni"
      ? { endedAt: Date.now() }
      : {};
  await updateDoc(doc(db, COL.enrollments, id), { status, ...extra });
}

// ─── Rubrics ───

export async function saveRubric(r: Rubric) {
  await setDoc(doc(db, COL.rubrics, r.id), clean(r));
}

export async function deleteRubric(id: string) {
  await deleteDoc(doc(db, COL.rubrics, id));
}

export async function listRubrics(institutionId: string): Promise<Rubric[]> {
  const snap = await getDocs(
    query(collection(db, COL.rubrics), where("institutionId", "==", institutionId))
  );
  return snap.docs
    .map((d) => d.data() as Rubric)
    .sort((a, b) => b.createdAt - a.createdAt);
}

export async function getRubric(id: string): Promise<Rubric | null> {
  const snap = await getDoc(doc(db, COL.rubrics, id));
  return snap.exists() ? (snap.data() as Rubric) : null;
}

// ─── Learning paths ───

export async function savePath(p: LearningPath) {
  await setDoc(doc(db, COL.paths, p.id), clean(p));
}

export async function deletePath(id: string) {
  await deleteDoc(doc(db, COL.paths, id));
}

export async function listPaths(institutionId: string): Promise<LearningPath[]> {
  const snap = await getDocs(
    query(collection(db, COL.paths), where("institutionId", "==", institutionId))
  );
  return snap.docs
    .map((d) => d.data() as LearningPath)
    .sort((a, b) => b.createdAt - a.createdAt);
}

// ─── Certificates ───

export function generateVerifyCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  return Array.from({ length: 10 }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
}

export async function saveCertificate(c: Certificate) {
  await setDoc(doc(db, COL.certificates, c.id), clean(c));
}

export async function listCertificates(
  institutionId: string,
  userId?: string
): Promise<Certificate[]> {
  const constraints = [where("institutionId", "==", institutionId)];
  if (userId) constraints.push(where("userId", "==", userId));
  const snap = await getDocs(query(collection(db, COL.certificates), ...constraints));
  return snap.docs
    .map((d) => d.data() as Certificate)
    .sort((a, b) => b.issuedAt - a.issuedAt);
}

export async function getCertificateByCode(code: string): Promise<Certificate | null> {
  const snap = await getDocs(
    query(
      collection(db, COL.certificates),
      where("verifyCode", "==", code.toUpperCase().trim()),
      fbLimit(1)
    )
  );
  return snap.empty ? null : (snap.docs[0].data() as Certificate);
}

export async function issueCertificate(opts: {
  institution: Institution;
  user: Pick<UserProfile, "uid" | "name">;
  title: string;
  cohortName?: string;
  skills?: string[];
}): Promise<Certificate> {
  const c: Certificate = {
    id: newId(COL.certificates),
    institutionId: opts.institution.id,
    institutionName: opts.institution.name,
    userId: opts.user.uid,
    userName: opts.user.name,
    title: opts.title,
    cohortName: opts.cohortName,
    skills: opts.skills,
    verifyCode: generateVerifyCode(),
    issuedAt: Date.now(),
  };
  await saveCertificate(c);
  return c;
}

export async function listChildren(parent: UserProfile): Promise<UserProfile[]> {
  const ids = parent.linkedStudentIds ?? [];
  const rows = await Promise.all(ids.map((id) => getUserProfile(id)));
  return rows.filter((u): u is UserProfile => Boolean(u));
}

export async function listUsersByDepartment(
  institutionId: string,
  departmentId: string
): Promise<UserProfile[]> {
  const all = await listUsers(institutionId);
  return all.filter((u) => u.departmentId === departmentId);
}
