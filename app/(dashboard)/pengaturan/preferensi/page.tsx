// app/(dashboard)/pengaturan/preferensi/page.tsx
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Settings } from 'lucide-react';

export default async function PreferensiPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect('/login');

  return (
    <div className="space-y-6 max-w-xl">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Preferensi</h1>
        <p className="text-muted-foreground text-sm mt-1">Pengaturan tampilan dan notifikasi.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Settings className="h-5 w-5" />
            Notifikasi
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-muted-foreground">
          <p>✅ Notifikasi KRS — aktif</p>
          <p>✅ Notifikasi Pembayaran — aktif</p>
          <p>✅ Notifikasi Forum — aktif</p>
        </CardContent>
      </Card>
    </div>
  );
}
