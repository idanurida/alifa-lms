// app/(dashboard)/keuangan/bukti-transfer/page.tsx
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import Link from 'next/link';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { sql } from '@/lib/db';

// PERBAIKAN: Gunakan default import
import PaymentEvidenceTable from '@/components/keuangan/PaymentEvidenceTable';

export default async function BuktiTransferPage() {
  const session = await getServerSession(authOptions);
  if (!session || !['super_admin', 'staff_keuangan', 'mahasiswa'].includes(session.user.role as string)) {
    return <div>Unauthorized</div>;
  }

  let data: any[] = [];
  try {
    let result: any[] = [];
    // PERBAIKAN: Gunakan template literal dengan parameterized query
    // Base Query string
    const baseFields = `
      SELECT 
        pe.id, pe.student_id, pe.academic_period_id, pe.amount, pe.evidence_path, pe.transfer_date,
        pe.bank_name, pe.account_number, pe.account_name, pe.status, pe.verified_by, pe.verified_at, pe.notes, pe.created_at,
        s.name as student_name, s.nim,
        ap.name as academic_period_name
      FROM payment_evidences pe
      JOIN students s ON pe.student_id = s.id
      JOIN academic_periods ap ON pe.academic_period_id = ap.id
    `;

    // Filter untuk mahasiswa: hanya tampilkan bukti transfer miliknya sendiri
    if (session.user.role === 'mahasiswa') {
      // Dapatkan student_id dari user yang login
      const student = await sql`
        SELECT id FROM students WHERE user_id = ${session.user.id}
      `;

      if (student.length === 0) {
        data = [];
      } else {
        // Query untuk mahasiswa
        result = await sql`
          SELECT 
            pe.id, pe.student_id, pe.academic_period_id, pe.amount, pe.evidence_path, pe.transfer_date,
            pe.bank_name, pe.account_number, pe.account_name, pe.status, pe.verified_by, pe.verified_at, pe.notes, pe.created_at,
            s.name as student_name, s.nim,
            ap.name as academic_period_name
          FROM payment_evidences pe
          JOIN students s ON pe.student_id = s.id
          JOIN academic_periods ap ON pe.academic_period_id = ap.id
          WHERE pe.student_id = ${student[0].id}
          ORDER BY pe.created_at DESC
        `;
        data = result;
      }
    } else {
      // Untuk admin/staff, tampilkan semua data
      result = await sql`
          SELECT 
            pe.id, pe.student_id, pe.academic_period_id, pe.amount, pe.evidence_path, pe.transfer_date,
            pe.bank_name, pe.account_number, pe.account_name, pe.status, pe.verified_by, pe.verified_at, pe.notes, pe.created_at,
            s.name as student_name, s.nim,
            ap.name as academic_period_name
          FROM payment_evidences pe
          JOIN students s ON pe.student_id = s.id
          JOIN academic_periods ap ON pe.academic_period_id = ap.id
          ORDER BY pe.created_at DESC
        `;
      data = result;
    }

  } catch (error) {
    console.error('Failed to fetch payment evidence:', error);
    // Fallback data untuk development
    data = [
      {
        id: 1,
        student_id: 1,
        student_name: 'Ahmad Budiman',
        nim: '202401001',
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
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight">Bukti Transfer</h1>
          <p className="text-muted-foreground">
            Daftar bukti transfer pembayaran mahasiswa.
          </p>
        </div>
        {session.user.role === 'mahasiswa' && (
          <Button asChild>
            <Link href="/keuangan/bukti-transfer/tambah">
              <Plus className="mr-2 h-4 w-4" />
              Upload Bukti Transfer
            </Link>
          </Button>
        )}
      </div>

      <Card className="glass-effect dark:glass-effect-dark">
        <CardHeader>
          <CardTitle>Daftar Bukti Transfer</CardTitle>
        </CardHeader>
        <CardContent>
          <PaymentEvidenceTable
            data={data}
            showAllStatus={true}
          />
        </CardContent>
      </Card>
    </div>
  );
}
