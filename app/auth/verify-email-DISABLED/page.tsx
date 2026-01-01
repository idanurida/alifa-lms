'use client'

// app/auth/verify-email/page.tsx
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { MailCheck } from 'lucide-react';
import { toast } from 'sonner';

export default function VerifyEmailPage() {
  const handleResend = async () => {
    // Simulasi API call
    try {
      // const res = await fetch('/api/auth/resend-verification', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ email: 'user@example.com' }), // Ambil email dari session
      // });

      // if (!res.ok) throw new Error('Gagal mengirim ulang email verifikasi');

      toast.success('âœ… Email verifikasi telah dikirim ulang.');
    } catch (error: any) {
      toast.error(`âŒ ${(error as Error).message}`);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
            <MailCheck className="text-primary" size={32} />
          </div>
          <CardTitle>Verifikasi Email</CardTitle>
          <CardDescription>
            Kami telah mengirimkan link verifikasi ke email Anda. Silakan cek kotak masuk Anda.
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center">
          <Button onClick={handleResend} variant="outline" className="w-full mb-4">
            Kirim Ulang Email
          </Button>
          <p className="text-sm text-muted-foreground">
            Sudah melakukan verifikasi? <Link href="/login" className="text-primary hover:underline">Login di sini</Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
