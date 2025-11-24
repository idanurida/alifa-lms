// app/(dashboard)/akademik/kurikulum/[id]/edit/page.tsx
import { notFound } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import KurikulumForm from '@/components/forms/KurikulumForm';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { sql } from '@/lib/db';

export default async function EditKurikulumPage({ params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session || !['super_admin', 'staff_akademik'].includes(session.user.role as string)) {
    return <div>Unauthorized</div>;
  }

  const id = parseInt(params.id);
  if (isNaN(id)) notFound();

  let kurikulum, studyPrograms;
  try {
    const [result] = await sql`SELECT * FROM curricula WHERE id = ${id}`;
    kurikulum = result;
    if (!kurikulum) notFound();

    studyPrograms = await sql`SELECT id, name, code FROM study_programs WHERE is_active = true ORDER BY code`;
  } catch (error) {
    console.error('Failed to fetch data:', error);
    notFound();
  }

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <p className="text-sm font-medium">Manajemen Kurikulum</p>
        <p className="text-muted-foreground text-sm">
          Edit kurikulum: {kurikulum.name}
        </p>
      </div>

      <Card className="glass-effect dark:glass-effect-dark">
        <CardHeader>
          <CardTitle>Edit Kurikulum</CardTitle>
        </CardHeader>
        <CardContent>
          <KurikulumForm initialData={kurikulum} studyPrograms={studyPrograms} />
        </CardContent>
      </Card>
    </div>
  );
}