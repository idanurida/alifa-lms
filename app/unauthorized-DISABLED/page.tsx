// app/unauthorized/page.tsx
'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertTriangle, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';

export default function UnauthorizedPage() {
  const { data: session } = useSession();

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto w-16 h-16 rounded-full bg-red-100 dark:bg-red-900 flex items-center justify-center mb-4">
            <AlertTriangle className="text-red-600 dark:text-red-400" size={32} />
          </div>
          <CardTitle className="text-xl">Akses Ditolak</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-center">
          <p className="text-muted-foreground">
            Anda tidak memiliki izin untuk mengakses halaman ini.
          </p>
          {session?.user && (
            <div className="bg-muted p-3 rounded-lg">
              <p className="text-sm">
                Login sebagai: <strong>{session.user.name}</strong>
                <br />
                Role: <strong>{session.user.role}</strong>
              </p>
            </div>
          )}
          <div className="flex gap-2 justify-center">
            <Link href="/">
              <Button variant="outline">
                <ArrowLeft className="mr-2" size={16} />
                Kembali ke Beranda
              </Button>
            </Link>
            <Link href="/api/auth/signout">
              <Button variant="destructive">
                Logout
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}