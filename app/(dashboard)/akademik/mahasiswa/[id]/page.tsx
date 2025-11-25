// app/akademik/mahasiswa/[id]/page.tsx
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  GraduationCap, 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar,
  BookOpen,
  BarChart3,
  ArrowLeft,
  Edit
} from 'lucide-react';
import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { sql } from '@/lib/db';

interface PageProps {
  params: {
    id: string;
  };
}

export default async function DetailMahasiswaPage({ params }: PageProps) {
  const session = await getServerSession(authOptions);
  
  // Cek authorization - hanya staff akademik dan super admin yang bisa akses
  if (!session || !['super_admin', 'staff_akademik'].includes(session.user.role as string)) {
    redirect('/login');
  }

  const { id } = params;

  let studentData = null;
  let academicData = null;
  let enrollmentData: any[] = [];

  try {
    // Ambil data mahasiswa
    const [student] = await sql`
      SELECT 
        s.id, s.nim, s.name, s.email, s.phone, s.address, s.birth_date, s.entry_year,
        s.status, s.created_at, s.updated_at,
        p.name as program_studi_name,
        u.name as created_by_name
      FROM students s
      LEFT JOIN program_studi p ON s.program_studi_id = p.id
      LEFT JOIN users u ON s.created_by = u.id
      WHERE s.id = ${id}
    `;

    if (!student) {
      notFound();
    }

    studentData = student;

    // Ambil data akademik (IPK, total SKS, dll)
    const [academic] = await sql`
      SELECT 
        COUNT(DISTINCT se.id) as total_courses,
        SUM(CASE WHEN se.status = 'completed' THEN c.credits ELSE 0 END) as completed_credits,
        SUM(c.credits) as total_credits,
        AVG(CASE WHEN se.final_score IS NOT NULL THEN se.final_score END) as gpa
      FROM student_enrollments se
      JOIN classes cl ON se.class_id = cl.id
      JOIN courses c ON cl.course_id = c.id
      WHERE se.student_id = ${id}
    `;

    academicData = academic;

    // Ambil data enrollment aktif
    const enrollments = await sql`
      SELECT 
        se.id, se.status, se.final_score, se.final_grade,
        c.code as course_code, c.name as course_name, c.credits,
        cl.name as class_name, cl.semester,
        d.name as lecturer_name,
        ap.name as academic_period
      FROM student_enrollments se
      JOIN classes cl ON se.class_id = cl.id
      JOIN courses c ON cl.course_id = c.id
      LEFT JOIN lecturers d ON cl.lecturer_id = d.id
      LEFT JOIN academic_periods ap ON cl.academic_period_id = ap.id
      WHERE se.student_id = ${id}
      ORDER BY ap.year DESC, ap.semester DESC, c.name ASC
    `;

    enrollmentData = enrollments;

  } catch (error) {
    console.error('Failed to fetch student data:', error);
    notFound();
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge variant="default" className="bg-green-500">Aktif</Badge>;
      case 'graduated':
        return <Badge variant="default" className="bg-blue-500">Lulus</Badge>;
      case 'dropout':
        return <Badge variant="destructive">Drop Out</Badge>;
      case 'inactive':
        return <Badge variant="secondary">Non-Aktif</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" asChild>
            <Link href="/akademik/mahasiswa">
              <ArrowLeft size={16} />
            </Link>
          </Button>
          <div className="space-y-1">
            <h1 className="text-2xl font-bold">Detail Mahasiswa</h1>
            <p className="text-muted-foreground">
              Informasi lengkap profil dan akademik mahasiswa
            </p>
          </div>
        </div>
        <Button asChild>
          <Link href={`/akademik/mahasiswa/${id}/edit`}>
            <Edit size={16} className="mr-2" />
            Edit Data
          </Link>
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Kolom Kiri - Profil Mahasiswa */}
        <div className="lg:col-span-2 space-y-6">
          {/* Informasi Pribadi */}
          <Card className="glass-effect dark:glass-effect-dark">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User size={20} />
                Informasi Pribadi
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">NIM</label>
                  <p className="font-semibold">{studentData.nim}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Nama Lengkap</label>
                  <p className="font-semibold">{studentData.name}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Email</label>
                  <div className="flex items-center gap-2">
                    <Mail size={16} className="text-muted-foreground" />
                    <p>{studentData.email || '-'}</p>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Telepon</label>
                  <div className="flex items-center gap-2">
                    <Phone size={16} className="text-muted-foreground" />
                    <p>{studentData.phone || '-'}</p>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Tanggal Lahir</label>
                  <div className="flex items-center gap-2">
                    <Calendar size={16} className="text-muted-foreground" />
                    <p>{studentData.birth_date ? formatDate(studentData.birth_date) : '-'}</p>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Tahun Masuk</label>
                  <p className="font-semibold">{studentData.entry_year}</p>
                </div>
                <div className="md:col-span-2">
                  <label className="text-sm font-medium text-muted-foreground">Alamat</label>
                  <div className="flex items-start gap-2">
                    <MapPin size={16} className="text-muted-foreground mt-0.5 flex-shrink-0" />
                    <p className="text-sm">{studentData.address || 'Alamat tidak tersedia'}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Informasi Akademik */}
          <Card className="glass-effect dark:glass-effect-dark">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <GraduationCap size={20} />
                Informasi Akademik
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="text-center p-4 bg-muted rounded-lg">
                  <p className="text-2xl font-bold text-supabase-green">
                    {academicData?.gpa ? academicData.gpa.toFixed(2) : '0.00'}
                  </p>
                  <p className="text-sm text-muted-foreground">IPK</p>
                </div>
                <div className="text-center p-4 bg-muted rounded-lg">
                  <p className="text-2xl font-bold text-supabase-green">
                    {academicData?.completed_credits || 0}
                  </p>
                  <p className="text-sm text-muted-foreground">SKS Lulus</p>
                </div>
                <div className="text-center p-4 bg-muted rounded-lg">
                  <p className="text-2xl font-bold text-supabase-green">
                    {academicData?.total_credits || 0}
                  </p>
                  <p className="text-sm text-muted-foreground">Total SKS</p>
                </div>
                <div className="text-center p-4 bg-muted rounded-lg">
                  <p className="text-2xl font-bold text-supabase-green">
                    {academicData?.total_courses || 0}
                  </p>
                  <p className="text-sm text-muted-foreground">Total Mata Kuliah</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Program Studi</label>
                  <p className="font-semibold">{studentData.program_studi_name || '-'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Status</label>
                  <div className="mt-1">
                    {getStatusBadge(studentData.status)}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Riwayat Kelas */}
          <Card className="glass-effect dark:glass-effect-dark">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen size={20} />
                Riwayat Kelas
              </CardTitle>
            </CardHeader>
            <CardContent>
              {enrollmentData.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">
                  Belum ada riwayat kelas
                </p>
              ) : (
                <div className="space-y-4">
                  {enrollmentData.map((enrollment) => (
                    <div key={enrollment.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="font-semibold">{enrollment.course_code} - {enrollment.course_name}</p>
                          <Badge variant="outline">{enrollment.credits} SKS</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Kelas: {enrollment.class_name} • {enrollment.academic_period}
                        </p>
                        {enrollment.lecturer_name && (
                          <p className="text-sm text-muted-foreground">
                            Dosen: {enrollment.lecturer_name}
                          </p>
                        )}
                      </div>
                      <div className="text-right">
                        <Badge variant={
                          enrollment.status === 'completed' ? 'default' :
                          enrollment.status === 'active' ? 'secondary' : 'outline'
                        }>
                          {enrollment.status === 'completed' ? 'Selesai' :
                           enrollment.status === 'active' ? 'Aktif' : enrollment.status}
                        </Badge>
                        {enrollment.final_score && (
                          <p className="text-sm font-semibold mt-1">
                            Nilai: {enrollment.final_score} ({enrollment.final_grade})
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Kolom Kanan - Informasi Tambahan */}
        <div className="space-y-6">
          {/* Status & Aksi Cepat */}
          <Card className="glass-effect dark:glass-effect-dark">
            <CardHeader>
              <CardTitle>Status & Aksi</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">Status Mahasiswa</label>
                <div className="mt-2">
                  {getStatusBadge(studentData.status)}
                </div>
              </div>
              
              <div className="space-y-2">
                <Button variant="outline" className="w-full justify-start" asChild>
                  <Link href={`/akademik/mahasiswa/${id}/nilai`}>
                    <BarChart3 size={16} className="mr-2" />
                    Lihat Nilai
                  </Link>
                </Button>
                <Button variant="outline" className="w-full justify-start" asChild>
                  <Link href={`/akademik/mahasiswa/${id}/krs`}>
                    <BookOpen size={16} className="mr-2" />
                    Lihat KRS
                  </Link>
                </Button>
                <Button variant="outline" className="w-full justify-start" asChild>
                  <Link href={`/akademik/mahasiswa/${id}/keuangan`}>
                    <GraduationCap size={16} className="mr-2" />
                    Riwayat Keuangan
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Informasi Sistem */}
          <Card className="glass-effect dark:glass-effect-dark">
            <CardHeader>
              <CardTitle>Informasi Sistem</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <label className="text-sm font-medium text-muted-foreground">Dibuat Pada</label>
                <p className="text-sm">{formatDate(studentData.created_at)}</p>
              </div>
              {studentData.updated_at && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Diupdate Pada</label>
                  <p className="text-sm">{formatDate(studentData.updated_at)}</p>
                </div>
              )}
              {studentData.created_by_name && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Dibuat Oleh</label>
                  <p className="text-sm">{studentData.created_by_name}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
