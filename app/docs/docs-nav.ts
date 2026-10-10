import {
  BookOpen,
  LayoutDashboard,
  PenTool,
  GraduationCap,
  Users,
  Brain,
  FileText,
  ClipboardCheck,
  BookMarked,
  BarChart3,
  Award,
  Shield,
  CreditCard,
  HelpCircle,
  Rocket,
  Settings,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

export interface NavItem {
  label: string;
  href: string;
  icon?: LucideIcon;
}

export interface NavGroup {
  title: string;
  items: NavItem[];
}

export const NAV_GROUPS: NavGroup[] = [
  {
    title: "Getting started",
    items: [
      { label: "Introduction", href: "/docs/introduction", icon: BookOpen },
      { label: "Quick start", href: "/docs/quick-start", icon: Rocket },
      { label: "Roles overview", href: "/docs/roles", icon: Users },
    ],
  },
  {
    title: "Admin",
    items: [
      {
        label: "Onboarding",
        href: "/docs/admin/onboarding",
        icon: LayoutDashboard,
      },
      {
        label: "Structure & terms",
        href: "/docs/admin/structure",
        icon: Settings,
      },
      { label: "Inviting people", href: "/docs/admin/inviting", icon: Users },
      { label: "Question library", href: "/docs/admin/questions", icon: Brain },
      {
        label: "Tests, Exams & Quizzes",
        href: "/docs/admin/assessments",
        icon: FileText,
      },
      {
        label: "Learning materials",
        href: "/docs/admin/materials",
        icon: BookMarked,
      },
      {
        label: "Announcements",
        href: "/docs/admin/announcements",
        icon: FileText,
      },
      { label: "Gradebook", href: "/docs/admin/gradebook", icon: BarChart3 },
      { label: "Analytics", href: "/docs/admin/analytics", icon: BarChart3 },
      { label: "Certificates", href: "/docs/admin/certificates", icon: Award },
      {
        label: "Settings & branding",
        href: "/docs/admin/settings",
        icon: Settings,
      },
    ],
  },
  {
    title: "Teacher",
    items: [
      {
        label: "Getting started",
        href: "/docs/teacher/getting-started",
        icon: PenTool,
      },
      {
        label: "Question library",
        href: "/docs/teacher/questions",
        icon: Brain,
      },
      { label: "AI generation", href: "/docs/teacher/ai", icon: Brain },
      {
        label: "Assessments",
        href: "/docs/teacher/assessments",
        icon: FileText,
      },
      {
        label: "Integrity settings",
        href: "/docs/teacher/integrity",
        icon: Shield,
      },
      { label: "Grading", href: "/docs/teacher/grading", icon: ClipboardCheck },
      { label: "Materials", href: "/docs/teacher/materials", icon: BookMarked },
      {
        label: "Learning paths",
        href: "/docs/teacher/paths",
        icon: BookMarked,
      },
      { label: "Rubrics", href: "/docs/teacher/rubrics", icon: ClipboardCheck },
      { label: "Analytics", href: "/docs/teacher/analytics", icon: BarChart3 },
    ],
  },
  {
    title: "Student",
    items: [
      { label: "Joining", href: "/docs/student/joining", icon: GraduationCap },
      {
        label: "Taking an exam",
        href: "/docs/student/taking-exam",
        icon: FileText,
      },
      { label: "Results", href: "/docs/student/results", icon: BarChart3 },
      { label: "Materials", href: "/docs/student/materials", icon: BookMarked },
      { label: "Progress", href: "/docs/student/progress", icon: BarChart3 },
      {
        label: "Certificates",
        href: "/docs/student/certificates",
        icon: Award,
      },
    ],
  },
  {
    title: "Parent",
    items: [
      { label: "Linking a child", href: "/docs/parent/linking", icon: Users },
      {
        label: "Dashboard",
        href: "/docs/parent/dashboard",
        icon: LayoutDashboard,
      },
    ],
  },
  {
    title: "Billing",
    items: [
      { label: "Plans", href: "/docs/billing/plans", icon: CreditCard },
      {
        label: "Paying with Paystack",
        href: "/docs/billing/paystack",
        icon: CreditCard,
      },
      {
        label: "Limits & upgrades",
        href: "/docs/billing/limits",
        icon: CreditCard,
      },
    ],
  },
  {
    title: "Reference",
    items: [
      {
        label: "Question types",
        href: "/docs/reference/question-types",
        icon: Brain,
      },
      {
        label: "Assessment kinds",
        href: "/docs/reference/assessment-kinds",
        icon: FileText,
      },
      {
        label: "Integrity suite",
        href: "/docs/reference/integrity",
        icon: Shield,
      },
      { label: "CSV formats", href: "/docs/reference/csv", icon: FileText },
      { label: "FAQ", href: "/docs/reference/faq", icon: HelpCircle },
    ],
  },
];

// flat list for prev/next navigation
export const ALL_PAGES: NavItem[] = NAV_GROUPS.flatMap((g) => g.items);
