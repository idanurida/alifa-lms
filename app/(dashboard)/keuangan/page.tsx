// app/(dashboard)/keuangan/page.tsx
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { sql } from '@/lib/db';
import { CreditCard, FileText, Users, Calendar } from 'lucide-react';
import Link from 'next/link'; // IMPORT LINK

export default async function KeuanganDashboardPage() {
  const session = await getServerSession(authOptions);
  if (!session || !['super_admin', 'staff_keuangan'].includes(session.user.role as string)) {
    return <div>Unauthorized</div>;
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
    <div className="space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-bold tracking-tight">Dashboard Keuangan</h1>
        <p className="text-muted-foreground">
          Kelola pembayaran, verifikasi, dan laporan keuangan.
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="glass-effect dark:glass-effect-dark">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Menunggu Verifikasi</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summaryData.totalPending}</div>
            <p className="text-xs text-muted-foreground">Bukti transfer</p>
          </CardContent>
        </Card>

        <Card className="glass-effect dark:glass-effect-dark">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Terverifikasi</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summaryData.totalVerified}</div>
            <p className="text-xs text-muted-foreground">Pembayaran</p>
          </CardContent>
        </Card>

        <Card className="glass-effect dark:glass-effect-dark">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Ditolak</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summaryData.totalRejected}</div>
            <p className="text-xs text-muted-foreground">Bukti transfer</p>
          </CardContent>
        </Card>

        <Card className="glass-effect dark:glass-effect-dark">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Invoice</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summaryData.totalInvoices}</div>
            <p className="text-xs text-muted-foreground">Tagihan</p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Links */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Modul Keuangan</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Bukti Transfer Card */}
          <Link href="/keuangan/bukti-transfer">
            <Card className="hover:shadow-md transition-shadow cursor-pointer glass-effect dark:glass-effect-dark group">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-muted group-hover:bg-supabase-green/20 transition-colors">
                    <FileText className="h-5 w-5 text-supabase-green" />
                  </div>
                  <CardTitle className="text-base group-hover:text-supabase-green transition-colors">
                    Bukti Transfer
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">Daftar bukti transfer mahasiswa</p>
              </CardContent>
            </Card>
          </Link>

          {/* Verifikasi Card */}
          <Link href="/keuangan/verifikasi">
            <Card className="hover:shadow-md transition-shadow cursor-pointer glass-effect dark:glass-effect-dark group">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-muted group-hover:bg-supabase-green/20 transition-colors">
                    <CreditCard className="h-5 w-5 text-supabase-green" />
                  </div>
                  <CardTitle className="text-base group-hover:text-supabase-green transition-colors">
                    Verifikasi
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">Antrian verifikasi pembayaran</p>
                {summaryData.totalPending > 0 && (
                  <Badge variant="destructive" className="mt-2">
                    {summaryData.totalPending} menunggu
                  </Badge>
                )}
              </CardContent>
            </Card>
          </Link>

          {/* Laporan Card */}
          <Link href="/keuangan/laporan">
            <Card className="hover:shadow-md transition-shadow cursor-pointer glass-effect dark:glass-effect-dark group">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-muted group-hover:bg-supabase-green/20 transition-colors">
                    <FileText className="h-5 w-5 text-supabase-green" />
                  </div>
                  <CardTitle className="text-base group-hover:text-supabase-green transition-colors">
                    Laporan
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">Laporan keuangan dan pembayaran</p>
              </CardContent>
            </Card>
          </Link>
        </div>
      </div>

      {/* Recent Activity atau Quick Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="glass-effect dark:glass-effect-dark">
          <CardHeader>
            <CardTitle>Status Pembayaran</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm">Menunggu Verifikasi</span>
                <Badge variant="secondary">{summaryData.totalPending}</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Terverifikasi</span>
                <Badge variant="default" className="bg-green-500">{summaryData.totalVerified}</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Ditolak</span>
                <Badge variant="destructive">{summaryData.totalRejected}</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-effect dark:glass-effect-dark">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <Link 
                href="/keuangan/verifikasi" 
                className="flex items-center gap-3 p-3 rounded-lg border hover:bg-muted/50 transition-colors"
              >
                <CreditCard className="h-4 w-4" />
                <span className="text-sm">Verifikasi Pembayaran</span>
                {summaryData.totalPending > 0 && (
                  <Badge variant="destructive" className="ml-auto">
                    {summaryData.totalPending} baru
                  </Badge>
                )}
              </Link>
              <Link 
                href="/keuangan/bukti-transfer" 
                className="flex items-center gap-3 p-3 rounded-lg border hover:bg-muted/50 transition-colors"
              >
                <FileText className="h-4 w-4" />
                <span className="text-sm">Lihat Semua Bukti Transfer</span>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}