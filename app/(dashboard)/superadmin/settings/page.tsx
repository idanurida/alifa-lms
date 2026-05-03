// app/(dashboard)/superadmin/settings/page.tsx
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Settings, Lock } from 'lucide-react';

export default async function SuperAdminSettingsPage() {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== 'super_admin') {
    redirect('/login');
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-3">
        <div className="p-3 rounded-2xl bg-red-500/10 text-red-500">
          <Settings className="h-6 w-6" />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Pengaturan Sistem</h1>
          <p className="text-muted-foreground text-sm">Konfigurasi global LMS dan environment variables</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Informasi Sistem</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between py-2 border-b">
              <span className="text-muted-foreground">Environment</span>
              <span className="font-medium">{process.env.NODE_ENV || 'development'}</span>
            </div>
            <div className="flex justify-between py-2 border-b">
              <span className="text-muted-foreground">NEXTAUTH_URL</span>
              <span className="font-medium">{process.env.NEXTAUTH_URL || '-'}</span>
            </div>
            <div className="flex justify-between py-2 border-b">
              <span className="text-muted-foreground">DATABASE_URL</span>
              <span className="font-medium">{process.env.DATABASE_URL ? 'Tersedia' : 'Tidak tersedia'}</span>
            </div>
            <div className="flex justify-between py-2 border-b">
              <span className="text-muted-foreground">NEXTAUTH_SECRET</span>
              <span className="font-medium">{process.env.NEXTAUTH_SECRET ? 'Tersedia' : '⚠ Tidak ada'}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Sistem Uptime</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8">
              <div className="text-4xl font-bold text-sky-600">99.9%</div>
              <p className="text-muted-foreground mt-2">Operasional normal</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
