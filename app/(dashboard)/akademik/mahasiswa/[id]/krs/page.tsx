// app/(dashboard)/akademik/mahasiswa/[id]/krs/page.tsx
import { notFound } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { sql } from '@/lib/db';

export default async function KRSPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await getServerSession(authOptions);
  if (!session || !['super_admin', 'staff_akademik', 'dosen'].includes(session.user.role as string)) {
    // Mahasiswa hanya bisa melihat KRS sendiri
    if (session?.user.role === 'mahasiswa') {
      const [studentCheck] = await sql`
        SELECT id FROM students WHERE id = ${parseInt(id)} AND user_id = ${session.user.id}
      `;
      if (!studentCheck) {
        return <div>Unauthorized</div>;
      }
    } else {
      return <div>Unauthorized</div>;
    }
  }

  const studentId = parseInt(id);
  if (isNaN(studentId)) notFound();

  let student, enrollments;
  try {
    const [studentResult] = await sql`SELECT name, nim FROM students WHERE id = ${studentId}`;
    student = studentResult;
    if (!student) notFound();

    // Ambil data enrollment beserta detail kelas dan dosen
    enrollments = await sql`
      SELECT 
        se.id as enrollment_id, se.status as enrollment_status, se.final_grade, se.final_score,
        c.id as class_id, c.class_code, co.name as course_name, co.code as course_code, co.credits,
        l.name as lecturer_name
      FROM student_enrollments se
      JOIN classes c ON se.class_id = c.id
      JOIN courses co ON c.course_id = co.id
      JOIN lecturers l ON c.lecturer_id = l.id
      WHERE se.student_id = ${studentId}
      ORDER BY c.class_code
    `;
  } catch (error) {
    console.error('Failed to fetch KRS data:', error);
    notFound();
  }

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <p className="text-sm font-medium">Manajemen Mahasiswa</p>
        <p className="text-muted-foreground text-sm">
          KRS Mahasiswa: {student.name} (NIM: {student.nim})
        </p>
      </div>

      <Card className="glass-effect dark:glass-effect-dark">
        <CardHeader>
          <CardTitle>Kartu Rencana Studi (KRS)</CardTitle>
        </CardHeader>
        <CardContent>
          {enrollments.length === 0 ? (
            <p className="text-muted-foreground">Mahasiswa ini belum mengambil kelas apapun.</p>
          ) : (
            <div className="rounded-md border">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-2">Kode Kelas</th>
                    <th className="text-left p-2">Mata Kuliah</th>
                    <th className="text-left p-2">Dosen</th>
                    <th className="text-left p-2">SKS</th>
                    <th className="text-left p-2">Status</th>
                    <th className="text-left p-2">Nilai Akhir</th>
                  </tr>
                </thead>
                <tbody>
                  {enrollments.map((enr: any) => (
                    <tr key={enr.enrollment_id} className="border-b hover:bg-muted/30">
                      <td className="p-2 font-mono">{enr.class_code}</td>
                      <td className="p-2">
                        <div className="font-medium">{enr.course_name}</div>
                        <div className="text-xs text-muted-foreground">{enr.course_code}</div>
                      </td>
                      <td className="p-2">{enr.lecturer_name}</td>
                      <td className="p-2">{enr.credits}</td>
                      <td className="p-2">
                        <Badge variant={enr.enrollment_status === 'completed' ? 'default' : 'secondary'}>
                          {enr.enrollment_status}
                        </Badge>
                      </td>
                      <td className="p-2 font-medium">{enr.final_grade || '—'} ({enr.final_score || '—'})</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}