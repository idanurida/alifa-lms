// app/(dashboard)/akademik/mahasiswa/nilai/cetak/page.tsx
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';
import { PrintButton } from '@/components/akademik/PrintButton';

export default async function KHSPrintPage({
    searchParams
}: {
    searchParams: Promise<{ student_id?: string; period_id?: string }>
}) {
    const { student_id, period_id } = await searchParams;
    const session = await getServerSession(authOptions);

    if (!session) return <div>Unauthorized</div>;

    // Determine target student ID
    let targetStudentId: number;
    if (session.user.role === 'mahasiswa') {
        const student = await prisma.student.findFirst({
            where: { user_id: parseInt(session.user.id) }
        });
        if (!student) return <div>Student profile not found</div>;
        targetStudentId = student.id;
    } else {
        if (!student_id) return <div>Student ID is required</div>;
        targetStudentId = parseInt(student_id);
    }

    if (!period_id) return <div>Semester/Period ID is required</div>;
    const periodId = parseInt(period_id);

    // Fetch Student Info with Study Program
    const student = await prisma.student.findUnique({
        where: { id: targetStudentId },
        include: {
            study_program_ref: true,
            user: true
        }
    });

    if (!student) notFound();

    // Fetch Academic Period Info
    const period = await prisma.academicPeriod.findUnique({
        where: { id: periodId }
    });

    if (!period) notFound();

    // Fetch Enrollments for this period
    const enrollments = await prisma.studentEnrollment.findMany({
        where: {
            student_id: targetStudentId,
            class: {
                academic_period_id: periodId
            }
        },
        include: {
            class: {
                include: {
                    course: true
                }
            }
        },
        orderBy: {
            class: {
                course: {
                    name: 'asc'
                }
            }
        }
    });

    // Calculate Semester Stats
    let totalSKS = 0;
    let totalBobot = 0;
    let totalSKSLulus = 0;

    enrollments.forEach(enr => {
        const sks = enr.class.course.credits;
        totalSKS += sks;
        if (enr.final_score) {
            const score = Number(enr.final_score);
            totalBobot += score * sks;
            if (Number(score) >= 2.0) { // Assuming C or 2.0 is passing
                totalSKSLulus += sks;
            }
        }
    });

    const ips = totalSKS > 0 ? (totalBobot / totalSKS).toFixed(2) : "0.00";

    // Note: IPK calculation ideally requires fetching ALL historical enrollments.
    // For this specific semester print, we focus on IPS, but UI asks for IPK sometimes.
    // We'll stick to IPS for the KHS as strictly defined usually.

    return (
        <div className="bg-white text-black p-0 max-w-[21cm] mx-auto print:m-0 print:p-0 print:max-w-none shadow-none md:shadow-lg md:p-8 min-h-screen font-serif">
            <style dangerouslySetInnerHTML={{
                __html: `
                @media print {
                    @page { margin: 1cm; size: A4 portrait; }
                    body { -webkit-print-color-adjust: exact; }
                    .no-print { display: none !important; }
                    .print-shadow-none { box-shadow: none !important; }
                }
            `}} />

            {/* Print Header Button */}
            <div className="no-print mb-8 flex justify-between items-center bg-slate-100 p-4 rounded-lg">
                <p className="text-sm font-medium text-slate-600 italic">Pratinjau Cetak KHS - Gunakan Ctrl+P untuk mencetak</p>
                <PrintButton label="Cetak Sekarang" />
            </div>

            {/* KOP SURAT (Header Image) */}
            <div className="w-full mb-2 border-b-4 border-double border-black pb-2">
                <img
                    src="/images/kop-khs.png"
                    alt="Kop Surat STIES Alifa"
                    className="w-full h-auto object-contain max-h-[150px]"
                />
            </div>

            {/* TITLE */}
            <div className="text-center mb-6 mt-4">
                <h3 className="text-xl font-bold uppercase underline underline-offset-4 decoration-2 tracking-wide font-sans">KARTU HASIL STUDI (KHS)</h3>
                <p className="text-sm font-bold mt-1 uppercase">{period.name}</p>
            </div>

            {/* IDENTITY & PHOTO SECTION */}
            <div className="flex justify-between items-start mb-6 gap-8">
                <div className="flex-1 space-y-1.5 text-sm font-medium font-sans">
                    <div className="flex">
                        <span className="w-40">Nama Mahasiswa</span>
                        <span className="mr-2">:</span>
                        <span className="font-bold uppercase">{student.name}</span>
                    </div>
                    <div className="flex">
                        <span className="w-40">NIM</span>
                        <span className="mr-2">:</span>
                        <span className="font-bold">{student.nim}</span>
                    </div>
                    <div className="flex">
                        <span className="w-40">Program Studi</span>
                        <span className="mr-2">:</span>
                        <span className="uppercase">{student.study_program_ref?.name || '-'}</span>
                    </div>
                    <div className="flex">
                        <span className="w-40">Jenjang Pendidikan</span>
                        <span className="mr-2">:</span>
                        <span className="uppercase">{student.study_program_ref?.degree_level || 'S1'}</span>
                    </div>
                </div>

                {/* PAS FOTO 3x4 */}
                <div className="w-[3cm] h-[4cm] border border-black flex items-center justify-center bg-white text-[10px] text-slate-400 overflow-hidden flex-shrink-0 shadow-sm">
                    {student.photo_url ? (
                        <img
                            src={student.photo_url}
                            alt="Foto Mahasiswa"
                            className="w-full h-full object-cover grayscale brightness-110 contrast-125" // Printable effect
                        />
                    ) : (
                        <div className="text-center p-2 uppercase">
                            Pas Foto<br />3 x 4
                        </div>
                    )}
                </div>
            </div>

            {/* GRADES TABLE */}
            <div className="mb-4">
                <table className="w-full border-collapse border border-black text-[11px] font-sans">
                    <thead>
                        <tr className="bg-slate-100/50">
                            <th className="border border-black p-1.5 w-8">NO</th>
                            <th className="border border-black p-1.5 w-20">KODE</th>
                            <th className="border border-black p-1.5 text-left">MATA KULIAH</th>
                            <th className="border border-black p-1.5 w-10 text-center">SKS</th>
                            <th className="border border-black p-1.5 w-12 text-center">NILAI</th>
                            <th className="border border-black p-1.5 w-12 text-center">BOBOT</th>
                            <th className="border border-black p-1.5 w-16 text-center">N x B</th>
                        </tr>
                    </thead>
                    <tbody>
                        {enrollments.map((enr, idx) => {
                            const sks = enr.class.course.credits;
                            const score = Number(enr.final_score || 0);
                            const bobot = (score * sks);
                            return (
                                <tr key={enr.id}>
                                    <td className="border border-black p-1.5 text-center">{idx + 1}</td>
                                    <td className="border border-black p-1.5 text-center font-semibold">{enr.class.course.code}</td>
                                    <td className="border border-black p-1.5 uppercase font-medium">{enr.class.course.name}</td>
                                    <td className="border border-black p-1.5 text-center">{sks}</td>
                                    <td className="border border-black p-1.5 text-center font-bold">{enr.final_grade || '-'}</td>
                                    <td className="border border-black p-1.5 text-center">{score.toFixed(2)}</td>
                                    <td className="border border-black p-1.5 text-center">{bobot.toFixed(2)}</td>
                                </tr>
                            );
                        })}
                        {/* Pad rows if empty to look neat? Optional, but better just show empty msg if 0 */}
                        {enrollments.length === 0 && (
                            <tr>
                                <td colSpan={7} className="border border-black p-8 text-center text-slate-400 italic">Belum ada data nilai semester ini</td>
                            </tr>
                        )}
                    </tbody>
                    <tfoot className="font-bold bg-slate-50/50">
                        <tr>
                            <td colSpan={3} className="border border-black p-1.5 text-right uppercase pr-4">Jumlah</td>
                            <td className="border border-black p-1.5 text-center">{totalSKS}</td>
                            <td className="border border-black p-1.5 text-center"></td>
                            <td className="border border-black p-1.5 text-center"></td>
                            <td className="border border-black p-1.5 text-center">{totalBobot.toFixed(2)}</td>
                        </tr>
                    </tfoot>
                </table>
            </div>

            {/* SUMMARY STATS & SIGNATURES */}
            <div className="grid grid-cols-2 gap-8 text-sm font-sans mt-2">
                <div className="space-y-1 pt-2">
                    <div className="flex gap-4">
                        <span className="w-48">Jumlah SKS diambil</span>
                        <span className="font-bold">: {totalSKS}</span>
                    </div>
                    <div className="flex gap-4">
                        <span className="w-48">Jumlah SKS yang lulus</span>
                        <span className="font-bold">: {totalSKSLulus}</span>
                    </div>
                    <div className="flex gap-4">
                        <span className="w-48">Indeks Prestasi Semester (IPS)</span>
                        <span className="font-bold">: {ips}</span>
                    </div>
                    <div className="flex gap-4">
                        <span className="w-48">Beban SKS Semester Berikutnya</span>
                        <span className="font-bold">: 24 SKS</span>
                    </div>
                </div>

                <div className="mt-8 text-center space-y-16">
                    <div>
                        <p className="mb-1">Pringsewu, {new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                        <p className="font-bold">Ketua Program Studi,</p>
                    </div>
                    <div className="space-y-1">
                        <p className="font-bold underline uppercase underline-offset-2">H. FAUZAN, S.E., M.M.</p>
                        <p className="text-[11px]">NIDN. 0225038502</p>
                    </div>
                </div>
            </div>

            <div className="mt-8 w-1/2 text-center space-y-16 font-sans text-sm">
                <div>
                    <p className="font-bold">Dosen Pembimbing Akademik,</p>
                </div>
                <div className="space-y-1">
                    <p className="font-bold underline uppercase underline-offset-2">AHMAD FAUZI, M.E.Sy</p>
                    <p className="text-[11px]">NIDN. 2012128801</p>
                </div>
            </div>

            {/* Footer / Notes */}
            <div className="mt-12 text-[10px] italic text-slate-500 border-t border-black pt-2 font-serif text-center">
                Dokumen ini dicetak dari Sistem Informasi Akademik STIES ALIFA pada {new Date().toLocaleString('id-ID')}.
            </div>
        </div>
    );
}
