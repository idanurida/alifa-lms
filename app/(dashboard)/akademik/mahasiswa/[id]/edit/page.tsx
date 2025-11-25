// app/(dashboard)/akademik/mahasiswa/[id]/edit/page.tsx
import { notFound } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import MahasiswaForm from '@/components/forms/MahasiswaForm';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { sql } from '@/lib/db';
// IMPORT TIPE YANG DIBUTUHKAN
import { Curriculum, StudyProgram } from '@/types/akademik'; // Pastikan path ini benar!

export default async function EditMahasiswaPage({ params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session || !['super_admin', 'staff_akademik'].includes(session.user.role as string)) {
    return <div>Unauthorized</div>;
  }

  const id = parseInt(params.id);
  if (isNaN(id)) notFound();

  let mhs: any; // Ganti dengan tipe Mahasiswa yang benar jika ada
  let curricula: Curriculum[] = []; // Terapkan tipe eksplisit

  try {
    const [result] = await sql`SELECT * FROM students WHERE id = ${id}`;
    mhs = result;
    if (!mhs) notFound();

    // 1. QUERY SQL CURRICULA: SELECT SEMUA FIELD WAJIB
    // Field wajib Curriculum adalah: id, name, code, study_program_id, total_credits, is_active, created_at.
    const resultCurricula: any[] = await sql`
        SELECT 
            id, name, code, study_program_id, 
            total_credits, is_active, created_at 
        FROM curricula 
        WHERE is_active = true 
        ORDER BY code
    `;
    
    // 2. KONVERSI TIPE DATE KE STRING & TAMBAH EMBEDDED OBJECT
    curricula = resultCurricula.map((c: any) => ({
        ...c,
        // Konversi Date ke string untuk field created_at
        created_at: c.createdAt ? c.createdAt.toISOString() : '', 
        
        // Tambahkan embedded object 'study_program' (minimal placeholder) 
        // agar sesuai dengan interface Curriculum.
        // Asumsi StudyProgram hanya butuh id dan name untuk form.
        study_program: { 
            id: c.study_program_id, 
            name: 'N/A', 
            code: 'N/A', 
            faculty: 'N/A', 
            is_active: false, 
            created_at: '' 
        } as StudyProgram, 
    })) as Curriculum[];

  } catch (error) {
    console.error('Failed to fetch data:', error);
    // Jika fetch data mahasiswa atau kurikulum gagal, redirect ke notFound
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
          {/* curricula sekarang memiliki tipe Curriculum[] yang sesuai */}
          <MahasiswaForm initialData={mhs} curricula={curricula} />
        </CardContent>
      </Card>
    </div>
  );
}
