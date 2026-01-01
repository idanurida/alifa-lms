// app/(dashboard)/akademik/mahasiswa/[id]/krs/page.tsx
import { notFound } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default async function KRSPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await getServerSession(authOptions);

  if (!session || !['super_admin', 'staff_akademik', 'dosen', 'mahasiswa'].includes(session.user.role as string)) {
    return <div>Unauthorized</div>;
  }

  const studentId = parseInt(id);
  if (isNaN(studentId)) notFound();

  // Authorization check for mahasiswa
  if (session.user.role === 'mahasiswa') {
    const studentCheck = await prisma.student.findUnique({
      where: { id: studentId, user_id: parseInt(session.user.id) }
    });
    if (!studentCheck) {
      return <div>Unauthorized</div>;
    }
  }

  const student = await prisma.student.findUnique({
    where: { id: studentId }
  });

  if (!student) notFound();

  // Ambil data enrollment beserta detail kelas dan dosen
  const enrollments = await prisma.studentEnrollment.findMany({
    where: { student_id: studentId },
    include: {
      class: {
        include: {
          course: true,
          lecturer: true,
          academic_period: true
        }
      }
    },
    orderBy: {
      class: {
        class_code: 'asc'
      }
    }
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" asChild>
          <Link href={`/akademik/mahasiswa/${id}`}>
            <ArrowLeft size={16} />
          </Link>
        </Button>
        <div className="space-y-1">
          <h1 className="text-xl font-bold">Kartu Rencana Studi (KRS)</h1>
          <p className="text-muted-foreground text-sm">
            Mahasiswa: <span className="font-semibold text-foreground">{student.name}</span> (NIM: {student.nim})
          </p>
        </div>
      </div>

      <Card className="glass-effect dark:glass-effect-dark">
        <CardHeader>
          <CardTitle>Daftar Mata Kuliah Diambil</CardTitle>
        </CardHeader>
        <CardContent>
          {enrollments.length === 0 ? (
            <p className="text-muted-foreground py-8 text-center">Mahasiswa ini belum mengambil kelas apapun.</p>
          ) : (
            <div className="rounded-md border">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-muted/50">
                    <th className="text-left p-3 font-medium">Kode Kelas</th>
                    <th className="text-left p-3 font-medium">Periode</th>
                    <th className="text-left p-3 font-medium">Mata Kuliah</th>
                    <th className="text-left p-3 font-medium">Dosen</th>
                    <th className="text-center p-3 font-medium">SKS</th>
                    <th className="text-left p-3 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {enrollments.map((enr) => (
                    <tr key={enr.id} className="border-b hover:bg-muted/30">
                      <td className="p-3 font-mono">{enr.class.class_code}</td>
                      <td className="p-3">
                        {enr.class.academic_period.name}
                      </td>
                      <td className="p-3">
                        <div className="font-medium">{enr.class.course.name}</div>
                        <div className="text-xs text-muted-foreground">{enr.class.course.code}</div>
                      </td>
                      <td className="p-3">{enr.class.lecturer?.name || '-'}</td>
                      <td className="p-3 text-center">{enr.class.course.credits}</td>
                      <td className="p-3">
                        <Badge variant={enr.status === 'completed' ? 'default' : 'secondary'}>
                          {enr.status === 'completed' ? 'Selesai' : enr.status === 'active' ? 'Aktif' : enr.status}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
