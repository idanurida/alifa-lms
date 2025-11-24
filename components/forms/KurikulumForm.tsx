// components/forms/KurikulumForm.tsx
'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { StudyProgram } from '@/types/akademik';
import { kurikulumSchema } from '@/lib/validations/akademik';
import { z } from 'zod';

interface KurikulumFormProps {
  initialData?: any; // Kurikulum
  studyPrograms: StudyProgram[];
}

export default function KurikulumForm({ initialData, studyPrograms }: KurikulumFormProps) {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: initialData?.name || '',
    code: initialData?.code || '',
    study_program_id: initialData?.study_program_id || '',
    total_credits: initialData?.total_credits || 144,
    is_active: initialData?.is_active ?? true,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const val = type === 'checkbox' ? (e.target as HTMLInputElement).checked : value;
    setFormData({ ...formData, [name]: val });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});

    try {
      const parsedData = kurikulumSchema.parse(formData);
      const method = initialData ? 'PUT' : 'POST';
      const url = initialData ? `/api/akademik/kurikulum/${initialData.id}` : '/api/akademik/kurikulum';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(parsedData),
      });

      const result = await res.json();
      if (!res.ok) throw new Error(result.error || 'Gagal menyimpan kurikulum');

      toast.success(`✅ Kurikulum ${initialData ? 'diperbarui' : 'ditambahkan'}!`);
      router.push('/akademik/kurikulum');

    } catch (error) {
      if (error instanceof z.ZodError) {
        const fieldErrors: Record<string, string> = {};
        error.errors.forEach((err) => {
          if (err.path) fieldErrors[err.path[0] as string] = err.message;
        });
        setErrors(fieldErrors);
        toast.error('Silakan perbaiki kesalahan input.');
      } else {
        toast.error(`❌ ${(error as Error).message}`);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{initialData ? 'Edit Kurikulum' : 'Tambah Kurikulum Baru'}</CardTitle>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="name">Nama Kurikulum *</Label>
            <Input
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Contoh: Kurikulum TI 2024"
              required
              className="mt-1"
            />
            {errors.name && <p className="text-sm text-destructive mt-1">{errors.name}</p>}
          </div>
          <div>
            <Label htmlFor="code">Kode Kurikulum *</Label>
            <Input
              id="code"
              name="code"
              value={formData.code}
              onChange={handleChange}
              placeholder="Contoh: TI2024"
              required
              className="mt-1"
            />
            {errors.code && <p className="text-sm text-destructive mt-1">{errors.code}</p>}
          </div>
          <div>
            <Label htmlFor="study_program_id">Program Studi *</Label>
            <select
              id="study_program_id"
              name="study_program_id"
              value={formData.study_program_id}
              onChange={handleChange}
              required
              className="w-full p-2 border rounded mt-1 bg-background text-foreground"
            >
              <option value="">Pilih Program Studi</option>
              {studyPrograms.map((sp) => (
                <option key={sp.id} value={sp.id}>
                  {sp.name} ({sp.code})
                </option>
              ))}
            </select>
            {errors.study_program_id && <p className="text-sm text-destructive mt-1">{errors.study_program_id}</p>}
          </div>
          <div>
            <Label htmlFor="total_credits">Total SKS</Label>
            <Input
              id="total_credits"
              name="total_credits"
              type="number"
              min="0"
              value={formData.total_credits}
              onChange={handleChange}
              className="mt-1"
            />
            {errors.total_credits && <p className="text-sm text-destructive mt-1">{errors.total_credits}</p>}
          </div>
          <div className="flex items-center">
            <input
              id="is_active"
              name="is_active"
              type="checkbox"
              checked={formData.is_active}
              onChange={handleChange}
              className="h-4 w-4"
            />
            <Label htmlFor="is_active" className="ml-2">
              Aktif
            </Label>
          </div>
        </CardContent>
        <div className="flex gap-3 p-6 pt-0">
          <Button type="submit" disabled={loading} className="px-6">
            {loading ? 'Menyimpan...' : initialData ? 'Perbarui' : 'Simpan'}
          </Button>
          <Button type="button" variant="outline" onClick={() => router.back()} className="px-6">
            Batal
          </Button>
        </div>
      </form>
    </Card>
  );
}