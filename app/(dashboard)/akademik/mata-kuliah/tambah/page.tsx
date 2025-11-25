import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import MataKuliahForm from '@/components/forms/MataKuliahForm';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { sql } from '@/lib/db';
// IMPORT TIPE YANG DIBUTUHKAN DARI DEFINISI ANDA
import { Curriculum, StudyProgram } from '@/types/akademik'; // Pastikan path ini benar!

export default async function TambahMataKuliahPage() {
  const session = await getServerSession(authOptions);
  if (!session || !['super_admin', 'staff_akademik'].includes(session.user.role as string)) {
    return <div>Unauthorized</div>;
  }

  let curricula: Curriculum[] = []; // INISIALISASI DENGAN TIPE YANG BENAR

  try {
    // 1. QUERY SQL CURRICULA: SELECT SEMUA FIELD WAJIB
    // Field wajib Curriculum: id, name, code, study_program_id, total_credits, is_active, created_at.
    const resultCurricula: any[] = await sql`
        SELECT 
            id, name, code, study_program_id, 
            total_credits, is_active, created_at 
        FROM curricula 
        WHERE is_active = true 
        ORDER BY code
    `;
    
    // 2. KONVERSI TIPE DATE KE STRING & TAMBAH EMBEDDED OBJECT
    const convertedCurricula = resultCurricula.map((c: any) => ({
        ...c,
        // Konversi Date ke string untuk field created_at
        created_at: c.created_at ? c.created_at.toISOString() : '', 
        
        // Tambahkan embedded object 'study_program' (placeholder)
        study_program: { 
            id: c.study_program_id, 
            name: 'N/A', 
            code: 'N/A', 
            faculty: 'N/A', 
            is_active: false, 
            created_at: '' 
        } as StudyProgram, 
    }));

    // Terapkan Type Assertion
    curricula = convertedCurricula as Curriculum[];

  } catch (error) {
    console.error('Gagal memuat data kurikulum:', error);
    return <div>Failed to load curricula.</div>;
  }

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <p className="text-sm font-medium">Manajemen Mata Kuliah</p>
        <p className="text-muted-foreground text-sm">
          Tambah mata kuliah baru.
        </p>
      </div>

      <Card className="glass-effect dark:glass-effect-dark">
        <CardHeader>
          <CardTitle>Tambah Mata Kuliah Baru</CardTitle>
        </CardHeader>
        <CardContent>
          <MataKuliahForm curricula={curricula} />
        </CardContent>
      </Card>
    </div>
  );
}