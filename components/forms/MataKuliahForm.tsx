'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import { Curriculum } from '@/types/akademik';
import { mataKuliahSchema } from '@/lib/validations/akademik';
import { z } from 'zod';
import { Loader2, Save, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MataKuliahFormProps {
  initialData?: any;
  curricula: Curriculum[];
  isEdit?: boolean;
}

export default function MataKuliahForm({ initialData, curricula, isEdit = false }: MataKuliahFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [formData, setFormData] = useState({
    code: initialData?.code || '',
    name: initialData?.name || '',
    credits: initialData?.credits || 0,
    theory_credits: initialData?.theory_credits || 0,
    practical_credits: initialData?.practical_credits || 0,
    curriculum_id: initialData?.curriculum_id || '',
    semester: initialData?.semester || 1,
    prerequisites: initialData?.prerequisites || '',
    description: initialData?.description || '',
    is_active: initialData?.is_active ?? true,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;

    if (['credits', 'theory_credits', 'practical_credits', 'semester', 'curriculum_id'].includes(name)) {
      setFormData(prev => ({ ...prev, [name]: parseInt(value) || 0 }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSwitchChange = (checked: boolean) => {
    setFormData(prev => ({ ...prev, is_active: checked }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});

    try {
      const validatedData = mataKuliahSchema.parse({
        ...formData,
        curriculum_id: Number(formData.curriculum_id)
      });

      const method = isEdit ? 'PUT' : 'POST';
      const url = isEdit ? `/api/akademik/mata-kuliah?id=${initialData.id}` : '/api/akademik/mata-kuliah';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(validatedData),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Gagal menyimpan data');
      }

      toast.success(isEdit ? 'Mata kuliah berhasil diperbarui' : 'Mata kuliah berhasil ditambahkan');
      router.push('/akademik/mata-kuliah');
      router.refresh();

    } catch (error) {
      if (error instanceof z.ZodError) {
        const fieldErrors: Record<string, string> = {};
        error.errors.forEach((err) => {
          if (err.path[0]) {
            fieldErrors[err.path[0] as string] = err.message;
          }
        });
        setErrors(fieldErrors);
        toast.error('Periksa kembali input Anda');
      } else {
        toast.error((error as Error).message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 animate-in fade-in duration-500">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="code">Kode Mata Kuliah *</Label>
            <Input
              id="code"
              name="code"
              value={formData.code}
              onChange={handleChange}
              placeholder="Contoh: 19STIES01"
              className={cn("bg-muted/30 focus:bg-background transition-all", errors.code && "border-destructive")}
            />
            {errors.code && <p className="text-xs text-destructive">{errors.code}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="name">Nama Mata Kuliah *</Label>
            <Input
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Contoh: Bahasa Arab Ekonomi"
              className={cn("bg-muted/30 focus:bg-background transition-all", errors.name && "border-destructive")}
            />
            {errors.name && <p className="text-xs text-destructive">{errors.name}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="curriculum_id">Kurikulum *</Label>
            <select
              id="curriculum_id"
              name="curriculum_id"
              value={formData.curriculum_id}
              onChange={handleChange}
              className="w-full h-10 px-3 rounded-md border border-input bg-muted/30 text-sm focus:bg-background transition-all focus:outline-none focus:ring-2 focus:ring-ring"
            >
              <option value="">Pilih Kurikulum</option>
              {curricula.map((cur) => (
                <option key={cur.id} value={cur.id}>
                  {cur.name} ({cur.code})
                </option>
              ))}
            </select>
            {errors.curriculum_id && <p className="text-xs text-destructive">{errors.curriculum_id}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="semester">Semester *</Label>
            <Input
              id="semester"
              name="semester"
              type="number"
              min="1"
              max="8"
              value={formData.semester}
              onChange={handleChange}
              className="bg-muted/30 focus:bg-background transition-all"
            />
            {errors.semester && <p className="text-xs text-destructive">{errors.semester}</p>}
          </div>
        </div>

        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="theory_credits">SKS Teori</Label>
              <Input
                id="theory_credits"
                name="theory_credits"
                type="number"
                value={formData.theory_credits}
                onChange={handleChange}
                className="bg-muted/30 focus:bg-background transition-all text-center"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="practical_credits">SKS Praktik</Label>
              <Input
                id="practical_credits"
                name="practical_credits"
                type="number"
                value={formData.practical_credits}
                onChange={handleChange}
                className="bg-muted/30 focus:bg-background transition-all text-center"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="credits" className="font-bold">Total SKS *</Label>
              <Input
                id="credits"
                name="credits"
                type="number"
                value={formData.credits}
                onChange={handleChange}
                className={cn("bg-primary/5 font-bold text-center border-primary/20", errors.credits && "border-destructive")}
              />
            </div>
          </div>
          {errors.credits && <p className="text-xs text-destructive text-center">{errors.credits}</p>}

          <div className="space-y-2">
            <Label htmlFor="prerequisites">Mata Kuliah Prasyarat</Label>
            <Input
              id="prerequisites"
              name="prerequisites"
              value={formData.prerequisites}
              onChange={handleChange}
              placeholder="Kode MK (Contoh: 19STIES06)"
              className="bg-muted/30 focus:bg-background transition-all"
            />
          </div>

          <div className="flex items-center space-x-3 pt-6 bg-muted/20 p-4 rounded-lg">
            <Switch
              id="is_active"
              checked={formData.is_active}
              onCheckedChange={handleSwitchChange}
            />
            <div className="space-y-0.5">
              <Label htmlFor="is_active" className="text-sm font-bold">Status Aktif</Label>
              <p className="text-xs text-muted-foreground">Mata kuliah akan muncul di penawaran KRS jika aktif.</p>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Keterangan / Deskripsi</Label>
        <Textarea
          id="description"
          name="description"
          value={formData.description}
          onChange={handleChange}
          rows={4}
          placeholder="Tambahkan deskripsi atau capaian pembelajaran mata kuliah ini..."
          className="bg-muted/30 focus:bg-background transition-all"
        />
      </div>

      <div className="flex items-center gap-4 pt-6 border-t mt-8">
        <Button
          type="submit"
          disabled={loading}
          className="min-w-[180px] h-11 text-lg"
        >
          {loading ? (
            <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Menyimpan...</>
          ) : (
            <><Save className="mr-2 h-5 w-5" /> {isEdit ? 'Simpan Perubahan' : 'Tambah Mata Kuliah'}</>
          )}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => router.back()}
          disabled={loading}
          className="h-11 px-8"
        >
          <X className="mr-2 h-4 w-4" /> Batal
        </Button>
      </div>
    </form>
  );
}