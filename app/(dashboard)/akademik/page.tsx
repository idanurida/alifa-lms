selesaikan file:
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  GraduationCap, 
  BookOpen, 
  Users, 
  Calendar, 
  FileText, 
  Settings,
  User,
  BookA,
  FileCheck,
  Clock,
  TrendingUp,
  AlertCircle
} from 'lucide-react';
import Link from 'next/link';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

// Komponen Stats Card
function StatsCard({ 
  title, 
  value, 
  description, 
  icon: Icon, 
  trend,
  href,
  variant = "default"
}: {
  title: string;
  value: number;
  description: string;
  icon: any;
  trend?: number;
  href?: string;
  variant?: "default" | "warning" | "danger";
}) {
  const variantStyles = {
    default: "border-border",
    warning: "border-yellow-200 bg-yellow-50 dark:bg-yellow-900/20 dark:border-yellow-800",
    danger: "border-red-200 bg-red-50 dark:bg-red-900/20 dark:border-red-800"
  };

  const content = (
    <Card className={`glass-effect dark:glass-effect-dark ${variantStyles[variant]}`}>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className={`h-4 w-4 text-muted-foreground ${
          variant === 'warning' ? 'text-yellow-600' : 
          variant === 'danger' ? 'text-red-600' : ''
        }`} />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <div className="flex items-center justify-between">
          <p className="text-xs text-muted-foreground">{description}</p>
          {trend !== undefined && (
            <div className={`text-xs ${trend > 0 ? 'text-green-600' : 'text-red-600'}`}>
              {trend > 0 ? '+' : ''}{trend}%
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );

  return href ? <Link href={href}>{content}</Link> : content;
}

// Komponen Quick Action
function QuickAction({
  title,
  description,
  icon: Icon,
  href,
  variant = "default"
}: {
  title: string;
  description: string;
  icon: any;
  href: string;
  variant?: "default" | "warning" | "danger";
}) {
  const variantStyles = {
    default: "border-border hover:bg-muted",
    warning: "border-yellow-200 bg-yellow-50 hover:bg-yellow-100 dark:bg-yellow-900/20 dark:border-yellow-800",
    danger: "border-red-200 bg-red-50 hover:bg-red-100 dark:bg-red-900/20 dark:border-red-800"
  };

  return (
    <Link href={href} className={`text-left p-4 border rounded-lg transition-colors block ${variantStyles[variant]}`}>
      <div className="flex items-center gap-3 mb-2">
        <Icon className={`h-5 w-5 ${
          variant === 'warning' ? 'text-yellow-600' : 
          variant === 'danger' ? 'text-red-600' : 'text-primary'
        }`} />
        <span className="font-medium">{title}</span>
      </div>
      <p className="text-sm text-muted-foreground">{description}</p>
    </Link>
  );
}

// Komponen Module Card
function ModuleCard({
  title,
  description,
  icon: Icon,
  href
}: {
  title: string;
  description: string;
  icon: any;
  href: string;
}) {
  return (
    <Link href={href} className="block">
      <Card className="hover:shadow-md transition-shadow cursor-pointer glass-effect dark:glass-effect-dark group">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-muted group-hover:bg-primary/20 transition-colors">
              <Icon className="h-5 w-5 text-primary group-hover:text-primary/80" />
            </div>
            <CardTitle className="text-base group-hover:text-primary transition-colors">
              {title}
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">{description}</p>
        </CardContent>
      </Card>
    </Link>
  );
}

export default async function AkademikDashboardPage() {
  const session = await getServerSession(authOptions);
  if (!session || !['super_admin', 'staff_akademik', 'dosen', 'mahasiswa'].includes(session.user.role as string)) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-red-600">Unauthorized</h2>
          <p className="text-muted-foreground mt-2">
            Anda tidak memiliki akses ke halaman ini.
          </p>
        </div>
      </div>
    );
  }

  const role = session.user.role;
  
  // Data statis untuk contoh
  const stats = {
    totalStudents: 1250,
    totalLecturers: 85,
    totalClasses: 156,
    totalCourses: 89,
    totalActivePeriods: 1,
    totalCurricula: 12,
    pendingKRS: 23,
    urgentTasks: 5,
    studentGrowth: 8,
    lecturerClasses: 4,
    studentCredits: 18,
    studentGPA: 3.45,
    programStats: [
      { name: 'Teknik Informatika', code: 'TI', students: 450, growth: 12 },
      { name: 'Sistem Informasi', code: 'SI', students: 320, growth: 8 },
      { name: 'Manajemen', code: 'MNJ', students: 280, growth: 5 }
    ],
    upcomingClasses: [
      { course_name: 'Pemrograman Web', class_code: 'CS101-A', schedule: 'Senin, 08:00-10:00', room: 'Lab. Komputer 1' },
      { course_name: 'Basis Data', class_code: 'CS102-B', schedule: 'Selasa, 10:00-12:00', room: 'Lab. Komputer 2' }
    ]
  };

  const accessibleModules = getAccessibleModules(role);
  const recentActivities = getRecentActivities(role);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Dashboard Akademik</h1>
        <p className="text-muted-foreground text-lg">
          Selamat datang, <span className="font-semibold text-foreground">{session.user.name}</span>!
          {role === 'staff_akademik' && ' Kelola seluruh sistem akademik di sini.'}
          {role === 'dosen' && ' Pantau kelas dan aktivitas mengajar Anda.'}
          {role === 'mahasiswa' && ' Lihat progress akademik Anda.'}
        </p>
      </div>

      {/* Alert untuk Staff Akademik */}
      {['super_admin', 'staff_akademik'].includes(role) && (
        <Card className="bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <AlertCircle className="h-5 w-5 text-blue-600" />
              <div>
                <p className="font-medium text-blue-800 dark:text-blue-300">
                  Dashboard Staff Akademik
                </p>
                <p className="text-sm text-blue-700 dark:text-blue-400 mt-1">
                  Anda memiliki akses penuh untuk mengelola semua modul akademik
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Mahasiswa - Hanya untuk staff/admin */}
        {['super_admin', 'staff_akademik'].includes(role) && (
          <StatsCard
            title="Total Mahasiswa"
            value={stats.totalStudents}
            description="Terdaftar aktif"
            icon={Users}
            trend={stats.studentGrowth}
            href="/akademik/mahasiswa"
          />
        )}

        {/* Total Dosen - Hanya untuk staff/admin */}
        {['super_admin', 'staff_akademik'].includes(role) && (
          <StatsCard
            title="Total Dosen"
            value={stats.totalLecturers}
            description="Aktif mengajar"
            icon={User}
            href="/akademik/dosen"
          />
        )}

        {/* Kelas Aktif */}
        <StatsCard
          title="Kelas Aktif"
          value={stats.totalClasses}
          description={role === 'mahasiswa' ? 'Yang diikuti' : 'Sedang berjalan'}
          icon={BookOpen}
          href="/akademik/kelas"
        />

        {/* Mata Kuliah */}
        {['super_admin', 'staff_akademik'].includes(role) && (
          <StatsCard
            title="Mata Kuliah"
            value={stats.totalCourses}
            description="Tersedia"
            icon={BookA}
            href="/akademik/mata-kuliah"
          />
        )}

        {/* Untuk Dosen: Kelas yang diajar */}
        {role === 'dosen' && (
          <StatsCard
            title="Kelas Diajar"
            value={stats.lecturerClasses}
            description="Semester ini"
            icon={BookOpen}
            href="/akademik/dosen/kelas"
          />
        )}

        {/* Untuk Mahasiswa: SKS Diambil */}
        {role === 'mahasiswa' && (
          <StatsCard
            title="SKS Diambil"
            value={stats.studentCredits}
            description="Semester ini"
            icon={FileCheck}
            href="/akademik/mahasiswa/krs"
          />
        )}

        {/* Periode Aktif */}
        <StatsCard
          title="Periode Aktif"
          value={stats.totalActivePeriods}
          description="Sedang berlangsung"
          icon={Calendar}
          href="/akademik/kalender-akademik"
        />

        {/* Kurikulum - Hanya untuk staff/admin */}
        {['super_admin', 'staff_akademik'].includes(role) && (
          <StatsCard
            title="Kurikulum"
            value={stats.totalCurricula}
            description="Tersedia"
            icon={GraduationCap}
            href="/akademik/kurikulum"
          />
        )}

        {/* KRS Pending - Hanya untuk staff akademik */}
        {['super_admin', 'staff_akademik'].includes(role) && (
          <StatsCard
            title="KRS Pending"
            value={stats.pendingKRS}
            description="Perlu approval"
            icon={FileCheck}
            variant="warning"
            href="/akademik/mahasiswa?tab=krs-pending"
          />
        )}

        {/* Tugas Mendesak - Hanya untuk staff akademik */}
        {['super_admin', 'staff_akademik'].includes(role) && (
          <StatsCard
            title="Kelas Tanpa Dosen"
            value={stats.urgentTasks}
            description="Perlu penugasan"
            icon={AlertCircle}
            variant="danger"
            href="/akademik/kelas"
          />
        )}
      </div>

      {/* Quick Actions untuk Staff Akademik */}
      {['super_admin', 'staff_akademik'].includes(role) && (
        <Card>
          <CardHeader>
            <CardTitle>Tugas Cepat Hari Ini</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <QuickAction
                title="Approve KRS"
                description={`${stats.pendingKRS} permohonan menunggu`}
                icon={FileCheck}
                href="/akademik/mahasiswa?tab=krs-pending"
                variant={stats.pendingKRS > 0 ? "warning" : "default"}
              />

              <QuickAction
                title="Atur Penugasan Dosen"
                description="Tugaskan dosen ke kelas"
                icon={User}
                href="/akademik/kelas"
              />

              <QuickAction
                title="Jadwal Akademik"
                description="Lihat tenggat waktu"
                icon={Calendar}
                href="/akademik/kalender-akademik"
              />

              <QuickAction
                title="Input Nilai"
                description="Periode penilaian"
                icon={TrendingUp}
                href="/akademik/dosen/penilaian"
              />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Modul Akademik */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Modul Akademik</h3>
          <Badge variant="outline">
            {accessibleModules.length} modul tersedia
          </Badge>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {accessibleModules.map((module) => (
            <ModuleCard
              key={module.href}
              title={module.title}
              description={module.description}
              icon={module.icon}
              href={module.href}
            />
          ))}
        </div>
      </div>

      {/* Recent Activity & Stats Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Aktivitas Terkini */}
        <Card>
          <CardHeader>
            <CardTitle>Aktivitas Terkini</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentActivities.map((activity, index) => (
                <div key={index} className="flex items-start gap-3 p-3 border rounded-lg hover:bg-muted/30 transition-colors">
                  <div className="p-2 rounded-full bg-primary/10">
                    <activity.icon className="h-4 w-4 text-primary" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">{activity.title}</p>
                    <p className="text-xs text-muted-foreground">{activity.description}</p>
                    <p className="text-xs text-muted-foreground mt-1">{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Statistik Program Studi (Hanya staff/admin) */}
        {['super_admin', 'staff_akademik'].includes(role) && (
          <Card>
            <CardHeader>
              <CardTitle>Statistik Program Studi</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {stats.programStats.map((program, index) => (
                  <div key={index} className="flex justify-between items-center p-3 border rounded-lg">
                    <div>
                      <div className="font-medium">{program.name}</div>
                      <div className="text-sm text-muted-foreground">{program.code}</div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold">{program.students} mahasiswa</div>
                      <div className={`text-xs ${program.growth > 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {program.growth > 0 ? '+' : ''}{program.growth}%
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Untuk Dosen: Kelas Terdekat */}
        {role === 'dosen' && stats.upcomingClasses && stats.upcomingClasses.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Kelas Mendatang</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {stats.upcomingClasses.slice(0, 3).map((classItem, index) => (
                  <div key={index} className="p-3 border rounded-lg">
                    <div className="font-medium">{classItem.course_name}</div>
                    <div className="text-sm text-muted-foreground">{classItem.class_code}</div>
                    <div className="flex justify-between text-xs mt-2">
                      <span>{classItem.schedule}</span>
                      <span className="font-medium">{classItem.room}</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Untuk Mahasiswa: Progress Akademik */}
        {role === 'mahasiswa' && (
          <Card>
            <CardHeader>
              <CardTitle>Progress Akademik</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-sm">IPK</span>
                  <span className="font-semibold">{stats.studentGPA}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">SKS Diambil</span>
                  <span className="font-semibold">{stats.studentCredits} / 144</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Status</span>
                  <Badge variant="default">Aktif</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

// Fungsi untuk mendapatkan modul yang bisa diakses
function getAccessibleModules(role: string) {
  const baseModules = [
    {
      title: "Program Studi",
      href: "/akademik/program-studi",
      icon: GraduationCap,
      description: "Kelola data program studi dan fakultas"
    },
    {
      title: "Kurikulum",
      href: "/akademik/kurikulum",
      icon: FileText,
      description: "Atur kurikulum dan struktur SKS"
    },
    {
      title: "Kalender Akademik",
      href: "/akademik/kalender-akademik",
      icon: Calendar,
      description: "Atur periode akademik, UTS, UAS"
    },
    {
      title: "Mata Kuliah",
      href: "/akademik/mata-kuliah",
      icon: BookA,
      description: "Daftar mata kuliah per kurikulum"
    },
    {
      title: "Kelas",
      href: "/akademik/kelas",
      icon: BookOpen,
      description: "Daftar kelas, jadwal, dan kuota"
    },
  ];

  if (role === 'mahasiswa') {
    return [
      ...baseModules.filter(m => ['Kelas', 'Mata Kuliah'].includes(m.title)),
      {
        title: "KRS Saya",
        href: "/akademik/mahasiswa/krs",
        icon: FileCheck,
        description: "Ambil atau batalkan kelas"
      },
      {
        title: "Nilai Saya",
        href: "/akademik/mahasiswa/nilai",
        icon: TrendingUp,
        description: "Lihat progress dan nilai"
      }
    ];
  }

  if (role === 'dosen') {
    return [
      ...baseModules.filter(m => ['Kelas', 'Mata Kuliah'].includes(m.title)),
      {
        title: "Kelas Saya",
        href: "/akademik/dosen/kelas",
        icon: BookOpen,
        description: "Lihat dan kelola kelas yang diajar"
      },
      {
        title: "Input Nilai",
        href: "/akademik/dosen/penilaian",
        icon: FileText,
        description: "Input nilai mahasiswa"
      }
    ];
  }

  // super_admin dan staff_akademik
  return [
    ...baseModules,
    {
      title: "Mahasiswa",
      href: "/akademik/mahasiswa",
      icon: Users,
      description: "Daftar, profil, dan dokumen mahasiswa"
    },
    {
      title: "Dosen",
      href: "/akademik/dosen",
      icon: User,
      description: "Daftar, profil, dan dokumen dosen"
    },
    {
      title: "Penugasan Dosen",
      href: "/akademik/kelas",
      icon: Settings,
      description: "Tugaskan dosen ke kelas"
    }
  ];
}

// Fungsi untuk mendapatkan aktivitas terkini
function getRecentActivities(role: string) {
  const baseActivities = [
    {
      title: "Sistem diperbarui",
      description: "Versi terbaru sistem akademik",
      time: "2 jam yang lalu",
      icon: Settings
    }
  ];

  if (role === 'staff_akademik') {
    return [
      ...baseActivities,
      {
        title: "Pendaftaran mahasiswa baru",
        description: "Periode pendaftaran dibuka",
        time: "1 hari yang lalu",
        icon: Users
      },
      {
        title: "Jadwal UTS diumumkan",
        description: "Periode UTS semester ganjil",
        time: "3 hari yang lalu",
        icon: Calendar
      },
            {
        title: "Perubahan kurikulum",
        description: "Update kurikulum 2024",
        time: "1 minggu yang lalu",
        icon: FileText
      }
    ];
  }

  if (role === 'dosen') {
    return [
      ...baseActivities,
      {
        title: "Kelas baru ditugaskan",
        description: "Anda mendapatkan kelas Pemrograman Web",
        time: "1 hari yang lalu",
        icon: BookOpen
      },
      {
        title: "Batas input nilai",
        description: "Input nilai UTS minggu depan",
        time: "3 hari yang lalu",
        icon: Clock
      },
      {
        title: "Rapat dosen",
        description: "Rapat rutin bulanan",
        time: "1 minggu yang lalu",
        icon: Users
      }
    ];
  }

  if (role === 'mahasiswa') {
    return [
      ...baseActivities,
      {
        title: "KRS disetujui",
        description: "KRS semester ini telah disetujui",
        time: "2 hari yang lalu",
        icon: FileCheck
      },
      {
        title: "Nilai UTS diumumkan",
        description: "Nilai UTS tersedia untuk dilihat",
        time: "5 hari yang lalu",
        icon: TrendingUp
      },
      {
        title: "Pembayaran semester",
        description: "Batas akhir pembayaran semester",
        time: "1 minggu yang lalu",
        icon: Clock
      }
    ];
  }

  return baseActivities;
}