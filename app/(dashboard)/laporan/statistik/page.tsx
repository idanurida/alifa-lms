import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download, BarChart3 } from 'lucide-react';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

interface ChartData {
  name: string;
  value: number;
  color?: string;
}

interface ProgressData {
  semester: string;
  credits: number;
  gpa: number;
}

interface EnrollmentData {
  month: string;
  enrolled: number;
  dropped: number;
}

export default async function LaporanStatistikPage() {
  const session = await getServerSession(authOptions);
  if (!session || !['super_admin', 'staff_akademik', 'staff_keuangan'].includes(session.user.role as string)) {
    return <div>Unauthorized</div>;
  }

  // Data statis untuk contoh
  const academicProgressData: ProgressData[] = [
    { semester: '1', credits: 20, gpa: 3.2 },
    { semester: '2', credits: 22, gpa: 3.5 },
    { semester: '3', credits: 18, gpa: 3.1 },
    { semester: '4', credits: 24, gpa: 3.7 },
  ];

  const enrollmentTrendData: EnrollmentData[] = [
    { month: 'Jan', enrolled: 150, dropped: 5 },
    { month: 'Feb', enrolled: 145, dropped: 3 },
    { month: 'Mar', enrolled: 160, dropped: 8 },
    { month: 'Apr', enrolled: 155, dropped: 4 },
    { month: 'May', enrolled: 170, dropped: 6 },
  ];

  const gradeDistributionData: ChartData[] = [
    { name: 'A', value: 50, color: '#8884d8' },
    { name: 'A-', value: 75, color: '#83a6ed' },
    { name: 'B+', value: 100, color: '#8dd1e1' },
    { name: 'B', value: 120, color: '#82ca9d' },
    { name: 'B-', value: 90, color: '#a4de6c' },
    { name: 'C', value: 60, color: '#d7d3bf' },
    { name: 'D', value: 30, color: '#ffc658' },
    { name: 'E', value: 10, color: '#ff8042' },
  ];

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
          <div className="h-64 flex items-center justify-center text-muted-foreground">
            Chart: Academic Progress - Data tersedia
          </div>
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
          <div className="h-64 flex items-center justify-center text-muted-foreground">
            Chart: Enrollment Trend - Data tersedia
          </div>
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
          <div className="h-64 flex items-center justify-center text-muted-foreground">
            Chart: Grade Distribution - Data tersedia
          </div>
        </CardContent>
      </Card>
    </div>
  );
}