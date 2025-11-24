// app/(dashboard)/pengaturan/keamanan/page.tsx
'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Shield, KeyRound } from 'lucide-react';
import { toast } from 'sonner';

export default function PengaturanKeamananPage() {
  const { data: session } = useSession();
  const [isLoading, setIsLoading] = useState(false);

  if (!session) {
    return <div>Unauthorized</div>;
  }

  const handleChangePassword = async (formData: FormData) => {
    setIsLoading(true);
    
    const currentPassword = formData.get('currentPassword') as string;
    const newPassword = formData.get('newPassword') as string;
    const confirmNewPassword = formData.get('confirmNewPassword') as string;

    // Validasi sederhana
    if (newPassword !== confirmNewPassword) {
      toast.error('❌ Kata sandi baru dan konfirmasi tidak cocok.');
      setIsLoading(false);
      return;
    }

    if (newPassword.length < 6) {
      toast.error('❌ Kata sandi baru minimal 6 karakter.');
      setIsLoading(false);
      return;
    }

    try {
      // Kirim request ke API route untuk ganti password
      const response = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          currentPassword,
          newPassword,
        }),
      });

      const result = await response.json();

      if (response.ok) {
        toast.success('✅ Kata sandi berhasil diubah.');
        // Reset form
        const form = document.getElementById('password-form') as HTMLFormElement;
        if (form) form.reset();
      } else {
        toast.error(`❌ ${result.error || 'Gagal mengubah kata sandi.'}`);
      }
    } catch (error) {
      console.error('Failed to change password:', error);
      toast.error('❌ Gagal mengubah kata sandi.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-bold">Keamanan Akun</h1>
        <p className="text-muted-foreground">
          Kelola keamanan akun Anda.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield size={18} />
            Ubah Kata Sandi
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form id="password-form" action={handleChangePassword} className="space-y-4">
            <div>
              <Label htmlFor="currentPassword">Kata Sandi Saat Ini</Label>
              <div className="relative mt-1">
                <Input
                  id="currentPassword"
                  name="currentPassword"
                  type="password"
                  placeholder="••••••••"
                  required
                  className="pr-10"
                />
                <KeyRound className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={16} />
              </div>
            </div>

            <div>
              <Label htmlFor="newPassword">Kata Sandi Baru</Label>
              <Input
                id="newPassword"
                name="newPassword"
                type="password"
                placeholder="••••••••"
                required
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="confirmNewPassword">Konfirmasi Kata Sandi Baru</Label>
              <Input
                id="confirmNewPassword"
                name="confirmNewPassword"
                type="password"
                placeholder="••••••••"
                required
                className="mt-1"
              />
            </div>

            <div className="flex gap-3 pt-4">
              <Button type="submit" disabled={isLoading}>
                {isLoading ? 'Mengubah...' : 'Ubah Kata Sandi'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Card tambahan untuk opsi keamanan lainnya */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield size={18} />
            Opsi Keamanan Lainnya
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Button variant="outline" className="w-full justify-start">
              Aktifkan Otentikasi Dua Faktor (2FA)
            </Button>
            <Button variant="outline" className="w-full justify-start">
              Lihat Aktivitas Login Terakhir
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}