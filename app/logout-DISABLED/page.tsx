// app/logout/page.tsx
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { signOut } from 'next-auth/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { LogOut, RotateCcw, Home } from 'lucide-react';

export default function LogoutPage() {
  const router = useRouter();

  useEffect(() => {
    // Fungsi untuk logout dan redirect ke landing page
    const performLogout = async () => {
      // Panggil fungsi signOut dari NextAuth
      // Parameter `callbackUrl` menentukan ke mana pengguna akan diarahkan setelah logout
      await signOut({ 
        callbackUrl: '/', // <-- Arahkan ke landing page setelah logout
        redirect: true    // <-- Lakukan redirect secara otomatis
      });
    };

    // Panggil fungsi logout
    performLogout();
  }, []); // [] berarti hanya dijalankan sekali setelah komponen mount

  // Handler untuk tombol logout manual (jika diperlukan)
  const handleManualLogout = () => {
    signOut({ callbackUrl: '/', redirect: true });
  };

  // Handler untuk tombol batal (kembali ke halaman sebelumnya)
  const handleCancel = () => {
    router.back();
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center mb-4">
            <LogOut className="text-destructive" size={32} />
          </div>
          <CardTitle>Logout</CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <p>Sesi Anda sedang diakhiri...</p>
          <p className="text-sm text-muted-foreground">Anda akan segera diarahkan ke beranda.</p>

          {/* Tombol manual logout (opsional, karena useEffect sudah logout otomatis) */}
          <div className="flex flex-col gap-2 pt-4">
            <Button onClick={handleManualLogout} variant="outline" className="w-full">
              <LogOut className="mr-2 h-4 w-4" />
              Keluar Sekarang
            </Button>
            <Button onClick={handleCancel} className="w-full">
              <RotateCcw className="mr-2 h-4 w-4" />
              Batal
            </Button>
            <Button variant="ghost" onClick={() => router.push('/')} className="w-full">
              <Home className="mr-2 h-4 w-4" />
              Ke Beranda
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}