// app/(dashboard)/laporan/kelas/page.tsx
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download, Filter } from 'lucide-react';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { sql } from '@/lib/db';

export default async function LaporanKelasPage() {
  const session = await getServerSession(authOptions);
  if (!session || !['super_admin', 'staff_akademik'].includes(session.user.role as string)) {
    return <div>Unauthorized</div>;
  }

  let data = [];
  try {
    const result = await sql`
      SELECT 
        c.class_code, co.name as course_name, co.code as course_code, co.credits,
        l.name as lecturer_name, l.nidn,
        ap.name as academic_period_name,
        c.max_students,
        (SELECT COUNT(*) FROM student_enrollments se WHERE se.class_id = c.id) as enrolled_count,
        c.schedule
      FROM classes c
      JOIN courses co ON c.course_id = co.id
      JOIN lecturers l ON c.lecturer_id = l.id
      JOIN academic_periods ap ON c.academic_period_id = ap.id
      WHERE c.is_active = true
      ORDER BY c.class_code
    `;
    data = result;
  } catch (error) {
    console.error('Failed to fetch class report data:', error);
    return <div>Failed to load data.</div>;
  }

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <p className="text-sm font-medium">Manajemen Laporan</p>
        <p className="text-muted-foreground text-sm">
          Laporan Daftar Kelas
        </p>
      </div>

      <Card className="glass-effect dark:glass-effect-dark">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Laporan Kelas</CardTitle>
          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              <Filter className="mr-2 h-4 w-4" />
              Filter
            </Button>
            <Button size="sm">
              <Download className="mr-2 h-4 w-4" />
              Ekspor ke Excel
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2">Kode Kelas</th>
                  <th className="text-left p-2">Mata Kuliah</th>
                  <th className="text-left p-2">Dosen</th>
                  <th className="text-left p-2">Periode</th>
                  <th className="text-left p-2">Kuota</th>
                  <th className="text-left p-2">Terisi</th>
                  <th className="text-left p-2">Jadwal</th>
                </tr>
              </thead>
              <tbody>
                {data.map((kelas: any, index: number) => (
                  <tr key={index} className="border-b hover:bg-muted/30">
                    <td className="p-2 font-mono">{kelas.class_code}</td>
                    <td className="p-2">
                      <div className="font-medium">{kelas.course_name}</div>
                      <div className="text-xs text-muted-foreground">{kelas.course_code}</div>
                    </td>
                    <td className="p-2">{kelas.lecturer_name}</td>
                    <td className="p-2">{kelas.academic_period_name}</td>
                    <td className="p-2">{kelas.max_students}</td>
                    <td className="p-2">{kelas.enrolled_count}</td>
                    <td className="p-2">{`${kelas.schedule.day}, ${kelas.schedule.time}, ${kelas.schedule.room}`}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}