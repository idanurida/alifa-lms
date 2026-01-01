import { notFound } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import { ArrowLeft, Download, Upload } from 'lucide-react';

export default async function FinancePage({ params }: { params: Promise<{ id: string }> }) {
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

    // Ambil data Tagihan (Invoice)
    const invoices = await prisma.invoice.findMany({
        where: { student_id: studentId },
        include: {
            academic_period: true
        },
        orderBy: { created_at: 'desc' }
    });

    // Ambil data Riwayat Pembayaran (PaymentEvidence)
    const payments = await prisma.paymentEvidence.findMany({
        where: { student_id: studentId },
        include: {
            academic_period: true,
            verifier: true
        },
        orderBy: { transfer_date: 'desc' }
    });

    const formatCurrency = (amount: number | any) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0
        }).format(Number(amount));
    };

    const formatDate = (date: Date) => {
        return new Date(date).toLocaleDateString('id-ID', {
            day: '2-digit', month: 'long', year: 'numeric'
        });
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <Button variant="outline" size="icon" asChild>
                    <Link href={`/akademik/mahasiswa/${id}`}>
                        <ArrowLeft size={16} />
                    </Link>
                </Button>
                <div className="space-y-1">
                    <h1 className="text-xl font-bold">Riwayat Keuangan</h1>
                    <p className="text-muted-foreground text-sm">
                        Mahasiswa: <span className="font-semibold text-foreground">{student.name}</span> (NIM: {student.nim})
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* invoices */}
                <Card className="glass-effect dark:glass-effect-dark">
                    <CardHeader>
                        <CardTitle>Tagihan Kuliah</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {invoices.length === 0 ? (
                            <p className="text-muted-foreground text-center py-6">Tidak ada tagihan aktif.</p>
                        ) : (
                            <div className="space-y-4">
                                {invoices.map(inv => (
                                    <div key={inv.id} className="border rounded-lg p-4 flex justify-between items-center bg-card">
                                        <div>
                                            <p className="font-semibold">{inv.academic_period.name}</p>
                                            <p className="text-sm text-muted-foreground">Jatuh Tempo: {formatDate(inv.due_date)}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-bold text-lg">{formatCurrency(inv.amount)}</p>
                                            <Badge variant={inv.status === 'paid' ? 'default' : 'destructive'} className="mt-1">
                                                {inv.status === 'paid' ? 'Lunas' : 'Belum Lunas'}
                                            </Badge>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Payments */}
                <Card className="glass-effect dark:glass-effect-dark">
                    <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle>Riwayat Pembayaran</CardTitle>
                        <Button size="sm" variant="outline">
                            <Upload size={14} className="mr-2" />
                            Upload Bukti
                        </Button>
                    </CardHeader>
                    <CardContent>
                        {payments.length === 0 ? (
                            <p className="text-muted-foreground text-center py-6">Belum ada riwayat pembayaran.</p>
                        ) : (
                            <div className="space-y-4">
                                {payments.map(pay => (
                                    <div key={pay.id} className="border rounded-lg p-4 bg-card">
                                        <div className="flex justify-between items-start mb-2">
                                            <div>
                                                <p className="font-semibold">{pay.academic_period.name}</p>
                                                <p className="text-sm text-muted-foreground">Tgl Transfer: {formatDate(pay.transfer_date)}</p>
                                            </div>
                                            <Badge variant={
                                                pay.status === 'verified' ? 'default' :
                                                    pay.status === 'rejected' ? 'destructive' : 'secondary'
                                            }>
                                                {pay.status === 'verified' ? 'Diterima' :
                                                    pay.status === 'rejected' ? 'Ditolak' : 'Menunggu'}
                                            </Badge>
                                        </div>
                                        <div className="flex justify-between items-center border-t pt-2 mt-2">
                                            <p className="font-bold">{formatCurrency(pay.amount)}</p>
                                            <Button size="sm" variant="ghost" className="h-8">
                                                <Download size={14} className="mr-2" />
                                                Bukti
                                            </Button>
                                        </div>
                                        {pay.notes && (
                                            <p className="text-xs text-muted-foreground mt-2 bg-muted p-2 rounded">
                                                Catatan: {pay.notes}
                                            </p>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
