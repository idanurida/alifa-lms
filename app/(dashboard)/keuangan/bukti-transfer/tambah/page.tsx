// app/(dashboard)/keuangan/bukti-transfer/tambah/page.tsx
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { sql } from '@/lib/db';
import TambahForm from './TambahForm';

export default async function TambahBuktiTransferPage() {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== 'mahasiswa') {
    return <div className="p-8 text-center">Unauthorized</div>;
  }

  let academicPeriods: { id: number; name: string; code: string }[] = [];
  try {
    academicPeriods = await sql`
      SELECT id, name, code FROM academic_periods WHERE is_active = true ORDER BY start_date DESC
    `;
  } catch {
    // fallback
  }

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <p className="text-sm font-medium">Manajemen Keuangan</p>
        <p className="text-muted-foreground text-sm">
          Upload bukti transfer pembayaran.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Upload Bukti Transfer Baru</CardTitle>
        </CardHeader>
        <CardContent>
          <TambahForm periods={academicPeriods} />
        </CardContent>
      </Card>
    </div>
  );
}
