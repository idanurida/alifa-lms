// app/(dashboard)/superadmin/users/UserActions.tsx
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Key, Loader2, Check, Copy, Users } from 'lucide-react';
import {
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger,
} from '@/components/ui/dialog';

export function ResetPasswordButton({ userId, email }: { userId: number; email: string }) {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ password: string } | null>(null);
  const [copied, setCopied] = useState(false);

  const handleReset = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId }),
      });
      const data = await res.json();
      if (data.success) {
        setResult({ password: data.newPassword });
      }
    } catch {}
    setLoading(false);
  };

  const copyPassword = () => {
    if (result) {
      navigator.clipboard.writeText(result.password);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="h-7 text-xs">
          <Key className="h-3 w-3 mr-1" /> Reset
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Reset Password</DialogTitle>
          <DialogDescription>
            Password baru untuk <strong>{email}</strong>
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 pt-4">
          {result ? (
            <div className="space-y-3">
              <div className="p-4 rounded-xl bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-center">
                <p className="text-xs text-muted-foreground mb-1">Password Baru</p>
                <p className="text-2xl font-mono font-bold tracking-wider text-green-700 dark:text-green-400 select-all">
                  {result.password}
                </p>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" className="flex-1" onClick={copyPassword}>
                  {copied ? <Check className="h-4 w-4 mr-1" /> : <Copy className="h-4 w-4 mr-1" />}
                  {copied ? 'Tersalin!' : 'Salin'}
                </Button>
                <Button size="sm" className="flex-1" onClick={() => setResult(null)}>
                  Reset Lagi
                </Button>
              </div>
              <p className="text-xs text-muted-foreground text-center">
                Berikan password ini ke user. Mereka bisa ganti password setelah login.
              </p>
            </div>
          ) : (
            <div className="text-center space-y-4">
              <p className="text-sm text-muted-foreground">
                Generate password baru untuk user ini. Password lama tidak akan berlaku lagi.
              </p>
              <Button onClick={handleReset} disabled={loading} className="w-full">
                {loading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Key className="h-4 w-4 mr-2" />}
                {loading ? 'Mereset...' : 'Reset Password'}
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

export function BatchResetButton({ role, label }: { role: string; label: string }) {
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<any[] | null>(null);
  const [showAll, setShowAll] = useState(false);

  const handleBatch = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/reset-password', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role }),
      });
      const data = await res.json();
      if (data.success) setResults(data.results);
    } catch {}
    setLoading(false);
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Users className="h-4 w-4 mr-1" /> Reset Semua {label}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Batch Reset Password — {label}</DialogTitle>
          <DialogDescription>
            Reset password untuk SEMUA user dengan role {label}.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 pt-4">
          {results ? (
            <div className="space-y-2">
              <p className="text-sm text-green-600 font-medium">
                ✅ {results.length} password berhasil direset!
              </p>
              <div className="rounded-md border max-h-96 overflow-y-auto">
                <table className="w-full text-sm">
                  <thead className="bg-muted sticky top-0">
                    <tr>
                      <th className="text-left p-2">Email</th>
                      <th className="text-left p-2">Username</th>
                      <th className="text-left p-2">Password Baru</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(showAll ? results : results.slice(0, 50)).map((r: any, i: number) => (
                      <tr key={i} className="border-t">
                        <td className="p-2 text-xs">{r.email}</td>
                        <td className="p-2 text-xs">{r.username}</td>
                        <td className="p-2 font-mono text-xs">{r.password}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {results.length > 50 && (
                <Button variant="ghost" size="sm" onClick={() => setShowAll(!showAll)}>
                  {showAll ? 'Sembunyikan' : `Tampilkan semua ${results.length}`}
                </Button>
              )}
              <p className="text-xs text-muted-foreground">
                ⚠️ Simpan daftar ini! Password tidak bisa dilihat lagi.
              </p>
            </div>
          ) : (
            <div className="text-center space-y-4">
              <p className="text-sm text-muted-foreground">
                Ini akan mereset password <strong>semua</strong> user dengan role <strong>{label}</strong>.
                Password lama akan diganti dengan password random baru.
              </p>
              <p className="text-sm text-red-600 font-medium">Tindakan ini tidak bisa dibatalkan!</p>
              <Button onClick={handleBatch} disabled={loading} variant="destructive" className="w-full">
                {loading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
                {loading ? 'Mereset...' : `Reset Semua Password ${label}`}
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
