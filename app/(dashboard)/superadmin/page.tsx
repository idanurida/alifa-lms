// app/(dashboard)/superadmin/page.tsx
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { sql } from '@/lib/db';
import {
  Users,
  Building,
  GraduationCap,
  CreditCard,
  FileText,
  Settings,
  Database,
  Activity,
  ShieldCheck,
  Zap,
  Lock
} from 'lucide-react';
import {
  StatsCard,
  ModuleCard,
  QuickAction,
  DashboardHeading
} from '@/components/dashboard/DashboardComponents';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export default async function SuperAdminDashboardPage() {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== 'super_admin') {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center p-8 premium-glass rounded-3xl border-destructive/20 bg-destructive/5 max-w-md">
          <Lock className="h-12 w-12 text-destructive mx-auto mb-4" />
          <h2 className="text-2xl font-bold tracking-tight text-destructive">Akses Ditolak</h2>
          <p className="text-muted-foreground mt-2">Anda tidak memiliki otorisasi untuk mengakses pusat kendali super admin.</p>
        </div>
      </div>
    );
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
  }

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <DashboardHeading
        title="Pusat Kendali Utama"
        subtitle="Otoritas tertinggi Alifa Institute. Kelola seluruh ekosistem digital, infrastruktur data, dan keamanan sistem dalam satu kendali terpadu."
        badge="Super Admin OVR"
      />

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="Total User"
          value={summaryData.totalUsers}
          description="Seluruh role sistem"
          icon={Users}
          variant="info"
        />
        <StatsCard
          title="Infrastruktur"
          value={summaryData.totalClasses}
          description="Kelas aktif berjalan"
          icon={Building}
        />
        <StatsCard
          title="E-Finance"
          value={summaryData.totalPendingPayments}
          description="Verifikasi tertunda"
          icon={CreditCard}
          variant={summaryData.totalPendingPayments > 0 ? "warning" : "default"}
          href="/keuangan/verifikasi"
        />
        <StatsCard
          title="Sistem Uptime"
          value="99.9%"
          description="Operasional normal"
          icon={ShieldCheck}
        />
      </div>

      {/* Navigasi Utama / Modul Inti */}
      <div>
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <Zap className="h-6 w-6 text-[#0ea5e9] animate-pulse" />
            <h3 className="text-2xl font-bold tracking-tighter text-slate-900 dark:text-white">Arsitektur Inti</h3>
          </div>
          <div className="px-4 py-1.5 bg-red-500/10 border border-red-500/20 text-red-600 font-bold text-[9px] tracking-[0.2em] uppercase rounded-full">
            Prioritas Tinggi
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <ModuleCard
            title="Manajemen Pengguna"
            description="Kontrol akses, perizinan, dan manajemen identitas seluruh pengguna sistem."
            icon={Users}
            href="/superadmin/users"
          />
          <ModuleCard
            title="Mesin Akademik"
            description="Konfigurasi inti kurikulum, mata kuliah, dan struktur akademik institusi."
            icon={GraduationCap}
            href="/akademik"
          />
          <ModuleCard
            title="Brankas Keuangan"
            description="Pusat verifikasi transaksi dan manajemen tagihan keuangan institusi."
            icon={CreditCard}
            href="/keuangan"
          />
        </div>
      </div>

      {/* Aksi Sekunder & Log Sistem */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card className="premium-glass bg-white dark:bg-slate-900/40 border-2 border-slate-200/50 dark:border-white/5 rounded-3xl shadow-xl overflow-hidden">
          <CardHeader className="border-b border-slate-100 dark:border-white/5 pb-6">
            <CardTitle className="text-sm font-bold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">Operasi Sistem</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <QuickAction
                title="System Configuration"
                description="Ubah variabel lingkungan dan pengaturan global LMS."
                icon={Settings}
                href="/superadmin/pengaturan-sistem"
              />
              <QuickAction
                title="Manajemen Pengguna"
                description="Kelola semua akun dan role pengguna sistem."
                icon={Users}
                href="/superadmin/users"
              />
              <QuickAction
                title="Keuangan"
                description="Pantau dan verifikasi transaksi pembayaran."
                icon={CreditCard}
                href="/keuangan"
              />
            </div>
          </CardContent>
        </Card>

        <Card className="premium-glass bg-white dark:bg-slate-900/40 border-2 border-slate-200/50 dark:border-white/5 rounded-3xl shadow-xl overflow-hidden">
          <CardHeader className="border-b border-slate-100 dark:border-white/5 pb-6">
            <CardTitle className="text-sm font-bold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">Intelegensi Langsung</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {[
                { label: 'Mahasiswa Terdaftar', value: summaryData.totalStudents, icon: GraduationCap },
                { label: 'Dosen Aktif', value: summaryData.totalLecturers, icon: Users },
                { label: 'Total Kurikulum', value: summaryData.totalCurricula, icon: FileText },
                { label: 'Periode Akademik', value: summaryData.totalActivePeriods, icon: Activity }
              ].map((item, i) => (
                <div key={i} className="flex items-center justify-between p-4 rounded-2xl bg-primary/5 border border-primary/10 group hover:bg-primary/10 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-white dark:bg-slate-950 shadow-sm transition-transform group-hover:scale-110">
                      <item.icon className="h-4 w-4 text-primary" />
                    </div>
                    <span className="text-sm font-bold">{item.label}</span>
                  </div>
                  <Badge variant="outline" className="bg-primary/20 text-primary border-primary/30 font-bold px-3">{item.value}</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}