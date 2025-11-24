// components/forms/KelasForm.tsx
'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { Course, AcademicPeriod, Dosen } from '@/types/akademik';
import { kelasSchema } from '@/lib/validations/akademik';
import { z } from 'zod';

interface KelasFormProps {
  initialData?: any; // Class
  courses: Course[];
  academicPeriods: AcademicPeriod[];
  lecturers: Dosen[];
}

export default function KelasForm({ initialData, courses, academicPeriods, lecturers }: KelasFormProps) {
  const router = useRouter();
  const [formData, setFormData] = useState({
    course_id: initialData?.course_id || '',
    academic_period_id: initialData?.academic_period_id || '',
    class_code: initialData?.class_code || '',
    lecturer_id: initialData?.lecturer_id || '',
    schedule: initialData?.schedule || { day: '', time: '', room: '' },
    max_students: initialData?.max_students || 40,
    is_active: initialData?.is_active ?? true,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleScheduleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      schedule: { ...formData.schedule, [name]: value }
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});

    try {
      const parsedData = kelasSchema.parse(formData);
      const method = initialData ? 'PUT' : 'POST';
      const url = initialData ? `/api/akademik/kelas/${initialData.id}` : '/api/akademik/kelas';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(parsedData),
      });

      const result = await res.json();
      if (!res.ok) throw new Error(result.error || 'Gagal menyimpan kelas');

      toast.success(`✅ Kelas ${initialData ? 'diperbarui' : 'ditambahkan'}!`);
      router.push('/akademik/kelas');

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
        <CardTitle>{initialData ? 'Edit Kelas' : 'Tambah Kelas Baru'}</CardTitle>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="course_id">Mata Kuliah *</Label>
            <select
              id="course_id"
              name="course_id"
              value={formData.course_id}
              onChange={handleChange}
              required
              className="w-full p-2 border rounded mt-1 bg-background text-foreground"
            >
              <option value="">Pilih Mata Kuliah</option>
              {courses.map((course) => (
                <option key={course.id} value={course.id}>
                  {course.code} - {course.name}
                </option>
              ))}
            </select>
            {errors.course_id && <p className="text-sm text-destructive mt-1">{errors.course_id}</p>}
          </div>
          <div>
            <Label htmlFor="academic_period_id">Periode Akademik *</Label>
            <select
              id="academic_period_id"
              name="academic_period_id"
              value={formData.academic_period_id}
              onChange={handleChange}
              required
              className="w-full p-2 border rounded mt-1 bg-background text-foreground"
            >
              <option value="">Pilih Periode</option>
              {academicPeriods.map((period) => (
                <option key={period.id} value={period.id}>
                  {period.name}
                </option>
              ))}
            </select>
            {errors.academic_period_id && <p className="text-sm text-destructive mt-1">{errors.academic_period_id}</p>}
          </div>
          <div>
            <Label htmlFor="class_code">Kode Kelas *</Label>
            <Input
              id="class_code"
              name="class_code"
              value={formData.class_code}
              onChange={handleChange}
              placeholder="Contoh: A, B1, REG-A"
              required
              className="mt-1"
            />
            {errors.class_code && <p className="text-sm text-destructive mt-1">{errors.class_code}</p>}
          </div>
          <div>
            <Label htmlFor="lecturer_id">Dosen Pengampu *</Label>
            <select
              id="lecturer_id"
              name="lecturer_id"
              value={formData.lecturer_id}
              onChange={handleChange}
              required
              className="w-full p-2 border rounded mt-1 bg-background text-foreground"
            >
              <option value="">Pilih Dosen</option>
              {lecturers.map((dosen) => (
                <option key={dosen.id} value={dosen.id}>
                  {dosen.name} (NIDN: {dosen.nidn})
                </option>
              ))}
            </select>
            {errors.lecturer_id && <p className="text-sm text-destructive mt-1">{errors.lecturer_id}</p>}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <Label htmlFor="day">Hari</Label>
              <Input
                id="day"
                name="day"
                value={formData.schedule.day}
                onChange={handleScheduleChange}
                placeholder="Contoh: Senin"
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="time">Waktu</Label>
              <Input
                id="time"
                name="time"
                value={formData.schedule.time}
                onChange={handleScheduleChange}
                placeholder="Contoh: 08:00-10:00"
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="room">Ruang</Label>
              <Input
                id="room"
                name="room"
                value={formData.schedule.room}
                onChange={handleScheduleChange}
                placeholder="Contoh: R301"
                className="mt-1"
              />
            </div>
          </div>
          {errors.schedule && <p className="text-sm text-destructive">{errors.schedule}</p>}
          <div>
            <Label htmlFor="max_students">Kapasitas Mahasiswa</Label>
            <Input
              id="max_students"
              name="max_students"
              type="number"
              min="1"
              value={formData.max_students}
              onChange={handleChange}
              className="mt-1"
            />
            {errors.max_students && <p className="text-sm text-destructive mt-1">{errors.max_students}</p>}
          </div>
          <div className="flex items-center">
            <input
              id="is_active"
              name="is_active"
              type="checkbox"
              checked={formData.is_active}
              onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
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