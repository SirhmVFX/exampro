import type { Metadata } from "next";
import { Geist } from "next/font/google";
import { Toaster } from "react-hot-toast";
import "./globals.css";
import { AuthProvider } from "@/lib/auth-context";

const geist = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "ExamPro — Assessment SaaS for Schools",
  description:
    "ExamPro is a multi-tenant SaaS platform for educational institutions. Super admins run the school, teachers set quizzes, tests and exams (including coding playgrounds), and students take them with instant results.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geist.variable} antialiased`}>
        <AuthProvider>
          {children}
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                borderRadius: "10px",
                fontSize: "14px",
              },
              success: {
                style: {
                  background: "#f0fdf4",
                  border: "1px solid #bbf7d0",
                  color: "#166534",
                },
                iconTheme: { primary: "#16a34a", secondary: "#f0fdf4" },
              },
              error: {
                style: {
                  background: "#fef2f2",
                  border: "1px solid #fecaca",
                  color: "#991b1b",
                },
                iconTheme: { primary: "#dc2626", secondary: "#fef2f2" },
              },
            }}
          />
        </AuthProvider>
      </body>
    </html>
  );
}
