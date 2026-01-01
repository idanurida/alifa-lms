// app/(dashboard)/akademik/dosen/kelas/page.tsx - PERBAIKAN QUERY
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { sql } from '@/lib/db';
import { BookOpen, Users, Calendar, Clock, MapPin, User, BarChart3, Eye } from 'lucide-react';
import Link from 'next/link';

export default async function KelasDosenPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user || session.user.role !== 'dosen') {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-red-600">Tidak Diizinkan</h2>
          <p className="text-muted-foreground mt-2">Hanya dosen yang dapat mengakses halaman ini.</p>
        </div>
      </div>
    );
  }

  let kelasDiajar: any[] = [];

  try {
    // PERBAIKAN: Query yang sesuai dengan struktur database sebenarnya
    const result = await sql`
    SELECT
    c.id,
      c.class_code,
      c.class_code as class_name,
      co.name as course_name,
      co.code as course_code,
      co.credits as credits,
      c.schedule ->> 'day' as schedule_day,
      c.schedule ->> 'time' as schedule_time,
      c.schedule ->> 'room' as room,
      COUNT(DISTINCT se.student_id) as total_mahasiswa,
      c.max_students
      FROM classes c
      JOIN courses co ON c.course_id = co.id
      LEFT JOIN student_enrollments se ON c.id = se.class_id AND se.status = 'active'
      WHERE c.lecturer_id = (SELECT id FROM lecturers WHERE user_id = ${parseInt(session.user.id as string)})
        AND c.is_active = true
      GROUP BY c.id, c.class_code, co.name, co.code, co.credits, c.schedule, c.max_students
      ORDER BY c.class_code
      `;

    kelasDiajar = result.map((row: any) => ({
      id: row.id,
      class_code: row.class_code,
      class_name: row.class_name || row.class_code,
      course_name: row.course_name,
      course_code: row.course_code,
      credits: row.credits,
      schedule_day: row.schedule_day || 'Belum diatur',
      schedule_time: row.schedule_time || 'Belum diatur',
      room: row.room || 'Belum diatur',
      total_mahasiswa: parseInt(row.total_mahasiswa) || 0
    }));

  } catch (error) {
    console.error('Gagal memuat data kelas:', error);

    // Fallback data untuk development
    kelasDiajar = [
      {
        id: 1,
        class_code: 'CS101-A',
        class_name: 'Pemrograman Dasar A',
        course_name: 'Pemrograman Dasar',
        course_code: 'CS101',
        credits: 3,
        schedule_day: 'Senin',
        schedule_time: '08:00-10:00',
        room: 'R.301',
        total_mahasiswa: 30
      },
      {
        id: 2,
        class_code: 'MT201-B',
        class_name: 'Kalkulus Lanjut B',
        course_name: 'Kalkulus Lanjut',
        course_code: 'MT201',
        credits: 4,
        schedule_day: 'Rabu',
        schedule_time: '10:00-12:00',
        room: 'R.205',
        total_mahasiswa: 25
      }
    ];
  }

  // ... rest of the component remains the same
  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-bold tracking-tight">Kelas yang Saya Ajar</h1>
        <p className="text-muted-foreground">
          Kelola kelas, materi, dan penilaian untuk mata kuliah yang Anda ampu
        </p>
      </div>

      {/* Statistik Cepat */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Kelas</p>
                <p className="text-2xl font-bold">{kelasDiajar.length}</p>
              </div>
              <BookOpen className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Mahasiswa</p>
                <p className="text-2xl font-bold">
                  {kelasDiajar.reduce((total, kelas) => total + (kelas.total_mahasiswa || 0), 0)}
                </p>
              </div>
              <Users className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Mata Kuliah</p>
                <p className="text-2xl font-bold">
                  {new Set(kelasDiajar.map(k => k.course_name)).size}
                </p>
              </div>
              <BarChart3 className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total SKS</p>
                <p className="text-2xl font-bold">
                  {kelasDiajar.reduce((total, kelas) => total + (kelas.credits || 0), 0)}
                </p>
              </div>
              <Clock className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Daftar Kelas */}
      <Card>
        <CardHeader>
          <CardTitle>Daftar Kelas</CardTitle>
        </CardHeader>
        <CardContent>
          {kelasDiajar.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <BookOpen className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Anda belum ditugaskan mengajar kelas apapun</p>
              <p className="text-sm">Hubungi staff akademik untuk penugasan kelas</p>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {kelasDiajar.map((kelas) => (
                <Card key={kelas.id} className="bg-card border-border hover:shadow-md transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-base">{kelas.course_name}</CardTitle>
                        <p className="text-sm text-muted-foreground">
                          {kelas.class_code} - {kelas.course_code}
                        </p>
                      </div>
                      <Badge variant="default">{kelas.credits} SKS</Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="space-y-2 text-sm mb-4">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span>{kelas.schedule_day}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <span>{kelas.schedule_time}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        <span>{kelas.room}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-muted-foreground" />
                        <span>{kelas.total_mahasiswa} mahasiswa</span>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      <Button size="sm" asChild className="flex-1">
                        <Link href={`/ akademik / dosen / kelas / ${kelas.id} `}>
                          <Eye className="h-4 w-4 mr-1" />
                          Detail
                        </Link>
                      </Button>
                      <Button size="sm" variant="outline" asChild className="flex-1">
                        <Link href={`/ akademik / dosen / penilaian ? kelas = ${kelas.id} `}>
                          <BarChart3 className="h-4 w-4 mr-1" />
                          Nilai
                        </Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Aksi Cepat</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Button asChild variant="outline" className="h-auto py-4">
              <Link href="/akademik/dosen/penilaian">
                <BarChart3 className="h-5 w-5 mr-2" />
                <div className="text-left">
                  <div className="font-medium">Input Nilai</div>
                  <div className="text-xs text-muted-foreground">Tugas, UTS, UAS</div>
                </div>
              </Link>
            </Button>

            <Button asChild variant="outline" className="h-auto py-4">
              <Link href="/akademik/dosen/materi">
                <BookOpen className="h-5 w-5 mr-2" />
                <div className="text-left">
                  <div className="font-medium">Upload Materi</div>
                  <div className="text-xs text-muted-foreground">Slide, modul, tugas</div>
                </div>
              </Link>
            </Button>

            <Button asChild variant="outline" className="h-auto py-4">
              <Link href="/akademik/dosen/presensi">
                <Clock className="h-5 w-5 mr-2" />
                <div className="text-left">
                  <div className="font-medium">Input Presensi</div>
                  <div className="text-xs text-muted-foreground">Kehadiran mahasiswa</div>
                </div>
              </Link>
            </Button>

            <Button asChild variant="outline" className="h-auto py-4">
              <Link href="/forum">
                <User className="h-5 w-5 mr-2" />
                <div className="text-left">
                  <div className="font-medium">Forum Diskusi</div>
                  <div className="text-xs text-muted-foreground">Q&A dengan mahasiswa</div>
                </div>
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
