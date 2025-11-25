// app/(dashboard)/akademik/kelas/page.tsx
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import Link from 'next/link';
import KelasTable from '@/components/tables/KelasTable';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { sql } from '@/lib/db';

export default async function KelasPage() {
  const session = await getServerSession(authOptions);
  const allowedRoles = ['super_admin', 'staff_akademik'];
  if (!session || !allowedRoles.includes(session.user.role as string)) {
    // Untuk dosen, mungkin arahkan ke kelas mereka sendiri
    if (session?.user.role === 'dosen') {
        // Redirect atau tampilkan halaman khusus dosen
        // Misalnya: redirect('/akademik/dosen/kelas');
        // Untuk sekarang, tampilkan pesan
        return <div>Halaman ini untuk Staff Akademik. Silakan ke <Link href="/akademik/dosen/kelas">Kelas Saya</Link>.</div>;
    }
    return <div>Unauthorized</div>;
  }

  let data: any[] = [];
  try {
    const result = await sql`
      SELECT 
        c.id, c.course_id, c.academic_period_id, c.class_code, c.lecturer_id, c.schedule, c.max_students, c.is_active, c.createdAt,
        co.name as course_name, co.code as course_code,
        ap.name as academic_period_name,
        l.name as lecturer_name
      FROM classes c
      JOIN courses co ON c.course_id = co.id
      JOIN academic_periods ap ON c.academic_period_id = ap.id
      JOIN lecturers l ON c.lecturer_id = l.id
      ORDER BY c.class_code, co.code
    `;
    // Hitung enrolled_students
    data = await Promise.all(result.map(async (kelas: any) => {
      const [count] = await sql`SELECT COUNT(*) as count FROM student_enrollments WHERE class_id = ${kelas.id}`;
      return {
        ...kelas,
        enrolled_students: parseInt(count.count),
        scheduleText: `${kelas.schedule.day}, ${kelas.schedule.time}, ${kelas.schedule.room}`
      };
    }));
  } catch (error) {
    console.error('Failed to fetch classes:', error);
    return <div>Failed to load data.</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="space-y-1">
          <p className="text-sm font-medium">Manajemen Kelas</p>
          <p className="text-muted-foreground text-sm">
            Daftar kelas kuliah, jadwal, dan kuota.
          </p>
        </div>
        <Button asChild>
          <Link href="/akademik/kelas/tambah">
            <Plus size={16} />
            Tambah Kelas
          </Link>
        </Button>
      </div>

      <Card className="glass-effect dark:glass-effect-dark">
        <CardHeader>
          <CardTitle>Daftar Kelas</CardTitle>
        </CardHeader>
        <CardContent>
          <KelasTable data={data} />
        </CardContent>
      </Card>
    </div>
  );
}
