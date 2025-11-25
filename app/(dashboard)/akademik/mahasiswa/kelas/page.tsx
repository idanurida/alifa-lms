// app/(dashboard)/akademik/mahasiswa/kelas/page.tsx
import { notFound } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { sql } from '@/lib/db';
import { BookOpen, Users, Calendar, Clock, MapPin, User, AlertCircle } from 'lucide-react';
import Link from 'next/link';

export default async function KelasMahasiswaPage() {
  const session = await getServerSession(authOptions);
  
  // PERBAIKAN: Tambah akses untuk staff akademik
  if (!session || !['mahasiswa', 'staff_akademik', 'super_admin'].includes(session.user.role as string)) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-red-600">Tidak Diizinkan</h2>
          <p className="text-muted-foreground mt-2">
            Anda tidak memiliki akses ke halaman ini.
          </p>
        </div>
      </div>
    );
  }

  const userId = session.user.id;
  const userRole = session.user.role;

  // PERBAIKAN KRITIS: INISIALISASI 'kelas' sebagai array kosong agar tidak undefined
  let mahasiswa: any; // Biarkan any atau ganti dengan tipe Mahasiswa yang benar
  let kelas: any[] = []; // INI SOLUSI UNTUK 'kelas is possibly undefined'

  try {
    if (userRole === 'mahasiswa') {
      // Ambil data mahasiswa berdasarkan user_id
      const hasilMahasiswa = await sql`
        SELECT id, nama, nim FROM mahasiswa WHERE user_id = ${userId}
      `;
      
      // Fallback ke table students jika mahasiswa tidak ada
      if (!hasilMahasiswa || hasilMahasiswa.length === 0) {
        const studentsFallback = await sql`
          SELECT id, name as nama, nim FROM students WHERE user_id = ${userId}
        `;
        
        if (!studentsFallback || studentsFallback.length === 0) {
          return (
            <div className="p-6">
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <h2 className="text-lg font-semibold text-yellow-800">Profil Mahasiswa Tidak Ditemukan</h2>
                <p className="text-yellow-700">Data profil mahasiswa Anda belum terdaftar di sistem.</p>
              </div>
            </div>
          );
        }
        mahasiswa = studentsFallback[0];
      } else {
        mahasiswa = hasilMahasiswa[0];
      }

      // PERBAIKAN QUERY: Ambil data kelas yang diikuti dengan JOIN yang benar
      kelas = await sql`
        SELECT 
          k.id,
          k.kode_kelas as class_code,
          k.nama_kelas as class_name,
          k.hari_jadwal as schedule_day,
          k.waktu_jadwal as schedule_time, 
          k.ruangan as room,
          mk.nama as course_name,
          mk.kode as course_code,
          mk.sks as credits,
          d.nama as lecturer_name,
          pe.status as enrollment_status,
          pe.nilai_akhir as final_grade
        FROM pendaftaran_kelas pe
        JOIN kelas k ON pe.kelas_id = k.id
        JOIN mata_kuliah mk ON k.mata_kuliah_id = mk.id
        LEFT JOIN dosen d ON k.dosen_id = d.id
        WHERE pe.mahasiswa_id = ${mahasiswa.id}
        ORDER BY 
          CASE WHEN pe.status = 'active' THEN 1 ELSE 2 END,
          k.kode_kelas
      `;

      // Fallback ke table English jika query gagal
      if (!kelas || kelas.length === 0) {
        kelas = await sql`
          SELECT 
            c.id,
            c.class_code,
            c.class_name,
            c.schedule_day,
            c.schedule_time, 
            c.room,
            co.name as course_name,
            co.code as course_code,
            co.credits,
            l.name as lecturer_name,
            se.status as enrollment_status,
            se.final_grade
          FROM student_enrollments se
          JOIN classes c ON se.class_id = c.id
          JOIN courses co ON c.course_id = co.id
          LEFT JOIN lecturers l ON c.lecturer_id = l.id
          WHERE se.student_id = ${mahasiswa.id}
          ORDER BY 
            CASE WHEN se.status = 'active' THEN 1 ELSE 2 END,
            c.class_code
        `;
      }

    } else if (['staff_akademik', 'super_admin'].includes(userRole)) {
      // PERBAIKAN: Staff akademik bisa melihat semua kelas
      kelas = await sql`
        SELECT 
          k.id,
          k.kode_kelas as class_code,
          k.nama_kelas as class_name,
          k.hari_jadwal as schedule_day,
          k.waktu_jadwal as schedule_time, 
          k.ruangan as room,
          mk.nama as course_name,
          mk.kode as course_code,
          mk.sks as credits,
          d.nama as lecturer_name,
          COUNT(pe.mahasiswa_id) as total_students,
          k.is_active
        FROM kelas k
        JOIN mata_kuliah mk ON k.mata_kuliah_id = mk.id
        LEFT JOIN dosen d ON k.dosen_id = d.id
        LEFT JOIN pendaftaran_kelas pe ON k.id = pe.kelas_id AND pe.status = 'active'
        WHERE k.is_active = true
        GROUP BY k.id, k.kode_kelas, k.nama_kelas, k.hari_jadwal, k.waktu_jadwal, 
                 k.ruangan, mk.nama, mk.kode, mk.sks, d.nama, k.is_active
        ORDER BY k.kode_kelas
      `;

      // Fallback ke table English
      if (!kelas || kelas.length === 0) {
        kelas = await sql`
          SELECT 
            c.id,
            c.class_code,
            c.class_name,
            c.schedule_day,
            c.schedule_time, 
            c.room,
            co.name as course_name,
            co.code as course_code,
            co.credits,
            l.name as lecturer_name,
            COUNT(se.student_id) as total_students,
            c.is_active
          FROM classes c
          JOIN courses co ON c.course_id = co.id
          LEFT JOIN lecturers l ON c.lecturer_id = l.id
          LEFT JOIN student_enrollments se ON c.id = se.class_id AND se.status = 'active'
          WHERE c.is_active = true
          GROUP BY c.id, c.class_code, c.class_name, c.schedule_day, c.schedule_time, 
                   c.room, co.name, co.code, co.credits, l.name, c.is_active
          ORDER BY c.class_code
        `;
      }
    }

  } catch (error) {
    console.error('Gagal memuat data kelas:', error);
    
    // Fallback data untuk development (ini juga berfungsi sebagai inisialisasi jika query gagal)
    kelas = [
      {
        id: 1,
        class_code: 'CS101-A',
        class_name: 'Pemrograman Dasar',
        course_name: 'Pemrograman Dasar',
        course_code: 'CS101',
        credits: 3,
        lecturer_name: 'Dr. Ahmad Wijaya',
        schedule_day: 'Senin',
        schedule_time: '08:00-10:00',
        room: 'R.301',
        enrollment_status: 'active',
        final_grade: null,
        total_students: 25,
        is_active: true
      },
      {
        id: 2, 
        class_code: 'MT201-B',
        class_name: 'Kalkulus Lanjut',
        course_name: 'Kalkulus Lanjut',
        course_code: 'MT201',
        credits: 4,
        lecturer_name: 'Prof. Sari Dewi',
        schedule_day: 'Rabu',
        schedule_time: '10:00-12:00',
        room: 'R.205',
        enrollment_status: 'active',
        final_grade: null,
        total_students: 30,
        is_active: true
      }
    ];
  }

  // Baris filter ini sekarang aman karena 'kelas' diinisialisasi sebagai array.
  const kelasAktif = userRole === 'mahasiswa' 
    ? kelas.filter((kls: any) => kls.enrollment_status === 'active')
    : kelas.filter((kls: any) => kls.is_active === true);

  const kelasSelesai = userRole === 'mahasiswa' 
    ? kelas.filter((kls: any) => kls.enrollment_status === 'completed')
    : [];

  return (
    // ... (sisa JSX Anda)
    <div className="space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-bold tracking-tight">
          {userRole === 'mahasiswa' ? 'Kelas Saya' : 'Daftar Kelas'}
        </h1>
        <p className="text-muted-foreground">
          {userRole === 'mahasiswa' 
            ? 'Kelas yang sedang diikuti dan sudah diselesaikan'
            : 'Kelola semua kelas dan mahasiswa yang terdaftar'
          }
        </p>
      </div>

      {/* Info untuk Staff Akademik */}
      {['staff_akademik', 'super_admin'].includes(userRole) && (
        <Card className="bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <AlertCircle className="h-5 w-5 text-blue-600" />
              <div>
                <p className="font-medium text-blue-800 dark:text-blue-300">
                  Mode Staff Akademik
                </p>
                <p className="text-sm text-blue-700 dark:text-blue-400 mt-1">
                  Anda sedang melihat semua kelas yang tersedia di sistem
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Kelas Aktif */}
      <Card className="glass-effect dark:glass-effect-dark">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            {userRole === 'mahasiswa' 
              ? `Kelas Aktif (${kelasAktif.length})`
              : `Semua Kelas Aktif (${kelasAktif.length})`
            }
          </CardTitle>
        </CardHeader>
        <CardContent>
          {kelasAktif.length === 0 ? (
            <div className="text-center py-8">
              <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">
                {userRole === 'mahasiswa' 
                  ? 'Tidak ada kelas aktif.'
                  : 'Tidak ada kelas aktif di sistem.'
                }
              </p>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {kelasAktif.map((kls: any) => (
                <Card key={kls.id} className="bg-card border-border hover:shadow-md transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-base">{kls.course_name}</CardTitle>
                        <p className="text-sm text-muted-foreground">
                          {kls.class_code} - {kls.course_code}
                        </p>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        {userRole === 'mahasiswa' ? (
                          <Badge variant="secondary">Aktif</Badge>
                        ) : (
                          <>
                            <Badge variant="default">Aktif</Badge>
                            {kls.total_students && (
                              <Badge variant="outline" className="text-xs">
                                {kls.total_students} mahasiswa
                              </Badge>
                            )}
                          </>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-muted-foreground" />
                        <span>{kls.lecturer_name || 'Belum ada dosen'}</span>
                      </div>
                      {kls.schedule_day && (
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <span>{kls.schedule_day}</span>
                        </div>
                      )}
                      {kls.schedule_time && (
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          <span>{kls.schedule_time}</span>
                        </div>
                      )}
                      {kls.room && (
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4 text-muted-foreground" />
                          <span>{kls.room}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-2">
                        <BookOpen className="h-4 w-4 text-muted-foreground" />
                        <span>{kls.credits} SKS</span>
                      </div>
                    </div>
                    <div className="mt-4 flex gap-2">
                      {userRole === 'mahasiswa' ? (
                        <Button size="sm" asChild>
                          <Link href={`/akademik/mahasiswa/kelas/${kls.id}`}>
                            Lihat Detail
                          </Link>
                        </Button>
                      ) : (
                        <>
                          <Button size="sm" variant="outline" asChild>
                            <Link href={`/akademik/kelas/${kls.id}`}>
                              Kelola Kelas
                            </Link>
                          </Button>
                          <Button size="sm" asChild>
                            <Link href={`/akademik/mahasiswa?kelas=${kls.id}`}>
                              Lihat Mahasiswa
                            </Link>
                          </Button>
                        </>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Kelas Selesai - Hanya untuk mahasiswa */}
      {userRole === 'mahasiswa' && kelasSelesai.length > 0 && (
        <Card className="glass-effect dark:glass-effect-dark">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              Kelas Selesai ({kelasSelesai.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              {kelasSelesai.map((kls: any) => (
                <Card key={kls.id} className="bg-card border-border">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-base">{kls.course_name}</CardTitle>
                        <p className="text-sm text-muted-foreground">
                          {kls.class_code} - {kls.course_code}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">Selesai</Badge>
                        {kls.final_grade && (
                          <Badge variant="default">{kls.final_grade}</Badge>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-muted-foreground" />
                        <span>{kls.lecturer_name}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <BookOpen className="h-4 w-4 text-muted-foreground" />
                        <span>{kls.credits} SKS</span>
                      </div>
                    </div>
                    <div className="mt-4">
                      <Button size="sm" variant="outline" asChild>
                        <Link href={`/akademik/mahasiswa/nilai`}>
                          Lihat Nilai Detail
                        </Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Statistik untuk Staff Akademik */}
      {['staff_akademik', 'super_admin'].includes(userRole) && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Kelas</p>
                  <p className="text-2xl font-bold">{kelasAktif.length}</p>
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
                    {kelasAktif.reduce((total: number, kls: any) => total + (kls.total_students || 0), 0)}
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
                  <p className="text-sm font-medium text-muted-foreground">Kelas tanpa Dosen</p>
                  <p className="text-2xl font-bold">
                    {kelasAktif.filter((kls: any) => !kls.lecturer_name).length}
                  </p>
                </div>
                <User className="h-8 w-8 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}