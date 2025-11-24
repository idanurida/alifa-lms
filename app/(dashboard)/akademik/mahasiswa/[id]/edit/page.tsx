// app/(dashboard)/akademik/mahasiswa/[id]/edit/page.tsx
import { notFound } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import MahasiswaForm from '@/components/forms/MahasiswaForm';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { sql } from '@/lib/db';

export default async function EditMahasiswaPage({ params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session || !['super_admin', 'staff_akademik'].includes(session.user.role as string)) {
    return <div>Unauthorized</div>;
  }

  const id = parseInt(params.id);
  if (isNaN(id)) notFound();

  let mhs, curricula;
  try {
    const [result] = await sql`SELECT * FROM students WHERE id = ${id}`;
    mhs = result;
    if (!mhs) notFound();

    curricula = await sql`SELECT id, name, code FROM curricula WHERE is_active = true ORDER BY code`;
  } catch (error) {
    console.error('Failed to fetch data:', error);
    notFound();
  }

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <p className="text-sm font-medium">Manajemen Mahasiswa</p>
        <p className="text-muted-foreground text-sm">
          Edit Mahasiswa: {mhs.name}
        </p>
      </div>

      <Card className="glass-effect dark:glass-effect-dark">
        <CardHeader>
          <CardTitle>Edit Profil Mahasiswa</CardTitle>
        </CardHeader>
        <CardContent>
          <MahasiswaForm initialData={mhs} curricula={curricula} />
        </CardContent>
      </Card>
    </div>
  );
}