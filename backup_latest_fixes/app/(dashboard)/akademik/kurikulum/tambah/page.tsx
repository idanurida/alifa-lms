// app/(dashboard)/akademik/kurikulum/tambah/page.tsx
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import KurikulumForm from '@/components/forms/KurikulumForm';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { sql } from '@/lib/db';
import { StudyProgram } from '@/types/akademik'; // Pastikan path ini benar!

export default async function TambahKurikulumPage() {
  const session = await getServerSession(authOptions);
  if (!session || !['super_admin', 'staff_akademik'].includes(session.user.role as string)) {
    return <div>Unauthorized</div>;
  }

  let studyPrograms: StudyProgram[] = [];

  try {
    // 1. SELECT SEMUA FIELD WAJIB. Berdasarkan types/akademik.ts, field wajib adalah:
    // id, name, code, faculty, is_active, created_at.
    const result: any[] = await sql`
        SELECT 
            id, name, code, faculty, 
            is_active, created_at
        FROM study_programs 
        WHERE is_active = true 
        ORDER BY code
    `;

    // 2. KONVERSI TIPE DATE KE STRING untuk field 'created_at'.
    const convertedPrograms = result.map((program) => ({
      ...program,
      // Konversi objek Date menjadi string ISO yang sesuai dengan tipe 'string'
      created_at: program.created_at ? program.created_at.toISOString() : '',
    }));

    // Terapkan Type Assertion
    studyPrograms = convertedPrograms as StudyProgram[];

  } catch (error) {
    console.error('Failed to fetch study programs:', error);
    return <div>Failed to load study programs.</div>;
  }

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <p className="text-sm font-medium">Manajemen Kurikulum</p>
        <p className="text-muted-foreground text-sm">
          Tambah kurikulum baru.
        </p>
      </div>

      <Card className="glass-effect dark:glass-effect-dark">
        <CardHeader>
          <CardTitle>Tambah Kurikulum Baru</CardTitle>
        </CardHeader>
        <CardContent>
          <KurikulumForm studyPrograms={studyPrograms} />
        </CardContent>
      </Card>
    </div>
  );
}
