// app/(dashboard)/akademik/mahasiswa/nilai/page.tsx
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Award, TrendingUp, Printer } from 'lucide-react';
import Link from 'next/link';

export default async function NilaiPage() {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== 'mahasiswa') {
    return <div>Unauthorized</div>;
  }

  console.log('🔍 [NilaiPage] Session User:', JSON.stringify(session.user, null, 2));

  const userId = parseInt(session.user.id);
  console.log(`🔍 [NilaiPage] Searching for student with user_id: ${userId}`);

  const student = await prisma.student.findFirst({
    where: { user_id: userId }
  });

  console.log('🎓 [NilaiPage] Student found:', student);

  if (!student) {
    return (
      <div className="p-8 text-center border-2 border-dashed rounded-xl">
        Profil mahasiswa tidak ditemukan. Silakan hubungi admin. (Debug: User ID {session.user.id})
      </div>
    );
  }

  // Ambil semua data nilai (enrollments)
  const enrollments = await prisma.studentEnrollment.findMany({
    where: { student_id: student.id },
    include: {
      class: {
        include: {
          course: true,
          academic_period: true
        }
      }
    },
    orderBy: [
      { class: { academic_period: { year: 'desc' } } },
      { class: { academic_period: { semester: 'desc' } } }
    ]
  });

  // Hitung IPK Kumulatif
  let totalSKSAll = 0;
  let totalBobotAll = 0;
  enrollments.forEach(enr => {
    if (enr.final_score) {
      const sks = enr.class.course.credits;
      totalSKSAll += sks;
      totalBobotAll += Number(enr.final_score) * sks;
    }
  });
  const ipk = totalSKSAll > 0 ? (totalBobotAll / totalSKSAll).toFixed(2) : "0.00";

  // Group by Semester
  const semesters: Record<string, { name: string, id: number, items: typeof enrollments }> = {};
  enrollments.forEach(enr => {
    const period = enr.class.academic_period;
    if (!semesters[period.id]) {
      semesters[period.id] = {
        name: period.name,
        id: period.id,
        items: []
      };
    }
    semesters[period.id].items.push(enr);
  });

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="space-y-1">
        <h1 className="text-3xl font-bold tracking-tight">Nilai Akademik</h1>
        <p className="text-muted-foreground font-medium">
          Pantau progres pencapaian studi dan cetak Kartu Hasil Studi (KHS).
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="premium-glass bg-primary/5 border-2 border-primary/10 overflow-hidden relative group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-primary/10 blur-2xl -mr-12 -mt-12 group-hover:bg-primary/20 transition-all" />
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-bold uppercase tracking-widest text-muted-foreground">IPK Kumulatif</CardTitle>
            <Award className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold text-primary">{ipk}</div>
            <p className="text-xs text-muted-foreground font-medium mt-1">
              Dari total {totalSKSAll} SKS yang telah ditempuh
            </p>
          </CardContent>
        </Card>

        <Card className="premium-glass bg-sky-500/5 border-2 border-sky-500/10 overflow-hidden relative group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-sky-500/10 blur-2xl -mr-12 -mt-12 group-hover:bg-sky-500/20 transition-all" />
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Status Akademik</CardTitle>
            <TrendingUp className="h-4 w-4 text-sky-600" />
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold text-sky-600">AKTIF</div>
            <p className="text-xs text-muted-foreground font-medium mt-1">
              {student.status === 'Active' ? 'Memenuhi syarat kelanjutan studi' : student.status}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-10">
        {Object.values(semesters).map((sem) => {
          let semSKS = 0;
          let semBobot = 0;
          sem.items.forEach(enr => {
            if (enr.final_score) {
              const sks = enr.class.course.credits;
              semSKS += sks;
              semBobot += Number(enr.final_score) * sks;
            }
          });
          const ips = semSKS > 0 ? (semBobot / semSKS).toFixed(2) : "0.00";

          return (
            <Card key={sem.id} className="glass-effect dark:glass-effect-dark border-2 border-primary/5 shadow-xl rounded-3xl overflow-hidden">
              <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b bg-muted/20 pb-4">
                <div>
                  <CardTitle className="text-xl font-bold tracking-tight">{sem.name}</CardTitle>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant="secondary" className="font-bold text-[10px] uppercase">IPS: {ips}</Badge>
                    <Badge variant="outline" className="font-bold text-[10px] uppercase">{semSKS} SKS</Badge>
                  </div>
                </div>
                <Link href={`/akademik/mahasiswa/nilai/cetak?period_id=${sem.id}`}>
                  <button className="px-5 py-2.5 rounded-xl bg-white dark:bg-slate-900 border-2 border-primary/10 text-primary font-bold text-[10px] uppercase tracking-widest hover:bg-primary hover:text-white hover:border-transparent transition-all shadow-lg flex items-center gap-2">
                    <Printer size={14} />
                    Cetak KHS
                  </button>
                </Link>
              </CardHeader>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/30">
                      <TableHead className="font-bold text-[10px] uppercase tracking-wider pl-6">Kode</TableHead>
                      <TableHead className="font-bold text-[10px] uppercase tracking-wider">Mata Kuliah</TableHead>
                      <TableHead className="text-center font-bold text-[10px] uppercase tracking-wider">SKS</TableHead>
                      <TableHead className="text-center font-bold text-[10px] uppercase tracking-wider">Huruf</TableHead>
                      <TableHead className="text-center font-bold text-[10px] uppercase tracking-wider">Bobot</TableHead>
                      <TableHead className="text-center font-bold text-[10px] uppercase tracking-wider pr-6">Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {sem.items.map((enr) => (
                      <TableRow key={enr.id} className="hover:bg-muted/20 transition-colors">
                        <td className="pl-6 font-mono text-xs font-bold">{enr.class.course.code}</td>
                        <td className="font-medium">{enr.class.course.name}</td>
                        <td className="text-center font-bold">{enr.class.course.credits}</td>
                        <td className="text-center">
                          <Badge variant={Number(enr.final_score || 0) >= 3.0 ? 'default' : 'secondary'} className="font-bold">
                            {enr.final_grade || '-'}
                          </Badge>
                        </td>
                        <td className="text-center font-medium font-mono">
                          {enr.final_score ? Number(enr.final_score).toFixed(2) : '-'}
                        </td>
                        <td className="text-center pr-6">
                          {Number(enr.final_score || 0) >= 2.0 ? (
                            <Badge className="bg-sky-100 text-sky-800 border-sky-200 font-bold text-[10px]">LULUS</Badge>
                          ) : (
                            <Badge variant="destructive" className="font-bold text-[10px]">Gagal</Badge>
                          )}
                        </td>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          );
        })}

        {Object.keys(semesters).length === 0 && (
          <div className="text-center py-20 bg-muted/20 rounded-3xl border-2 border-dashed border-muted">
            <Award className="h-12 w-12 text-muted/30 mx-auto mb-4" />
            <p className="text-muted-foreground font-medium italic">Belum ada data nilai akademik yang tersedia.</p>
          </div>
        )}
      </div>
    </div>
  );
}
