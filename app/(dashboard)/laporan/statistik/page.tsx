// app/(dashboard)/laporan/statistik/page.tsx
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download, BarChart3 } from 'lucide-react';
import AcademicProgressChart from '@/components/charts/AcademicProgressChart';
import EnrollmentTrendChart from '@/components/charts/EnrollmentTrendChart';
import GradeDistributionChart from '@/components/charts/GradeDistributionChart';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { sql } from '@/lib/db';

export default async function LaporanStatistikPage() {
  const session = await getServerSession(authOptions);
  if (!session || !['super_admin', 'staff_akademik', 'staff_keuangan'].includes(session.user.role as string)) {
    return <div>Unauthorized</div>;
  }

  // Ambil data untuk chart (contoh sederhana)
  let academicProgressData = [];
  let enrollmentTrendData = [];
  let gradeDistributionData = [];

  try {
    // Contoh data untuk AcademicProgressChart (IPK per semester)
    // Query ini hanya contoh, Anda perlu menyesuaikan dengan struktur tabel dan logika perhitungan IPK
    academicProgressData = [
      { semester: '1', credits: 20, gpa: 3.2 },
      { semester: '2', credits: 22, gpa: 3.5 },
      { semester: '3', credits: 18, gpa: 3.1 },
      { semester: '4', credits: 24, gpa: 3.7 },
    ];

    // Contoh data untuk EnrollmentTrendChart (jumlah mahasiswa per bulan)
    enrollmentTrendData = [
      { month: 'Jan', enrolled: 150, dropped: 5 },
      { month: 'Feb', enrolled: 145, dropped: 3 },
      { month: 'Mar', enrolled: 160, dropped: 8 },
      { month: 'Apr', enrolled: 155, dropped: 4 },
      { month: 'May', enrolled: 170, dropped: 6 },
    ];

    // Contoh data untuk GradeDistributionChart
    gradeDistributionData = [
      { name: 'A', value: 50, color: '#8884d8' },
      { name: 'A-', value: 75, color: '#83a6ed' },
      { name: 'B+', value: 100, color: '#8dd1e1' },
      { name: 'B', value: 120, color: '#82ca9d' },
      { name: 'B-', value: 90, color: '#a4de6c' },
      { name: 'C', value: 60, color: '#d7d3bf' },
      { name: 'D', value: 30, color: '#ffc658' },
      { name: 'E', value: 10, color: '#ff8042' },
    ];

  } catch (error) {
    console.error('Failed to fetch chart data:', error);
    // Tetap tampilkan halaman dengan chart kosong atau pesan error di dalam chart
  }

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <p className="text-sm font-medium">Manajemen Laporan</p>
        <p className="text-muted-foreground text-sm">
          Statistik & Grafik Analitik
        </p>
      </div>

      <div className="flex justify-end">
        <Button>
          <Download className="mr-2 h-4 w-4" />
          Ekspor Semua Grafik
        </Button>
      </div>

      <Card className="glass-effect dark:glass-effect-dark">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 size={18} />
            Progres Akademik Mahasiswa (IPK & SKS)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <AcademicProgressChart data={academicProgressData} />
        </CardContent>
      </Card>

      <Card className="glass-effect dark:glass-effect-dark">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 size={18} />
            Tren Pendaftaran Kelas
          </CardTitle>
        </CardHeader>
        <CardContent>
          <EnrollmentTrendChart data={enrollmentTrendData} />
        </CardContent>
      </Card>

      <Card className="glass-effect dark:glass-effect-dark">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 size={18} />
            Distribusi Nilai
          </CardTitle>
        </CardHeader>
        <CardContent>
          <GradeDistributionChart data={gradeDistributionData} />
        </CardContent>
      </Card>
    </div>
  );
}