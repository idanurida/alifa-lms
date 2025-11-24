// app/auth/reset-password/page.tsx
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Lock } from 'lucide-react';
import { toast } from 'sonner';

export default function ResetPasswordPage() {
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    const password = formData.get('password') as string;
    const confirmPassword = formData.get('confirmPassword') as string;
    const token = new URLSearchParams(window.location.search).get('token'); // Ambil token dari URL jika ada

    if (password !== confirmPassword) {
      toast.error('❌ Kata sandi tidak cocok.');
      return;
    }

    // Simulasi API call
    try {
      // const res = await fetch('/api/auth/reset-password', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ password, token }), // Kirim token jika digunakan
      // });

      // if (!res.ok) throw new Error('Gagal mereset kata sandi');

      toast.success('✅ Kata sandi berhasil direset. Silakan login kembali.');
      // Redirect ke login setelah sukses
      // router.push('/login');
    } catch (error: any) {
      toast.error(`❌ ${(error as Error).message}`);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle>Reset Kata Sandi</CardTitle>
          <CardDescription>
            Masukkan kata sandi baru Anda.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit}>
            <div className="space-y-4">
              <div>
                <label htmlFor="password" className="text-sm font-medium">Kata Sandi Baru</label>
                <div className="relative mt-1">
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    placeholder="••••••••"
                    required
                    className="pl-10"
                  />
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={16} />
                </div>
              </div>
              <div>
                <label htmlFor="confirmPassword" className="text-sm font-medium">Konfirmasi Kata Sandi</label>
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  placeholder="••••••••"
                  required
                  className="mt-1"
                />
              </div>
              <Button type="submit" className="w-full">
                Reset Kata Sandi
              </Button>
            </div>
          </form>
          <div className="mt-4 text-center text-sm">
            <Link href="/login" className="text-primary hover:underline">
              Kembali ke Login
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}