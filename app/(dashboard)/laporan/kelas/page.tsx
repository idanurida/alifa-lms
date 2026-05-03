// app/(dashboard)/laporan/kelas/page.tsx
import { Card, CardContent } from '@/components/ui/card';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { sql } from '@/lib/db';
import LaporanTable from '@/components/laporan/LaporanTable';
import Breadcrumb from '@/components/layout/Breadcrumb';

export default async function LaporanKelasPage() {
  const session = await getServerSession(authOptions);
  if (!session || !['super_admin', 'staff_akademik'].includes(session.user.role as string)) {
    return <div>Unauthorized</div>;
  }

  let data: Record<string, unknown>[] = [];
  try {
    data = await sql`
      SELECT 
        c.class_code, co.name as course_name, co.code as course_code, co.credits,
        l.name as lecturer_name,
        ap.name as academic_period_name,
        c.max_students,
        (SELECT COUNT(*) FROM student_enrollments se WHERE se.class_id = c.id)::int as enrolled_count,
        c.schedule
      FROM classes c
      JOIN courses co ON c.course_id = co.id
      LEFT JOIN lecturers l ON c.lecturer_id = l.id
      JOIN academic_periods ap ON c.academic_period_id = ap.id
      ORDER BY c.class_code
    `;
  } catch {
    // fallback
  }

  const columns = [
    { key: 'class_code', label: 'Kode' },
    { key: 'course_name', label: 'Mata Kuliah' },
    { key: 'lecturer_name', label: 'Dosen' },
    { key: 'academic_period_name', label: 'Periode' },
    { key: 'max_students', label: 'Kuota' },
    { key: 'enrolled_count', label: 'Terisi' },
    {
      key: 'schedule', label: 'Jadwal',
      render: (val: unknown) => {
        if (typeof val === 'object' && val !== null) {
          const s = val as Record<string, string>;
          return `${s.day || '-'}, ${s.time || '-'}, ${s.room || '-'}`;
        }
        return String(val ?? '-');
      }
    },
  ];

  return (
    <div className="space-y-6">
      <Breadcrumb items={[{ label: 'Laporan', href: '/laporan' }, { label: 'Kelas' }]} />
      <h1 className="text-2xl font-bold tracking-tight">Laporan Kelas</h1>
      <p className="text-muted-foreground text-sm">Daftar kelas, dosen pengampu, dan kuota.</p>
      <Card>
        <CardContent className="pt-6">
          <LaporanTable title="Daftar Kelas" columns={columns} data={data} filename="laporan-kelas" />
        </CardContent>
      </Card>
    </div>
  );
}
