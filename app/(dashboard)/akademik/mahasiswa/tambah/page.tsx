// app/(dashboard)/akademik/mahasiswa/tambah/page.tsx
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import MahasiswaForm from '@/components/forms/MahasiswaForm';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { sql } from '@/lib/db';

export default async function TambahMahasiswaPage() {
  const session = await getServerSession(authOptions);
  if (!session || !['super_admin', 'staff_akademik'].includes(session.user.role as string)) {
    return <div>Unauthorized</div>;
  }

  let curricula = [];
  try {
    const result = await sql`SELECT id, name, code FROM curricula WHERE is_active = true ORDER BY code`;
    curricula = result;
  } catch (error) {
    console.error('Failed to fetch curricula:', error);
    return <div>Failed to load curricula.</div>;
  }

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <p className="text-sm font-medium">Manajemen Mahasiswa</p>
        <p className="text-muted-foreground text-sm">
          Tambah mahasiswa baru.
        </p>
      </div>

      <Card className="glass-effect dark:glass-effect-dark">
        <CardHeader>
          <CardTitle>Tambah Mahasiswa Baru</CardTitle>
        </CardHeader>
        <CardContent>
          <MahasiswaForm curricula={curricula} />
        </CardContent>
      </Card>
    </div>
  );
}