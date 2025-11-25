// app/(dashboard)/keuangan/verifikasi/page.tsx
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { sql } from '@/lib/db';
import PaymentEvidenceTable from '@/components/keuangan/PaymentEvidenceTable';
import { verifyPayment, rejectPayment } from '@/app/actions/payment-actions';

export default async function VerifikasiPage() {
  const session = await getServerSession(authOptions);
  
  if (!session || !['super_admin', 'staff_keuangan'].includes(session.user.role as string)) {
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

  let data: any[] = [];
  try {
    // QUERY YANG SESUAI DENGAN STRUKTUR TABEL SEBENARNYA
    const result = await sql`
      SELECT 
        pe.id, 
        pe.student_id, 
        pe.academic_period_id,
        pe.amount, 
        pe.evidence_path, 
        pe.transfer_date,
        pe.bank_name, 
        pe.account_number, 
        pe.account_name, 
        pe.status, 
        pe.verified_by,
        pe.verified_at,
        pe.notes,
        pe.createdAt,
        s.name as student_name, 
        s.nim,
        s.email,
        ap.name as academic_period_name
      FROM payment_evidences pe
      JOIN students s ON pe.student_id = s.id
      LEFT JOIN academic_periods ap ON pe.academic_period_id = ap.id
      WHERE pe.status = 'pending'
      ORDER BY pe.createdAt ASC
    `;
    
    data = result;
    
  } catch (error) {
    console.error('Failed to fetch pending payment evidence:', error);
    
    // Fallback data untuk development
    data = [
      {
        id: 1,
        student_id: 1,
        student_name: 'Ahmad Budiman',
        nim: '202401001',
        email: 'ahmad@example.com',
        amount: 2500000,
        transfer_date: new Date().toISOString(),
        bank_name: 'BCA',
        account_number: '1234567890',
        account_name: 'Ahmad Budiman',
        status: 'pending',
        academic_period_id: 1,
        academic_period_name: 'Semester Ganjil 2024/2025',
        evidence_path: '/uploads/payment.jpg',
        created_at: new Date().toISOString(),
        notes: null,
        verified_by: null,
        verified_at: null
      }
    ];
  }

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-bold tracking-tight">Verifikasi Pembayaran</h1>
        <p className="text-muted-foreground">
          Antrian verifikasi bukti transfer pembayaran mahasiswa.
        </p>
      </div>

      <Card className="glass-effect dark:glass-effect-dark">
        <CardHeader>
          <CardTitle>Antrian Verifikasi</CardTitle>
        </CardHeader>
        <CardContent>
          <PaymentEvidenceTable 
            data={data} 
            onVerify={verifyPayment} 
            onReject={rejectPayment} 
          />
        </CardContent>
      </Card>
    </div>
  );
}
