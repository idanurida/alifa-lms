// app/(dashboard)/akademik/program-studi/page.tsx
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import Link from 'next/link';
import StudyProgramTable from '@/components/akademik/StudyProgramTable';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { sql } from '@/lib/db';

export default async function ProgramStudiPage() {
  const session = await getServerSession(authOptions);
  if (!session || !['super_admin', 'staff_akademik'].includes(session.user.role as string)) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-red-600">Unauthorized</h2>
          <p className="text-muted-foreground mt-2">
            Anda tidak memiliki akses ke halaman ini.
          </p>
        </div>
      </div>
    );
  }

  let programs = []; // Ganti 'data' menjadi 'programs'
  try {
    // PERBAIKI: Query dengan kolom yang sesuai dan hitung jumlah mahasiswa
    const result = await sql`
      SELECT 
        sp.id, 
        sp.name, 
        sp.code, 
        sp.faculty, 
        sp.is_active,
        sp.created_at,
        (SELECT COUNT(*) FROM students WHERE students.study_program_id::text = sp.id::text) as total_students
      FROM study_programs sp
      ORDER BY sp.code
    `;
    programs = result;
  } catch (error) {
    console.error('Failed to fetch study programs:', error);
    // Fallback data sesuai struktur database
    programs = [
      {
        id: 5,
        name: 'Teknik Informatika',
        code: 'TI',
        faculty: 'Fakultas Teknik',
        is_active: true,
        total_students: 0,
        created_at: '2025-11-19T12:17:06.682Z'
      },
      {
        id: 6,
        name: 'Sistem Informasi',
        code: 'SI', 
        faculty: 'Fakultas Teknik',
        is_active: true,
        total_students: 0,
        created_at: '2025-11-19T12:17:06.682Z'
      },
      {
        id: 7,
        name: 'Manajemen Informatika',
        code: 'MI',
        faculty: 'Fakultas Ekonomi',
        is_active: true,
        total_students: 0,
        created_at: '2025-11-19T12:17:06.682Z'
      }
    ];
  }

  // Server Actions untuk edit dan delete
  const handleEdit = async (id: number) => {
    'use server';
    // Implement edit logic
    console.log('Edit program:', id);
  };

  const handleDelete = async (id: number) => {
    'use server';
    // Implement delete logic
    console.log('Delete program:', id);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight">Program Studi</h1>
          <p className="text-muted-foreground">
            Kelola data program studi dan fakultas.
          </p>
        </div>
        <Button asChild>
          <Link href="/akademik/program-studi/tambah">
            <Plus className="mr-2 h-4 w-4" />
            Tambah Program Studi
          </Link>
        </Button>
      </div>

      <Card className="glass-effect dark:glass-effect-dark">
        <CardHeader>
          <CardTitle>Daftar Program Studi</CardTitle>
        </CardHeader>
        <CardContent>
          {/* PERBAIKI: Kirim prop 'programs' bukan 'data' */}
          <StudyProgramTable 
            programs={programs} 
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        </CardContent>
      </Card>
    </div>
  );
}