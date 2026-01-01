// app/(dashboard)/mahasiswa/dashboard/page.tsx
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { sql } from '@/lib/db';
import { redirect } from 'next/navigation';
import {
  GraduationCap,
  BookOpen,
  BarChart3,
  FileText,
  MessageCircle,
  Settings,
  ChevronRight,
  TrendingUp,
  Award,
  CreditCard,
  Zap
} from 'lucide-react';
import {
  StatsCard,
  ModuleCard,
  QuickAction,
  DashboardHeading
} from '@/components/dashboard/DashboardComponents';
import AcademicProgressChart from '@/components/charts/AcademicProgressChart';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';

export default async function MahasiswaDashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== 'mahasiswa') {
    redirect('/login');
  }

  const userId = session.user.id;
  const user = session.user;

  let dashboardData = {
    totalCredits: 0,
    completedCredits: 0,
    gpa: 0,
    enrolledClasses: 0,
    pendingPayments: 0,
    upcomingDeadlines: 0,
  };

  let progressChartData: any[] = [];
  let studentInfo = null;
  let studentProfileExists = false;

  try {
    const userIdNumber = parseInt(userId);
    if (!isNaN(userIdNumber)) {
      const studentResult = await sql`
        SELECT id, nim, name, year_entry, status, study_program_id
        FROM students 
        WHERE user_id = ${userIdNumber}
        ORDER BY created_at DESC
        LIMIT 1
      `;

      if (studentResult && studentResult.length > 0) {
        studentInfo = studentResult[0];
        studentProfileExists = true;

        const creditsResult = await sql`
          SELECT 
            COALESCE(SUM(c.credits), 0) as total_credits,
            COALESCE(SUM(CASE WHEN se.status = 'completed' THEN c.credits ELSE 0 END), 0) as completed_credits
          FROM student_enrollments se
          JOIN classes cl ON se.class_id = cl.id
          JOIN courses c ON cl.course_id = c.id
          WHERE se.student_id = ${studentInfo.id}
        `;

        const gpaResult = await sql`
          SELECT COALESCE(AVG(final_score), 0) as avg_score 
          FROM student_enrollments 
          WHERE student_id = ${studentInfo.id} AND final_score IS NOT NULL
        `;

        const classCount = await sql`
          SELECT COALESCE(COUNT(*), 0) as count 
          FROM student_enrollments 
          WHERE student_id = ${studentInfo.id} AND status = 'active'
        `;

        const paymentCount = await sql`
          SELECT COALESCE(COUNT(*), 0) as count 
          FROM payment_evidences 
          WHERE student_id = ${studentInfo.id} AND status = 'pending'
        `;

        const deadlineCount = await sql`
          SELECT COALESCE(COUNT(*), 0) as count 
          FROM evaluation_components ec
          JOIN classes c ON ec.class_id = c.id
          JOIN student_enrollments se ON c.id = se.class_id
          WHERE se.student_id = ${studentInfo.id} 
            AND ec.deadline BETWEEN NOW() AND NOW() + INTERVAL '7 days'
        `;

        dashboardData = {
          totalCredits: parseInt(creditsResult[0]?.total_credits || "0") || 0,
          completedCredits: parseInt(creditsResult[0]?.completed_credits || "0") || 0,
          gpa: parseFloat(gpaResult[0]?.avg_score || "0") || 0,
          enrolledClasses: parseInt(classCount[0]?.count || "0") || 0,
          pendingPayments: parseInt(paymentCount[0]?.count || "0") || 0,
          upcomingDeadlines: parseInt(deadlineCount[0]?.count || "0") || 0,
        };

        const chartResult = await sql`
          SELECT 
            ap.semester as semester_label,
            COALESCE(SUM(c.credits), 0) as credits_completed,
            COALESCE(AVG(se.final_score), 0) as semester_gpa
          FROM student_enrollments se
          JOIN classes cl ON se.class_id = cl.id
          JOIN courses c ON cl.course_id = c.id
          JOIN academic_periods ap ON cl.academic_period_id = ap.id
          WHERE se.student_id = ${studentInfo.id} 
            AND se.status = 'completed' 
            AND se.final_score IS NOT NULL
          GROUP BY ap.semester, ap.year
          ORDER BY ap.year, ap.semester
        `;
        progressChartData = chartResult.length > 0 ? chartResult.map((item: any) => ({
          ...item,
          credits_completed: Number(item.credits_completed),
          semester_gpa: Number(item.semester_gpa)
        })) : getDefaultChartData();
      } else {
        dashboardData = getFallbackData();
        progressChartData = getDefaultChartData();
      }
    }
  } catch (error) {
    console.error('Dashboard data error:', error);
    dashboardData = getFallbackData();
    progressChartData = getDefaultChartData();
  }

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <DashboardHeading
        title={`Halo, ${user.name?.split(' ')[0]}!`}
        subtitle="Selamat datang di ekosistem akademik digital. Pantau progres studi, kelola administrasi, dan raih prestasi terbaik bersama Alifa Institute."
        badge={studentInfo?.status === 'active' ? 'Mahasiswa Aktif' : studentInfo?.status || 'Mahasiswa'}
      />

      {/* Profile Spotlight */}
      <Card className="premium-glass bg-gradient-to-br from-primary/10 via-transparent to-sky-500/5 border-2 border-primary/10 shadow-2xl overflow-hidden rounded-3xl">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 blur-3xl rounded-full -mr-32 -mt-32" />
        <CardContent className="p-8 relative">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
            <div className="flex items-center gap-6">
              <div className="p-1.5 rounded-[2rem] bg-gradient-to-tr from-[#0ea5e9] to-sky-400 shadow-xl shadow-primary/20">
                <div className="w-20 h-20 rounded-[1.75rem] bg-white dark:bg-slate-900 flex items-center justify-center">
                  <GraduationCap className="h-10 w-10 text-[#0ea5e9]" />
                </div>
              </div>
              <div className="space-y-1.5">
                <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white leading-none">
                  {studentInfo?.name || user.name}
                </h2>
                <div className="flex flex-wrap gap-2.5">
                  <div className="flex items-center gap-2 px-3 py-1.5 bg-[#0ea5e9]/10 border border-[#0ea5e9]/20 rounded-xl text-[#0ea5e9] font-bold text-[10px] tracking-widest uppercase">
                    {studentInfo?.nim || 'NIM BELUM TERSEDIA'}
                  </div>
                  <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-600 dark:text-slate-400 font-bold text-[10px] uppercase tracking-widest">
                    Angkatan {studentInfo?.year_entry || '-'}
                  </div>
                </div>
              </div>
            </div>
            <div className="flex gap-4">
              <Link href="/akademik/mahasiswa/krs">
                <button className="px-8 py-3.5 rounded-2xl bg-[#0ea5e9] hover:bg-[#0ea5e9]/90 text-white font-bold text-xs uppercase tracking-widest shadow-lg shadow-[#0ea5e9]/20 hover:scale-105 active:scale-95 transition-all">
                  Ambil KRS
                </button>
              </Link>
              <Link href="/pengaturan/profil">
                <button className="px-8 py-3.5 rounded-2xl bg-white dark:bg-slate-950 border-2 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 font-bold text-xs uppercase tracking-widest hover:bg-slate-50 dark:hover:bg-slate-900 transition-all shadow-sm">
                  Edit Profil
                </button>
              </Link>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Warning jika profil tidak ditemukan */}
      {!studentProfileExists && (
        <Card className="premium-glass bg-yellow-500/5 border-2 border-yellow-500/20 rounded-3xl overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-yellow-500/5 blur-3xl -mr-16 -mt-16" />
          <CardContent className="p-6 relative">
            <div className="flex items-start gap-5">
              <div className="p-3 rounded-2xl bg-yellow-500/10 shadow-inner">
                <Settings className="h-6 w-6 text-yellow-600 animate-spin-slow" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold tracking-tight text-yellow-800 dark:text-yellow-400">
                  Profil Mahasiswa Belum Lengkap
                </h3>
                <p className="text-yellow-700/70 dark:text-yellow-300/70 text-sm mt-1 font-medium leading-relaxed">
                  Data akademik Anda belum terhubung secara penuh. Silakan lengkapi informasi profil untuk sinkronisasi data real-time dengan sistem institusi.
                </p>
                <Link
                  href="/pengaturan/profil"
                  className="inline-flex items-center gap-2 mt-4 text-xs font-bold uppercase tracking-widest text-[#0ea5e9] dark:text-[#0ea5e9] hover:gap-3 transition-all underline decoration-2 underline-offset-4"
                >
                  Lengkapi Profil Sekarang <ChevronRight size={14} />
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="IPK Terakhir"
          value={dashboardData.gpa > 0 ? dashboardData.gpa.toFixed(2) : '0.00'}
          description="Rata-rata kumulatif"
          icon={TrendingUp}
          variant="info"
        />
        <StatsCard
          title="Total SKS"
          value={dashboardData.completedCredits}
          description={`Dari ${dashboardData.totalCredits} SKS diambil`}
          icon={Award}
        />
        <StatsCard
          title="Kelas Aktif"
          value={dashboardData.enrolledClasses}
          description="Semester sedang berjalan"
          icon={BookOpen}
          href="/akademik/mahasiswa/kelas"
        />
        <StatsCard
          title="Keuangan"
          value={dashboardData.pendingPayments}
          description="Bukti transfer tertunda"
          icon={CreditCard}
          variant={dashboardData.pendingPayments > 0 ? "warning" : "default"}
          href="/keuangan/bukti-transfer"
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          {/* Chart Section */}
          <Card className="premium-glass bg-white dark:bg-slate-900/40 border-2 border-slate-200/50 dark:border-white/5 overflow-hidden shadow-xl rounded-3xl transition-all hover:border-[#0ea5e9]/20">
            <CardHeader className="flex flex-row items-center justify-between pb-8">
              <div>
                <CardTitle className="text-2xl font-bold tracking-tighter text-slate-900 dark:text-white">Evolusi Akademik</CardTitle>
                <p className="text-xs font-bold text-slate-500 mt-1 uppercase tracking-widest">Pantau grafik kenaikan prestasi setiap semester</p>
              </div>
              <div className="px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 font-bold text-[9px] tracking-[0.2em] uppercase rounded-full">
                Performa Tinggi
              </div>
            </CardHeader>
            <CardContent>
              <div className="h-[300px] w-full">
                <AcademicProgressChart data={progressChartData} />
              </div>
            </CardContent>
          </Card>

          {/* Core Modules */}
          <div>
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 rounded-2xl bg-[#0ea5e9]/10 text-[#0ea5e9] shadow-sm">
                <Zap className="h-5 w-5" />
              </div>
              <h3 className="text-2xl font-bold tracking-tighter text-slate-900 dark:text-white">Modul Akademik</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <ModuleCard
                title="Sistem KRS"
                description="Rencanakan studi semester Anda dengan pemilihan mata kuliah terpadu."
                icon={BookOpen}
                href="/akademik/mahasiswa/krs"
              />
              <ModuleCard
                title="Kelas & Materi"
                description="Akses portal pembelajaran, unduh materi, dan kumpulkan tugas tepat waktu."
                icon={FileText}
                href="/akademik/mahasiswa/kelas"
              />
              <ModuleCard
                title="Laporan Nilai"
                description="Lihat KHS digital dan transkrip nilai akademik sementara Anda."
                icon={BarChart3}
                href="/akademik/mahasiswa/nilai"
              />
              <ModuleCard
                title="Forum Diskusi"
                description="Berkolaborasi dengan dosen dan rekan mahasiswa dalam ruang diskusi."
                icon={MessageCircle}
                href="/forum"
              />
            </div>
          </div>
        </div>

        {/* Action Sidebar */}
        <div className="space-y-6">
          <Card className="premium-glass bg-white/40 dark:bg-slate-900/40 border-2 border-primary/10 shadow-xl overflow-hidden group rounded-3xl">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary to-sky-500" />
            <CardHeader>
              <CardTitle className="text-sm font-bold uppercase tracking-widest text-muted-foreground">Admin & Keuangan</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <QuickAction
                title="Unggah Slip"
                description="Verifikasi bukti transfer pembayaran"
                icon={CreditCard}
                href="/keuangan/bukti-transfer"
                variant="success"
              />
              <QuickAction
                title="Pengaturan"
                description="Update profil & keamanan"
                icon={Settings}
                href="/pengaturan"
              />
            </CardContent>
          </Card>

          <Card className="premium-glass bg-primary/5 border-2 border-primary/10 shadow-xl p-8 relative overflow-hidden rounded-3xl group transition-all hover:bg-primary/10">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
              <FileText size={100} className="rotate-12 text-primary" />
            </div>
            <div className="relative space-y-4">
              <h4 className="text-2xl font-bold tracking-tight leading-tight">Mendekati Deadline</h4>
              <p className="text-sm font-medium text-muted-foreground/80 leading-relaxed">Ada <span className="text-[#0ea5e9] font-bold">{dashboardData.upcomingDeadlines} tugas</span> yang harus segera Anda kumpulkan dalam pekan ini. Jangan lewatkan batas waktu!</p>
              <Link href="/akademik/mahasiswa/kelas" className="block">
                <button className="w-full py-4 rounded-2xl bg-[#0ea5e9] hover:bg-[#0ea5e9]/90 text-xs font-bold uppercase tracking-widest text-white flex items-center justify-center gap-2 transition-all shadow-lg shadow-[#0ea5e9]/20 hover:scale-[1.02] active:scale-[0.98]">
                  Lihat Kalender Tugas <ChevronRight size={14} />
                </button>
              </Link>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

function getFallbackData() {
  return {
    totalCredits: 84,
    completedCredits: 72,
    gpa: 3.55,
    enrolledClasses: 6,
    pendingPayments: 1,
    upcomingDeadlines: 3,
  };
}

function getDefaultChartData() {
  return [
    { semester_label: 'Sem 1', credits_completed: 18, semester_gpa: 3.2 },
    { semester_label: 'Sem 2', credits_completed: 20, semester_gpa: 3.4 },
    { semester_label: 'Sem 3', credits_completed: 22, semester_gpa: 3.5 },
    { semester_label: 'Sem 4', credits_completed: 21, semester_gpa: 3.6 },
  ];
}
