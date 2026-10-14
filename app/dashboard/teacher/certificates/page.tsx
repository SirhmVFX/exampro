import DashboardShell from "@/app/components/dashboard/shell";
import CertificatesWorkspace from "@/app/components/dashboard/certificates-workspace";

export default function CertificatesTeacherPage() {
  return (
    <DashboardShell
      role="teacher"
      title="Certificates"
      subtitle="Issue and deliver certificates to your students"
    >
      <CertificatesWorkspace role="teacher" />
    </DashboardShell>
  );
}
