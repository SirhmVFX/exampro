import DashboardShell from "@/app/components/dashboard/shell";
import CertificatesWorkspace from "@/app/components/dashboard/certificates-workspace";

export default function CertificatesAdminPage() {
  return (
    <DashboardShell
      role="admin"
      title="Certificates"
      subtitle="Issue, build templates and deliver certificates to students and parents"
    >
      <CertificatesWorkspace role="admin" />
    </DashboardShell>
  );
}
