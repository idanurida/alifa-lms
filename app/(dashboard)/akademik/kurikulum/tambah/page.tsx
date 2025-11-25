// app/(dashboard)/akademik/kurikulum/tambah/page.tsx

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import KurikulumForm from '@/components/forms/KurikulumForm';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { sql } from '@/lib/db';
import { redirect } from 'next/navigation'; // Tambahkan jika Anda menggunakan redirect di sini

// 1. Tentukan Tipe StudyProgram yang Lengkap atau Import dari file global.
// ASUMSI: 6 field wajib adalah id, name, code, faculty, is_active, dan created_at.
// Ganti dengan field yang sebenarnya dari file types/akademik.ts Anda.
type StudyProgram = { id: number; name: string; code: string; faculty: string; is_active: boolean; created_at: Date }; 
// Jika Anda menggunakan import, HAPUS baris di atas dan gunakan:
// import { StudyProgram } from '@/types/akademik';


export default async function TambahKurikulumPage() {
  const session = await getServerSession(authOptions);
  if (!session || !['super_admin', 'staff_akademik'].includes(session.user.role as string)) {
    // Gunakan redirect atau return Unauthorized
    return <div>Unauthorized</div>; 
  }

  let studyPrograms: StudyProgram[] = [];
  
  try {
    // 2. Perbaikan Query SQL: SELECT semua 6 field wajib.
    // GANTI Field5 dan Field6 dengan nama field yang sebenarnya dari DB/tipe Anda.
    const result = await sql`
        SELECT 
            id, name, code, faculty, 
            is_active, created_at 
        FROM study_programs 
        WHERE is_active = true 
        ORDER BY code
    `;

    // 3. Terapkan Type Assertion
    studyPrograms = result as StudyProgram[]; 
    
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
          {/* studyPrograms sekarang memiliki tipe StudyProgram[] yang sesuai */}
          <KurikulumForm studyPrograms={studyPrograms} /> 
        </CardContent>
      </Card>
    </div>
  );
}