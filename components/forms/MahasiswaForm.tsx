// components/forms/MahasiswaForm.tsx
'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { Curriculum } from '@/types/akademik';
import { mahasiswaSchema } from '@/lib/validations/user';
import { z } from 'zod';

interface MahasiswaFormProps {
  initialData?: any; // Mahasiswa
  curricula: Curriculum[];
}

export default function MahasiswaForm({ initialData, curricula }: MahasiswaFormProps) {
  const router = useRouter();
  const [formData, setFormData] = useState({
    nim: initialData?.nim || '',
    name: initialData?.name || '',
    email: initialData?.email || '',
    phone: initialData?.phone || '',
    curriculum_id: initialData?.curriculum_id || '',
    year_entry: initialData?.year_entry || new Date().getFullYear(),
    status: initialData?.status || 'active',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});

    try {
      const parsedData = mahasiswaSchema.parse(formData);
      const method = initialData ? 'PUT' : 'POST';
      const url = initialData ? `/api/akademik/mahasiswa/${initialData.id}` : '/api/akademik/mahasiswa';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(parsedData),
      });

      const result = await res.json();
      if (!res.ok) throw new Error(result.error || 'Gagal menyimpan mahasiswa');

      toast.success(`✅ Mahasiswa ${initialData ? 'diperbarui' : 'ditambahkan'}!`);
      router.push('/akademik/mahasiswa');

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
        <CardTitle>{initialData ? 'Edit Mahasiswa' : 'Tambah Mahasiswa Baru'}</CardTitle>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="nim">NIM *</Label>
            <Input
              id="nim"
              name="nim"
              value={formData.nim}
              onChange={handleChange}
              placeholder="Contoh: 20240001"
              required
              className="mt-1"
            />
            {errors.nim && <p className="text-sm text-destructive mt-1">{errors.nim}</p>}
          </div>
          <div>
            <Label htmlFor="name">Nama Lengkap *</Label>
            <Input
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Contoh: Ahmad Wijaya"
              required
              className="mt-1"
            />
            {errors.name && <p className="text-sm text-destructive mt-1">{errors.name}</p>}
          </div>
          <div>
            <Label htmlFor="email">Email *</Label>
            <Input
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="ahmad@student.alifa.ac.id"
              required
              className="mt-1"
            />
            {errors.email && <p className="text-sm text-destructive mt-1">{errors.email}</p>}
          </div>
          <div>
            <Label htmlFor="phone">No. HP</Label>
            <Input
              id="phone"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="081234567890"
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="curriculum_id">Kurikulum *</Label>
            <select
              id="curriculum_id"
              name="curriculum_id"
              value={formData.curriculum_id}
              onChange={handleChange}
              required
              className="w-full p-2 border rounded mt-1 bg-background text-foreground"
            >
              <option value="">Pilih Kurikulum</option>
              {curricula.map((curr) => (
                <option key={curr.id} value={curr.id}>
                  {curr.name} ({curr.code})
                </option>
              ))}
            </select>
            {errors.curriculum_id && <p className="text-sm text-destructive mt-1">{errors.curriculum_id}</p>}
          </div>
          <div>
            <Label htmlFor="year_entry">Tahun Masuk</Label>
            <Input
              id="year_entry"
              name="year_entry"
              type="number"
              min="2000"
              max={new Date().getFullYear()}
              value={formData.year_entry}
              onChange={handleChange}
              className="mt-1"
            />
            {errors.year_entry && <p className="text-sm text-destructive mt-1">{errors.year_entry}</p>}
          </div>
          <div>
            <Label htmlFor="status">Status</Label>
            <select
              id="status"
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="w-full p-2 border rounded mt-1 bg-background text-foreground"
            >
              <option value="active">Aktif</option>
              <option value="inactive">Tidak Aktif</option>
              <option value="graduated">Lulus</option>
              <option value="expelled">Dikeluarkan</option>
            </select>
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