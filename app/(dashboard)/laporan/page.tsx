// app/(dashboard)/laporan/page.tsx
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileText, Users, GraduationCap, CreditCard, BarChart3, Download } from 'lucide-react';
import Link from 'next/link';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export default async function LaporanDashboardPage() {
  const session = await getServerSession(authOptions);
  if (!session || !['super_admin', 'staff_akademik', 'staff_keuangan'].includes(session.user.role as string)) {
    return <div>Unauthorized</div>;
  }

  // Tentukan modul laporan yang bisa diakses berdasarkan role
  const accessibleReports = getAccessibleReports(session.user.role as string);

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <p className="text-sm font-medium">Manajemen Laporan</p>
        <p className="text-muted-foreground text-sm">
          Generate dan akses laporan akademik, keuangan, dan statistik.
        </p>
      </div>

      {/* Module Links */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Jenis Laporan</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {accessibleReports.map((report) => (
            <Link key={report.href} href={report.href} passHref>
              <Card className="hover:shadow-md transition-shadow cursor-pointer glass-effect dark:glass-effect-dark">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-muted">
                      <report.icon className="h-5 w-5 text-primary" />
                    </div>
                    <CardTitle className="text-base">{report.title}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">{report.description}</p>
                  <Button className="mt-3 w-full" size="sm" variant="outline">
                    <Download className="mr-2 h-4 w-4" />
                    Generate Laporan
                  </Button>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>

      {/* Contoh Ringkasan Statistik (Opsional) */}
      <Card className="glass-effect dark:glass-effect-dark">
        <CardHeader>
          <CardTitle>Statistik Umum</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Grafik atau ringkasan statistik bisa ditampilkan di sini.</p>
        </CardContent>
      </Card>
    </div>
  );
}

function getAccessibleReports(role: string) {
  const baseReports = [
    {
      title: "Laporan Mahasiswa",
      href: "/laporan/mahasiswa",
      icon: Users,
      description: "Daftar mahasiswa, status, kurikulum"
    },
    {
      title: "Laporan Kelas",
      href: "/laporan/kelas",
      icon: GraduationCap,
      description: "Daftar kelas, dosen, kuota, kehadiran"
    },
    {
      title: "Laporan Pembayaran",
      href: "/laporan/pembayaran",
      icon: CreditCard,
      description: "Daftar pembayaran, verifikasi, tunggakan"
    },
    {
      title: "Laporan Nilai",
      href: "/laporan/nilai",
      icon: FileText,
      description: "Nilai per kelas, IPK mahasiswa"
    },
    {
      title: "Statistik & Grafik",
      href: "/laporan/statistik",
      icon: BarChart3,
      description: "Grafik progres, tren, analisis data"
    }
  ];

  if (role === 'staff_keuangan') {
    // Hanya tampilkan laporan keuangan
    return [
      baseReports.find(r => r.title === "Laporan Pembayaran")!,
      baseReports.find(r => r.title === "Statistik & Grafik")! // Jika relevan
    ];
  }

  if (role === 'staff_akademik') {
    // Hapus laporan keuangan
    return baseReports.filter(r => !['Laporan Pembayaran'].includes(r.title));
  }

  // super_admin bisa lihat semua
  return baseReports;
}