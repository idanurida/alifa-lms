// app/(dashboard)/staff-keuangan/dashboard/page.tsx
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { sql } from '@/lib/db';
import { redirect } from 'next/navigation';
import {
  DollarSign,
  CreditCard,
  CheckCircle,
  AlertTriangle,
  FileText,
  Settings,
  Lock
} from 'lucide-react';
import {
  StatsCard,
  QuickAction,
  DashboardHeading
} from '@/components/dashboard/DashboardComponents';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';

export default async function StaffKeuanganDashboard() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect('/login');
  }

  if (!['staff_keuangan', 'super_admin'].includes(session.user.role)) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center p-8 premium-glass rounded-3xl border-destructive/20 bg-destructive/5 max-w-md">
          <Lock className="h-12 w-12 text-destructive mx-auto mb-4" />
          <h2 className="text-2xl font-bold tracking-tight text-destructive">Akses Ditolak</h2>
          <p className="text-muted-foreground mt-2">Hanya Staff Keuangan yang dapat mengakses dashboard ini.</p>
        </div>
      </div>
    );
  }

  // Fetch data keuangan dari database
  let stats = {
    totalPemasukan: 0,
    pendingVerifikasi: 0,
    totalPembayaranLunas: 0,
    totalPembayaran: 0,
    recentPayments: [] as { student_name: string; nim: string; amount: number; status: string; date: string }[],
  };

  try {
    const [incomeResult] = await sql`
      SELECT COALESCE(SUM(amount), 0) as total
      FROM payment_evidences
      WHERE status = 'approved'
    `;
    stats.totalPemasukan = parseInt(incomeResult?.total || '0');

    const [pendingResult] = await sql`
      SELECT COUNT(*) as count FROM payment_evidences WHERE status = 'pending'
    `;
    stats.pendingVerifikasi = parseInt(pendingResult?.count || '0');

    const [lunasResult] = await sql`
      SELECT COUNT(*) as count FROM payment_evidences WHERE status = 'approved'
    `;
    stats.totalPembayaranLunas = parseInt(lunasResult?.count || '0');

    const [totalResult] = await sql`
      SELECT COUNT(*) as count FROM payment_evidences
    `;
    stats.totalPembayaran = parseInt(totalResult?.count || '0');

    const recentPayments = await sql`
      SELECT 
        pe.amount,
        pe.status,
        pe.created_at,
        s.name as student_name,
        s.nim
      FROM payment_evidences pe
      JOIN students s ON pe.student_id = s.id
      ORDER BY pe.created_at DESC
      LIMIT 5
    `;

    stats.recentPayments = (recentPayments || []).map((p: any) => ({
      student_name: p.student_name || '-',
      nim: p.nim || '-',
      amount: parseInt(p.amount || '0'),
      status: p.status || 'pending',
      date: new Date(p.created_at).toLocaleDateString('id-ID'),
    }));
  } catch {
    // Dashboard tetap bisa dirender dengan data kosong
  }

  const formatRupiah = (n: number) => 
    'Rp ' + n.toLocaleString('id-ID');

  const lunasPct = stats.totalPembayaran > 0 
    ? Math.round((stats.totalPembayaranLunas / stats.totalPembayaran) * 100) 
    : 0;

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <DashboardHeading
        title="Dashboard Keuangan"
        subtitle={`Selamat datang, ${session.user.name}! Kelola pembayaran, verifikasi bukti transfer, dan pantau arus keuangan institusi.`}
        badge="Staff Keuangan"
      />

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="Pemasukan"
          value={formatRupiah(stats.totalPemasukan)}
          description="Total terverifikasi"
          icon={DollarSign}
          variant="info"
        />
        <StatsCard
          title="Menunggu Verifikasi"
          value={stats.pendingVerifikasi}
          description="Bukti transfer perlu dicek"
          icon={AlertTriangle}
          variant={stats.pendingVerifikasi > 0 ? 'warning' : 'default'}
          href="/keuangan/verifikasi"
        />
        <StatsCard
          title="Pembayaran Lunas"
          value={stats.totalPembayaranLunas}
          description={`${lunasPct}% dari total`}
          icon={CheckCircle}
        />
        <StatsCard
          title="Total Transaksi"
          value={stats.totalPembayaran}
          description="Semua periode"
          icon={CreditCard}
        />
      </div>

      {/* Quick Navigation */}
      <Card className="premium-glass bg-white dark:bg-slate-900/40 border-2 border-slate-200/50 dark:border-white/5 rounded-3xl shadow-xl overflow-hidden">
        <CardHeader>
          <CardTitle className="text-sm font-bold uppercase tracking-[0.2em]">Akses Cepat</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <QuickAction
              title="Verifikasi Pembayaran"
              description={`${stats.pendingVerifikasi} bukti transfer menunggu`}
              icon={CheckCircle}
              href="/keuangan/verifikasi"
              variant={stats.pendingVerifikasi > 0 ? 'warning' : 'default'}
            />
            <QuickAction
              title="Daftar Bukti Transfer"
              description="Semua bukti pembayaran"
              icon={FileText}
              href="/keuangan/bukti-transfer"
            />
            <QuickAction
              title="Laporan Keuangan"
              description="Ringkasan & statistik"
              icon={FileText}
              href="/keuangan/laporan"
            />
            <QuickAction
              title="Manajemen Keuangan"
              description="Kelola semua modul"
              icon={CreditCard}
              href="/keuangan"
            />
            <QuickAction
              title="Pengaturan"
              description="Profil dan keamanan"
              icon={Settings}
              href="/pengaturan"
            />
          </div>
        </CardContent>
      </Card>

      {/* Recent Payments + Status */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="premium-glass bg-white dark:bg-slate-900/40 border-2 border-slate-200/50 dark:border-white/5 rounded-3xl shadow-xl">
          <CardHeader>
            <CardTitle>Pembayaran Terbaru</CardTitle>
          </CardHeader>
          <CardContent>
            {stats.recentPayments.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">Belum ada data pembayaran.</p>
            ) : (
              <div className="space-y-3">
                {stats.recentPayments.map((payment, index) => (
                  <div key={index} className="flex justify-between items-center p-3 border rounded-lg">
                    <div>
                      <div className="font-medium">{payment.student_name}</div>
                      <div className="text-sm text-muted-foreground">{payment.nim} &middot; {payment.date}</div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium">{formatRupiah(payment.amount)}</div>
                      <div className={`text-sm font-bold ${payment.status === 'approved' ? 'text-sky-600' : payment.status === 'rejected' ? 'text-red-600' : 'text-yellow-600'}`}>
                        {payment.status === 'approved' ? 'Lunas' : payment.status === 'rejected' ? 'Ditolak' : 'Pending'}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="premium-glass bg-white dark:bg-slate-900/40 border-2 border-slate-200/50 dark:border-white/5 rounded-3xl shadow-xl">
          <CardHeader>
            <CardTitle>Status Pembayaran</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between">
                <span>Lunas</span>
                <span className="font-medium">{stats.totalPembayaranLunas} ({lunasPct}%)</span>
              </div>
              <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                <div className="bg-sky-600 h-2 rounded-full" style={{ width: `${lunasPct}%` }} />
              </div>

              <div className="flex justify-between">
                <span>Pending</span>
                <span className="font-medium">{stats.pendingVerifikasi} ({stats.totalPembayaran > 0 ? Math.round((stats.pendingVerifikasi / stats.totalPembayaran) * 100) : 0}%)</span>
              </div>
              <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                <div className="bg-yellow-500 h-2 rounded-full" style={{ width: `${stats.totalPembayaran > 0 ? Math.round((stats.pendingVerifikasi / stats.totalPembayaran) * 100) : 0}%` }} />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
