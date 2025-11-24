// components/akademik/TambahSkalaNilaiForm.tsx - UPDATE
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { toast } from 'sonner';

interface TambahSkalaNilaiFormProps {
  kurikulumId: number;
  kurikulumName: string;
}

export default function TambahSkalaNilaiForm({
  kurikulumId,
  kurikulumName
}: TambahSkalaNilaiFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formData, setFormData] = useState({
    grade_char: '',
    grade_value: '',
    min_score: '',
    max_score: '',
    description: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});

    try {
      const res = await fetch('/api/akademik/skala-nilai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          curriculum_id: kurikulumId,
          grade_char: formData.grade_char.toUpperCase(),
          grade_value: parseFloat(formData.grade_value),
          min_score: parseInt(formData.min_score),
          max_score: formData.max_score ? parseInt(formData.max_score) : null,
          description: formData.description
        }),
      });

      const result = await res.json();
      
      if (!res.ok) {
        if (result.details) {
          // Handle validation errors dari Zod
          const newErrors: Record<string, string> = {};
          result.details.forEach((err: any) => {
            newErrors[err.field] = err.message;
          });
          setErrors(newErrors);
          throw new Error('Validasi gagal, periksa form Anda');
        }
        throw new Error(result.error || 'Gagal menambah skala nilai');
      }

      if (result.success) {
        toast.success('Skala nilai berhasil ditambahkan');
        router.push(`/akademik/skala-nilai/${kurikulumId}`);
        router.refresh();
      }

    } catch (error: any) {
      console.error('Add grade scale error:', error);
      if (!error.message.includes('Validasi gagal')) {
        toast.error(`❌ ${error.message}`);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Form Tambah Skala Nilai</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="mb-6 p-4 bg-muted rounded-md">
          <p className="font-medium">Kurikulum: {kurikulumName}</p>
          <p className="text-sm text-muted-foreground mt-1">
            ID Kurikulum: {kurikulumId}
          </p>
        </div>

        {Object.keys(errors).length > 0 && (
          <Alert variant="destructive" className="mb-6">
            <AlertDescription>
              <ul className="list-disc list-inside space-y-1">
                {Object.values(errors).map((error, index) => (
                  <li key={index}>{error}</li>
                ))}
              </ul>
            </AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label htmlFor="grade_char">Huruf Nilai *</Label>
              <Input
                id="grade_char"
                value={formData.grade_char}
                onChange={(e) => setFormData({ ...formData, grade_char: e.target.value })}
                placeholder="A, B+, C, etc"
                required
                maxLength={2}
                className={errors.grade_char ? 'border-red-500' : ''}
              />
              {errors.grade_char && (
                <p className="text-red-500 text-sm mt-1">{errors.grade_char}</p>
              )}
              <p className="text-xs text-muted-foreground mt-1">
                Contoh: A, A-, B+, B, C+, C, D, E
              </p>
            </div>

            <div>
              <Label htmlFor="grade_value">Nilai Angka *</Label>
              <Input
                id="grade_value"
                type="number"
                step="0.01"
                min="0"
                max="4"
                value={formData.grade_value}
                onChange={(e) => setFormData({ ...formData, grade_value: e.target.value })}
                placeholder="4.00, 3.75, 3.50, etc"
                required
                className={errors.grade_value ? 'border-red-500' : ''}
              />
              {errors.grade_value && (
                <p className="text-red-500 text-sm mt-1">{errors.grade_value}</p>
              )}
              <p className="text-xs text-muted-foreground mt-1">
                Skala 0.00 - 4.00
              </p>
            </div>

            <div>
              <Label htmlFor="min_score">Nilai Minimum *</Label>
              <Input
                id="min_score"
                type="number"
                min="0"
                max="100"
                value={formData.min_score}
                onChange={(e) => setFormData({ ...formData, min_score: e.target.value })}
                placeholder="85"
                required
                className={errors.min_score ? 'border-red-500' : ''}
              />
              {errors.min_score && (
                <p className="text-red-500 text-sm mt-1">{errors.min_score}</p>
              )}
            </div>

            <div>
              <Label htmlFor="max_score">Nilai Maksimum</Label>
              <Input
                id="max_score"
                type="number"
                min="0"
                max="100"
                value={formData.max_score}
                onChange={(e) => setFormData({ ...formData, max_score: e.target.value })}
                placeholder="100 (opsional)"
                className={errors.max_score ? 'border-red-500' : ''}
              />
              {errors.max_score && (
                <p className="text-red-500 text-sm mt-1">{errors.max_score}</p>
              )}
              <p className="text-xs text-muted-foreground mt-1">
                Kosongkan untuk nilai terakhir (misal: E = 0-49)
              </p>
            </div>
          </div>

          <div>
            <Label htmlFor="description">Deskripsi</Label>
            <Input
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Sangat Baik, Baik, Cukup, Kurang, Gagal"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Deskripsi kualitatif untuk nilai ini
            </p>
          </div>

          <div className="flex gap-3 pt-4">
            <Button 
              type="submit" 
              disabled={loading}
              className="flex-1"
            >
              {loading ? 'Menambah...' : 'Tambah Skala Nilai'}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
              className="flex-1"
              disabled={loading}
            >
              Batal
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}