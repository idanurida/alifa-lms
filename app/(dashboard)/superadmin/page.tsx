// app/(dashboard)/superadmin/page.tsx
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { sql } from '@/lib/db';
import { Users, Building, GraduationCap, CreditCard, FileText, Settings, Database, Activity } from 'lucide-react';

export default async function SuperAdminDashboardPage() {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== 'super_admin') {
    return <div>Unauthorized</div>;
  }

  let summaryData = {
    totalUsers: 0,
    totalStudents: 0,
    totalLecturers: 0,
    totalClasses: 0,
    totalPendingPayments: 0,
    totalInvoices: 0,
    totalCurricula: 0,
    totalActivePeriods: 0,
  };

  try {
    const [
      [userCount],
      [studentCount],
      [lecturerCount],
      [classCount],
      [pendingPaymentCount],
      [invoiceCount],
      [curriculaCount],
      [activePeriodCount],
    ] = await Promise.all([
      sql`SELECT COUNT(*) as count FROM users`,
      sql`SELECT COUNT(*) as count FROM students`,
      sql`SELECT COUNT(*) as count FROM lecturers`,
      sql`SELECT COUNT(*) as count FROM classes`,
      sql`SELECT COUNT(*) as count FROM payment_evidences WHERE status = 'pending'`,
      sql`SELECT COUNT(*) as count FROM invoices`,
      sql`SELECT COUNT(*) as count FROM curricula`,
      sql`SELECT COUNT(*) as count FROM academic_periods WHERE is_active = true`,
    ]);

    summaryData = {
      totalUsers: parseInt(userCount.count),
      totalStudents: parseInt(studentCount.count),
      totalLecturers: parseInt(lecturerCount.count),
      totalClasses: parseInt(classCount.count),
      totalPendingPayments: parseInt(pendingPaymentCount.count),
      totalInvoices: parseInt(invoiceCount.count),
      totalCurricula: parseInt(curriculaCount.count),
      totalActivePeriods: parseInt(activePeriodCount.count),
    };
  } catch (error) {
    console.error('Failed to fetch summary data:', error);
    // Tampilkan error UI atau kembalikan nilai default
    // return <div>Failed to load data.</div>;
  }

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <p className="text-sm font-medium">Super Admin Dashboard</p>
        <p className="text-muted-foreground text-sm">
          Overview sistem, manajemen pengguna, dan pengaturan global.
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="glass-effect dark:glass-effect-dark">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Pengguna</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summaryData.totalUsers}</div>
            <p className="text-xs text-muted-foreground">Di semua role</p>
          </CardContent>
        </Card>

        <Card className="glass-effect dark:glass-effect-dark">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Mahasiswa</CardTitle>
            <GraduationCap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summaryData.totalStudents}</div>
            <p className="text-xs text-muted-foreground">Terdaftar</p>
          </CardContent>
        </Card>

        <Card className="glass-effect dark:glass-effect-dark">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Dosen</CardTitle>
            <GraduationCap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summaryData.totalLecturers}</div>
            <p className="text-xs text-muted-foreground">Aktif</p>
          </CardContent>
        </Card>

        <Card className="glass-effect dark:glass-effect-dark">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Kelas Aktif</CardTitle>
            <Building className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summaryData.totalClasses}</div>
            <p className="text-xs text-muted-foreground">Saat ini</p>
          </CardContent>
        </Card>

        <Card className="glass-effect dark:glass-effect-dark">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Pembayaran Tertunda</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summaryData.totalPendingPayments}</div>
            <p className="text-xs text-muted-foreground">Menunggu verifikasi</p>
          </CardContent>
        </Card>

        <Card className="glass-effect dark:glass-effect-dark">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Invoice</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summaryData.totalInvoices}</div>
            <p className="text-xs text-muted-foreground">Tagihan</p>
          </CardContent>
        </Card>

        <Card className="glass-effect dark:glass-effect-dark">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Kurikulum</CardTitle>
            <GraduationCap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summaryData.totalCurricula}</div>
            <p className="text-xs text-muted-foreground">Tersedia</p>
          </CardContent>
        </Card>

        <Card className="glass-effect dark:glass-effect-dark">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Periode Aktif</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summaryData.totalActivePeriods}</div>
            <p className="text-xs text-muted-foreground">Sedang berlangsung</p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Links */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Manajemen Sistem</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <Card className="hover:shadow-md transition-shadow cursor-pointer glass-effect dark:glass-effect-dark">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-muted">
                  <Users className="h-5 w-5 text-supabase-green" />
                </div>
                <CardTitle className="text-base">Manajemen Pengguna</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">Tambah, edit, nonaktifkan pengguna</p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow cursor-pointer glass-effect dark:glass-effect-dark">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-muted">
                  <Building className="h-5 w-5 text-supabase-green" />
                </div>
                <CardTitle className="text-base">Manajemen Akademik</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">Kurikulum, kelas, dosen, mahasiswa</p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow cursor-pointer glass-effect dark:glass-effect-dark">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-muted">
                  <CreditCard className="h-5 w-5 text-supabase-green" />
                </div>
                <CardTitle className="text-base">Manajemen Keuangan</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">Verifikasi pembayaran, invoice</p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow cursor-pointer glass-effect dark:glass-effect-dark">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-muted">
                  <Database className="h-5 w-5 text-supabase-green" />
                </div>
                <CardTitle className="text-base">Backup & Restore</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">Cadangkan atau pulihkan data sistem</p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow cursor-pointer glass-effect dark:glass-effect-dark">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-muted">
                  <Activity className="h-5 w-5 text-supabase-green" />
                </div>
                <CardTitle className="text-base">Audit Log</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">Log aktivitas pengguna dan sistem</p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow cursor-pointer glass-effect dark:glass-effect-dark">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-muted">
                  <Settings className="h-5 w-5 text-supabase-green" />
                </div>
                <CardTitle className="text-base">Pengaturan Sistem</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">Konfigurasi global LMS</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}