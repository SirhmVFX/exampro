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
  Video,
  Mail,
  Activity,
  Globe,
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
      group: "Overview",
    },
    {
      label: v.teachers,
      href: "/dashboard/admin/teachers",
      icon: <Users className="w-4 h-4" />,
      group: "People",
    },
    {
      label: v.students,
      href: "/dashboard/admin/students",
      icon: <GraduationCap className="w-4 h-4" />,
      group: "People",
    },
    {
      label: "Attendance",
      href: "/dashboard/admin/attendance",
      icon: <CalendarCheck className="w-4 h-4" />,
      group: "People",
    },
    {
      label: `${v.classes} & subjects`,
      href: "/dashboard/admin/structure",
      icon: <FolderTree className="w-4 h-4" />,
      group: "Setup",
    },
    {
      label: "Roster import",
      href: "/dashboard/admin/import",
      icon: <Upload className="w-4 h-4" />,
      group: "Setup",
    },
    {
      label: "Question library",
      href: "/dashboard/admin/questions",
      icon: <Library className="w-4 h-4" />,
      group: "Content",
    },
    {
      label: "AI Generator",
      href: "/dashboard/admin/ai",
      icon: <Sparkles className="w-4 h-4" />,
      group: "Content",
    },
    {
      label: "Materials",
      href: "/dashboard/admin/materials",
      icon: <BookOpen className="w-4 h-4" />,
      group: "Content",
    },
    {
      label: "Paths",
      href: "/dashboard/admin/paths",
      icon: <Route className="w-4 h-4" />,
      group: "Content",
    },
    {
      label: "Assessments",
      href: "/dashboard/admin/assessments",
      icon: <FileText className="w-4 h-4" />,
      group: "Assessments",
    },
    {
      label: "Quizzes",
      href: "/dashboard/admin/assessments?kind=quiz",
      icon: <Zap className="w-4 h-4" />,
      group: "Assessments",
    },
    {
      label: "Tests",
      href: "/dashboard/admin/assessments?kind=test",
      icon: <ClipboardCheck className="w-4 h-4" />,
      group: "Assessments",
    },
    {
      label: "Exams",
      href: "/dashboard/admin/assessments?kind=exam",
      icon: <FileCheck className="w-4 h-4" />,
      group: "Assessments",
    },
    {
      label: "Assignments",
      href: "/dashboard/admin/assessments?kind=assignment",
      icon: <FolderCheck className="w-4 h-4" />,
      group: "Assessments",
    },
    {
      label: "Projects",
      href: "/dashboard/admin/assessments?kind=project",
      icon: <FolderKanban className="w-4 h-4" />,
      group: "Assessments",
    },
    {
      label: "Practice",
      href: "/dashboard/admin/assessments?kind=practice",
      icon: <Dumbbell className="w-4 h-4" />,
      group: "Assessments",
    },
    {
      label: "Gradebook",
      href: "/dashboard/admin/gradebook",
      icon: <ScrollText className="w-4 h-4" />,
      group: "Grading",
    },
    {
      label: "Certificates",
      href: "/dashboard/admin/certificates",
      icon: <BadgeCheck className="w-4 h-4" />,
      group: "Engage",
    },
    {
      label: "Live sessions",
      href: "/dashboard/admin/sessions",
      icon: <Video className="w-4 h-4" />,
      group: "Engage",
    },
    {
      label: "Message parents",
      href: "/dashboard/admin/messages",
      icon: <Mail className="w-4 h-4" />,
      group: "Engage",
    },
    {
      label: "Announcements",
      href: "/dashboard/admin/announcements",
      icon: <Megaphone className="w-4 h-4" />,
      group: "Engage",
    },
    {
      label: "Student analytics",
      href: "/dashboard/admin/student-analytics",
      icon: <Activity className="w-4 h-4" />,
      group: "Insights",
    },
    {
      label: "Analytics",
      href: "/dashboard/admin/analytics",
      icon: <BarChart3 className="w-4 h-4" />,
      group: "Insights",
    },
    {
      label: "Export",
      href: "/dashboard/admin/export",
      icon: <Download className="w-4 h-4" />,
      group: "Insights",
    },
    {
      label: "Audit log",
      href: "/dashboard/admin/audit",
      icon: <Shield className="w-4 h-4" />,
      group: "Insights",
    },
    {
      label: "Website",
      href: "/dashboard/admin/website",
      icon: <Globe className="w-4 h-4" />,
      group: "Account",
    },
    {
      label: "Settings",
      href: "/dashboard/admin/settings",
      icon: <Settings className="w-4 h-4" />,
      group: "Account",
    },
    {
      label: "Billing",
      href: "/dashboard/admin/billing",
      icon: <CreditCard className="w-4 h-4" />,
      group: "Account",
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
      group: "Overview",
    },
    {
      label: v.students,
      href: "/dashboard/teacher/students",
      icon: <GraduationCap className="w-4 h-4" />,
      group: "Teaching",
    },
    {
      label: "Attendance",
      href: "/dashboard/teacher/attendance",
      icon: <CalendarCheck className="w-4 h-4" />,
      group: "Teaching",
    },
    {
      label: "Question library",
      href: "/dashboard/teacher/questions",
      icon: <Library className="w-4 h-4" />,
      group: "Content",
    },
    {
      label: "AI Generator",
      href: "/dashboard/teacher/ai",
      icon: <Sparkles className="w-4 h-4" />,
      group: "Content",
    },
    {
      label: "Rubrics",
      href: "/dashboard/teacher/rubrics",
      icon: <Scale className="w-4 h-4" />,
      group: "Content",
    },
    {
      label: "Materials",
      href: "/dashboard/teacher/materials",
      icon: <BookOpen className="w-4 h-4" />,
      group: "Content",
    },
    {
      label: "Assessments",
      href: "/dashboard/teacher/assessments",
      icon: <FileText className="w-4 h-4" />,
      group: "Assessments",
    },
    {
      label: "Quizzes",
      href: "/dashboard/teacher/assessments?kind=quiz",
      icon: <Zap className="w-4 h-4" />,
      group: "Assessments",
    },
    {
      label: "Tests",
      href: "/dashboard/teacher/assessments?kind=test",
      icon: <ClipboardCheck className="w-4 h-4" />,
      group: "Assessments",
    },
    {
      label: "Exams",
      href: "/dashboard/teacher/assessments?kind=exam",
      icon: <FileCheck className="w-4 h-4" />,
      group: "Assessments",
    },
    {
      label: "Assignments",
      href: "/dashboard/teacher/assessments?kind=assignment",
      icon: <FolderCheck className="w-4 h-4" />,
      group: "Assessments",
    },
    {
      label: "Projects",
      href: "/dashboard/teacher/assessments?kind=project",
      icon: <FolderKanban className="w-4 h-4" />,
      group: "Assessments",
    },
    {
      label: "Practice",
      href: "/dashboard/teacher/assessments?kind=practice",
      icon: <Dumbbell className="w-4 h-4" />,
      group: "Assessments",
    },
    {
      label: "Submissions",
      href: "/dashboard/teacher/submissions",
      icon: <ClipboardCheck className="w-4 h-4" />,
      group: "Grading",
    },
    {
      label: "Certificates",
      href: "/dashboard/teacher/certificates",
      icon: <BadgeCheck className="w-4 h-4" />,
      group: "Engage",
    },
    {
      label: "Live sessions",
      href: "/dashboard/teacher/sessions",
      icon: <Video className="w-4 h-4" />,
      group: "Engage",
    },
    {
      label: "Message parents",
      href: "/dashboard/teacher/messages",
      icon: <Mail className="w-4 h-4" />,
      group: "Engage",
    },
    {
      label: "Announcements",
      href: "/dashboard/teacher/announcements",
      icon: <Megaphone className="w-4 h-4" />,
      group: "Engage",
    },
    {
      label: "Student analytics",
      href: "/dashboard/teacher/student-analytics",
      icon: <Activity className="w-4 h-4" />,
      group: "Insights",
    },
    {
      label: "Analytics",
      href: "/dashboard/teacher/analytics",
      icon: <BarChart3 className="w-4 h-4" />,
      group: "Insights",
    },
  ];
}

export function getStudentNav(institution?: Institution | null): NavItem[] {
  return [
    {
      label: "Overview",
      href: "/dashboard/student",
      icon: <LayoutDashboard className="w-4 h-4" />,
      group: "Overview",
    },
    {
      label: "Assessments",
      href: "/dashboard/student/assessments",
      icon: <FileText className="w-4 h-4" />,
      group: "Learning",
    },
    {
      label: "Materials",
      href: "/dashboard/student/materials",
      icon: <BookOpen className="w-4 h-4" />,
      group: "Learning",
    },
    {
      label: "Live sessions",
      href: "/dashboard/student/sessions",
      icon: <Video className="w-4 h-4" />,
      group: "Learning",
    },
    {
      label: "AI Practice",
      href: "/dashboard/student/practice",
      icon: <Sparkles className="w-4 h-4" />,
      group: "Learning",
    },
    {
      label: "Results",
      href: "/dashboard/student/results",
      icon: <Award className="w-4 h-4" />,
      group: "Progress",
    },
    {
      label: "Progress",
      href: "/dashboard/student/progress",
      icon: <TrendingUp className="w-4 h-4" />,
      group: "Progress",
    },
    {
      label: "Certificates",
      href: "/dashboard/student/certificates",
      icon: <BadgeCheck className="w-4 h-4" />,
      group: "Progress",
    },
    {
      label: "Profile",
      href: "/dashboard/student/profile",
      icon: <UserCircle className="w-4 h-4" />,
      group: "Account",
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
