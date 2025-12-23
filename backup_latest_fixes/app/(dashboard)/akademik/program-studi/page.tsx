import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Plus } from 'lucide-react';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { sql } from '@/lib/db'; // Asumsi ini adalah path ke koneksi database
import { StudyProgram } from '@/types/akademik';
import StudyProgramTable from '@/components/akademik/StudyProgramTable'; // Import komponen table

export default async function ProgramStudiPage() {
  const session = await getServerSession(authOptions);

  if (!session || !['super_admin', 'staff_akademik'].includes(session.user.role as string)) {
    return (
      <div className="p-6 text-center text-red-500">
        Anda tidak memiliki izin untuk mengakses halaman ini.
      </div>
    );
  }

  // Data diperole dari SQL di Server Component

  let programs: StudyProgram[] = [];

  try {
    // 1. QUERY SQL Study Programs
    const result: any[] = await sql`
        SELECT 
            id, name, code, faculty, is_active, created_at 
        FROM study_programs 
        ORDER BY code ASC
    `;

    // 2. TIPE KONVERSI KRITIS (Penyebab error di build log)
    // Memastikan id dan is_active memiliki tipe yang benar sesuai StudyProgram
    programs = result.map((sp: any) => ({
      ...sp,
      id: Number(sp.id), // FIX: Memastikan ID adalah number sesuai types/akademik.ts
      is_active: Boolean(sp.is_active), // Memastikan is_active adalah boolean
      // Mengkonversi objek Date dari DB ke string
      created_at: sp.created_at ? new Date(sp.created_at).toISOString() : new Date().toISOString(),
    })) as StudyProgram[]; // Assertion agar TypeScript tahu tipe objek sudah StudyProgram

  } catch (error) {
    console.error('Gagal memuat data Program Studi:', error);
    // Tampilkan pesan error jika fetching gagal
    return (
      <div className="p-6 bg-red-100 border border-red-400 text-red-700 rounded-lg">
        Gagal memuat data Program Studi dari database. Silakan periksa koneksi.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="space-y-1">
          <h1 className="text-xl font-semibold">Daftar Program Studi</h1>
          <p className="text-muted-foreground text-sm">
            Kelola data Program Studi yang tersedia di institusi.
          </p>
        </div>
        <Link href="/akademik/program-studi/tambah">
          <Button className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Tambah Baru
          </Button>
        </Link>
      </div>

      <Card className="glass-effect dark:glass-effect-dark">
        <CardContent className="p-6">
          {/* Komponen StudyProgramTable dengan prop programs yang sudah dikonversi tipenya */}
          <StudyProgramTable
            programs={programs}
          />
        </CardContent>
      </Card>
    </div>
  );
}
