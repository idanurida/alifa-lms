import { notFound } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import { ArrowLeft, Printer } from 'lucide-react';
import { PrintButton } from '@/components/akademik/PrintButton';

export default async function GradesPage({ params }: { params: Promise<{ id: string }> }) {
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
        where: { id: studentId },
        include: {
            study_program_ref: true
        }
    });

    if (!student) notFound();

    // Ambil data enrollment yang sudah ada nilai (completed) atau setidaknya ada final_score
    const enrollments = await prisma.studentEnrollment.findMany({
        where: {
            student_id: studentId,
            // status: 'completed' // Bisa difilter hanya yang completed jika perlu
        },
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

    // Group by semester (Academic Period)
    const semesters: Record<string, typeof enrollments> = {};

    enrollments.forEach(enr => {
        const key = `${enr.class.academic_period.name}`;
        if (!semesters[key]) {
            semesters[key] = [];
        }
        semesters[key].push(enr);
    });

    // Calculate Cumulative GPA (IPK)
    let totalSKS = 0;
    let totalBobot = 0;
    let totalSKSLulus = 0;

    enrollments.forEach(enr => {
        if (enr.final_score) {
            const sks = enr.class.course.credits;
            totalSKS += sks;
            totalBobot += Number(enr.final_score) * sks; // Assuming final_score is 0-4 point
            if (Number(enr.final_score) >= 2.0) { // C threshold
                totalSKSLulus += sks;
            }
        }
    });

    const ipk = totalSKS > 0 ? (totalBobot / totalSKS).toFixed(2) : "0.00";

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex items-center gap-4">
                    <Button variant="outline" size="icon" asChild>
                        <Link href={`/akademik/mahasiswa/${id}`}>
                            <ArrowLeft size={16} />
                        </Link>
                    </Button>
                    <div className="space-y-1">
                        <h1 className="text-xl font-bold">Transkrip Nilai</h1>
                        <p className="text-muted-foreground text-sm">
                            Mahasiswa: <span className="font-semibold text-foreground">{student.name}</span> (NIM: {student.nim})
                        </p>
                    </div>
                </div>
                <PrintButton
                    label="Cetak Transkrip"
                    className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2"
                />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card className="glass-effect dark:glass-effect-dark md:col-span-4">
                    <CardContent className="p-6">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                            <div>
                                <p className="text-muted-foreground text-sm">IPK Kumulatif</p>
                                <p className="text-3xl font-bold text-primary">{ipk}</p>
                            </div>
                            <div>
                                <p className="text-muted-foreground text-sm">Total SKS Diambil</p>
                                <p className="text-2xl font-semibold">{totalSKS}</p>
                            </div>
                            <div>
                                <p className="text-muted-foreground text-sm">SKS Lulus</p>
                                <p className="text-2xl font-semibold">{totalSKSLulus}</p>
                            </div>
                            <div>
                                <p className="text-muted-foreground text-sm">Program Studi</p>
                                <p className="text-lg font-medium">{student.study_program_ref?.name || '-'}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <div className="space-y-6">
                {Object.entries(semesters).map(([periodName, periodEnrollments]) => {
                    // Calculate IPS (Indeks Prestasi Semester)
                    let semSKS = 0;
                    let semBobot = 0;
                    periodEnrollments.forEach(enr => {
                        if (enr.final_score) {
                            const sks = enr.class.course.credits;
                            semSKS += sks;
                            semBobot += Number(enr.final_score) * sks;
                        }
                    });
                    const ips = semSKS > 0 ? (semBobot / semSKS).toFixed(2) : "0.00";

                    return (
                        <Card key={periodName} className="glass-effect dark:glass-effect-dark">
                            <CardHeader className="flex flex-row items-center justify-between pb-2">
                                <div className="flex flex-col">
                                    <CardTitle className="text-lg font-semibold">{periodName}</CardTitle>
                                    <Badge variant="outline" className="w-fit mt-1">IPS: {ips}</Badge>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Button variant="outline" size="sm" asChild className="h-8 text-[10px] font-bold uppercase tracking-wider">
                                        <Link href={`/akademik/mahasiswa/nilai/cetak?student_id=${studentId}&period_id=${periodEnrollments[0].class.academic_period_id}`}>
                                            <Printer size={12} className="mr-1.5" />
                                            Cetak KHS
                                        </Link>
                                    </Button>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="rounded-md border">
                                    <table className="w-full text-sm">
                                        <thead>
                                            <tr className="border-b bg-muted/50">
                                                <th className="text-left p-3 font-medium">Kode MK</th>
                                                <th className="text-left p-3 font-medium">Mata Kuliah</th>
                                                <th className="text-center p-3 font-medium">SKS</th>
                                                <th className="text-center p-3 font-medium">Nilai Angka</th>
                                                <th className="text-center p-3 font-medium">Nilai Huruf</th>
                                                <th className="text-center p-3 font-medium">Bobot</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {periodEnrollments.map(enr => (
                                                <tr key={enr.id} className="border-b last:border-0 hover:bg-muted/30">
                                                    <td className="p-3 font-mono">{enr.class.course.code}</td>
                                                    <td className="p-3 font-medium">{enr.class.course.name}</td>
                                                    <td className="p-3 text-center">{enr.class.course.credits}</td>
                                                    <td className="p-3 text-center">{Number(enr.final_score || 0).toFixed(2)}</td>
                                                    <td className="p-3 text-center font-bold">{enr.final_grade || '-'}</td>
                                                    <td className="p-3 text-center">{(Number(enr.final_score || 0) * enr.class.course.credits).toFixed(2)}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </CardContent>
                        </Card>
                    );
                })}

                {Object.keys(semesters).length === 0 && (
                    <div className="text-center py-12 text-muted-foreground border rounded-lg border-dashed">
                        Belum ada data nilai akademik.
                    </div>
                )}
            </div>
        </div>
    );
}
