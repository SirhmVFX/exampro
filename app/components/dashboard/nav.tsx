import {
  LayoutDashboard,
  Users,
  GraduationCap,
  FileText,
  Library,
  BookOpen,
  BarChart3,
  Settings,
  CreditCard,
  Megaphone,
  ClipboardCheck,
  FolderTree,
  Award,
  TrendingUp,
  UserCircle,
  Upload,
  ScrollText,
  Shield,
  BadgeCheck,
  Route,
  Scale,
  Download,
  Sparkles,
  Zap,
  FileCheck,
  FolderCheck,
  FolderKanban,
  Dumbbell,
  CalendarCheck,
} from "lucide-react";
import type { NavItem } from "./sidebar";
import type { Institution } from "@/lib/types";
import { vocab } from "@/lib/vocab";

export function getAdminNav(institution?: Institution | null): NavItem[] {
  const v = vocab(institution ?? null);
  return [
    {
      label: "Overview",
      href: "/dashboard/admin",
      icon: <LayoutDashboard className="w-4 h-4" />,
    },
    {
      label: v.teachers,
      href: "/dashboard/admin/teachers",
      icon: <Users className="w-4 h-4" />,
    },
    {
      label: v.students,
      href: "/dashboard/admin/students",
      icon: <GraduationCap className="w-4 h-4" />,
    },
    {
      label: "Attendance",
      href: "/dashboard/admin/attendance",
      icon: <CalendarCheck className="w-4 h-4" />,
    },
    {
      label: `${v.classes} & subjects`,
      href: "/dashboard/admin/structure",
      icon: <FolderTree className="w-4 h-4" />,
    },
    {
      label: "Roster import",
      href: "/dashboard/admin/import",
      icon: <Upload className="w-4 h-4" />,
    },
    {
      label: "Question library",
      href: "/dashboard/admin/questions",
      icon: <Library className="w-4 h-4" />,
    },
    {
      label: "Assessments",
      href: "/dashboard/admin/assessments",
      icon: <FileText className="w-4 h-4" />,
    },
    {
      label: "Quizzes",
      href: "/dashboard/admin/assessments?kind=quiz",
      icon: <Zap className="w-4 h-4" />,
    },
    {
      label: "Tests",
      href: "/dashboard/admin/assessments?kind=test",
      icon: <ClipboardCheck className="w-4 h-4" />,
    },
    {
      label: "Exams",
      href: "/dashboard/admin/assessments?kind=exam",
      icon: <FileCheck className="w-4 h-4" />,
    },
    {
      label: "Assignments",
      href: "/dashboard/admin/assessments?kind=assignment",
      icon: <FolderCheck className="w-4 h-4" />,
    },
    {
      label: "Projects",
      href: "/dashboard/admin/assessments?kind=project",
      icon: <FolderKanban className="w-4 h-4" />,
    },
    {
      label: "Practice",
      href: "/dashboard/admin/assessments?kind=practice",
      icon: <Dumbbell className="w-4 h-4" />,
    },
    {
      label: "Materials",
      href: "/dashboard/admin/materials",
      icon: <BookOpen className="w-4 h-4" />,
    },
    {
      label: "Gradebook",
      href: "/dashboard/admin/gradebook",
      icon: <ScrollText className="w-4 h-4" />,
    },
    {
      label: "Paths",
      href: "/dashboard/admin/paths",
      icon: <Route className="w-4 h-4" />,
    },
    {
      label: "Certificates",
      href: "/dashboard/admin/certificates",
      icon: <BadgeCheck className="w-4 h-4" />,
    },
    {
      label: "Announcements",
      href: "/dashboard/admin/announcements",
      icon: <Megaphone className="w-4 h-4" />,
    },
    {
      label: "Analytics",
      href: "/dashboard/admin/analytics",
      icon: <BarChart3 className="w-4 h-4" />,
    },
    {
      label: "Export",
      href: "/dashboard/admin/export",
      icon: <Download className="w-4 h-4" />,
    },
    {
      label: "Audit log",
      href: "/dashboard/admin/audit",
      icon: <Shield className="w-4 h-4" />,
    },
    {
      label: "Billing",
      href: "/dashboard/admin/billing",
      icon: <CreditCard className="w-4 h-4" />,
    },
    {
      label: "Settings",
      href: "/dashboard/admin/settings",
      icon: <Settings className="w-4 h-4" />,
    },
  ];
}

export function getTeacherNav(institution?: Institution | null): NavItem[] {
  const v = vocab(institution ?? null);
  return [
    {
      label: "Overview",
      href: "/dashboard/teacher",
      icon: <LayoutDashboard className="w-4 h-4" />,
    },
    {
      label: "Question library",
      href: "/dashboard/teacher/questions",
      icon: <Library className="w-4 h-4" />,
    },
    {
      label: "Rubrics",
      href: "/dashboard/teacher/rubrics",
      icon: <Scale className="w-4 h-4" />,
    },
    {
      label: "Assessments",
      href: "/dashboard/teacher/assessments",
      icon: <FileText className="w-4 h-4" />,
    },
    {
      label: "Quizzes",
      href: "/dashboard/teacher/assessments?kind=quiz",
      icon: <Zap className="w-4 h-4" />,
    },
    {
      label: "Tests",
      href: "/dashboard/teacher/assessments?kind=test",
      icon: <ClipboardCheck className="w-4 h-4" />,
    },
    {
      label: "Exams",
      href: "/dashboard/teacher/assessments?kind=exam",
      icon: <FileCheck className="w-4 h-4" />,
    },
    {
      label: "Assignments",
      href: "/dashboard/teacher/assessments?kind=assignment",
      icon: <FolderCheck className="w-4 h-4" />,
    },
    {
      label: "Projects",
      href: "/dashboard/teacher/assessments?kind=project",
      icon: <FolderKanban className="w-4 h-4" />,
    },
    {
      label: "Practice",
      href: "/dashboard/teacher/assessments?kind=practice",
      icon: <Dumbbell className="w-4 h-4" />,
    },
    {
      label: "Materials",
      href: "/dashboard/teacher/materials",
      icon: <BookOpen className="w-4 h-4" />,
    },
    {
      label: "Submissions",
      href: "/dashboard/teacher/submissions",
      icon: <ClipboardCheck className="w-4 h-4" />,
    },
    {
      label: v.students,
      href: "/dashboard/teacher/students",
      icon: <GraduationCap className="w-4 h-4" />,
    },
    {
      label: "Attendance",
      href: "/dashboard/teacher/attendance",
      icon: <CalendarCheck className="w-4 h-4" />,
    },
    {
      label: "Announcements",
      href: "/dashboard/teacher/announcements",
      icon: <Megaphone className="w-4 h-4" />,
    },
    {
      label: "Analytics",
      href: "/dashboard/teacher/analytics",
      icon: <BarChart3 className="w-4 h-4" />,
    },
  ];
}

export function getStudentNav(institution?: Institution | null): NavItem[] {
  return [
    {
      label: "Overview",
      href: "/dashboard/student",
      icon: <LayoutDashboard className="w-4 h-4" />,
    },
    {
      label: "Assessments",
      href: "/dashboard/student/assessments",
      icon: <FileText className="w-4 h-4" />,
    },
    {
      label: "Materials",
      href: "/dashboard/student/materials",
      icon: <BookOpen className="w-4 h-4" />,
    },
    {
      label: "Results",
      href: "/dashboard/student/results",
      icon: <Award className="w-4 h-4" />,
    },
    {
      label: "AI Practice",
      href: "/dashboard/student/practice",
      icon: <Sparkles className="w-4 h-4" />,
    },
    {
      label: "Progress",
      href: "/dashboard/student/progress",
      icon: <TrendingUp className="w-4 h-4" />,
    },
    {
      label: "Certificates",
      href: "/dashboard/student/certificates",
      icon: <BadgeCheck className="w-4 h-4" />,
    },
    {
      label: "Profile",
      href: "/dashboard/student/profile",
      icon: <UserCircle className="w-4 h-4" />,
    },
  ];
}

export function parentNav(): NavItem[] {
  return [
    {
      label: "Overview",
      href: "/dashboard/parent",
      icon: <LayoutDashboard className="w-4 h-4" />,
    },
  ];
}

export function getManagerNav(institution?: Institution | null): NavItem[] {
  const v = vocab(institution ?? null);
  return [
    {
      label: "Overview",
      href: "/dashboard/manager",
      icon: <LayoutDashboard className="w-4 h-4" />,
    },
    {
      label: v.students,
      href: "/dashboard/manager",
      icon: <GraduationCap className="w-4 h-4" />,
    },
  ];
}

export const adminNav = getAdminNav(null);
export const teacherNav = getTeacherNav(null);
export const studentNav = getStudentNav(null);
export const managerNav = getManagerNav(null);

export function navFor(
  role: string,
  institution?: Institution | null,
): NavItem[] {
  if (role === "admin") return getAdminNav(institution);
  if (role === "teacher") return getTeacherNav(institution);
  if (role === "parent") return parentNav();
  if (role === "manager") return getManagerNav(institution);
  return getStudentNav(institution);
}
