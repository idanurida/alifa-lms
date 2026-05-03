// app/(dashboard)/keuangan/bukti-transfer/tambah/TambahForm.tsx
'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import BackButton from '@/components/BackButton';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { submitPaymentEvidence } from '@/app/actions/payment-actions';
import { Loader2 } from 'lucide-react';

interface AcademicPeriod {
  id: number;
  name: string;
  code: string;
}

export default function TambahForm({ periods }: { periods: AcademicPeriod[] }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    const form = e.currentTarget;
    const formData = new FormData(form);

    startTransition(async () => {
      try {
        const result = await submitPaymentEvidence(formData);
        if (result.success) {
          setSuccess(result.message);
          form.reset();
          setTimeout(() => router.push('/keuangan/bukti-transfer'), 1500);
        } else {
          setError(result.error || 'Gagal mengunggah');
        }
      } catch {
        setError('Gagal menghubungi server');
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="academic_period_id">Periode Akademik *</Label>
        <Select name="academic_period_id" required>
          <SelectTrigger className="mt-1">
            <SelectValue placeholder="Pilih Periode" />
          </SelectTrigger>
          <SelectContent>
            {periods.map((period) => (
              <SelectItem key={period.id} value={period.id.toString()}>
                {period.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label htmlFor="amount">Jumlah Transfer (Rp) *</Label>
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
        <Input id="bank_name" name="bank_name" type="text" placeholder="Contoh: BCA" className="mt-1" />
      </div>

      <div>
        <Label htmlFor="account_number">No. Rekening</Label>
        <Input id="account_number" name="account_number" type="text" placeholder="Contoh: 1234567890" className="mt-1" />
      </div>

      <div>
        <Label htmlFor="account_name">Nama Pemilik Rekening</Label>
        <Input id="account_name" name="account_name" type="text" placeholder="Contoh: Ahmad Wijaya" className="mt-1" />
      </div>

      <div>
        <Label htmlFor="evidence_file">Unggah Bukti Transfer *</Label>
        <Input
          id="evidence_file"
          name="evidence_file"
          type="file"
          accept="image/*,.pdf"
          required
          className="mt-1"
        />
      </div>

      {error && (
        <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
          {error}
        </div>
      )}
      {success && (
        <div className="p-3 rounded-lg bg-green-50 border border-green-200 text-green-700 text-sm">
          {success}
        </div>
      )}

      <div className="flex gap-3 pt-4">
        <Button type="submit" disabled={isPending}>
          {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
          Simpan Bukti Transfer
        </Button>
        <BackButton label="Batal" />
      </div>
    </form>
  );
}
