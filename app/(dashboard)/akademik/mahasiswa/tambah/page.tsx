// app/(dashboard)/akademik/mahasiswa/tambah/page.tsx
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import MahasiswaForm from '@/components/forms/MahasiswaForm';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { sql } from '@/lib/db';
// IMPORT TIPE YANG DIBUTUHKAN DARI DEFINISI ANDA
import { Curriculum, StudyProgram } from '@/types/akademik'; // Pastikan path ini benar!

export default async function TambahMahasiswaPage() {
  const session = await getServerSession(authOptions);
  if (!session || !['super_admin', 'staff_akademik'].includes(session.user.role as string)) {
    return <div>Unauthorized</div>;
  }

  // INISIALISASI DENGAN TIPE YANG BENAR
  let curricula: Curriculum[] = []; 
  
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
        // agar sesuai dengan interface Curriculum.
        study_program: { 
            id: c.study_program_id, // Gunakan id dari kurikulum
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
    // Jika gagal, tampilkan pesan error, karena form tidak bisa diisi tanpa data.
    return <div>Failed to load curricula.</div>;
  }

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <p className="text-sm font-medium">Manajemen Mahasiswa</p>
        <p className="text-muted-foreground text-sm">
          Tambah data mahasiswa baru.
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