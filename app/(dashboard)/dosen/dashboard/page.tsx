// app/(dashboard)/dosen/dashboard/page.tsx
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import {
  BookOpen,
  Users,
  FileText,
  Clock,
  BarChart3,
  MessageCircle,
  Settings,
  Calendar,
  Lock,
  ChevronRight
} from 'lucide-react';
import {
  StatsCard,
  ModuleCard,
  QuickAction,
  DashboardHeading
} from '@/components/dashboard/DashboardComponents';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export default async function DosenDashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect('/login');
  }

  if (session.user.role !== 'dosen') {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center p-8 premium-glass rounded-3xl border-destructive/20 bg-destructive/5 max-w-md">
          <Lock className="h-12 w-12 text-destructive mx-auto mb-4" />
          <h2 className="text-2xl font-bold tracking-tight text-destructive">Akses Ditolak</h2>
          <p className="text-muted-foreground mt-2">Hanya akun dengan peran Dosen yang dapat mengakses dashboard ini.</p>
        </div>
      </div>
    );
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
    ]
  };

  const getGreeting = () => {
    const time = new Date().getHours();
    if (time < 11) return 'Selamat Pagi';
    if (time < 15) return 'Selamat Siang';
    if (time < 18) return 'Selamat Sore';
    return 'Selamat Malam';
  };

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <DashboardHeading
        title={`${getGreeting()}, ${user.name?.split(' ')[0]}`}
        subtitle="Selamat datang kembali di pusat kendali akademik. Kelola kelas, nilai mahasiswa, dan persiapkan materi pembelajaran Anda hari ini."
        badge="Dosen Dashboard"
      />

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="Kelas Saya"
          value={dashboardData.totalAssignedClasses}
          description="Status Aktif"
          icon={BookOpen}
          href="/akademik/dosen/kelas"
        />
        <StatsCard
          title="Mahasiswa"
          value={dashboardData.totalEnrolledStudents}
          description="Total Terdaftar"
          icon={Users}
        />
        <StatsCard
          title="Pending Grades"
          value={dashboardData.pendingGrades}
          description="Perlu Penilaian"
          icon={FileText}
          variant={dashboardData.pendingGrades > 0 ? "warning" : "default"}
          href="/akademik/dosen/penilaian"
        />
        <StatsCard
          title="Presensi"
          value={dashboardData.pendingAttendances}
          description="Belum Terinput"
          icon={Clock}
          variant={dashboardData.pendingAttendances > 0 ? "danger" : "default"}
          href="/akademik/dosen/presensi"
        />
      </div>

      {/* Primary Actions Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <div>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold tracking-tight">Akademik Terpadu</h3>
              <Badge variant="outline" className="px-3 py-1 bg-primary/5 border-primary/10 text-primary font-bold text-[10px] tracking-widest uppercase">Teaching Modules</Badge>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <ModuleCard
                title="Manajemen Kelas"
                description="Pantau progres mahasiswa, jadwal kuliah, dan daftar hadir."
                icon={BookOpen}
                href="/akademik/dosen/kelas"
              />
              <ModuleCard
                title="Input Penilaian"
                description="Kelola komponen nilai tugas, UTS, UAS, dan feedback mahasiswa."
                icon={BarChart3}
                href="/akademik/dosen/penilaian"
              />
              <ModuleCard
                title="Materi & Tugas"
                description="Upload slide presentasi, ebook, dan instruksi penugasan."
                icon={FileText}
                href="/akademik/dosen/materi"
              />
              <ModuleCard
                title="Forum Akademik"
                description="Bangun diskusi interaktif dengan mahasiswa di forum kelas."
                icon={MessageCircle}
                href="/forum"
              />
            </div>
          </div>
        </div>

        {/* Recent Activity Sidebar */}
        <Card className="premium-glass bg-white/40 dark:bg-slate-900/40 border-2 border-primary/5 shadow-xl h-fit">
          <CardHeader className="border-b border-primary/5 pb-4">
            <CardTitle className="text-sm font-bold uppercase tracking-widest text-muted-foreground">Aktivitas Terbaru</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-primary/5">
              {dashboardData.recentActivities.map((activity, i) => (
                <div key={i} className="p-4 hover:bg-primary/5 transition-colors group cursor-pointer">
                  <div className="flex items-start gap-4">
                    <div className={cn(
                      "p-2 rounded-xl bg-white dark:bg-slate-950 shadow-sm transition-transform group-hover:scale-110",
                      activity.type === 'grading' ? 'text-sky-500' : 'text-sky-500'
                    )}>
                      {activity.type === 'grading' ? <BarChart3 size={16} /> : <Clock size={16} />}
                    </div>
                    <div className="flex-1 overflow-hidden">
                      <p className="text-xs font-bold uppercase tracking-wider mb-1 line-clamp-1">
                        {activity.type === 'grading' ? 'Penilaian' : 'Presensi'}
                      </p>
                      <p className="text-sm font-bold leading-tight line-clamp-2 mb-2">{activity.detail}</p>
                      <div className="flex items-center justify-between">
                        <Badge variant="outline" className="text-[9px] font-bold tracking-tighter h-5 px-1.5">{activity.class_code}</Badge>
                        <span className="text-[10px] text-muted-foreground font-medium italic opacity-60">Baru saja</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              <div className="p-4">
                <button className="w-full py-2.5 rounded-xl bg-muted/30 hover:bg-primary/10 text-[10px] font-bold uppercase tracking-widest transition-all text-muted-foreground hover:text-primary flex items-center justify-center gap-2">
                  Lihat Semua Log <ChevronRight size={14} />
                </button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Global Controls */}
      <div className="pt-6 border-t border-primary/5">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <QuickAction
            title="Kalender"
            description="Jadwal mengajar dan agenda"
            icon={Calendar}
            href="/akademik/kalender-akademik"
          />
          <QuickAction
            title="Presensi"
            description="Input kehadiran mahasiswa"
            icon={Clock}
            href="/akademik/dosen/presensi"
          />
          <QuickAction
            title="Laporan"
            description="Statistik pengajaran semester"
            icon={FileText}
            href="/laporan"
          />
          <QuickAction
            title="Pengaturan"
            description="Update profil dan keamanan"
            icon={Settings}
            href="/pengaturan"
          />
        </div>
      </div>
    </div>
  );
}

function cn(...classes: any[]) {
  return classes.filter(Boolean).join(' ');
}
