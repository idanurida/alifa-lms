// app/(dashboard)/keuangan/laporan/page.tsx
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export default async function LaporanPage() {
  const session = await getServerSession(authOptions);
  if (!session || !['super_admin', 'staff_keuangan'].includes(session.user.role as string)) {
    return <div>Unauthorized</div>;
  }

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-bold tracking-tight">Laporan Keuangan</h1>
        <p className="text-muted-foreground">
          Laporan dan analisis keuangan pembayaran mahasiswa.
        </p>
      </div>

      <Card className="glass-effect dark:glass-effect-dark">
        <CardHeader>
          <CardTitle>Laporan Pembayaran</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            Fitur laporan sedang dalam pengembangan.
          </div>
        </CardContent>
      </Card>
    </div>
  );
}