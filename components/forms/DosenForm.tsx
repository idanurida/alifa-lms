// components/forms/DosenForm.tsx
'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { dosenSchema } from '@/lib/validations/user';
import { z } from 'zod';

interface DosenFormProps {
  initialData?: any; // Dosen
}

export default function DosenForm({ initialData }: DosenFormProps) {
  const router = useRouter();
  const [formData, setFormData] = useState({
    nidn: initialData?.nidn || '',
    name: initialData?.name || '',
    email: initialData?.email || '',
    phone: initialData?.phone || '',
    expertise: initialData?.expertise || '',
    status: initialData?.status || 'active',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});

    try {
      const parsedData = dosenSchema.parse(formData);
      const method = initialData ? 'PUT' : 'POST';
      const url = initialData ? `/api/akademik/dosen/${initialData.id}` : '/api/akademik/dosen';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(parsedData),
      });

      const result = await res.json();
      if (!res.ok) throw new Error(result.error || 'Gagal menyimpan dosen');

      toast.success(`✅ Dosen ${initialData ? 'diperbarui' : 'ditambahkan'}!`);
      router.push('/akademik/dosen');

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
        <CardTitle>{initialData ? 'Edit Dosen' : 'Tambah Dosen Baru'}</CardTitle>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="nidn">NIDN *</Label>
            <Input
              id="nidn"
              name="nidn"
              value={formData.nidn}
              onChange={handleChange}
              placeholder="Contoh: 1234567801"
              required
              className="mt-1"
            />
            {errors.nidn && <p className="text-sm text-destructive mt-1">{errors.nidn}</p>}
          </div>
          <div>
            <Label htmlFor="name">Nama Lengkap *</Label>
            <Input
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Contoh: Dr. Bambang S.T., M.T."
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
              placeholder="bambang@alifa.ac.id"
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
            <Label htmlFor="expertise">Keahlian</Label>
            <Textarea
              id="expertise"
              name="expertise"
              value={formData.expertise}
              onChange={handleChange}
              placeholder="Contoh: Artificial Intelligence, Web Development"
              className="mt-1"
            />
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
              <option value="on_leave">Sedang Cuti</option>
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