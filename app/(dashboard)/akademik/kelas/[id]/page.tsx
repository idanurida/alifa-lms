// app/(dashboard)/akademik/kelas/[id]/page.tsx
import { notFound } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Users, GraduationCap, BookOpen, Calendar } from 'lucide-react';
import Link from 'next/link';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { sql } from '@/lib/db';

export default async function DetailKelasPage({ params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session || !['super_admin', 'staff_akademik', 'dosen'].includes(session.user.role as string)) {
    // Untuk mahasiswa, cek apakah dia terdaftar di kelas ini
    if (session?.user.role === 'mahasiswa') {
      const [enrollment] = await sql`
        SELECT se.id FROM student_enrollments se
        JOIN classes c ON se.class_id = c.id
        WHERE c.id = ${parseInt(params.id)} AND se.student_id = (SELECT id FROM students WHERE user_id = ${session.user.id})
      `;
      if (!enrollment) {
        return <div>Unauthorized</div>;
      }
    } else {
      return <div>Unauthorized</div>;
    }
  }

  const id = parseInt(params.id);
  if (isNaN(id)) notFound();

  let kelas;
  try {
    const [result] = await sql`
      SELECT 
        c.id, c.course_id, c.academic_period_id, c.class_code, c.lecturer_id, c.schedule, c.max_students, c.is_active, c.created_at,
        co.name as course_name, co.code as course_code, co.credits as course_credits,
        ap.name as academic_period_name, ap.code as academic_period_code,
        l.name as lecturer_name, l.nidn as lecturer_nidn, l.expertise as lecturer_expertise
      FROM classes c
      JOIN courses co ON c.course_id = co.id
      JOIN academic_periods ap ON c.academic_period_id = ap.id
      JOIN lecturers l ON c.lecturer_id = l.id
      WHERE c.id = ${id}
    `;
    kelas = result;
    if (!kelas) notFound();

    // Hitung enrolled_students
    const [count] = await sql`SELECT COUNT(*) as count FROM student_enrollments WHERE class_id = ${id}`;
    kelas.enrolled_students = parseInt(count.count);
    kelas.scheduleText = `${kelas.schedule.day}, ${kelas.schedule.time}, ${kelas.schedule.room}`;
  } catch (error) {
    console.error('Failed to fetch class:', error);
    notFound();
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="space-y-1">
          <p className="text-sm font-medium">Manajemen Kelas</p>
          <p className="text-muted-foreground text-sm">
            Detail kelas: {kelas.course_name} ({kelas.class_code})
          </p>
        </div>
        <div className="flex gap-2">
          <Button asChild variant="outline">
            <Link href={`/akademik/kelas/${id}/dosen`}>
              <Users size={16} className="mr-2" />
              Penugasan Dosen
            </Link>
          </Button>
          <Button asChild variant="outline">
            <Link href={`/akademik/kelas/${id}/edit`}>
              Edit
            </Link>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 glass-effect dark:glass-effect-dark">
          <CardHeader>
            <CardTitle>Informasi Kelas</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Kode Kelas</p>
                <p className="font-mono font-medium">{kelas.class_code}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Kapasitas</p>
                <p>{kelas.enrolled_students} / {kelas.max_students} mahasiswa</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Mata Kuliah</p>
                <p className="font-medium">{kelas.course_name} ({kelas.course_code})</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">SKS</p>
                <p>{kelas.course_credits}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Periode</p>
                <p>{kelas.academic_period_name}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Status</p>
                <Badge variant={kelas.is_active ? 'default' : 'secondary'}>
                  {kelas.is_active ? 'Aktif' : 'Tidak Aktif'}
                </Badge>
              </div>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Jadwal</p>
              <p>{kelas.scheduleText}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-effect dark:glass-effect-dark">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <GraduationCap size={18} />
              Dosen Pengampu
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p className="font-medium">{kelas.lecturer_name}</p>
              <p className="text-sm text-muted-foreground">NIDN: {kelas.lecturer_nidn}</p>
              <p className="text-sm text-muted-foreground">Keahlian: {kelas.lecturer_expertise || '—'}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Contoh Link ke Penilaian untuk Dosen */}
      {session.user.role === 'dosen' && (
        <Card className="glass-effect dark:glass-effect-dark">
          <CardHeader>
            <CardTitle>Penilaian & Aktivitas</CardTitle>
          </CardHeader>
          <CardContent>
            <Button asChild>
              <Link href={`/akademik/dosen/kelas/${id}/penilaian`}>Lihat Penilaian</Link>
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}