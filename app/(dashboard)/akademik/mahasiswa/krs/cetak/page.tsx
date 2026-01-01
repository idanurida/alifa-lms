// app/(dashboard)/akademik/mahasiswa/krs/cetak/page.tsx
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';
import { PrintButton } from '@/components/akademik/PrintButton';

export default async function KRSPrintPage({
    searchParams
}: {
    searchParams: Promise<{ student_id?: string; period_id?: string }>
}) {
    const { student_id, period_id } = await searchParams;
    const session = await getServerSession(authOptions);

    if (!session) return <div>Unauthorized</div>;

    // Determine target student ID
    let targetStudentId: number;
    let targetPeriodId: number;

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

    // Determine Period (Default to latest active if not provided)
    if (period_id) {
        targetPeriodId = parseInt(period_id);
    } else {
        const activePeriod = await prisma.academicPeriod.findFirst({
            where: { is_active: true },
            orderBy: { start_date: 'desc' }
        });
        if (!activePeriod) return <div>No active academic period found</div>;
        targetPeriodId = activePeriod.id;
    }

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
        where: { id: targetPeriodId }
    });

    if (!period) notFound();

    // Fetch Enrollments for this period (KRS Data)
    const enrollments = await prisma.studentEnrollment.findMany({
        where: {
            student_id: targetStudentId,
            class: {
                academic_period_id: targetPeriodId
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
                    code: 'asc' // Sort by Course Code usually for KRS
                }
            }
        }
    });

    // Calculate Total SKS
    const totalSKS = enrollments.reduce((sum, enr) => sum + enr.class.course.credits, 0);

    return (
        <div className="bg-white text-black p-0 max-w-[21.5cm] mx-auto print:m-0 print:p-0 print:max-w-none shadow-none md:shadow-lg md:p-8 min-h-screen font-serif">
            <style dangerouslySetInnerHTML={{
                __html: `
                @media print {
                    @page { margin: 1cm; size: legal portrait; }
                    body { -webkit-print-color-adjust: exact; }
                    .no-print { display: none !important; }
                    .print-shadow-none { box-shadow: none !important; }
                }
            `}} />

            {/* Print Header Button */}
            <div className="no-print mb-8 flex justify-between items-center bg-slate-100 p-4 rounded-lg">
                <p className="text-sm font-medium text-slate-600 italic">Pratinjau Cetak KRS - Gunakan Ctrl+P untuk mencetak</p>
                <PrintButton label="Cetak KRS" />
            </div>

            {/* KOP SURAT (Header Image) - No Border Bottom */}
            <div className="w-full mb-2 pb-2">
                <img
                    src="/images/kop-khs.png"
                    alt="Kop Surat STIES Alifa"
                    className="w-full h-auto object-contain max-h-[150px]"
                />
            </div>

            {/* TITLE */}
            <div className="text-center mb-6 mt-0">
                <h3 className="text-xl font-bold uppercase tracking-wide font-sans text-[#009933]">KARTU RENCANA STUDI (KRS)</h3>
            </div>

            {/* IDENTITY & PHOTO SECTION - PHOTO LEFT */}
            <div className="flex gap-6 items-start mb-4 font-serif text-[13px]">
                {/* PAS FOTO 3x4 (LEFT) */}
                <div className="w-[3cm] h-[4cm] bg-red-600 flex items-center justify-center text-[10px] text-white overflow-hidden flex-shrink-0 shadow-sm">
                    {student.photo_url ? (
                        <img
                            src={student.photo_url}
                            alt="Foto Mahasiswa"
                            className="w-full h-full object-cover"
                        />
                    ) : (
                        <div className="text-center p-2 font-bold">
                            FOTO<br />3 x 4
                        </div>
                    )}
                </div>

                {/* Identity Info */}
                <div className="flex-1 space-y-1">
                    <div className="flex">
                        <span className="w-48">Nama Mahasiswa</span>
                        <span className="mr-2">:</span>
                        <span className="font-medium">{student.name}</span>
                    </div>
                    <div className="flex">
                        <span className="w-48">Nomor Pokok Mahasiswa</span>
                        <span className="mr-2">:</span>
                        <span className="font-medium">{student.nim}</span>
                    </div>
                    <div className="flex">
                        <span className="w-48">Program Studi</span>
                        <span className="mr-2">:</span>
                        <span className="">{student.study_program_ref?.name || '-'}</span>
                    </div>
                    <div className="flex">
                        <span className="w-48">Kelas</span>
                        <span className="mr-2">:</span>
                        <span className="">A</span> {/* Hardcoded as requested or derive if possible */}
                    </div>
                    <div className="flex">
                        <span className="w-48">Tahun Ajaran</span>
                        <span className="mr-2">:</span>
                        <span className="">{period.year}/{period.year + 1} ({period.semester % 2 !== 0 ? 'Ganjil' : 'Genap'})</span>
                    </div>
                    <div className="flex">
                        <span className="w-48">Semester</span>
                        <span className="mr-2">:</span>
                        <span className="">{Math.ceil(period.semester)}</span>
                    </div>
                    <div className="flex">
                        <span className="w-48">IPK semester lalu</span>
                        <span className="mr-2">:</span>
                        <span className="">3.91</span> {/* Placeholder logic as per image sample for now */}
                    </div>
                    <div className="flex">
                        <span className="w-48">Max SKS yang bisa diambil</span>
                        <span className="mr-2">:</span>
                        <span className="">24 SKS</span>
                    </div>
                </div>
            </div>

            {/* KRS TABLE */}
            <div className="mb-2">
                <table className="w-full border-collapse border border-black text-[12px] font-serif">
                    <thead>
                        <tr className="text-center font-bold" style={{ backgroundColor: '#B4C6E7' }}>
                            <th className="border border-black p-1 w-8">No</th>
                            <th className="border border-black p-1 w-24">Kode MK</th>
                            <th className="border border-black p-1">Nama Mata Kuliah</th>
                            <th className="border border-black p-1 w-10">SKS</th>
                            <th className="border border-black p-1 w-10">Smt</th>
                            <th className="border border-black p-1 w-12">Kelas</th>
                            <th className="border border-black p-1 w-12">Ket</th>
                        </tr>
                    </thead>
                    <tbody>
                        {enrollments.map((enr, idx) => (
                            <tr key={enr.id} className="h-6">
                                <td className="border border-black p-1 text-center">{idx + 1}</td>
                                <td className="border border-black p-1 text-center">{enr.class.course.code}</td>
                                <td className="border border-black p-1 pl-2">{enr.class.course.name}</td>
                                <td className="border border-black p-1 text-center">{enr.class.course.credits}</td>
                                <td className="border border-black p-1 text-center">{enr.class.course.semester}</td>
                                <td className="border border-black p-1 text-center">A</td>
                                <td className="border border-black p-1"></td>
                            </tr>
                        ))}
                        {/* Fill remaining rows to make it look like the form (total ~15 rows) */}
                        {Array.from({ length: Math.max(0, 15 - enrollments.length) }).map((_, idx) => (
                            <tr key={`empty-${idx}`} className="h-6">
                                <td className="border border-black p-1">&nbsp;</td>
                                <td className="border border-black p-1"></td>
                                <td className="border border-black p-1"></td>
                                <td className="border border-black p-1"></td>
                                <td className="border border-black p-1"></td>
                                <td className="border border-black p-1"></td>
                                <td className="border border-black p-1"></td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Total SKS Highlight */}
            <div className="mb-8">
                <span className="bg-yellow-300 font-bold px-2 py-1 border border-none text-[12px]">
                    Total Pengambilan: {totalSKS} SKS
                </span>
            </div>

            {/* SIGNATURES SECTION - BOXED */}
            <div className="border border-black flex text-[12px] font-serif mb-8">
                {/* COLUMN 1: KPS */}
                <div className="flex-1 border-r border-black p-2 flex flex-col items-center justify-between h-[120px]">
                    <div className="text-center w-full">
                        <p className="text-left w-full pl-2">Pringsewu...................</p>
                        <p className="font-bold">Ketua Program Studi,</p>
                    </div>
                    <div className="text-center space-y-1">
                        <p className="font-bold underline">H. FAUZAN, S.E., M.M.</p>
                        <p>NIDN. 0225038502</p>
                    </div>
                </div>

                {/* COLUMN 2: PA */}
                <div className="flex-1 border-r border-black p-2 flex flex-col items-center justify-between h-[120px]">
                    <div className="text-center w-full">
                        <p className="text-left w-full pl-2">Pringsewu...................</p>
                        <p className="font-bold">Pembimbing Akademik,</p>
                    </div>
                    <div className="text-center space-y-1">
                        <p className="font-bold underline">H. Allan Harris, S.Psi.,S.E.,M.M</p>
                        <p>NUPTK 8637753654130112</p>
                    </div>
                </div>

                {/* COLUMN 3: MAHASISWA */}
                <div className="flex-1 p-2 flex flex-col items-center justify-between h-[120px]">
                    <div className="text-center">
                        <p>Pringsewu, {new Date().toLocaleDateString('id-ID', { day: '2-digit', month: '2-digit', year: 'numeric' }).replace(/\//g, '-')}</p>
                        <p className="font-bold">Mahasiswa Ybs,</p>
                    </div>
                    <div className="text-center space-y-1">
                        <p className="font-bold underline">{student.name}</p>
                        <p>NPM {student.nim}</p>
                    </div>
                </div>
            </div>

            {/* CATATAN PERUBAHAN SKS */}
            <div className="mb-4">
                <p className="text-[12px] italic mb-1 font-serif">Catatan Perubahan SKS</p>
                <table className="w-full border-collapse border border-black text-[12px] font-serif">
                    <thead>
                        <tr className="text-center font-bold" style={{ backgroundColor: '#B4C6E7' }}>
                            <th className="border border-black p-1 w-8">No</th>
                            <th className="border border-black p-1">Nama Mata Kuliah</th>
                            <th className="border border-black p-1 w-10">SKS</th>
                            <th className="border border-black p-1 w-10">Smt</th>
                            <th className="border border-black p-1 w-24">Status</th>
                            <th className="border border-black p-1 w-20">Paraf</th>
                        </tr>
                    </thead>
                    <tbody>
                        {/* 5 Empty Rows */}
                        {Array.from({ length: 5 }).map((_, idx) => (
                            <tr key={`change-${idx}`} className="h-6">
                                <td className="border border-black p-1">&nbsp;</td>
                                <td className="border border-black p-1"></td>
                                <td className="border border-black p-1"></td>
                                <td className="border border-black p-1"></td>
                                <td className="border border-black p-1"></td>
                                <td className="border border-black p-1"></td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

        </div>
    );
}
