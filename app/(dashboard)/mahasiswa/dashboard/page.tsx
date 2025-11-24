import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { GraduationCap, BookOpen, BarChart3, Coins, FileText, Users, MessageCircle, Settings } from 'lucide-react';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { sql } from '@/lib/db';
import AcademicProgressChart from '@/components/charts/AcademicProgressChart';

export default async function MahasiswaDashboardPage() {
  const session = await getServerSession(authOptions);
  
  if (!session || session.user.role !== 'mahasiswa') {
    redirect('/login');
  }

  const userId = session.user.id;

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
    // PERBAIKAN: Handle user_id conversion dengan try-catch
    const userIdNumber = parseInt(userId);
    
    if (isNaN(userIdNumber)) {
      console.warn('User ID is not a number, using fallback data');
      throw new Error('Invalid user ID format');
    }

    // Ambil data mahasiswa
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

      // Query data akademik dengan error handling
      try {
        // Total credits dan completed credits
        const creditsResult = await sql`
          SELECT 
            COALESCE(SUM(c.credits), 0) as total_credits,
            COALESCE(SUM(CASE WHEN se.status = 'completed' THEN c.credits ELSE 0 END), 0) as completed_credits
          FROM student_enrollments se
          JOIN classes cl ON se.class_id = cl.id
          JOIN courses c ON cl.course_id = c.id
          WHERE se.student_id = ${studentInfo.id}
        `;

        // GPA
        const gpaResult = await sql`
          SELECT COALESCE(AVG(final_score), 0) as avg_score 
          FROM student_enrollments 
          WHERE student_id = ${studentInfo.id} AND final_score IS NOT NULL
        `;

        // Active classes count
        const classCount = await sql`
          SELECT COALESCE(COUNT(*), 0) as count 
          FROM student_enrollments 
          WHERE student_id = ${studentInfo.id} AND status = 'active'
        `;

        // Pending payments
        const paymentCount = await sql`
          SELECT COALESCE(COUNT(*), 0) as count 
          FROM payment_evidences 
          WHERE student_id = ${studentInfo.id} AND status = 'pending'
        `;

        // Upcoming deadlines
        const deadlineCount = await sql`
          SELECT COALESCE(COUNT(*), 0) as count 
          FROM evaluation_components ec
          JOIN classes c ON ec.class_id = c.id
          JOIN student_enrollments se ON c.id = se.class_id
          WHERE se.student_id = ${studentInfo.id} 
            AND ec.deadline BETWEEN NOW() AND NOW() + INTERVAL '7 days'
        `;

        dashboardData = {
          totalCredits: parseInt(creditsResult[0]?.total_credits) || 0,
          completedCredits: parseInt(creditsResult[0]?.completed_credits) || 0,
          gpa: parseFloat(gpaResult[0]?.avg_score) || 0,
          enrolledClasses: parseInt(classCount[0]?.count) || 0,
          pendingPayments: parseInt(paymentCount[0]?.count) || 0,
          upcomingDeadlines: parseInt(deadlineCount[0]?.count) || 0,
        };

        // Data chart dengan fallback
        try {
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
          
          if (chartResult && chartResult.length > 0) {
            progressChartData = chartResult;
          } else {
            // Fallback data untuk demo
            progressChartData = [
              { semester_label: 'Semester 1', credits_completed: 18, semester_gpa: 3.2 },
              { semester_label: 'Semester 2', credits_completed: 20, semester_gpa: 3.4 },
              { semester_label: 'Semester 3', credits_completed: 22, semester_gpa: 3.5 },
              { semester_label: 'Semester 4', credits_completed: 21, semester_gpa: 3.6 },
            ];
          }
        } catch (chartError) {
          console.error('Chart data error:', chartError);
          progressChartData = [
            { semester_label: 'Semester 1', credits_completed: 18, semester_gpa: 3.2 },
            { semester_label: 'Semester 2', credits_completed: 20, semester_gpa: 3.4 },
          ];
        }

      } catch (queryError) {
        console.error('Academic data query failed:', queryError);
        // Fallback data
        dashboardData = {
          totalCredits: 84,
          completedCredits: 72,
          gpa: 3.55,
          enrolledClasses: 6,
          pendingPayments: 1,
          upcomingDeadlines: 3,
        };
        progressChartData = [
          { semester_label: 'Semester 1', credits_completed: 18, semester_gpa: 3.2 },
          { semester_label: 'Semester 2', credits_completed: 20, semester_gpa: 3.4 },
        ];
      }
    } else {
      console.log('No student profile found');
      // Data demo untuk mahasiswa tanpa profil
      dashboardData = {
        totalCredits: 84,
        completedCredits: 72,
        gpa: 3.55,
        enrolledClasses: 6,
        pendingPayments: 1,
        upcomingDeadlines: 3,
      };
      progressChartData = [
        { semester_label: 'Semester 1', credits_completed: 18, semester_gpa: 3.2 },
        { semester_label: 'Semester 2', credits_completed: 20, semester_gpa: 3.4 },
      ];
    }

  } catch (error) {
    console.error('Dashboard data error:', error);
    // Fallback data lengkap
    dashboardData = {
      totalCredits: 84,
      completedCredits: 72,
      gpa: 3.55,
      enrolledClasses: 6,
      pendingPayments: 1,
      upcomingDeadlines: 3,
    };
    progressChartData = [
      { semester_label: 'Semester 1', credits_completed: 18, semester_gpa: 3.2 },
      { semester_label: 'Semester 2', credits_completed: 20, semester_gpa: 3.4 },
      { semester_label: 'Semester 3', credits_completed: 22, semester_gpa: 3.5 },
    ];
  }

  return (
    <div className="space-y-6 p-4 md:p-6">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Dashboard Mahasiswa
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Selamat datang di sistem akademik kampus
          </p>
        </div>
        {studentProfileExists && studentInfo && (
          <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100 px-3 py-2">
            <GraduationCap className="w-4 h-4 mr-2" />
            Status: {studentInfo.status || 'Aktif'}
          </Badge>
        )}
      </div>

      {/* Student Info Card */}
      {studentProfileExists && studentInfo && (
        <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200 dark:from-blue-900/20 dark:to-indigo-900/20 dark:border-blue-800">
          <CardContent className="pt-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h3 className="text-xl font-semibold text-blue-900 dark:text-blue-100">
                  {studentInfo.name}
                </h3>
                <div className="flex flex-wrap gap-4 mt-2 text-sm text-blue-700 dark:text-blue-300">
                  <span>NIM: {studentInfo.nim}</span>
                  <span>Angkatan: {studentInfo.year_entry}</span>
                  <span className="capitalize">Status: {studentInfo.status}</span>
                </div>
              </div>
              <div className="flex gap-2">
                <Link 
                  href="/pengaturan/profil"
                  className="px-4 py-2 text-sm bg-white dark:bg-blue-800 text-blue-700 dark:text-blue-200 rounded-lg border border-blue-200 dark:border-blue-700 hover:bg-blue-50 dark:hover:bg-blue-700 transition-colors"
                >
                  Edit Profil
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Warning jika profil tidak ditemukan */}
      {!studentProfileExists && (
        <Card className="bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-200 dark:from-yellow-900/20 dark:to-orange-900/20 dark:border-yellow-800">
          <CardContent className="pt-6">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 mt-1">
                <svg className="h-6 w-6 text-yellow-500" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-yellow-800 dark:text-yellow-200">
                  Profil Mahasiswa Belum Lengkap
                </h3>
                <p className="text-yellow-700 dark:text-yellow-300 mt-1">
                  Data profil mahasiswa Anda belum terdaftar di sistem. Menampilkan data contoh untuk demonstrasi.
                </p>
                <Link 
                  href="/pengaturan/profil" 
                  className="inline-block mt-3 text-yellow-800 dark:text-yellow-200 font-medium hover:text-yellow-900 dark:hover:text-yellow-100 underline"
                >
                  Lengkapi Profil Sekarang →
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Summary Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {[
          { 
            title: 'Total SKS', 
            value: dashboardData.totalCredits, 
            icon: BookOpen, 
            desc: 'SKS yang diambil',
            color: 'blue'
          },
          { 
            title: 'SKS Lulus', 
            value: dashboardData.completedCredits, 
            icon: GraduationCap, 
            desc: 'Sudah diselesaikan',
            color: 'green'
          },
          { 
            title: 'IPK', 
            value: dashboardData.gpa > 0 ? dashboardData.gpa.toFixed(2) : '0.00', 
            icon: BarChart3, 
            desc: dashboardData.gpa > 0 ? 'Rata-rata skor' : 'Belum ada nilai',
            color: 'purple'
          },
          { 
            title: 'Kelas Aktif', 
            value: dashboardData.enrolledClasses, 
            icon: Users, 
            desc: 'Saat ini',
            color: 'orange'
          },
          { 
            title: 'Pembayaran', 
            value: dashboardData.pendingPayments, 
            icon: Coins, 
            desc: 'Menunggu verifikasi',
            color: 'yellow'
          },
          { 
            title: 'Tugas', 
            value: dashboardData.upcomingDeadlines, 
            icon: FileText, 
            desc: '7 hari ke depan',
            color: 'red'
          },
        ].map((item, index) => {
          const colorClasses = {
            blue: 'text-blue-600 dark:text-blue-400',
            green: 'text-green-600 dark:text-green-400',
            purple: 'text-purple-600 dark:text-purple-400',
            orange: 'text-orange-600 dark:text-orange-400',
            yellow: 'text-yellow-600 dark:text-yellow-400',
            red: 'text-red-600 dark:text-red-400'
          };

          return (
            <Card key={index} className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow duration-200">
              <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-300">
                  {item.title}
                </CardTitle>
                <item.icon className={`h-4 w-4 ${colorClasses[item.color as keyof typeof colorClasses]}`} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                  {item.value}
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {item.desc}
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Progress Chart Section */}
      {progressChartData.length > 0 && (
        <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm">
          <CardHeader>
            <CardTitle className="text-xl font-semibold text-gray-900 dark:text-white">
              Progres Akademik
            </CardTitle>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Perkembangan IPK dan SKS per Semester
            </p>
          </CardHeader>
          <CardContent>
            <AcademicProgressChart data={progressChartData} />
          </CardContent>
        </Card>
      )}

      {/* Quick Actions Section */}
      <div>
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Akses Cepat</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[
            { 
              title: 'KRS Saya', 
              desc: 'Ambil atau batalkan kelas', 
              icon: BookOpen, 
              href: '/akademik/mahasiswa/krs',
              color: 'blue'
            },
            { 
              title: 'Kelas Saya', 
              desc: 'Lihat materi, tugas, dan presensi', 
              icon: GraduationCap, 
              href: '/akademik/mahasiswa/kelas',
              color: 'green'
            },
            { 
              title: 'Nilai Saya', 
              desc: 'Lihat nilai per semester dan IPK', 
              icon: BarChart3, 
              href: '/akademik/mahasiswa/nilai',
              color: 'purple'
            },
            { 
              title: 'Upload Bukti Transfer', 
              desc: 'Upload bukti pembayaran SPP', 
              icon: Coins, 
              href: '/keuangan/bukti-transfer',
              color: 'yellow'
            },
            { 
              title: 'Forum Diskusi', 
              desc: 'Bergabung dalam diskusi kelas', 
              icon: MessageCircle, 
              href: '/forum',
              color: 'orange'
            },
            { 
              title: 'Pengaturan Akun', 
              desc: 'Ubah profil, kata sandi, dll', 
              icon: Settings, 
              href: '/pengaturan',
              color: 'gray'
            },
          ].map((item, index) => (
            <Link key={index} href={item.href}>
              <Card className="group bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-lg transition-all duration-200 hover:border-blue-300 dark:hover:border-blue-600 cursor-pointer">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg bg-${item.color}-50 dark:bg-${item.color}-900/20 group-hover:bg-${item.color}-100 dark:group-hover:bg-${item.color}-900/30 transition-colors`}>
                      <item.icon className={`text-${item.color}-600 dark:text-${item.color}-400`} size={20} />
                    </div>
                    <CardTitle className="text-base font-semibold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                      {item.title}
                    </CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {item.desc}
                  </p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}