// app/(dashboard)/akademik/dosen/tambah/page.tsx
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import DosenForm from '@/components/forms/DosenForm';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

// HAPUS 'use client'

export default async function TambahDosenPage() {
  const session = await getServerSession(authOptions);
  if (!session || !['super_admin', 'staff_akademik'].includes(session.user.role as string)) {
    return <div>Unauthorized</div>;
  }

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <p className="text-sm font-medium">Manajemen Dosen</p>
        <p className="text-muted-foreground text-sm">
          Tambah dosen baru.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Tambah Dosen Baru</CardTitle>
        </CardHeader>
        <CardContent>
          <DosenForm />
        </CardContent>
      </Card>
    </div>
  );
}