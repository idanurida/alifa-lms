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
import { StatsCard, ModuleCard, QuickAction, DashboardHeading } from '@/components/dashboard/DashboardComponents';
import AcademicProgressChart from '@/components/charts/AcademicProgressChart';
import { prisma } from '@/lib/prisma';
import { sql } from '@/lib/db';

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

  // Fetch real data from database
  let totalStudents = 0;
  let totalLecturers = 0;
  let totalClasses = 0;
  let totalCourses = 0;
  let totalActivePeriods = 0;
  let totalCurricula = 0;
  let pendingKRSCount = 0;
  let urgentTasks = 0;
  // Fetch active period for Gantt Chart
  const activePeriod = await (async () => {
    try {
      return await prisma.academicPeriod.findFirst({
        where: { is_active: true },
        orderBy: { created_at: 'desc' }
      });
    } catch (e) {
      console.error('Error fetching active period:', e);
      return null;
    }
  })();
  let programStatsRaw: any[] = [];
  let recentStudents: any[] = [];
  let statusStatsRaw: any[] = [];
  let cohortStatsRaw: any[] = [];

  try {
    const [
      sCount,
      lCount,
      clCount,
      coCount,
      apCount,
      cuCount,
      pkrsRes,
      uTasks,
      pStats,
      rStudents,
      stStats,
      cStats
    ] = await Promise.all([
      (async () => {
        try {
          return await prisma.student.count({
            where: {
              status: {
                notIn: ['graduated', 'graduate', 'lulus', 'dropout', 'drop_out', 'do', 'leave', 'cuti']
              }
            }
          });
        } catch (e) { console.error('Error student count:', e); return 0; }
      })(),
      (async () => { try { return await prisma.lecturer.count(); } catch (e) { return 0; } })(),
      (async () => { try { return await prisma.class.count(); } catch (e) { return 0; } })(),
      (async () => { try { return await prisma.course.count(); } catch (e) { return 0; } })(),
      (async () => { try { return await prisma.academicPeriod.count({ where: { is_active: true } }); } catch (e) { return 0; } })(),
      (async () => { try { return await prisma.curriculum.count(); } catch (e) { return 0; } })(),
      (async () => {
        try {
          const res = await sql`SELECT COUNT(id) as count FROM public.krs_submissions WHERE status = 'pending'`;
          return res && res[0] ? Number(res[0].count) : 0;
        } catch (e) {
          console.error('⚠️ [KRS_COUNT_ERROR]:', e);
          return 0;
        }
      })(),
      (async () => { try { return await prisma.class.count({ where: { lecturer_id: null } }); } catch (e) { return 0; } })(),
      sql`
        SELECT 
          sp.id, sp.name, sp.code, 
          COUNT(s.id) as student_count
        FROM study_programs sp
        LEFT JOIN students s ON s.study_program_num_id = sp.id
        GROUP BY sp.id, sp.name, sp.code
      `,
      (async () => {
        try {
          return await prisma.student.findMany({
            orderBy: { created_at: 'desc' },
            take: 5
          });
        } catch (e) { return []; }
      })(),
      // Statistik Status Mahasiswa (Aggregation)
      (async () => {
        try {
          return await prisma.student.groupBy({
            by: ['status'],
            _count: { id: true }
          });
        } catch (e) { return []; }
      })(),
      // Statistik Angkatan (Aggregation)
      (async () => {
        try {
          return await prisma.student.groupBy({
            by: ['year_entry', 'status'],
            _count: { id: true },
            orderBy: { year_entry: 'desc' }
          });
        } catch (e) { return []; }
      })()
    ]);

    totalStudents = sCount;
    totalLecturers = lCount;
    totalClasses = clCount;
    totalCourses = coCount;
    totalActivePeriods = apCount;
    totalCurricula = cuCount;
    pendingKRSCount = Number(pkrsRes || 0);
    urgentTasks = uTasks;
    programStatsRaw = pStats;
    recentStudents = rStudents;
    statusStatsRaw = stStats;
    cohortStatsRaw = cStats;
  } catch (error) {
    console.error('❌ DASHBOARD STATS FETCH ERROR:', error);
    // Keep defaults (0) if fetch fails to prevent crash
  }

  // Data statis untuk contoh (beberapa tetap hardcoded jika belum ada datanya)
  const stats = {
    totalStudents,
    totalLecturers,
    totalClasses,
    totalCourses,
    totalActivePeriods,
    totalCurricula,
    pendingKRS: pendingKRSCount,
    urgentTasks,
    studentGrowth: 0, // Belum ada data historis
    lecturerClasses: 0, // Perlu query spesifik per dosen jika role === 'dosen'
    studentCredits: 0, // Perlu query spesifik per mahasiswa jika role === 'mahasiswa'
    studentGPA: 0, // Belum dihitung
    programStats: programStatsRaw.map(p => ({
      name: p.name,
      code: p.code,
      students: Number(p.student_count || 0),
      growth: 0
    })),
    statusStats: statusStatsRaw,
    // Add real total for percentage calculations if needed, or just use totalStudents if that's what we want as base
    upcomingClasses: [] as { course_name: string, class_code: string, schedule: string, room: string }[]
  };

  // Hitung total semua record untuk persentase di card status
  const grandTotalStudents = statusStatsRaw.reduce((sum, s) => sum + s._count.id, 0);

  // Process Cohort Data
  const cohortData: Record<string, Record<string, number>> = {};
  cohortStatsRaw.forEach((item: any) => {
    const year = item.year_entry || 'Unknown';
    if (!cohortData[year]) {
      cohortData[year] = { total: 0, active: 0, inactive: 0, graduated: 0, dropout: 0, other: 0 };
    }
    const count = item._count.id;
    cohortData[year].total += count;

    switch (item.status.toLowerCase()) {
      case 'active': cohortData[year].active += count; break;
      case 'inactive':
      case 'leave':
        cohortData[year].inactive += count; break;
      case 'graduated': cohortData[year].graduated += count; break;
      case 'dropout':
      case 'dropped_out':
      case 'do':
        cohortData[year].dropout += count; break;
      default: cohortData[year].other += count; break;
    }
  });

  // Fetch role-specific stats
  if (role === 'dosen') {
    try {
      const lecturer = await prisma.lecturer.findUnique({
        where: { user_id: Number(session.user.id) }
      });
      if (lecturer) {
        stats.lecturerClasses = await (async () => {
          try { return await prisma.class.count({ where: { lecturer_id: lecturer.id } }); }
          catch (e) { return 0; }
        })();
      }
    } catch (error) {
      console.error('Error fetching lecturer stats:', error);
    }
  }

  if (role === 'mahasiswa') {
    try {
      const student = await prisma.student.findUnique({
        where: { user_id: Number(session.user.id) }
      });
      if (student) {
        // Use type casting since Prisma Client might be stale in some environments
        stats.studentCredits = (student as any).current_semester || 1;
        stats.studentCredits = (student as any).total_credits || 0;
      }
    } catch (error) {
      console.error('Error fetching student stats:', error);
    }
  }

  const accessibleModules = getAccessibleModules(role);
  const recentActivities = getRecentActivities(role, recentStudents);

  return (
    <div className="space-y-6">
      <DashboardHeading
        title="Pusat Akademik"
        subtitle={`Selamat datang kembali, ${session.user.name}! Kelola kurikulum, mahasiswa, dan aktivitas akademik lainnya secara efisien.`}
        badge={role.replace('_', ' ')}
      />

      {/* Notifikasi Peran untuk Staf Akademik */}
      {['super_admin', 'staff_akademik'].includes(role) && (
        <div className="p-6 rounded-3xl bg-slate-950 dark:bg-white border-2 border-slate-900 dark:border-white relative overflow-hidden group shadow-2xl">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
            <GraduationCap size={80} className="text-white dark:text-slate-900" />
          </div>
          <div className="flex items-center gap-5 relative">
            <div className="p-3.5 rounded-2xl bg-white/10 dark:bg-slate-900/10 shadow-inner">
              <AlertCircle className="h-6 w-6 text-white dark:text-slate-900" />
            </div>
            <div>
              <p className="font-bold text-white dark:text-slate-950 uppercase tracking-[0.2em] text-sm">
                Akses Staf Akademik Aktif
              </p>
              <p className="text-slate-400 dark:text-slate-500 text-xs font-bold mt-1 uppercase tracking-widest">
                Anda memiliki kendali penuh atas manajemen pendaftaran dan kurikulum institusi.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Mahasiswa - Hanya untuk staff/admin */}
        {['super_admin', 'staff_akademik'].includes(role) && (
          <StatsCard
            title="Mahasiswa Aktif"
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

      {/* Gantt Chart Jadwal Akademik (Hanya untuk staff/admin) */}
      {['super_admin', 'staff_akademik'].includes(role) && (
        <Card className="premium-glass bg-white dark:bg-slate-900/40 border-2 border-slate-200/50 dark:border-white/5 rounded-3xl shadow-xl overflow-hidden">
          <CardHeader className="border-b border-slate-100 dark:border-white/5 pb-6">
            <CardTitle className="flex items-center gap-3 text-xl font-bold tracking-tighter text-slate-900 dark:text-white">
              <div className="p-2 rounded-xl bg-[#0ea5e9]/10 text-[#0ea5e9]">
                <Calendar className="h-5 w-5" />
              </div>
              Timeline Kalender Akademik
            </CardTitle>
          </CardHeader>
          <CardContent>
            <AcademicGanttChart activePeriod={activePeriod} />
          </CardContent>
        </Card>
      )}

      {/* Advanced Statistics Section (Staff Only) */}
      {['super_admin', 'staff_akademik'].includes(role) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Statistik Status Mahasiswa */}
          <Card className="premium-glass bg-white dark:bg-slate-900/40 border-2 border-slate-200/50 dark:border-white/5 rounded-3xl shadow-xl overflow-hidden">
            <CardHeader>
              <CardTitle className="text-xl font-bold tracking-tighter text-slate-900 dark:text-white">Statistik Mahasiswa</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {stats.statusStats.map((status: any, index: number) => {
                  const getStatusColor = (s: string) => {
                    const status = s.toLowerCase();
                    if (status === 'active') return 'bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-400';
                    if (['inactive', 'leave', 'cuti'].includes(status)) return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400';
                    if (status === 'graduated') return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400';
                    if (['dropout', 'dropped_out', 'do'].includes(status)) return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400';
                    return 'bg-slate-100 dark:bg-slate-800 text-gray-700 dark:bg-gray-800 dark:text-slate-400 dark:text-slate-500';
                  };
                  const getStatusLabel = (s: string) => {
                    const status = s.toLowerCase();
                    if (status === 'active') return 'Aktif';
                    if (['inactive', 'leave', 'cuti'].includes(status)) return 'Non-Aktif / Cuti';
                    if (status === 'graduated') return 'Lulus';
                    if (['dropout', 'dropped_out', 'do'].includes(status)) return 'Drop Out';
                    return s;
                  };

                  const percentage = grandTotalStudents > 0 ? Math.round((status._count.id / grandTotalStudents) * 100) : 0;

                  return (
                    <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <Badge className={getStatusColor(status.status)} variant="outline">
                          {getStatusLabel(status.status)}
                        </Badge>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">{status._count.id}</p>
                        <p className="text-xs text-muted-foreground">{percentage}%</p>
                      </div>
                    </div>
                  );
                })}
                {stats.statusStats.length === 0 && (
                  <p className="text-center text-muted-foreground py-4">Belum ada data status.</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Statistik Angkatan */}
          <Card className="premium-glass bg-white dark:bg-slate-900/40 border-2 border-slate-200/50 dark:border-white/5 rounded-3xl shadow-xl overflow-hidden">
            <CardHeader>
              <CardTitle className="text-xl font-bold tracking-tighter text-slate-900 dark:text-white">Pertumbuhan Angkatan</CardTitle>
            </CardHeader>
            <CardContent>
              {Object.keys(cohortData).length === 0 ? (
                <p className="text-center text-muted-foreground py-8">Belum ada data angkatan.</p>
              ) : (
                <div className="rounded-md border overflow-x-auto">
                  <table className="w-full text-sm text-left">
                    <thead className="bg-muted/50 text-muted-foreground">
                      <tr className="border-b">
                        <th className="p-3 font-medium">Angkatan</th>
                        <th className="p-3 font-medium text-center">Total</th>
                        <th className="p-3 font-medium text-center text-sky-600">Aktif</th>
                        <th className="p-3 font-medium text-center text-blue-600">Lulus</th>
                        <th className="p-3 font-medium text-center text-red-600">DO</th>
                      </tr>
                    </thead>
                    <tbody>
                      {Object.entries(cohortData)
                        .sort((a, b) => Number(b[0]) - Number(a[0])) // Sort desc by year
                        .slice(0, 5) // Show top 5 years only to save space
                        .map(([year, data]) => (
                          <tr key={year} className="border-b last:border-0 hover:bg-muted/30">
                            <td className="p-3 font-semibold">{year}</td>
                            <td className="p-3 text-center">{data.total}</td>
                            <td className="p-3 text-center font-medium">{data.active}</td>
                            <td className="p-3 text-center">{data.graduated}</td>
                            <td className="p-3 text-center">{data.dropout}</td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
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
        <div className="flex items-center justify-between mb-8">
          <h3 className="text-2xl font-bold tracking-tighter text-slate-900 dark:text-white">Modul Akademik</h3>
          <div className="px-4 py-1.5 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-full text-slate-600 dark:text-slate-300 font-bold text-[10px] tracking-widest uppercase">
            {accessibleModules.length} Modul Tersedia
          </div>
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
          <>
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
                        <div className={`text-xs ${program.growth > 0 ? 'text-sky-600' : 'text-red-600'}`}>
                          {program.growth > 0 ? '+' : ''}{program.growth}%
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Statistik Status Mahasiswa (Removed - Moved to top) */}
          </>
        )}

        {/* Statistik Angkatan (Removed - Moved to top) */}

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


// Komponen Gantt Chart Sederhana untuk Kalender Akademik
function AcademicGanttChart({ activePeriod }: { activePeriod: any }) {
  // Gunakan data dari periode aktif jika ada, jika tidak gunakan default/simulasi
  const utsWeek = activePeriod?.uts_week || 8;
  const uasWeek = activePeriod?.uas_week || 16;

  const events = [
    { name: 'Kuliah Efektif', start: 0, duration: 16, color: 'bg-blue-500' },
    { name: `UTS (Minggu ${utsWeek})`, start: utsWeek - 1, duration: 1, color: 'bg-yellow-500' },
    { name: `UAS (Minggu ${uasWeek})`, start: uasWeek - 1, duration: 1, color: 'bg-red-500' },
    { name: 'Input Nilai', start: uasWeek, duration: 2, color: 'bg-sky-500' },
  ];

  const weeks = Array.from({ length: 18 }, (_, i) => i + 1);

  return (
    <div className="mt-4">
      <div className="relative overflow-x-auto pb-4">
        <div className="min-w-[800px]">
          {/* Header Minggu */}
          <div className="flex border-b pb-2">
            <div className="w-48 flex-shrink-0 font-medium text-sm text-muted-foreground">Kegiatan / Minggu</div>
            <div className="flex-1 flex justify-between">
              {weeks.map(w => (
                <div key={w} className="w-full text-center text-[10px] text-muted-foreground border-l">
                  {w}
                </div>
              ))}
            </div>
          </div>

          {/* Baris Kegiatan */}
          <div className="space-y-3 mt-4">
            {events.map((event, i) => (
              <div key={i} className="flex items-center">
                <div className="w-48 flex-shrink-0 text-sm font-medium pr-4">{event.name}</div>
                <div className="flex-1 flex h-6 bg-muted/30 rounded-full relative">
                  <div
                    className={`absolute h-full ${event.color} rounded-full opacity-80 flex items-center justify-center text-[10px] text-white font-bold`}
                    style={{
                      left: `${(event.start / 18) * 100}%`,
                      width: `${(event.duration / 18) * 100}%`
                    }}
                  >
                    {event.duration > 1 ? `${event.duration} mgg` : ''}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Penanda Hari Ini (Simulasi) */}
          <div className="mt-6 flex items-center gap-4 text-xs">
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 bg-blue-500 rounded-sm"></div>
              <span>Kuliah</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 bg-yellow-500 rounded-sm"></div>
              <span>Ujian</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 bg-sky-500 rounded-sm"></div>
              <span>Penilaian</span>
            </div>
            <p className="ml-auto italic text-muted-foreground">
              Periode: {activePeriod?.name || 'Tidak ada periode aktif'}
              {activePeriod && ` (${new Date(activePeriod.start_date).toLocaleDateString('id-ID')} - ${new Date(activePeriod.end_date).toLocaleDateString('id-ID')})`}
            </p>
          </div>
        </div>
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
  ];
}

// Fungsi untuk mendapatkan aktivitas terkini
function getRecentActivities(role: string, recentStudents: any[] = []) {
  const baseActivities = [
    ...recentStudents.map(s => ({
      title: "Mahasiswa Baru",
      description: `${s.name} (${s.nim}) telah terdaftar`,
      time: "Baru saja",
      icon: Users
    })),
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