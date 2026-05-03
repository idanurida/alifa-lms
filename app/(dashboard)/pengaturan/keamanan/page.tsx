// app/(dashboard)/pengaturan/keamanan/page.tsx
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Shield, Lock } from 'lucide-react';

export default async function KeamananPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect('/login');

  return (
    <div className="space-y-6 max-w-xl">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Keamanan Akun</h1>
        <p className="text-muted-foreground text-sm mt-1">Kelola password dan keamanan akun Anda.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Lock className="h-5 w-5" />
            Ubah Password
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form action="/api/auth/change-password" method="POST" className="space-y-4">
            <div>
              <Label htmlFor="current">Password Saat Ini</Label>
              <Input id="current" name="currentPassword" type="password" required />
            </div>
            <div>
              <Label htmlFor="new">Password Baru</Label>
              <Input id="new" name="newPassword" type="password" required minLength={6} />
            </div>
            <Button type="submit">Simpan Perubahan</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
