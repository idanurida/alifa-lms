// app/auth/reset-password/page.tsx
'use client';

import { useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Lock, ArrowLeft, CheckCircle2, AlertCircle, GraduationCap } from 'lucide-react';
import Link from 'next/link';

export default function ResetPasswordPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get('token') || '';

  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password.length < 6) {
      setError('Password minimal 6 karakter');
      return;
    }
    if (password !== confirm) {
      setError('Konfirmasi password tidak cocok');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password }),
      });
      const data = await res.json();
      if (data.success) {
        setSuccess(true);
        setTimeout(() => router.push('/login'), 2000);
      } else {
        setError(data.error || 'Gagal reset password');
      }
    } catch {
      setError('Gagal menghubungi server');
    }
    setLoading(false);
  };

  if (!token) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-[#0f172a] flex items-center justify-center p-6">
        <Card className="w-full max-w-md text-center p-8">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold">Token Tidak Valid</h2>
          <p className="text-muted-foreground mt-2">Link reset password tidak valid atau sudah kadaluarsa.</p>
          <Link href="/auth/forgot-password">
            <Button variant="outline" className="mt-4">Minta Link Baru</Button>
          </Link>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0f172a] flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <GraduationCap className="h-12 w-12 text-[#0ea5e9] mx-auto mb-4" />
          <h1 className="text-2xl font-bold dark:text-white">Reset Password</h1>
          <p className="text-slate-600 dark:text-slate-400 mt-2">Masukkan password baru Anda.</p>
        </div>

        <Card className="bg-white dark:bg-[#1e293b]/50">
          <CardContent className="p-6">
            {success ? (
              <div className="text-center space-y-4">
                <CheckCircle2 className="h-12 w-12 text-green-500 mx-auto" />
                <p className="font-medium">Password berhasil direset!</p>
                <p className="text-sm text-muted-foreground">Mengarahkan ke halaman login...</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="password">Password Baru</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                    <Input id="password" type="password" value={password} onChange={e => setPassword(e.target.value)} className="pl-10" placeholder="Minimal 6 karakter" required minLength={6} />
                  </div>
                </div>
                <div>
                  <Label htmlFor="confirm">Konfirmasi Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                    <Input id="confirm" type="password" value={confirm} onChange={e => setConfirm(e.target.value)} className="pl-10" placeholder="Ulangi password" required />
                  </div>
                </div>
                {error && (
                  <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm flex items-center gap-2">
                    <AlertCircle className="h-4 w-4" />{error}
                  </div>
                )}
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? 'Mereset...' : 'Reset Password'}
                </Button>
                <Link href="/login" className="block text-center text-sm text-muted-foreground hover:underline">
                  <ArrowLeft className="inline h-3 w-3 mr-1" />Kembali ke Login
                </Link>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
