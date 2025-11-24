// app/(dashboard)/dosen/page.tsx
import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { sql } from '@/lib/db';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { GraduationCap, BookOpen, FileText, Users, BarChart3, Clock, Calendar, MessageCircle, Settings } from 'lucide-react';

export default async function DosenDashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect('/login');
  }

  if (session.user.role !== 'dosen') {
    redirect('/unauthorized');
  }

  const user = session.user;

  // Data default untuk development
  let dashboardData = {
    totalAssignedClasses: 3,
    totalEnrolledStudents: 85,
    pendingGrades: 12,
    pendingAttendances: 5,
    upcomingDeadlines: 2,
    recentActivities: [
      {
        type: 'grading',
        class_code: 'CS101-A',
        detail: 'Tugas 1 - Pemrograman Dasar',
        activity_date: new Date().toISOString()
      },
      {
        type: 'attendance', 
        class_code: 'MT201-B',
        detail: 'Meeting #8 - Kalkulus',
        activity_date: new Date().toISOString()
      }
    ],
    progressChartData: [
      { semester: 'Semester 1', averageScore: 78.5 },
      { semester: 'Semester 2', averageScore: 82.3 },
      { semester: 'Semester 3', averageScore: 85.1 },
      { semester: 'Semester 4', averageScore: 80.7 }
    ],
  };

  // Format date function
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  const getGreeting = () => {
    const time = new Date().getHours();
    let timeGreet = 'Halo';
    if (time < 11) timeGreet = 'Selamat Pagi';
    else if (time < 15) timeGreet = 'Selamat Siang';
    else if (time < 18) timeGreet = 'Selamat Sore';
    else timeGreet = 'Selamat Malam';
    return `${timeGreet}, ${user.name || 'Pengguna'} (Dosen)`;
  };

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <p className="text-sm font-medium">Dashboard Dosen</p>
        <p className="text-muted-foreground text-sm">
          {getGreeting()} - Kelola kelas, nilai, dan materi Anda.
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="glass-effect dark:glass-effect-dark">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Kelas Saya</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardData.totalAssignedClasses}</div>
            <p className="text-xs text-muted-foreground">Sedang aktif</p>
          </CardContent>
        </Card>

        <Card className="glass-effect dark:glass-effect-dark">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Mahasiswa</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardData.totalEnrolledStudents}</div>
            <p className="text-xs text-muted-foreground">Di semua kelas</p>
          </CardContent>
        </Card>

        <Card className="glass-effect dark:glass-effect-dark">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Nilai Belum Diinput</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardData.pendingGrades}</div>
            <p className="text-xs text-muted-foreground">Tugas/UTS/UAS</p>
          </CardContent>
        </Card>

        <Card className="glass-effect dark:glass-effect-dark">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Presensi Belum Diinput</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardData.pendingAttendances}</div>
            <p className="text-xs text-muted-foreground">Per pekan</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts & Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 glass-effect dark:glass-effect-dark">
          <CardHeader>
            <CardTitle>Progres Rata-rata Kelas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64 flex items-center justify-center bg-muted/20 rounded-lg">
              <p className="text-muted-foreground">Chart component akan ditampilkan di sini</p>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-effect dark:glass-effect-dark">
          <CardHeader>
            <CardTitle>Aktivitas Terbaru</CardTitle>
          </CardHeader>
          <CardContent>
            {dashboardData.recentActivities.length === 0 ? (
              <p className="text-sm text-muted-foreground">Belum ada aktivitas.</p>
            ) : (
              <div className="space-y-3">
                {dashboardData.recentActivities.map((activity: any, index: number) => (
                  <div key={index} className="flex items-start gap-3 text-sm">
                    <div className={`w-2 h-2 rounded-full mt-1.5 ${
                      activity.type === 'grading' ? 'bg-green-500' : 'bg-purple-500'
                    }`}></div>
                    <div className="flex-1">
                      <p className="font-medium">
                        {activity.type === 'grading' ? 'Input Nilai' : 'Input Presensi'}
                      </p>
                      <p className="text-muted-foreground">
                        {activity.detail} - {activity.class_code}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {formatDate(activity.activity_date)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Aksi Cepat</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <Link href="/akademik/dosen/kelas">
            <Card className="hover:shadow-md transition-shadow cursor-pointer glass-effect dark:glass-effect-dark">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <BookOpen className="text-green-600" size={20} />
                  <CardTitle className="text-base">Kelas Saya</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">Lihat daftar kelas yang diajar.</p>
              </CardContent>
            </Card>
          </Link>

          <Link href="/akademik/dosen/penilaian">
            <Card className="hover:shadow-md transition-shadow cursor-pointer glass-effect dark:glass-effect-dark">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <BarChart3 className="text-green-600" size={20} />
                  <CardTitle className="text-base">Input Nilai</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">Atur komponen penilaian dan input nilai.</p>
              </CardContent>
            </Card>
          </Link>

          <Link href="/akademik/dosen/materi">
            <Card className="hover:shadow-md transition-shadow cursor-pointer glass-effect dark:glass-effect-dark">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <FileText className="text-green-600" size={20} />
                  <CardTitle className="text-base">Materi Pembelajaran</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">Upload slide, tugas, dan materi lainnya.</p>
              </CardContent>
            </Card>
          </Link>

          <Link href="/akademik/dosen/presensi">
            <Card className="hover:shadow-md transition-shadow cursor-pointer glass-effect dark:glass-effect-dark">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Clock className="text-green-600" size={20} />
                  <CardTitle className="text-base">Input Presensi</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">Catat kehadiran mahasiswa per kelas.</p>
              </CardContent>
            </Card>
          </Link>

          <Link href="/forum">
            <Card className="hover:shadow-md transition-shadow cursor-pointer glass-effect dark:glass-effect-dark">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <MessageCircle className="text-green-600" size={20} />
                  <CardTitle className="text-base">Forum Diskusi</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">Balas pertanyaan mahasiswa di forum.</p>
              </CardContent>
            </Card>
          </Link>

          <Link href="/pengaturan">
            <Card className="hover:shadow-md transition-shadow cursor-pointer glass-effect dark:glass-effect-dark">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Settings className="text-green-600" size={20} />
                  <CardTitle className="text-base">Pengaturan Profil</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">Ubah informasi pribadi dan keamanan.</p>
              </CardContent>
            </Card>
          </Link>
        </div>
      </div>
    </div>
  );
}