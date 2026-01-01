// app/(dashboard)/keuangan/page.tsx
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { sql } from '@/lib/db';
import { CreditCard, FileText, Users, Calendar } from 'lucide-react';
import Link from 'next/link';
import { StatsCard, ModuleCard, QuickAction, DashboardHeading } from '@/components/dashboard/DashboardComponents';

export default async function KeuanganDashboardPage() {
  const session = await getServerSession(authOptions);
  if (!session || !['super_admin', 'staff_keuangan'].includes(session.user.role as string)) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center p-8 rounded-3xl bg-red-500/5 border-2 border-red-500/10">
          <h2 className="text-2xl font-bold text-red-600 uppercase tracking-tighter">Akses Ditolak</h2>
          <p className="text-slate-500 font-bold mt-2 uppercase tracking-widest text-xs">
            Anda tidak memiliki otorisasi untuk mengakses data keuangan.
          </p>
        </div>
      </div>
    );
  }

  let summaryData = {
    totalPending: 0,
    totalVerified: 0,
    totalRejected: 0,
    totalInvoices: 0,
  };

  try {
    const [
      [pendingCount],
      [verifiedCount],
      [rejectedCount],
      [invoiceCount],
    ] = await Promise.all([
      sql`SELECT COUNT(*) as count FROM payment_evidences WHERE status = 'pending'`,
      sql`SELECT COUNT(*) as count FROM payment_evidences WHERE status = 'verified'`,
      sql`SELECT COUNT(*) as count FROM payment_evidences WHERE status = 'rejected'`,
      sql`SELECT COUNT(*) as count FROM invoices`,
    ]);

    summaryData = {
      totalPending: parseInt(pendingCount.count),
      totalVerified: parseInt(verifiedCount.count),
      totalRejected: parseInt(rejectedCount.count),
      totalInvoices: parseInt(invoiceCount.count),
    };
  } catch (error) {
    console.error('Failed to fetch summary data:', error);
  }

  return (
    <div className="space-y-8">
      <DashboardHeading
        title="Dashboard Keuangan"
        subtitle="Kelola pembayaran, verifikasi bukti transfer, dan pantau laporan keuangan secara real-time melalui ekosistem Alifa Institute."
        badge={session.user.role.replace('_', ' ')}
      />

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="Menunggu Verifikasi"
          value={summaryData.totalPending}
          description="Bukti transfer baru"
          icon={FileText}
          variant={summaryData.totalPending > 0 ? "warning" : "default"}
          href="/keuangan/bukti-transfer"
        />
        <StatsCard
          title="Terverifikasi"
          value={summaryData.totalVerified}
          description="Pembayaran berhasil"
          icon={CreditCard}
        />
        <StatsCard
          title="Ditolak"
          value={summaryData.totalRejected}
          description="Bukti transfer bermasalah"
          icon={FileText}
          variant={summaryData.totalRejected > 0 ? "danger" : "default"}
        />
        <StatsCard
          title="Total Tagihan"
          value={summaryData.totalInvoices}
          description="Invoice terbit"
          icon={CreditCard}
        />
      </div>

      {/* Quick Links */}
      <div>
        <div className="flex items-center justify-between mb-8">
          <h3 className="text-2xl font-bold tracking-tighter text-slate-800 dark:text-white">Ekosistem Keuangan</h3>
          <div className="px-4 py-1.5 bg-[#0ea5e9]/10 border border-[#0ea5e9]/20 rounded-full text-[#0ea5e9] font-bold text-[10px] tracking-[0.2em] uppercase">
            Modul Keamanan Tinggi
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <ModuleCard
            title="Bukti Transfer"
            description="Manajemen arsip bukti transfer dari mahasiswa"
            icon={FileText}
            href="/keuangan/bukti-transfer"
          />
          <ModuleCard
            title="Sistem Verifikasi"
            description="Antrian cerdas untuk validasi pembayaran"
            icon={CreditCard}
            href="/keuangan/verifikasi"
          />
          <ModuleCard
            title="Laporan Konsolidasi"
            description="Laporan analitik keuangan dan pembayaran"
            icon={FileText}
            href="/keuangan/laporan"
          />
        </div>
      </div>

      {/* Analytics & Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card className="premium-glass bg-white dark:bg-slate-900/40 border-2 border-slate-200/50 dark:border-white/5 rounded-3xl shadow-xl overflow-hidden">
          <CardHeader className="border-b border-slate-100 dark:border-white/5 pb-6">
            <CardTitle className="text-sm font-bold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">Status Pembayaran</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div className="flex justify-between items-center p-5 rounded-2xl bg-yellow-500/10 border-2 border-yellow-500/20 shadow-sm">
                <span className="text-sm font-bold uppercase tracking-widest text-yellow-700 dark:text-yellow-400">Menunggu Verifikasi</span>
                <div className="px-4 py-1.5 bg-yellow-500 text-white rounded-full font-bold text-xs shadow-lg shadow-yellow-500/20">
                  {summaryData.totalPending}
                </div>
              </div>
              <div className="flex justify-between items-center p-5 rounded-2xl bg-[#0ea5e9]/10 border-2 border-[#0ea5e9]/20 shadow-sm">
                <span className="text-sm font-bold uppercase tracking-widest text-[#0ea5e9] dark:text-sky-300">Terverifikasi</span>
                <div className="px-4 py-1.5 bg-[#0ea5e9] text-white rounded-full font-bold text-xs shadow-lg shadow-[#0ea5e9]/20">
                  {summaryData.totalVerified}
                </div>
              </div>
              <div className="flex justify-between items-center p-5 rounded-2xl bg-red-500/10 border-2 border-red-500/20 shadow-sm">
                <span className="text-sm font-bold uppercase tracking-widest text-red-700 dark:text-red-400">Ditolak</span>
                <div className="px-4 py-1.5 bg-red-500 text-white rounded-full font-bold text-xs shadow-lg shadow-red-500/20">
                  {summaryData.totalRejected}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="premium-glass bg-white dark:bg-slate-900/40 border-2 border-slate-200/50 dark:border-white/5 rounded-3xl shadow-xl overflow-hidden">
          <CardHeader className="border-b border-slate-100 dark:border-white/5 pb-6">
            <CardTitle className="text-sm font-bold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">Aksi Cepat</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <QuickAction
                title="Verifikasi Sekarang"
                description={`Terdapat ${summaryData.totalPending} pembayaran yang perlu diperiksa`}
                icon={CreditCard}
                href="/keuangan/verifikasi"
                variant={summaryData.totalPending > 0 ? "warning" : "default"}
              />
              <QuickAction
                title="Arsip Transfer"
                description="Lihat seluruh riwayat bukti transfer mahasiswa"
                icon={FileText}
                href="/keuangan/bukti-transfer"
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

