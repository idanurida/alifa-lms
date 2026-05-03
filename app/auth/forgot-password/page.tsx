// app/auth/forgot-password/page.tsx
'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Mail, ArrowLeft, CheckCircle2, AlertCircle, GraduationCap } from 'lucide-react';
import Link from 'next/link';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [resetUrl, setResetUrl] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // For now: check if email exists, then show success
      // In production: send actual reset email with token
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (data.success) {
        setSent(true);
        if (data.resetUrl) setResetUrl(data.resetUrl);
      } else {
        setError(data.error || 'Gagal mengirim email reset');
      }
    } catch {
      setError('Gagal menghubungi server');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0f172a] flex items-center justify-center p-6 transition-colors">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="bg-[#0ea5e9]/10 p-4 rounded-2xl border border-[#0ea5e9]/20">
              <GraduationCap className="h-10 w-10 text-[#0ea5e9]" />
            </div>
          </div>
          <h1 className="text-2xl font-bold dark:text-white">Lupa Password</h1>
          <p className="text-slate-600 dark:text-slate-400 mt-2">
            {sent ? 'Cek email Anda untuk instruksi reset.' : 'Masukkan email terdaftar Anda.'}
          </p>
        </div>

        <Card className="bg-white dark:bg-[#1e293b]/50 border-slate-200 dark:border-white/10">
          <CardContent className="p-6">
            {sent ? (
              <div className="text-center space-y-4">
                <CheckCircle2 className="h-12 w-12 text-green-500 mx-auto" />
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Link reset password untuk <strong>{email}</strong>:
                </p>
                {resetUrl ? (
                  <a href={resetUrl} className="block p-3 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300 text-sm break-all hover:underline">
                    {resetUrl}
                  </a>
                ) : (
                  <p className="text-sm text-muted-foreground">Email tidak ditemukan dalam sistem.</p>
                )}
                <p className="text-xs text-muted-foreground">Link berlaku 1 jam. Klik link di atas untuk reset password.</p>
                <Link href="/login">
                  <Button variant="outline" className="mt-4">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Kembali ke Login
                  </Button>
                </Link>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email Terdaftar</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      className="pl-10"
                      placeholder="contoh@kampus.ac.id"
                      required
                    />
                  </div>
                </div>

                {error && (
                  <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm flex items-center gap-2">
                    <AlertCircle className="h-4 w-4" />
                    {error}
                  </div>
                )}

                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? 'Mengirim...' : 'Kirim Link Reset'}
                </Button>

                <div className="text-center">
                  <Link href="/login" className="text-sm text-[#0ea5e9] hover:underline">
                    <ArrowLeft className="inline h-3 w-3 mr-1" />
                    Kembali ke Login
                  </Link>
                </div>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
