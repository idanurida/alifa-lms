// app/(dashboard)/keuangan/invoice/page.tsx
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { sql } from '@/lib/db';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import LaporanTable from '@/components/laporan/LaporanTable';
import { formatRupiah } from '@/lib/utils';

export default async function InvoicePage() {
  const session = await getServerSession(authOptions);
  if (!session || !['super_admin', 'staff_keuangan'].includes(session.user.role)) {
    return <div className="p-8 text-center">Unauthorized</div>;
  }

  let invoices: Record<string, unknown>[] = [];
  try {
    invoices = await sql`
      SELECT 
        i.id, s.name as student_name, s.nim,
        ap.name as period_name,
        i.amount, i.due_date, i.status, i.created_at
      FROM invoices i
      JOIN students s ON i.student_id = s.id
      JOIN academic_periods ap ON i.academic_period_id = ap.id
      ORDER BY i.created_at DESC
    `;
  } catch {
    // fallback
  }

  const columns = [
    { key: 'student_name', label: 'Nama' },
    { key: 'nim', label: 'NIM' },
    { key: 'period_name', label: 'Periode' },
    {
      key: 'amount', label: 'Jumlah',
      render: (val: unknown) => formatRupiah(Number(val))
    },
    {
      key: 'due_date', label: 'Jatuh Tempo',
      render: (val: unknown) => val ? new Date(String(val)).toLocaleDateString('id-ID') : '-'
    },
    {
      key: 'status', label: 'Status',
      render: (val: unknown) => {
        const status = String(val);
        return (
          <Badge variant={status === 'paid' ? 'default' : status === 'unpaid' ? 'destructive' : 'secondary'}>
            {status === 'paid' ? 'Lunas' : status === 'unpaid' ? 'Belum Bayar' : status}
          </Badge>
        );
      }
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Invoice</h1>
        <p className="text-muted-foreground text-sm mt-1">Daftar tagihan pembayaran mahasiswa per periode.</p>
      </div>

      <Card>
        <CardContent className="pt-6">
          <LaporanTable
            title={`Daftar Invoice (${invoices.length})`}
            columns={columns}
            data={invoices}
            filename="laporan-invoice"
          />
        </CardContent>
      </Card>
    </div>
  );
}
