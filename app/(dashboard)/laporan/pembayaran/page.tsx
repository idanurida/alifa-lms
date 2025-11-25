// app/(dashboard)/laporan/pembayaran/page.tsx
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download, Filter } from 'lucide-react';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { sql } from '@/lib/db';
import { formatRupiah } from '@/lib/utils';

export default async function LaporanPembayaranPage() {
  const session = await getServerSession(authOptions);
  if (!session || !['super_admin', 'staff_keuangan'].includes(session.user.role as string)) {
    return <div>Unauthorized</div>;
  }

  let data: any[] = [];
  try {
    const result = await sql`
      SELECT 
        pe.id, pe.student_id, s.name as student_name, s.nim,
        ap.name as academic_period_name,
        pe.amount, pe.transfer_date, pe.status,
        pe.verified_at, l.name as verified_by_name
      FROM payment_evidences pe
      JOIN students s ON pe.student_id = s.id
      JOIN academic_periods ap ON pe.academic_period_id = ap.id
      LEFT JOIN lecturers l ON pe.verified_by = l.id
      ORDER BY pe.created_at DESC
    `;
    data = result;
  } catch (error) {
    console.error('Failed to fetch payment report data:', error);
    return <div>Failed to load data.</div>;
  }

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <p className="text-sm font-medium">Manajemen Laporan</p>
        <p className="text-muted-foreground text-sm">
          Laporan Pembayaran Mahasiswa
        </p>
      </div>

      <Card className="glass-effect dark:glass-effect-dark">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Laporan Pembayaran</CardTitle>
          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              <Filter className="mr-2 h-4 w-4" />
              Filter
            </Button>
            <Button size="sm">
              <Download className="mr-2 h-4 w-4" />
              Ekspor ke Excel
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2">NIM</th>
                  <th className="text-left p-2">Nama</th>
                  <th className="text-left p-2">Periode</th>
                  <th className="text-left p-2">Jumlah</th>
                  <th className="text-left p-2">Tanggal Transfer</th>
                  <th className="text-left p-2">Status</th>
                  <th className="text-left p-2">Diverifikasi Oleh</th>
                  <th className="text-left p-2">Tanggal Verifikasi</th>
                </tr>
              </thead>
              <tbody>
                {data.map((payment: any, index: number) => (
                  <tr key={index} className="border-b hover:bg-muted/30">
                    <td className="p-2 font-mono">{payment.nim}</td>
                    <td className="p-2 font-medium">{payment.student_name}</td>
                    <td className="p-2">{payment.academic_period_name}</td>
                    <td className="p-2">{formatRupiah(payment.amount)}</td>
                    <td className="p-2">{new Date(payment.transfer_date).toLocaleDateString('id-ID')}</td>
                    <td className="p-2 capitalize">{payment.status}</td>
                    <td className="p-2">{payment.verified_by_name || '—'}</td>
                    <td className="p-2">{payment.verified_at ? new Date(payment.verified_at).toLocaleDateString('id-ID') : '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
