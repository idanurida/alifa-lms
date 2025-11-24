// app/(dashboard)/akademik/kurikulum/[id]/edit/page.tsx
import { notFound } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import KurikulumForm from '@/components/forms/KurikulumForm';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { sql } from '@/lib/db';

// Definisikan interface untuk StudyProgram
interface StudyProgram {
  id: string;
  name: string;
  code: string;
}

interface Kurikulum {
  id: number;
  name: string;
  study_program_id: number;
  year: number;
  description?: string;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

export default async function EditKurikulumPage({ params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session || !['super_admin', 'staff_akademik'].includes(session.user.role as string)) {
    return <div>Unauthorized</div>;
  }

  const id = parseInt(params.id);
  if (isNaN(id)) notFound();

  let kurikulum: Kurikulum | null = null;
  let studyPrograms: StudyProgram[] = [];
  
  try {
    // Fetch kurikulum data
    const [result] = await sql`SELECT * FROM curricula WHERE id = ${id}`;
    if (!result) notFound();
    
    kurikulum = {
      id: result.id,
      name: result.name,
      study_program_id: result.study_program_id,
      year: result.year,
      description: result.description,
      is_active: result.is_active,
      created_at: result.created_at,
      updated_at: result.updated_at
    };

    // Fetch study programs data dengan type casting yang aman
    const studyProgramsResult = await sql`SELECT id, name, code FROM study_programs WHERE is_active = true ORDER BY code`;
    
    studyPrograms = studyProgramsResult.map((program: any) => ({
      id: program.id.toString(),
      name: program.name,
      code: program.code
    }));

  } catch (error) {
    console.error('Failed to fetch data:', error);
    notFound();
  }

  if (!kurikulum) {
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