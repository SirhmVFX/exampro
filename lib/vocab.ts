import type { Institution, InstitutionType, Vocabulary } from "./types";

const BY_TYPE: Record<InstitutionType, Vocabulary> = {
  k12: {
    student: "Student",
    students: "Students",
    teacher: "Teacher",
    teachers: "Teachers",
    class: "Grade",
    classes: "Grades",
    admin: "Admin",
  },
  university: {
    student: "Student",
    students: "Students",
    teacher: "Lecturer",
    teachers: "Lecturers",
    class: "Level",
    classes: "Levels",
    admin: "Admin",
  },
  training: {
    student: "Learner",
    students: "Learners",
    teacher: "Instructor",
    teachers: "Instructors",
    class: "Cohort",
    classes: "Cohorts",
    admin: "Admin",
  },
  corporate: {
    student: "Trainee",
    students: "Trainees",
    teacher: "Facilitator",
    teachers: "Facilitators",
    class: "Track",
    classes: "Tracks",
    admin: "Admin",
  },
  tutoring: {
    student: "Student",
    students: "Students",
    teacher: "Tutor",
    teachers: "Tutors",
    class: "Group",
    classes: "Groups",
    admin: "Admin",
  },
  faith: {
    student: "Member",
    students: "Members",
    teacher: "Facilitator",
    teachers: "Facilitators",
    class: "Class",
    classes: "Classes",
    admin: "Admin",
  },
  language: {
    student: "Learner",
    students: "Learners",
    teacher: "Teacher",
    teachers: "Teachers",
    class: "Level",
    classes: "Levels",
    admin: "Admin",
  },
  professional: {
    student: "Candidate",
    students: "Candidates",
    teacher: "Examiner",
    teachers: "Examiners",
    class: "Session",
    classes: "Sessions",
    admin: "Admin",
  },
  other: {
    student: "Learner",
    students: "Learners",
    teacher: "Instructor",
    teachers: "Instructors",
    class: "Group",
    classes: "Groups",
    admin: "Admin",
  },
};

export function defaultVocabulary(type?: InstitutionType | null): Vocabulary {
  return { ...(BY_TYPE[type ?? "other"] ?? BY_TYPE.other) };
}

export function vocab(institution: Institution | null | undefined): Vocabulary {
  const base = defaultVocabulary(institution?.type);
  const custom = institution?.vocabulary;
  const classSingular =
    institution?.classLabel?.trim() || custom?.class || base.class;
  return {
    student: custom?.student || base.student,
    students: custom?.students || base.students,
    teacher: custom?.teacher || base.teacher,
    teachers: custom?.teachers || base.teachers,
    class: classSingular,
    classes:
      custom?.classes ||
      (institution?.classLabel ? `${classSingular}s` : base.classes),
    admin: custom?.admin || base.admin,
  };
}

export function roleTitle(
  role: string,
  institution: Institution | null | undefined
): string {
  const v = vocab(institution);
  if (role === "admin") return v.admin;
  if (role === "teacher") return v.teacher;
  if (role === "student") return v.student;
  if (role === "parent") return "Parent / guardian";
  if (role === "manager") return "Manager";
  return role;
}
