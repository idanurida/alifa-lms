// app/(dashboard)/keuangan/bukti-transfer/tambah/page.tsx
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { sql } from '@/lib/db';
import { toast } from 'sonner';
import { redirect } from 'next/navigation';

export default async function TambahBuktiTransferPage() {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== 'mahasiswa') {
    return <div>Unauthorized</div>;
  }

  let academicPeriods = [];
  try {
    const result = await sql`
      SELECT id, name, code FROM academic_periods WHERE is_active = true ORDER BY start_date DESC
    `;
    academicPeriods = result;
  } catch (error) {
    console.error('Failed to fetch academic periods:', error);
    return <div>Failed to load academic periods.</div>;
  }

  const handleSubmit = async (formData: FormData) => {
    'use server' // Ini adalah Server Action

    const studentId = (await sql`SELECT id FROM students WHERE user_id = ${session.user.id}`)[0].id;
    const academicPeriodId = parseInt(formData.get('academic_period_id') as string);
    const amount = parseFloat(formData.get('amount') as string);
    const transferDate = formData.get('transfer_date') as string;
    const bankName = formData.get('bank_name') as string;
    const accountNumber = formData.get('account_number') as string;
    const accountName = formData.get('account_name') as string;

    // Validasi sederhana
    if (!academicPeriodId || !amount || !transferDate) {
      toast.error('Harap isi semua field yang wajib.');
      return;
    }

    // Di sini Anda perlu menangani upload file ke storage (Supabase/Local)
    // Untuk sekarang, kita asumsikan path file disimpan di `evidence_path`
    const file = formData.get('evidence_file') as File | null;
    let evidencePath = null;
    if (file && file.size > 0) {
      // Contoh upload ke local (Anda perlu konfigurasi storage)
      // const buffer = await file.arrayBuffer();
      // const fileName = `${Date.now()}_${file.name}`;
      // const filePath = path.join(process.cwd(), 'public', 'uploads', fileName);
      // fs.writeFileSync(filePath, new Uint8Array(buffer));
      // evidencePath = `/uploads/${fileName}`;
      // Untuk sekarang, kita gunakan placeholder
      evidencePath = `/uploads/bukti_transfer_${studentId}_${Date.now()}.jpg`;
    } else {
      toast.error('Harap unggah bukti transfer.');
      return;
    }

    try {
      await sql`
        INSERT INTO payment_evidences (
          student_id, academic_period_id, amount, evidence_path, transfer_date,
          bank_name, account_number, account_name, status
        )
        VALUES (${studentId}, ${academicPeriodId}, ${amount}, ${evidencePath}, ${transferDate},
                ${bankName || null}, ${accountNumber || null}, ${accountName || null}, 'pending')
      `;
      toast.success('✅ Bukti transfer berhasil diunggah.');
      redirect('/keuangan/bukti-transfer');
    } catch (error) {
      console.error('Failed to submit payment evidence:', error);
      toast.error('❌ Gagal mengunggah bukti transfer.');
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <p className="text-sm font-medium">Manajemen Keuangan</p>
        <p className="text-muted-foreground text-sm">
          Upload bukti transfer pembayaran.
        </p>
      </div>

      <Card className="glass-effect dark:glass-effect-dark">
        <CardHeader>
          <CardTitle>Upload Bukti Transfer Baru</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="academic_period_id">Periode Akademik *</Label>
              <Select name="academic_period_id" required>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Pilih Periode" />
                </SelectTrigger>
                <SelectContent>
                  {academicPeriods.map((period) => (
                    <SelectItem key={period.id} value={period.id.toString()}>
                      {period.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="amount">Jumlah Transfer *</Label>
              <Input
                id="amount"
                name="amount"
                type="number"
                step="0.01"
                placeholder="Contoh: 5000000"
                required
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="transfer_date">Tanggal Transfer *</Label>
              <Input
                id="transfer_date"
                name="transfer_date"
                type="date"
                required
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="bank_name">Nama Bank</Label>
              <Input
                id="bank_name"
                name="bank_name"
                type="text"
                placeholder="Contoh: BCA"
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="account_number">No. Rekening</Label>
              <Input
                id="account_number"
                name="account_number"
                type="text"
                placeholder="Contoh: 1234567890"
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="account_name">Nama Pemilik Rekening</Label>
              <Input
                id="account_name"
                name="account_name"
                type="text"
                placeholder="Contoh: Ahmad Wijaya"
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="evidence_file">Unggah Bukti Transfer *</Label>
              <Input
                id="evidence_file"
                name="evidence_file"
                type="file"
                accept="image/*, .pdf"
                required
                className="mt-1"
              />
            </div>

            <div className="flex gap-3 pt-4">
              <Button type="submit">Simpan Bukti Transfer</Button>
              <Button variant="outline" onClick={() => window.history.back()}>Batal</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}