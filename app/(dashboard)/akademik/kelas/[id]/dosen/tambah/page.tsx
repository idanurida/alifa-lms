// app/(dashboard)/akademik/kelas/[id]/dosen/tambah/page.tsx
import { notFound } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import TambahPenugasanForm from '@/components/akademik/TambahPenugasanForm';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { sql } from '@/lib/db';

export default async function TambahPenugasanDosenPage({ params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session || !['super_admin', 'staff_akademik'].includes(session.user.role as string)) {
    return <div>Unauthorized</div>;
  }

  const classId = parseInt(params.id);
  if (isNaN(classId)) notFound();

  let kelas, availableLecturers, availableClasses;
  try {
    const [kelasResult] = await sql`
      SELECT c.id, co.name as course_name, c.class_code, ap.name as period_name
      FROM classes c
      JOIN courses co ON c.course_id = co.id
      JOIN academic_periods ap ON c.academic_period_id = ap.id
      WHERE c.id = ${classId}
    `;
    kelas = kelasResult;
    if (!kelas) notFound();

    availableLecturers = await sql`
      SELECT l.id, l.name, l.nidn, l.expertise
      FROM lecturers l
      WHERE l.status = 'active'
      AND l.id NOT IN (
        SELECT lecturer_id FROM lecturer_assignments 
        WHERE class_id = ${classId} AND is_active = true
      )
      ORDER BY l.name
    `;

    // Ambil semua kelas untuk form (jika ingin menugaskan ke kelas lain sekaligus)
    availableClasses = await sql`SELECT id, class_code, course_id FROM classes WHERE is_active = true ORDER BY class_code`;

  } catch (error) {
    console.error('Failed to fetch data for assignment form:', error);
    notFound();
  }

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <p className="text-sm font-medium">Manajemen Kelas</p>
        <p className="text-muted-foreground text-sm">
          Tambah Penugasan Dosen - {kelas.course_name} ({kelas.class_code})
        </p>
      </div>

      <Card className="glass-effect dark:glass-effect-dark">
        <CardHeader>
          <CardTitle>Tambah Penugasan Dosen</CardTitle>
        </CardHeader>
        <CardContent>
          <TambahPenugasanForm 
            classId={classId} 
            availableLecturers={availableLecturers} 
            availableClasses={availableClasses} 
          />
        </CardContent>
      </Card>
    </div>
  );
}